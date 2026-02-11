use crate::settings::{get_settings, ClipboardHandling, PasteMethod};
use enigo::Enigo;
use enigo::Key;
use enigo::Keyboard;
use enigo::Settings;
use std::process::Command;
use tauri::AppHandle;
use tauri_plugin_clipboard_manager::ClipboardExt;

/// Sends Ctrl+V using wtype (for Wayland)
#[cfg(target_os = "linux")]
fn send_paste_wayland_wtype() -> Result<(), String> {
    // Attempt to use wtype to simulate Ctrl+V
    // wtype -M ctrl -k v -m ctrl
    let output = Command::new("wtype")
        .arg("-M")
        .arg("ctrl")
        .arg("-k")
        .arg("v")
        .arg("-m")
        .arg("ctrl")
        .output();

    match output {
        Ok(o) if o.status.success() => Ok(()),
        Ok(o) => Err(format!(
            "wtype failed: {}",
            String::from_utf8_lossy(&o.stderr)
        )),
        Err(e) => Err(format!("Failed to execute wtype: {}", e)),
    }
}

/// Sends a Ctrl+V or Cmd+V paste command using platform-specific virtual key codes.
/// This ensures the paste works regardless of keyboard layout (e.g., Russian, AZERTY, DVORAK).
fn send_paste_ctrl_v() -> Result<(), String> {
    // Platform-specific key definitions
    #[cfg(target_os = "linux")]
    {
        // On Wayland, we should use wtype if available, otherwise Enigo
        if crate::wayland::is_wayland() {
            return send_paste_wayland_wtype();
        }
    }
    #[cfg(target_os = "macos")]
    let (modifier_key, v_key_code) = (Key::Meta, Key::Other(9));
    #[cfg(target_os = "windows")]
    let (modifier_key, v_key_code) = (Key::Control, Key::Other(0x56)); // VK_V
    #[cfg(target_os = "linux")]
    let (modifier_key, v_key_code) = (Key::Control, Key::Unicode('v'));

    let mut enigo = Enigo::new(&Settings::default())
        .map_err(|e| format!("Failed to initialize Enigo: {}", e))?;

    // Press modifier + V
    enigo
        .key(modifier_key, enigo::Direction::Press)
        .map_err(|e| format!("Failed to press modifier key: {}", e))?;
    enigo
        .key(v_key_code, enigo::Direction::Click)
        .map_err(|e| format!("Failed to click V key: {}", e))?;

    std::thread::sleep(std::time::Duration::from_millis(100));

    enigo
        .key(modifier_key, enigo::Direction::Release)
        .map_err(|e| format!("Failed to release modifier key: {}", e))?;

    Ok(())
}

/// Sends a Shift+Insert paste command (Windows and Linux only).
/// This is more universal for terminal applications and legacy software.
#[cfg(not(target_os = "macos"))]
fn send_paste_shift_insert() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    let insert_key_code = Key::Other(0x2D); // VK_INSERT
    #[cfg(target_os = "linux")]
    let insert_key_code = Key::Other(0x76); // XK_Insert (keycode 118 / 0x76)

    let mut enigo = Enigo::new(&Settings::default())
        .map_err(|e| format!("Failed to initialize Enigo: {}", e))?;

    // Press Shift + Insert
    enigo
        .key(Key::Shift, enigo::Direction::Press)
        .map_err(|e| format!("Failed to press Shift key: {}", e))?;
    enigo
        .key(insert_key_code, enigo::Direction::Click)
        .map_err(|e| format!("Failed to click Insert key: {}", e))?;

    std::thread::sleep(std::time::Duration::from_millis(100));

    enigo
        .key(Key::Shift, enigo::Direction::Release)
        .map_err(|e| format!("Failed to release Shift key: {}", e))?;

    Ok(())
}

/// Pastes text directly using the enigo text method.
/// This tries to use system input methods if possible, otherwise simulates keystrokes one by one.
fn paste_via_direct_input(text: &str) -> Result<(), String> {
    let mut enigo = Enigo::new(&Settings::default())
        .map_err(|e| format!("Failed to initialize Enigo: {}", e))?;

    enigo
        .text(text)
        .map_err(|e| format!("Failed to send text directly: {}", e))?;

    Ok(())
}

/// Pastes text using the clipboard method with Ctrl+V/Cmd+V.
/// Saves the current clipboard, writes the text, sends paste command, then restores the clipboard.
fn paste_via_clipboard_ctrl_v(text: &str, app_handle: &AppHandle) -> Result<(), String> {
    // On Wayland, use wl-copy for better reliability if available
    #[cfg(target_os = "linux")]
    if crate::wayland::is_wayland() {
        return paste_via_wayland_clipboard(text);
    }

    let clipboard = app_handle.clipboard();

    // get the current clipboard content
    let clipboard_content = clipboard.read_text().unwrap_or_default();

    clipboard
        .write_text(text)
        .map_err(|e| format!("Failed to write to clipboard: {}", e))?;

    // small delay to ensure the clipboard content has been written to
    std::thread::sleep(std::time::Duration::from_millis(50));

    send_paste_ctrl_v()?;

    std::thread::sleep(std::time::Duration::from_millis(50));

    // restore the clipboard
    clipboard
        .write_text(&clipboard_content)
        .map_err(|e| format!("Failed to restore clipboard: {}", e))?;

    Ok(())
}

/// Pastes text using the clipboard method with Shift+Insert (Windows/Linux only).
/// Saves the current clipboard, writes the text, sends paste command, then restores the clipboard.
#[cfg(not(target_os = "macos"))]
fn paste_via_clipboard_shift_insert(text: &str, app_handle: &AppHandle) -> Result<(), String> {
    let clipboard = app_handle.clipboard();

    // get the current clipboard content
    let clipboard_content = clipboard.read_text().unwrap_or_default();

    clipboard
        .write_text(text)
        .map_err(|e| format!("Failed to write to clipboard: {}", e))?;

    // small delay to ensure the clipboard content has been written to
    std::thread::sleep(std::time::Duration::from_millis(50));

    send_paste_shift_insert()?;

    std::thread::sleep(std::time::Duration::from_millis(50));

    // restore the clipboard
    clipboard
        .write_text(&clipboard_content)
        .map_err(|e| format!("Failed to restore clipboard: {}", e))?;

    Ok(())
}

pub fn paste(text: String, app_handle: AppHandle) -> Result<(), String> {
    let settings = get_settings(&app_handle);
    let paste_method = settings.paste_method;

    log::info!("Using paste method: {:?}", paste_method);

    // Perform the paste operation
    match paste_method {
        PasteMethod::CtrlV => paste_via_clipboard_ctrl_v(&text, &app_handle)?,
        PasteMethod::Direct => paste_via_direct_input(&text)?,
        #[cfg(not(target_os = "macos"))]
        PasteMethod::ShiftInsert => paste_via_clipboard_shift_insert(&text, &app_handle)?,
    }

    // After pasting, optionally copy to clipboard based on settings
    if settings.clipboard_handling == ClipboardHandling::CopyToClipboard {
        let clipboard = app_handle.clipboard();
        clipboard
            .write_text(&text)
            .map_err(|e| format!("Failed to copy to clipboard: {}", e))?;
    }

    Ok(())
}

#[cfg(target_os = "linux")]
fn paste_via_wayland_clipboard(text: &str) -> Result<(), String> {
    // 1. Write to clipboard using wl-copy
    use std::io::Write;
    let mut child = Command::new("wl-copy")
        .stdin(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn wl-copy: {}", e))?;

    if let Some(mut stdin) = child.stdin.take() {
        stdin
            .write_all(text.as_bytes())
            .map_err(|e| format!("Failed to write to wl-copy stdin: {}", e))?;
    }

    let status = child
        .wait()
        .map_err(|e| format!("Failed to wait for wl-copy: {}", e))?;

    if !status.success() {
        return Err(format!("wl-copy failed with status: {}", status));
    }

    // 2. Simulate paste using wtype
    // Small delay to ensure clipboard is ready
    std::thread::sleep(std::time::Duration::from_millis(50));
    send_paste_wayland_wtype()
}
