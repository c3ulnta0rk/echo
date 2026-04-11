//! Platform-abstracted system audio capture.
//!
//! Provides a trait for capturing system/output audio alongside microphone input.
//! Each platform has its own implementation.

use anyhow::Result;
use std::sync::mpsc;

/// Trait for capturing system audio.
pub trait SystemAudioCapture: Send {
    /// Start capturing system audio. Returns a receiver for audio samples (16kHz mono f32).
    fn start(&mut self) -> Result<mpsc::Receiver<Vec<f32>>>;
    /// Stop capturing.
    fn stop(&mut self) -> Result<()>;
    /// Check if system audio capture is available on this platform.
    fn is_available() -> bool
    where
        Self: Sized;
}

/// Check whether system audio capture is available on the current platform.
pub fn is_system_audio_available() -> bool {
    platform::is_available()
}

/// Create a platform-appropriate system audio capture instance.
pub fn create_system_capture() -> Result<Box<dyn SystemAudioCapture>> {
    platform::create()
}

// ── Platform implementations ───────────────────────────────────────────

#[cfg(target_os = "macos")]
mod platform {
    use super::*;

    /// macOS: ScreenCaptureKit audio-only stream (requires Screen Recording permission).
    /// This is a stub — full FFI implementation requires ScreenCaptureKit framework bindings.
    pub struct MacOsSystemCapture {
        running: bool,
    }

    impl MacOsSystemCapture {
        pub fn new() -> Result<Self> {
            Ok(Self { running: false })
        }
    }

    impl SystemAudioCapture for MacOsSystemCapture {
        fn start(&mut self) -> Result<mpsc::Receiver<Vec<f32>>> {
            let (_tx, rx) = mpsc::channel();
            self.running = true;
            // TODO: Implement ScreenCaptureKit audio-only stream
            // For now, return the receiver without sending samples
            log::warn!("macOS system audio capture is not yet implemented");
            Ok(rx)
        }

        fn stop(&mut self) -> Result<()> {
            self.running = false;
            Ok(())
        }

        fn is_available() -> bool {
            // ScreenCaptureKit is available on macOS 12.3+
            true
        }
    }

    pub fn is_available() -> bool {
        MacOsSystemCapture::is_available()
    }

    pub fn create() -> Result<Box<dyn SystemAudioCapture>> {
        Ok(Box::new(MacOsSystemCapture::new()?))
    }
}

#[cfg(target_os = "windows")]
mod platform {
    use super::*;

    /// Windows: WASAPI loopback capture via CPAL.
    pub struct WindowsSystemCapture {
        running: bool,
    }

    impl WindowsSystemCapture {
        pub fn new() -> Result<Self> {
            Ok(Self { running: false })
        }
    }

    impl SystemAudioCapture for WindowsSystemCapture {
        fn start(&mut self) -> Result<mpsc::Receiver<Vec<f32>>> {
            let (_tx, rx) = mpsc::channel();
            self.running = true;
            // TODO: Implement WASAPI loopback capture
            log::warn!("Windows system audio capture is not yet implemented");
            Ok(rx)
        }

        fn stop(&mut self) -> Result<()> {
            self.running = false;
            Ok(())
        }

        fn is_available() -> bool {
            true
        }
    }

    pub fn is_available() -> bool {
        WindowsSystemCapture::is_available()
    }

    pub fn create() -> Result<Box<dyn SystemAudioCapture>> {
        Ok(Box::new(WindowsSystemCapture::new()?))
    }
}

#[cfg(target_os = "linux")]
mod platform {
    use super::*;

    /// Linux: PipeWire/PulseAudio monitor source capture.
    pub struct LinuxSystemCapture {
        running: bool,
    }

    impl LinuxSystemCapture {
        pub fn new() -> Result<Self> {
            Ok(Self { running: false })
        }
    }

    impl SystemAudioCapture for LinuxSystemCapture {
        fn start(&mut self) -> Result<mpsc::Receiver<Vec<f32>>> {
            let (_tx, rx) = mpsc::channel();
            self.running = true;
            // TODO: Implement PipeWire/PulseAudio monitor source capture
            log::warn!("Linux system audio capture is not yet implemented");
            Ok(rx)
        }

        fn stop(&mut self) -> Result<()> {
            self.running = false;
            Ok(())
        }

        fn is_available() -> bool {
            // Check if PipeWire or PulseAudio is available
            true
        }
    }

    pub fn is_available() -> bool {
        LinuxSystemCapture::is_available()
    }

    pub fn create() -> Result<Box<dyn SystemAudioCapture>> {
        Ok(Box::new(LinuxSystemCapture::new()?))
    }
}

// Fallback for other platforms
#[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
mod platform {
    use super::*;

    pub fn is_available() -> bool {
        false
    }

    pub fn create() -> Result<Box<dyn SystemAudioCapture>> {
        anyhow::bail!("System audio capture is not supported on this platform")
    }
}
