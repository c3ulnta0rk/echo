use async_openai::types::{ChatCompletionTool, ChatCompletionToolType, FunctionObject};
use log::{debug, error, info};
use std::path::PathBuf;
use tauri::AppHandle;
use tauri::Manager;

use crate::settings::{self, SoundTheme};

/// Outcome of LLM post-processing: corrected text, tool execution, or nothing.
pub enum PostProcessOutcome {
    /// LLM returned corrected text -> paste it
    Text(String),
    /// Tools were called -> show overlay notification, don't paste
    ToolExecuted(String),
    /// Nothing useful returned -> fall back to original transcription
    Empty,
}

/// Result of executing a single tool call.
#[allow(dead_code)]
pub struct ToolResult {
    pub display_message: String,
    pub success: bool,
}

/// Returns the tool definitions available for the LLM to call.
pub fn get_tool_definitions() -> Vec<ChatCompletionTool> {
    vec![
        ChatCompletionTool {
            r#type: ChatCompletionToolType::Function,
            function: FunctionObject {
                name: "change_sound_theme".to_string(),
                description: Some(
                    "Cycle the audio feedback sound theme to the next option (Marimba -> Pop -> Custom -> Marimba)."
                        .to_string(),
                ),
                parameters: Some(serde_json::json!({
                    "type": "object",
                    "properties": {},
                    "required": []
                })),
                strict: None,
            },
        },
        ChatCompletionTool {
            r#type: ChatCompletionToolType::Function,
            function: FunctionObject {
                name: "create_note".to_string(),
                description: Some(
                    "Create a text note file with the given title and content."
                        .to_string(),
                ),
                parameters: Some(serde_json::json!({
                    "type": "object",
                    "properties": {
                        "title": {
                            "type": "string",
                            "description": "The title of the note (used as filename)"
                        },
                        "content": {
                            "type": "string",
                            "description": "The text content of the note"
                        }
                    },
                    "required": ["title", "content"]
                })),
                strict: None,
            },
        },
        ChatCompletionTool {
            r#type: ChatCompletionToolType::Function,
            function: FunctionObject {
                name: "open_application".to_string(),
                description: Some(
                    "Open an application by name on the user's system."
                        .to_string(),
                ),
                parameters: Some(serde_json::json!({
                    "type": "object",
                    "properties": {
                        "app_name": {
                            "type": "string",
                            "description": "The name of the application to open"
                        }
                    },
                    "required": ["app_name"]
                })),
                strict: None,
            },
        },
    ]
}

/// Dispatches a tool call to the correct handler and returns the result.
pub fn execute_tool(app: &AppHandle, tool_name: &str, arguments_json: &str) -> ToolResult {
    info!(
        "[Tools] Executing tool '{}' with args: {}",
        tool_name, arguments_json
    );

    match tool_name {
        "change_sound_theme" => execute_change_sound_theme(app),
        "create_note" => execute_create_note(app, arguments_json),
        "open_application" => execute_open_application(arguments_json),
        _ => ToolResult {
            display_message: format!("Unknown tool: {}", tool_name),
            success: false,
        },
    }
}

fn execute_change_sound_theme(app: &AppHandle) -> ToolResult {
    let current_theme = settings::get_settings(app).sound_theme;
    let next_theme = match current_theme {
        SoundTheme::Marimba => SoundTheme::Pop,
        SoundTheme::Pop => SoundTheme::Custom,
        SoundTheme::Custom => SoundTheme::Marimba,
    };

    settings::update_settings(app, |s| {
        s.sound_theme = next_theme;
    });

    let label = match next_theme {
        SoundTheme::Marimba => "Marimba",
        SoundTheme::Pop => "Pop",
        SoundTheme::Custom => "Custom",
    };

    info!("[Tools] Sound theme changed to {}", label);
    ToolResult {
        display_message: format!("Sound theme changed to {}", label),
        success: true,
    }
}

fn execute_create_note(app: &AppHandle, arguments_json: &str) -> ToolResult {
    #[derive(serde::Deserialize)]
    struct Args {
        title: String,
        content: String,
    }

    let args: Args = match serde_json::from_str(arguments_json) {
        Ok(a) => a,
        Err(e) => {
            error!("[Tools] Failed to parse create_note args: {}", e);
            return ToolResult {
                display_message: format!("Invalid arguments: {}", e),
                success: false,
            };
        }
    };

    // Sanitize filename: strip path separators, limit length
    let sanitized_title: String = args
        .title
        .chars()
        .filter(|c| *c != '/' && *c != '\\' && *c != '\0')
        .take(100)
        .collect();

    if sanitized_title.is_empty() {
        return ToolResult {
            display_message: "Note title cannot be empty".to_string(),
            success: false,
        };
    }

    let notes_dir: PathBuf = match app.path().app_data_dir() {
        Ok(dir) => dir.join("notes"),
        Err(e) => {
            error!("[Tools] Failed to get app data dir: {}", e);
            return ToolResult {
                display_message: format!("Failed to get app data directory: {}", e),
                success: false,
            };
        }
    };

    if let Err(e) = std::fs::create_dir_all(&notes_dir) {
        error!("[Tools] Failed to create notes dir: {}", e);
        return ToolResult {
            display_message: format!("Failed to create notes directory: {}", e),
            success: false,
        };
    }

    let file_path = notes_dir.join(format!("{}.txt", sanitized_title));
    match std::fs::write(&file_path, &args.content) {
        Ok(()) => {
            info!("[Tools] Note created at {:?}", file_path);
            ToolResult {
                display_message: format!("Note '{}' created", sanitized_title),
                success: true,
            }
        }
        Err(e) => {
            error!("[Tools] Failed to write note: {}", e);
            ToolResult {
                display_message: format!("Failed to create note: {}", e),
                success: false,
            }
        }
    }
}

fn execute_open_application(arguments_json: &str) -> ToolResult {
    #[derive(serde::Deserialize)]
    struct Args {
        app_name: String,
    }

    let args: Args = match serde_json::from_str(arguments_json) {
        Ok(a) => a,
        Err(e) => {
            error!("[Tools] Failed to parse open_application args: {}", e);
            return ToolResult {
                display_message: format!("Invalid arguments: {}", e),
                success: false,
            };
        }
    };

    let app_name = args.app_name.trim();
    if app_name.is_empty() {
        return ToolResult {
            display_message: "Application name cannot be empty".to_string(),
            success: false,
        };
    }

    debug!("[Tools] Attempting to open application: {}", app_name);

    #[cfg(target_os = "macos")]
    {
        match std::process::Command::new("open")
            .arg("-a")
            .arg(app_name)
            .spawn()
        {
            Ok(_) => {
                info!("[Tools] Opened application: {}", app_name);
                return ToolResult {
                    display_message: format!("Opened {}", app_name),
                    success: true,
                };
            }
            Err(e) => {
                error!("[Tools] Failed to open '{}': {}", app_name, e);
                return ToolResult {
                    display_message: format!("Failed to open {}: {}", app_name, e),
                    success: false,
                };
            }
        }
    }

    #[cfg(target_os = "windows")]
    {
        match std::process::Command::new("cmd")
            .args(["/C", "start", "", app_name])
            .spawn()
        {
            Ok(_) => {
                info!("[Tools] Opened application: {}", app_name);
                return ToolResult {
                    display_message: format!("Opened {}", app_name),
                    success: true,
                };
            }
            Err(e) => {
                error!("[Tools] Failed to open '{}': {}", app_name, e);
                return ToolResult {
                    display_message: format!("Failed to open {}: {}", app_name, e),
                    success: false,
                };
            }
        }
    }

    #[cfg(target_os = "linux")]
    {
        // Try gtk-launch first, then xdg-open, then direct exec
        let lowercase_name = app_name.to_lowercase();

        if let Ok(_) = std::process::Command::new("gtk-launch")
            .arg(&lowercase_name)
            .spawn()
        {
            info!("[Tools] Opened application via gtk-launch: {}", app_name);
            return ToolResult {
                display_message: format!("Opened {}", app_name),
                success: true,
            };
        }

        if let Ok(_) = std::process::Command::new("xdg-open")
            .arg(app_name)
            .spawn()
        {
            info!("[Tools] Opened application via xdg-open: {}", app_name);
            return ToolResult {
                display_message: format!("Opened {}", app_name),
                success: true,
            };
        }

        match std::process::Command::new(&lowercase_name).spawn() {
            Ok(_) => {
                info!(
                    "[Tools] Opened application via direct exec: {}",
                    app_name
                );
                ToolResult {
                    display_message: format!("Opened {}", app_name),
                    success: true,
                }
            }
            Err(e) => {
                error!("[Tools] Failed to open '{}': {}", app_name, e);
                ToolResult {
                    display_message: format!("Failed to open {}: {}", app_name, e),
                    success: false,
                }
            }
        }
    }
}
