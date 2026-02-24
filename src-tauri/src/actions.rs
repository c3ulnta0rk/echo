use crate::audio_feedback::{play_feedback_sound, play_feedback_sound_blocking, SoundType};
use crate::managers::audio::AudioRecordingManager;
use crate::managers::history::HistoryManager;
use crate::managers::transcription::TranscriptionManager;
use crate::managers::tts::TtsManager;
use crate::overlay::{
    show_recording_overlay, show_tool_overlay, show_transcribing_overlay, show_warning_overlay,
};
use crate::settings::{get_settings, AppSettings};
use crate::tools::{self, PostProcessOutcome};
use crate::tray::{change_tray_icon, TrayIconState};
use crate::utils;
use crate::ManagedToggleState;
use async_openai::types::{
    ChatCompletionRequestAssistantMessageArgs, ChatCompletionRequestMessage,
    ChatCompletionRequestSystemMessageArgs, ChatCompletionRequestToolMessageArgs,
    ChatCompletionRequestUserMessageArgs, CreateChatCompletionRequestArgs, FinishReason,
};
use ferrous_opencc::{config::BuiltinConfig, OpenCC};
use log::{debug, error, info};
use once_cell::sync::Lazy;
use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Instant;
use tauri::AppHandle;
use tauri::Manager;

/// Monotonically increasing counter that increments on every `start()` and `cancel()`.
/// In-flight async tasks capture the current value and bail out when it changes,
/// preventing stale transcription paste, overlay updates, and mute operations.
pub(crate) static OPERATION_GENERATION: AtomicU64 = AtomicU64::new(0);

/// Handle to the most recent async transcription task spawned by `stop()`.
/// On a new stop or cancel we abort the previous handle so stale LLM
/// post-processing API calls don't continue running.
pub(crate) static TRANSCRIPTION_TASK: Lazy<Mutex<Option<tauri::async_runtime::JoinHandle<()>>>> =
    Lazy::new(|| Mutex::new(None));

// Shortcut Action Trait
pub trait ShortcutAction: Send + Sync {
    fn start(&self, app: &AppHandle, binding_id: &str, shortcut_str: &str);
    fn stop(&self, app: &AppHandle, binding_id: &str, shortcut_str: &str);
}

// Transcribe Action
struct TranscribeAction;

pub async fn maybe_post_process_transcription(
    app: &AppHandle,
    settings: &AppSettings,
    transcription: &str,
) -> PostProcessOutcome {
    if !settings.post_process_enabled {
        return PostProcessOutcome::Empty;
    }

    let provider = match settings.active_post_process_provider().cloned() {
        Some(provider) => provider,
        None => {
            debug!("Post-processing enabled but no provider is selected");
            return PostProcessOutcome::Empty;
        }
    };

    let model = settings
        .post_process_models
        .get(&provider.id)
        .cloned()
        .unwrap_or_default();

    if model.trim().is_empty() {
        debug!(
            "Post-processing skipped because provider '{}' has no model configured",
            provider.id
        );
        return PostProcessOutcome::Empty;
    }

    let selected_prompt_id = match &settings.post_process_selected_prompt_id {
        Some(id) => id.clone(),
        None => {
            debug!("Post-processing skipped because no prompt is selected");
            return PostProcessOutcome::Empty;
        }
    };

    let prompt = match settings
        .post_process_prompts
        .iter()
        .find(|prompt| prompt.id == selected_prompt_id)
    {
        Some(prompt) => prompt.prompt.clone(),
        None => {
            debug!(
                "Post-processing skipped because prompt '{}' was not found",
                selected_prompt_id
            );
            return PostProcessOutcome::Empty;
        }
    };

    if prompt.trim().is_empty() {
        debug!("Post-processing skipped because the selected prompt is empty");
        return PostProcessOutcome::Empty;
    }

    let api_key = settings
        .post_process_api_keys
        .get(&provider.id)
        .cloned()
        .unwrap_or_default();

    debug!(
        "Starting LLM post-processing with provider '{}' (model: {})",
        provider.id, model
    );

    // Log the original transcription that will be inserted
    log::info!("[Post-Process] Original transcription:\n{}", transcription);

    // Log the original prompt template (before variable substitution)
    log::info!("[Post-Process] Original prompt template:\n{}", prompt);

    // Replace mention placeholder with the actual transcription text
    // Handle multiple formats:
    // 1. Platejs remarkMention link format: [output](mention:output) or [any text](mention:output)
    // 2. Legacy ${output} format
    // 3. Simple @output format

    // Use regex for flexible matching of [any text](mention:output)
    let mention_regex = regex::Regex::new(r"\[[^\]]*\]\(mention:output\)").unwrap();
    let processed_prompt = mention_regex
        .replace_all(&prompt, transcription)
        .to_string();

    // Also replace ${output} and @output formats for backward compatibility
    let processed_prompt = processed_prompt
        .replace("${output}", transcription)
        .replace("@output", transcription);

    // Log the processed prompt (after variable substitution)
    log::info!(
        "[Post-Process] Prompt with transcript inserted:\n{}",
        processed_prompt
    );

    debug!("Processed prompt length: {} chars", processed_prompt.len());

    // Create OpenAI-compatible client
    let client = match crate::llm_client::create_client(&provider, api_key) {
        Ok(client) => client,
        Err(e) => {
            error!("Failed to create LLM client: {}", e);
            return PostProcessOutcome::Empty;
        }
    };

    let use_tools = settings.voice_commands_enabled;
    let tool_definitions = if use_tools {
        tools::get_tool_definitions()
    } else {
        vec![]
    };

    let mut messages: Vec<ChatCompletionRequestMessage> = Vec::new();

    if use_tools && !tool_definitions.is_empty() {
        // Voice commands mode: the system message carries both the routing
        // logic AND the user's text-processing instructions. The user
        // message is the raw transcription so the LLM can cleanly decide
        // whether it's a command or regular text.
        let system_content = format!(
            "You are a voice assistant that processes speech transcriptions. \
            You have two roles:\n\
            1. **Voice commands**: If the user's speech is clearly a command \
            (e.g. \"open Safari\", \"create a note called ...\", \"change the sound theme\"), \
            use the appropriate tool. Do NOT output any text when executing a tool.\n\
            2. **Text processing**: If the speech is regular dictated text, \
            apply the following instructions and return only the processed text \
            with no extra commentary.\n\n\
            --- Text processing instructions ---\n{}",
            prompt
        );
        if let Ok(sys_msg) = ChatCompletionRequestSystemMessageArgs::default()
            .content(system_content)
            .build()
        {
            messages.push(ChatCompletionRequestMessage::System(sys_msg));
        }

        // User message is the raw transcription
        match ChatCompletionRequestUserMessageArgs::default()
            .content(transcription)
            .build()
        {
            Ok(msg) => messages.push(ChatCompletionRequestMessage::User(msg)),
            Err(e) => {
                error!("Failed to build chat message: {}", e);
                return PostProcessOutcome::Empty;
            }
        }
    } else {
        // Text-only mode: send the prompt with the transcription inserted,
        // exactly as before.
        match ChatCompletionRequestUserMessageArgs::default()
            .content(processed_prompt)
            .build()
        {
            Ok(msg) => messages.push(ChatCompletionRequestMessage::User(msg)),
            Err(e) => {
                error!("Failed to build chat message: {}", e);
                return PostProcessOutcome::Empty;
            }
        }
    }

    // Tool calling loop (max 5 iterations to prevent infinite loops)
    const MAX_TOOL_ITERATIONS: usize = 5;
    let mut last_tool_message = String::new();

    for iteration in 0..MAX_TOOL_ITERATIONS {
        debug!(
            "[Post-Process] Tool loop iteration {}/{}",
            iteration + 1,
            MAX_TOOL_ITERATIONS
        );

        let mut request_builder = CreateChatCompletionRequestArgs::default();
        request_builder.model(&model).messages(messages.clone());
        if use_tools && !tool_definitions.is_empty() {
            request_builder.tools(tool_definitions.clone());
        }
        let request_result = request_builder.build();

        let request = match request_result {
            Ok(req) => req,
            Err(e) => {
                error!("Failed to build chat completion request: {}", e);
                return PostProcessOutcome::Empty;
            }
        };

        let response = match client.chat().create(request).await {
            Ok(resp) => resp,
            Err(e) if iteration == 0 => {
                // First request failed with tools — retry without tools (graceful fallback
                // for providers like Ollama that may not support function calling)
                info!(
                    "[Post-Process] Request with tools failed for provider '{}': {}. Retrying without tools.",
                    provider.id, e
                );
                let fallback_request = match CreateChatCompletionRequestArgs::default()
                    .model(&model)
                    .messages(messages.clone())
                    .build()
                {
                    Ok(req) => req,
                    Err(e2) => {
                        error!("Failed to build fallback request: {}", e2);
                        return PostProcessOutcome::Empty;
                    }
                };
                match client.chat().create(fallback_request).await {
                    Ok(resp) => {
                        if let Some(choice) = resp.choices.first() {
                            if let Some(content) = &choice.message.content {
                                info!("[Post-Process] Fallback LLM result:\n{}", content);
                                return PostProcessOutcome::Text(content.clone());
                            }
                        }
                        return PostProcessOutcome::Empty;
                    }
                    Err(e2) => {
                        error!(
                            "LLM post-processing failed for provider '{}': {}. Falling back to original transcription.",
                            provider.id, e2
                        );
                        return PostProcessOutcome::Empty;
                    }
                }
            }
            Err(e) => {
                error!(
                    "LLM post-processing failed on iteration {} for provider '{}': {}.",
                    iteration + 1,
                    provider.id,
                    e
                );
                if !last_tool_message.is_empty() {
                    return PostProcessOutcome::ToolExecuted(last_tool_message);
                }
                return PostProcessOutcome::Empty;
            }
        };

        let choice = match response.choices.first() {
            Some(c) => c,
            None => {
                error!("LLM API response has no choices");
                return PostProcessOutcome::Empty;
            }
        };

        // Check if the LLM wants to call tools
        if let Some(tool_calls) = &choice.message.tool_calls {
            if !tool_calls.is_empty() {
                // Build assistant message with tool_calls for conversation history
                let assistant_msg = ChatCompletionRequestAssistantMessageArgs::default()
                    .tool_calls(tool_calls.clone())
                    .build()
                    .map(ChatCompletionRequestMessage::Assistant);
                if let Ok(msg) = assistant_msg {
                    messages.push(msg);
                }

                // Execute each tool and add results
                for tool_call in tool_calls {
                    let result = tools::execute_tool(
                        app,
                        &tool_call.function.name,
                        &tool_call.function.arguments,
                    );
                    last_tool_message = result.display_message.clone();

                    let tool_msg = ChatCompletionRequestToolMessageArgs::default()
                        .content(result.display_message)
                        .tool_call_id(&tool_call.id)
                        .build()
                        .map(ChatCompletionRequestMessage::Tool);
                    if let Ok(msg) = tool_msg {
                        messages.push(msg);
                    }
                }

                // If this is the last iteration, return with the tool result
                if iteration == MAX_TOOL_ITERATIONS - 1 {
                    return PostProcessOutcome::ToolExecuted(last_tool_message);
                }

                // Otherwise continue the loop to let the LLM respond to tool results
                continue;
            }
        }

        // No tool calls — check for text content
        if let Some(content) = &choice.message.content {
            if !content.trim().is_empty() {
                info!("[Post-Process] LLM result:\n{}", content);
                debug!(
                    "LLM post-processing succeeded for provider '{}'. Output length: {} chars",
                    provider.id,
                    content.len()
                );

                // If tools were executed earlier, this is a final summary from the LLM
                if !last_tool_message.is_empty() {
                    return PostProcessOutcome::ToolExecuted(content.clone());
                }
                return PostProcessOutcome::Text(content.clone());
            }
        }

        // Check finish reason for tool_calls
        if choice.finish_reason == Some(FinishReason::ToolCalls) {
            continue;
        }

        // No content and no tool calls
        break;
    }

    if !last_tool_message.is_empty() {
        return PostProcessOutcome::ToolExecuted(last_tool_message);
    }

    error!("LLM API response has no content");
    PostProcessOutcome::Empty
}

async fn maybe_convert_chinese_variant(
    settings: &AppSettings,
    transcription: &str,
) -> Option<String> {
    let is_simplified = settings.selected_language == "zh-Hans";
    let is_traditional = settings.selected_language == "zh-Hant";

    if !is_simplified && !is_traditional {
        debug!("selected_language is not Simplified or Traditional Chinese; skipping conversion");
        return None;
    }

    debug!(
        "Starting Chinese variant conversion for language: {}",
        settings.selected_language
    );

    let config = if is_simplified {
        BuiltinConfig::Tw2sp
    } else {
        BuiltinConfig::S2twp
    };

    match OpenCC::from_config(config) {
        Ok(converter) => {
            let converted = converter.convert(transcription);
            debug!(
                "OpenCC conversion completed. Input length: {}, Output length: {}",
                transcription.len(),
                converted.len()
            );
            Some(converted)
        }
        Err(e) => {
            error!(
                "Failed to initialize OpenCC converter: {}. Falling back to original transcription.",
                e
            );
            None
        }
    }
}

impl ShortcutAction for TranscribeAction {
    fn start(&self, app: &AppHandle, binding_id: &str, _shortcut_str: &str) {
        let start_time = Instant::now();
        debug!("TranscribeAction::start called for binding: {}", binding_id);

        // Increment generation to invalidate any in-flight operations from previous recordings
        OPERATION_GENERATION.fetch_add(1, Ordering::SeqCst);

        // Check if a file transcription is currently active
        if crate::is_file_transcription_active() {
            debug!("File transcription in progress - showing warning overlay");
            show_warning_overlay(app, "File transcription in progress. Please wait...");

            // Reset the toggle state so next press will call start() again
            let toggle_state_manager = app.state::<ManagedToggleState>();
            if let Ok(mut states) = toggle_state_manager.lock() {
                states.active_toggles.insert(binding_id.to_string(), false);
            }
            return;
        }

        // Load model in the background
        let tm = app.state::<Arc<TranscriptionManager>>();
        tm.initiate_model_load();

        let binding_id = binding_id.to_string();
        change_tray_icon(app, TrayIconState::Recording);
        show_recording_overlay(app);

        let rm = app.state::<Arc<AudioRecordingManager>>();

        // Get the microphone mode to determine audio feedback timing
        let settings = get_settings(app);
        let is_always_on = settings.always_on_microphone;
        debug!("Microphone mode - always_on: {}", is_always_on);

        if is_always_on {
            // Always-on mode: Play audio feedback immediately, then apply mute after sound finishes
            debug!("Always-on mode: Playing audio feedback immediately");
            let rm_clone = Arc::clone(&rm);
            let app_clone = app.clone();
            // The blocking helper exits immediately if audio feedback is disabled,
            // so we can reuse this thread regardless of user settings.
            let gen = OPERATION_GENERATION.load(Ordering::SeqCst);
            std::thread::spawn(move || {
                play_feedback_sound_blocking(&app_clone, SoundType::Start);
                if OPERATION_GENERATION.load(Ordering::SeqCst) == gen {
                    rm_clone.apply_mute();
                }
            });

            let recording_started = rm.try_start_recording(&binding_id);
            if !recording_started {
                // Reset toggle state and revert UI when recording fails to start
                let toggle_state_manager = app.state::<ManagedToggleState>();
                if let Ok(mut states) = toggle_state_manager.lock() {
                    states.active_toggles.insert(binding_id.clone(), false);
                }
                utils::hide_recording_overlay(app);
                change_tray_icon(app, TrayIconState::Idle);
            }
            debug!("Recording started: {}", recording_started);
        } else {
            // On-demand mode: Start recording first, then play audio feedback, then apply mute
            // This allows the microphone to be activated before playing the sound
            debug!("On-demand mode: Starting recording first, then audio feedback");
            let recording_start_time = Instant::now();
            if rm.try_start_recording(&binding_id) {
                debug!("Recording started in {:?}", recording_start_time.elapsed());
                // Small delay to ensure microphone stream is active
                let app_clone = app.clone();
                let rm_clone = Arc::clone(&rm);
                let gen = OPERATION_GENERATION.load(Ordering::SeqCst);
                std::thread::spawn(move || {
                    std::thread::sleep(std::time::Duration::from_millis(100));
                    debug!("Handling delayed audio feedback/mute sequence");
                    // Helper handles disabled audio feedback by returning early,
                    // so we reuse it to keep mute sequencing consistent in every mode.
                    play_feedback_sound_blocking(&app_clone, SoundType::Start);
                    if OPERATION_GENERATION.load(Ordering::SeqCst) == gen {
                        rm_clone.apply_mute();
                    }
                });
            } else {
                // Reset toggle state and revert UI when recording fails to start
                let toggle_state_manager = app.state::<ManagedToggleState>();
                if let Ok(mut states) = toggle_state_manager.lock() {
                    states.active_toggles.insert(binding_id.clone(), false);
                }
                utils::hide_recording_overlay(app);
                change_tray_icon(app, TrayIconState::Idle);
                debug!("Failed to start recording");
            }
        }

        debug!(
            "TranscribeAction::start completed in {:?}",
            start_time.elapsed()
        );
    }

    fn stop(&self, app: &AppHandle, binding_id: &str, _shortcut_str: &str) {
        let stop_time = Instant::now();
        debug!("TranscribeAction::stop called for binding: {}", binding_id);

        let ah = app.clone();
        let rm = Arc::clone(&app.state::<Arc<AudioRecordingManager>>());
        let tm = Arc::clone(&app.state::<Arc<TranscriptionManager>>());
        let hm = Arc::clone(&app.state::<Arc<HistoryManager>>());
        let tts_manager = Arc::clone(&app.state::<Arc<TtsManager>>());

        change_tray_icon(app, TrayIconState::Transcribing);
        show_transcribing_overlay(app);

        // Unmute before playing audio feedback so the stop sound is audible
        rm.remove_mute();

        // Play audio feedback for recording stop
        play_feedback_sound(app, SoundType::Stop);

        let binding_id = binding_id.to_string(); // Clone binding_id for the async task
        let rm_for_task = Arc::clone(&rm);

        // Capture current generation to detect staleness
        let gen = OPERATION_GENERATION.load(Ordering::SeqCst);

        // Abort any previous in-flight transcription task
        if let Ok(mut task) = TRANSCRIPTION_TASK.lock() {
            if let Some(handle) = task.take() {
                handle.abort();
            }
        }

        let handle = tauri::async_runtime::spawn(async move {
            let binding_id = binding_id.clone(); // Clone for the inner async task
            debug!(
                "Starting async transcription task for binding: {}",
                binding_id
            );

            let stop_recording_time = Instant::now();
            if let Some(samples) = rm_for_task.stop_recording(&binding_id) {
                debug!(
                    "Recording stopped and samples retrieved in {:?}, sample count: {} ({:.1}s audio)",
                    stop_recording_time.elapsed(),
                    samples.len(),
                    samples.len() as f32 / 16000.0
                );

                // Final transcription: transcribe ALL audio for complete result
                // (streaming preview is limited, but final result is complete)
                let transcription_time = Instant::now();
                let samples_clone = samples.clone(); // Clone full samples for history saving

                match tm.transcribe(samples) {
                    Ok(transcription) => {
                        debug!(
                            "Transcription completed in {:?}: '{}'",
                            transcription_time.elapsed(),
                            transcription
                        );
                        if !transcription.is_empty() {
                            let settings = get_settings(&ah);
                            let mut final_text = transcription.clone();
                            let mut post_processed_text: Option<String> = None;
                            let mut post_process_prompt: Option<String> = None;

                            if let Some(converted_text) =
                                maybe_convert_chinese_variant(&settings, &transcription).await
                            {
                                final_text = converted_text.clone();
                                post_processed_text = Some(converted_text);
                            } else {
                                match maybe_post_process_transcription(&ah, &settings, &transcription).await {
                                    PostProcessOutcome::Text(processed_text) => {
                                        final_text = processed_text.clone();
                                        post_processed_text = Some(processed_text);

                                        // Get the prompt that was used
                                        if let Some(prompt_id) = &settings.post_process_selected_prompt_id {
                                            if let Some(prompt) = settings
                                                .post_process_prompts
                                                .iter()
                                                .find(|p| &p.id == prompt_id)
                                            {
                                                post_process_prompt = Some(prompt.prompt.clone());
                                            }
                                        }
                                    }
                                    PostProcessOutcome::ToolExecuted(message) => {
                                        // Save to history (original transcription only)
                                        let hm_clone = Arc::clone(&hm);
                                        let transcription_for_history = transcription.clone();
                                        tauri::async_runtime::spawn(async move {
                                            if let Err(e) = hm_clone
                                                .save_transcription(
                                                    samples_clone,
                                                    transcription_for_history,
                                                    None,
                                                    None,
                                                )
                                                .await
                                            {
                                                error!("Failed to save transcription to history: {}", e);
                                            }
                                        });

                                        // Show tool result in overlay, do NOT paste
                                        if OPERATION_GENERATION.load(Ordering::SeqCst) == gen {
                                            show_tool_overlay(&ah, &message);
                                            change_tray_icon(&ah, TrayIconState::Idle);
                                        }
                                        return;
                                    }
                                    PostProcessOutcome::Empty => {
                                        // No-op, original transcription used as final_text
                                    }
                                }
                            }

                            // Trigger TTS if enabled and post-processing was successful
                            if settings.tts_enabled && post_processed_text.is_some() {
                                let tts_manager_clone = tts_manager.clone();
                                let text_to_speak = final_text.clone();
                                info!("Triggering TTS with text: {}", text_to_speak);
                                std::thread::spawn(move || {
                                    if let Err(e) = tts_manager_clone.speak(&text_to_speak) {
                                        error!("TTS failed: {}", e);
                                    }
                                });
                            }

                            // Save to history with post-processed text and prompt
                            let hm_clone = Arc::clone(&hm);
                            let transcription_for_history = transcription.clone();
                            tauri::async_runtime::spawn(async move {
                                if let Err(e) = hm_clone
                                    .save_transcription(
                                        samples_clone,
                                        transcription_for_history,
                                        post_processed_text,
                                        post_process_prompt,
                                    )
                                    .await
                                {
                                    error!("Failed to save transcription to history: {}", e);
                                }
                            });

                            // Check if this operation is still current before pasting
                            if OPERATION_GENERATION.load(Ordering::SeqCst) != gen {
                                debug!("Operation became stale during transcription, skipping paste");
                                return;
                            }

                            // Paste the final text (either processed or original)
                            let ah_clone = ah.clone();
                            let paste_time = Instant::now();
                            ah.run_on_main_thread(move || {
                                match utils::paste(final_text, ah_clone.clone()) {
                                    Ok(()) => debug!(
                                        "Text pasted successfully in {:?}",
                                        paste_time.elapsed()
                                    ),
                                    Err(e) => error!("Failed to paste transcription: {}", e),
                                }
                                // Hide the overlay after transcription is complete
                                utils::hide_recording_overlay(&ah_clone);
                                change_tray_icon(&ah_clone, TrayIconState::Idle);
                            })
                            .unwrap_or_else(|e| {
                                error!("Failed to run paste on main thread: {:?}", e);
                                if OPERATION_GENERATION.load(Ordering::SeqCst) == gen {
                                    utils::hide_recording_overlay(&ah);
                                    change_tray_icon(&ah, TrayIconState::Idle);
                                }
                            });
                        } else if OPERATION_GENERATION.load(Ordering::SeqCst) == gen {
                            utils::hide_recording_overlay(&ah);
                            change_tray_icon(&ah, TrayIconState::Idle);
                        }
                    }
                    Err(err) => {
                        debug!("Global Shortcut Transcription error: {}", err);
                        if OPERATION_GENERATION.load(Ordering::SeqCst) == gen {
                            utils::hide_recording_overlay(&ah);
                            change_tray_icon(&ah, TrayIconState::Idle);
                        }
                    }
                }
            } else {
                debug!("No samples retrieved from recording stop");
                if OPERATION_GENERATION.load(Ordering::SeqCst) == gen {
                    utils::hide_recording_overlay(&ah);
                    change_tray_icon(&ah, TrayIconState::Idle);
                }
            }
        });

        // Store the new task handle for potential abortion
        if let Ok(mut task) = TRANSCRIPTION_TASK.lock() {
            *task = Some(handle);
        }

        debug!(
            "TranscribeAction::stop completed in {:?}",
            stop_time.elapsed()
        );
    }
}

// Test Action
struct TestAction;

impl ShortcutAction for TestAction {
    fn start(&self, app: &AppHandle, binding_id: &str, shortcut_str: &str) {
        log::info!(
            "Shortcut ID '{}': Started - {} (App: {})", // Changed "Pressed" to "Started" for consistency
            binding_id,
            shortcut_str,
            app.package_info().name
        );
    }

    fn stop(&self, app: &AppHandle, binding_id: &str, shortcut_str: &str) {
        log::info!(
            "Shortcut ID '{}': Stopped - {} (App: {})", // Changed "Released" to "Stopped" for consistency
            binding_id,
            shortcut_str,
            app.package_info().name
        );
    }
}

// Static Action Map
pub static ACTION_MAP: Lazy<HashMap<String, Arc<dyn ShortcutAction>>> = Lazy::new(|| {
    let mut map = HashMap::new();
    map.insert(
        "transcribe".to_string(),
        Arc::new(TranscribeAction) as Arc<dyn ShortcutAction>,
    );
    map.insert(
        "test".to_string(),
        Arc::new(TestAction) as Arc<dyn ShortcutAction>,
    );
    map
});

#[cfg(test)]
mod tests {
    use super::*;
    use crate::settings::{get_default_settings, LLMPrompt};
    use crate::tools::PostProcessOutcome;

    /// Helper: returns settings with a fully-configured post-processing setup.
    fn settings_with_post_process() -> AppSettings {
        let mut s = get_default_settings();
        s.post_process_enabled = true;
        s.post_process_provider_id = "ollama".to_string();
        s.post_process_models
            .insert("ollama".to_string(), "llama3".to_string());
        s.post_process_prompts = vec![LLMPrompt {
            id: "test_prompt".to_string(),
            name: "Test".to_string(),
            prompt: "Fix this: ${output}".to_string(),
        }];
        s.post_process_selected_prompt_id = Some("test_prompt".to_string());
        s
    }

    /// Validate early-return conditions without needing a full AppHandle.
    /// Mirrors the validation logic at the top of `maybe_post_process_transcription`.
    fn should_skip_post_process(settings: &AppSettings) -> bool {
        if !settings.post_process_enabled {
            return true;
        }
        if settings.active_post_process_provider().is_none() {
            return true;
        }
        let provider = settings.active_post_process_provider().unwrap();
        let model = settings
            .post_process_models
            .get(&provider.id)
            .cloned()
            .unwrap_or_default();
        if model.trim().is_empty() {
            return true;
        }
        if settings.post_process_selected_prompt_id.is_none() {
            return true;
        }
        let prompt_id = settings.post_process_selected_prompt_id.as_ref().unwrap();
        let prompt = settings
            .post_process_prompts
            .iter()
            .find(|p| &p.id == prompt_id);
        match prompt {
            Some(p) if !p.prompt.trim().is_empty() => false,
            _ => true,
        }
    }

    #[test]
    fn disabled_returns_empty() {
        let mut s = settings_with_post_process();
        s.post_process_enabled = false;
        assert!(
            should_skip_post_process(&s),
            "Should skip when disabled"
        );
    }

    #[test]
    fn no_provider_returns_empty() {
        let mut s = settings_with_post_process();
        s.post_process_provider_id = "nonexistent_provider".to_string();
        assert!(
            should_skip_post_process(&s),
            "Should skip when provider is invalid"
        );
    }

    #[test]
    fn no_model_returns_empty() {
        let mut s = settings_with_post_process();
        s.post_process_models
            .insert("ollama".to_string(), "".to_string());
        assert!(
            should_skip_post_process(&s),
            "Should skip when model is empty"
        );
    }

    #[test]
    fn no_prompt_returns_empty() {
        let mut s = settings_with_post_process();
        s.post_process_selected_prompt_id = None;
        assert!(
            should_skip_post_process(&s),
            "Should skip when no prompt is selected"
        );
    }

    #[test]
    fn valid_settings_should_not_skip() {
        let s = settings_with_post_process();
        assert!(
            !should_skip_post_process(&s),
            "Should not skip with valid settings"
        );
    }

    #[test]
    fn post_process_outcome_variants() {
        // Verify PostProcessOutcome can be constructed
        let text = PostProcessOutcome::Text("hello".to_string());
        let tool = PostProcessOutcome::ToolExecuted("Opened Safari".to_string());
        let empty = PostProcessOutcome::Empty;

        assert!(matches!(text, PostProcessOutcome::Text(_)));
        assert!(matches!(tool, PostProcessOutcome::ToolExecuted(_)));
        assert!(matches!(empty, PostProcessOutcome::Empty));
    }
}
