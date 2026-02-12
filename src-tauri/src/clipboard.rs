use crate::settings::{get_settings, ClipboardHandling, PasteMethod};
use enigo::Enigo;
use enigo::Key;
use enigo::Keyboard;
use enigo::Settings;
use tauri::AppHandle;
use tauri_plugin_clipboard_manager::ClipboardExt;

// Wayland auto-paste: not supported.
//
// Tested approaches that do NOT work on GNOME Wayland:
// - wtype (zwp_virtual_keyboard_v1): commands execute but keystrokes are not
//   delivered to the focused window. The overlay steals focus, and even after
//   hiding it + waiting for the compositor to return focus, wtype keystrokes
//   are silently dropped.
// - wl-copy + wtype Ctrl+V: same focus issue — wtype can't simulate Ctrl+V
//   into the correct window.
// - enigo (libxdo backend): X11-only, does not work on Wayland at all.
// - Reordering hide-overlay → delay → paste: the compositor focus return
//   timing is unreliable, keystrokes still go to the wrong window.
//
// On Wayland, the paste method is forced to ClipboardOnly. The user pastes
// manually with Ctrl+V.

/// Sends a Ctrl+V or Cmd+V paste command using platform-specific virtual key codes.
/// This ensures the paste works regardless of keyboard layout (e.g., Russian, AZERTY, DVORAK).
fn send_paste_ctrl_v() -> Result<(), String> {
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
/// Note: enigo uses X11/libxdo on Linux, so this only works on X11.
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

fn copy_to_clipboard(text: &str, app_handle: &AppHandle) -> Result<(), String> {
    let clipboard = app_handle.clipboard();
    clipboard
        .write_text(text)
        .map_err(|e| format!("Failed to write to clipboard: {}", e))?;
    log::info!("Text copied to clipboard (clipboard-only mode)");
    Ok(())
}

pub fn paste(text: String, app_handle: AppHandle) -> Result<(), String> {
    let settings = get_settings(&app_handle);
    let mut paste_method = settings.paste_method;

    // On Wayland, force clipboard-only mode — auto-paste is not supported
    // (see comment at the top of this file for details).
    #[cfg(target_os = "linux")]
    if crate::wayland::is_wayland() && paste_method != PasteMethod::ClipboardOnly {
        log::info!(
            "Wayland session detected: overriding paste method {:?} → ClipboardOnly",
            paste_method
        );
        paste_method = PasteMethod::ClipboardOnly;
    }

    log::info!("Using paste method: {:?}", paste_method);

    // Perform the paste operation
    match paste_method {
        PasteMethod::CtrlV => paste_via_clipboard_ctrl_v(&text, &app_handle)?,
        PasteMethod::Direct => paste_via_direct_input(&text)?,
        #[cfg(not(target_os = "macos"))]
        PasteMethod::ShiftInsert => paste_via_clipboard_shift_insert(&text, &app_handle)?,
        PasteMethod::ClipboardOnly => {
            return copy_to_clipboard(&text, &app_handle);
        }
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
