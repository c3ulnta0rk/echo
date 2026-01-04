//! TTS-related settings commands.

use tauri::AppHandle;
use crate::settings::{self, get_settings};

#[tauri::command]
pub fn change_tts_enabled_setting(app: AppHandle, enabled: bool) -> Result<(), String> {
    let mut settings = get_settings(&app);
    settings.tts_enabled = enabled;
    settings::write_settings(&app, settings);
    Ok(())
}
