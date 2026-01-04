use log::LevelFilter;

#[allow(dead_code)]
pub fn init() {
    // initialization is handled by tauri-plugin-log via the Tauri builder
}

pub fn set_debug_logging(enabled: bool) {
    let level = if enabled {
        LevelFilter::Debug
    } else {
        LevelFilter::Info
    };

    log::set_max_level(level);
}
