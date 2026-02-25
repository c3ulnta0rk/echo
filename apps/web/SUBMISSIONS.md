# Echo — Directory Submission Plan

Step-by-step instructions for submitting Echo to directories, package managers, and curated lists. Run these in order — earlier submissions provide backlinks that help later ones.

---

## Pre-submission checklist (do once, before anything else)

- [ ] Add GitHub topics to the repo: `speech-to-text`, `transcription`, `whisper`, `parakeet`, `offline`, `privacy`, `open-source`, `macos`, `windows`, `linux`, `tauri`
  → Go to https://github.com/damien-schneider/Echo → gear icon next to "About" → add topics
- [ ] Verify the repo has a good description, website URL, and preview image set in GitHub settings
- [ ] Confirm latest release binaries are codesigned and notarized (required for Homebrew Cask)

---

## Boilerplate copy (paste into forms)

**Short description (160 chars):**
> Free, open-source, 100% offline speech-to-text for macOS, Windows, and Linux. Powered by Whisper AI — your voice never leaves your device.

**Long description:**
> Echo is a free, open-source speech-to-text application that runs entirely on your device. Press a global keyboard shortcut, speak naturally, and Echo transcribes your voice and pastes the text wherever your cursor is — with no internet connection, no account, and no data ever sent to a server.
>
> Powered by OpenAI's Whisper model and NVIDIA's Parakeet, Echo supports 100+ languages and works on macOS, Windows, and Linux. Features include push-to-talk, Voice Activity Detection, LLM post-processing, and file transcription. MIT licensed and free forever.

**Tagline (60 chars for Product Hunt):**
> Free offline speech-to-text powered by Whisper AI

**Key facts:**
- Price: Free (MIT License)
- Platforms: macOS 11+, Windows 10 (64-bit), Linux (AppImage / .deb)
- Offline: 100% — no internet required
- Open source: Yes — https://github.com/damien-schneider/Echo
- Download: https://github.com/damien-schneider/Echo/releases/latest
- Models: OpenAI Whisper (100+ languages), NVIDIA Parakeet V2/V3
- Account required: No

**Alternatives to position against:**
Otter.ai, Descript, Rev, Sonix, Super Whisper, Wispr Flow, Dragon Dictate, Apple Dictation, Google Docs Voice Typing

---

## Submission #1 — GitHub Topics (5 min, do this first)

**URL:** https://github.com/damien-schneider/Echo
**Action:** Click gear icon next to "About" → add topics listed above
**Why first:** Free, instant, improves discoverability on all GitHub-based searches

---

## Submission #2 — awesome-whisper (15–20 min)

**URL:** https://github.com/sindresorhus/awesome-whisper
**Type:** GitHub Pull Request
**Steps:**
1. Fork the repo
2. Edit `readme.md` — find the "Apps" or "Desktop Apps" section
3. Add: `- [Echo](https://github.com/damien-schneider/Echo) - Free, open-source, offline speech-to-text with global shortcuts and auto-paste for macOS, Windows, and Linux.`
4. Open a PR titled `Add Echo`
5. Confirm Echo has 20+ stars before submitting (requirement)

---

## Submission #3 — awesome-privacy (15–20 min)

**URL:** https://github.com/pluja/awesome-privacy
**Contributing guide:** https://github.com/pluja/awesome-privacy/blob/main/misc/Contributing.md
**Type:** GitHub Pull Request
**Steps:**
1. Fork the repo
2. Find the Speech-to-Text section in `README.md`
3. Add Echo under existing entries:
   ```
   - [Echo](https://github.com/damien-schneider/Echo) - Free, open-source, 100% offline speech-to-text for macOS, Windows, and Linux. No account, no cloud, MIT license.
   ```
4. Open a PR titled `Add Echo to Speech-to-Text`

---

## Submission #4 — OpenAlternative.co (5–10 min)

**URL:** https://openalternative.co/submit
**Type:** Web form
**Fields:**
- GitHub repo URL: `https://github.com/damien-schneider/Echo`
- Alternatives to: Otter.ai, Descript, Super Whisper, Wispr Flow, Rev
- Description: use short description above

---

## Submission #5 — opensourcealternative.to (5–10 min)

**URL:** https://www.opensourcealternative.to/submit
**Type:** Web form
**Fields:** GitHub repo URL + what proprietary tool it replaces (Otter.ai, Descript, Dragon)

---

## Submission #6 — AlternativeTo.net (10–15 min)

**URL:** https://alternativeto.net
**Type:** Web form (requires free account)
**Steps:**
1. Create account at alternativeto.net
2. Click your user icon → "Suggest new application"
3. Fill in: name (Echo), website (GitHub releases page), platforms (macOS, Windows, Linux), license (Open Source / MIT), description (use long description above), tags (speech-to-text, transcription, whisper, offline, privacy)
4. Also go to Otter.ai's page → "Contribute" → "Suggest Alternatives" → add Echo
5. Do the same on Super Whisper, Dragon, Descript pages

---

## Submission #7 — open-source-mac-os-apps (15 min)

**URL:** https://github.com/serhii-londar/open-source-mac-os-apps
**Type:** GitHub Pull Request
**Steps:**
1. Fork the repo
2. Find the Audio or Utilities section in `README.md`
3. Add Echo alphabetically:
   ```
   - [Echo](https://github.com/damien-schneider/Echo) - Free offline speech-to-text with global shortcuts powered by Whisper AI. ![swift_icon](media/swift_icon.png)
   ```
   (check the format they use for Rust/Tauri apps — use the correct language icon)
4. Open a PR

---

## Submission #8 — awesome-mac (15 min)

**URL:** https://github.com/jaywcjlove/awesome-mac
**Type:** GitHub Pull Request
**Steps:**
1. Fork the repo
2. Find the AI / Productivity / Audio section
3. Add Echo with the standard format used in that repo
4. Open a PR

---

## Submission #9 — Product Hunt (30–60 min, schedule in advance)

**URL:** https://www.producthunt.com/launch
**Preparation guide:** https://www.producthunt.com/launch/preparing-for-launch
**Tips:**
- Schedule for a Tuesday, Wednesday, or Thursday
- Build community engagement before launch day (comment on other products for 1–2 weeks)
- Prepare: logo (240×240px PNG), 3–5 screenshots, tagline (≤60 chars), description
- Tagline: `Free offline speech-to-text powered by Whisper AI`
- Topics: Artificial Intelligence, Productivity, Open Source, Privacy
- Do NOT ask for upvotes — ask people to "check it out and share feedback"
- Reply to every comment on launch day

---

## Submission #10 — SourceForge mirror (10–15 min)

**URL:** https://sourceforge.net/p/import_project/github/
**Type:** Web form with GitHub OAuth
**Steps:**
1. Create a SourceForge account
2. Go to the GitHub Importer URL above
3. Authorize SourceForge with your GitHub account
4. Enter `damien-schneider/Echo`
5. Enable GitHub Release sync so new releases auto-mirror

---

## Submission #11 — Homebrew Cask (30–60 min)

**URL:** https://github.com/Homebrew/homebrew-cask
**Prerequisite:** Verify Echo's `.dmg` is codesigned with Apple Developer ID and notarized (required since Homebrew 5.0)
**Steps:**
1. Get the direct download URL for the latest `.dmg` from GitHub Releases
2. Run: `brew create --cask <dmg-url>`
3. Edit the generated `.rb` cask file
4. Run: `brew audit --cask --new echo`
5. Fix any audit failures
6. Fork homebrew-cask, add the cask file, open a PR

**Cask template:**
```ruby
cask "echo" do
  version "X.X.X"
  sha256 "<sha256 of dmg>"

  url "https://github.com/damien-schneider/Echo/releases/download/v#{version}/Echo_#{version}_aarch64.dmg"
  name "Echo"
  desc "Free offline speech-to-text powered by Whisper AI"
  homepage "https://github.com/damien-schneider/Echo"

  app "Echo.app"
end
```

---

## Submission #12 — Slant.co (15–20 min)

**URL:** https://www.slant.co
**Note:** Verify the site still accepts community contributions before investing time
**Steps:**
1. Search for "best offline speech-to-text" or similar
2. If a relevant question exists: click "I Recommend" → add Echo
3. Add pros: Free, Open Source, 100% Offline, Cross-Platform, Whisper-powered
4. Add cons: No mobile app, No meeting transcription (yet)

---

## Future submissions (when Windows/Linux builds are more established)

| Platform | URL | Notes |
|---|---|---|
| Chocolatey (Windows) | https://push.chocolatey.org | Requires Windows `.exe` installer |
| winget (Windows) | https://github.com/microsoft/winget-pkgs | GitHub PR with YAML manifest |
| Flathub (Linux) | https://github.com/flathub/flathub | Requires Flatpak manifest + AppStream XML |
| Privacy Guides | https://discuss.privacyguides.net | Forum discussion first, then PR |

---

## Estimated total time

| Phase | Time |
|---|---|
| GitHub topics + pre-flight | 10 min |
| GitHub PRs (awesome-whisper, awesome-privacy, open-source-mac-os-apps, awesome-mac) | ~1 hour |
| Web form submissions (OpenAlternative, opensourcealternative, AlternativeTo, SourceForge) | ~45 min |
| Product Hunt prep + launch | 2–4 hours (spread over days) |
| Homebrew Cask | 1 hour |
| **Total** | **~5–6 hours across 1–2 weeks** |
