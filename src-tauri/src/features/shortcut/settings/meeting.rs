//! Meeting settings commands.

use crate::managers::model::ModelManager;
use std::sync::Arc;
use tauri::{AppHandle, Manager, State};

use crate::settings;

#[tauri::command]
pub fn change_meeting_system_audio_setting(app: AppHandle, enabled: bool) -> Result<(), String> {
    settings::update_settings(&app, |s| {
        s.meeting_system_audio_enabled = enabled;
    });
    Ok(())
}

#[tauri::command]
pub fn change_meeting_system_audio_device_setting(
    app: AppHandle,
    device: Option<String>,
) -> Result<(), String> {
    settings::update_settings(&app, |s| {
        s.meeting_system_audio_device = device;
    });
    Ok(())
}

#[tauri::command]
pub fn change_meeting_auto_summary_setting(app: AppHandle, enabled: bool) -> Result<(), String> {
    settings::update_settings(&app, |s| {
        s.meeting_auto_summary = enabled;
    });
    Ok(())
}

#[tauri::command]
pub fn change_meeting_chunk_duration_setting(
    app: AppHandle,
    duration_secs: u32,
) -> Result<(), String> {
    settings::update_settings(&app, |s| {
        s.meeting_chunk_duration_secs = duration_secs.max(10);
    });
    Ok(())
}

#[tauri::command]
pub fn change_meeting_diarization_setting(
    app: AppHandle,
    model_manager: State<'_, Arc<ModelManager>>,
    enabled: bool,
) -> Result<(), String> {
    settings::update_settings(&app, |s| {
        s.meeting_diarization_enabled = enabled;
    });

    // Auto-download diarization models when enabling
    if enabled {
        let segmentation_needs_download = model_manager
            .get_model_info("diarization-segmentation")
            .map(|m| !m.is_downloaded && !m.is_downloading)
            .unwrap_or(false);
        let embedding_needs_download = model_manager
            .get_model_info("diarization-embedding")
            .map(|m| !m.is_downloaded && !m.is_downloading)
            .unwrap_or(false);

        if segmentation_needs_download || embedding_needs_download {
            let mm = model_manager.inner().clone();
            tauri::async_runtime::spawn(async move {
                if segmentation_needs_download {
                    if let Err(e) = mm.download_model("diarization-segmentation").await {
                        log::error!("Failed to download segmentation model: {}", e);
                    }
                }
                if embedding_needs_download {
                    if let Err(e) = mm.download_model("diarization-embedding").await {
                        log::error!("Failed to download embedding model: {}", e);
                    }
                }
            });
        }
    }

    Ok(())
}

#[tauri::command]
pub fn get_diarization_status(
    app: AppHandle,
) -> Result<DiarizationStatus, String> {
    let model_manager = app.state::<Arc<ModelManager>>();
    let seg = model_manager.get_model_info("diarization-segmentation");
    let emb = model_manager.get_model_info("diarization-embedding");

    Ok(DiarizationStatus {
        segmentation_downloaded: seg.as_ref().map(|m| m.is_downloaded).unwrap_or(false),
        segmentation_downloading: seg.as_ref().map(|m| m.is_downloading).unwrap_or(false),
        embedding_downloaded: emb.as_ref().map(|m| m.is_downloaded).unwrap_or(false),
        embedding_downloading: emb.as_ref().map(|m| m.is_downloading).unwrap_or(false),
    })
}

#[derive(serde::Serialize)]
pub struct DiarizationStatus {
    pub segmentation_downloaded: bool,
    pub segmentation_downloading: bool,
    pub embedding_downloaded: bool,
    pub embedding_downloading: bool,
}
