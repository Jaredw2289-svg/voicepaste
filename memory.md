# VoicePaste Packaging And Signing Memory

Updated: 2026-03-13

## Fresh package status

- Built via `./scripts/release-macos.sh`
- Output DMG: `out/release/VoicePaste.dmg`
- Output app: `out/release/VoicePaste-darwin-arm64/VoicePaste.app`
- App notarization status: Accepted
- DMG notarization status: Accepted
- `xcrun stapler validate out/release/VoicePaste.dmg`: passed
- Installed app Gatekeeper assessment: accepted, source `Notarized Developer ID`

## Signing identity

- Main bundle identifier: `com.junyuwang.voicepaste`
- Team identifier: `ULSTAGR4F5`
- Signing identity: `Developer ID Application: Junyu Wang (ULSTAGR4F5)`
- Main app and bundled helper apps were checked with `codesign -dv --verbose=4`
- Main app and helpers all used the same team/signing authority chain
- `codesign --verify --deep --strict` passed on the packaged app

## Accessibility / permission conclusion

- I did **not** find evidence that the current packaged app fails because of nested code-sign mismatch.
- The packaged app, helper apps, bundle identifier, and Team ID are consistent.
- The more likely causes of past permission issues were:
  - running from the DMG instead of `/Applications`
  - stale local TCC permission state from older installs/builds
  - using a different executable identity during development (`Electron` / terminal host) vs packaged app
- For this cleanup/rebuild cycle, local TCC state was reset for `com.junyuwang.voicepaste` and old installs/data were removed before reinstalling.

## Local runtime logging

- Persistent runtime log path: `~/Library/Logs/VoicePaste/runtime.log`
- Verified by launching the freshly installed app once after rebuild
- Log file includes startup metadata and will be used for packaged-app debugging
- Realtime diagnostics now log:
  - realtime start request context
  - realtime stop snapshots
  - `No speech detected` diagnostics

## Local cleanup performed on 2026-03-13

- Killed running `VoicePaste` processes
- Removed old `/Applications/VoicePaste.app`
- Removed `~/Library/Application Support/VoicePaste`
- Removed `~/Library/Logs/VoicePaste`
- Removed old `~/Library/Logs/DiagnosticReports/VoicePaste-*.ips`
- Removed local build outputs before rebuild
- Reset TCC entries for `All`, `Microphone`, `Accessibility`, and `AppleEvents`

## Fresh install verification

- Reinstalled the newly built app to `/Applications/VoicePaste.app`
- `spctl -a -vv /Applications/VoicePaste.app`: accepted
- Launched successfully once after install
- Verified runtime log file was created

