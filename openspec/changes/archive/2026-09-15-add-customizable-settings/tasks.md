## 1. Settings Data And Persistence

- [x] 1.1 Add the unified `pomodoro-settings-v1` defaults, per-field validators, and loader in `app.js`, including fallback migration from the legacy theme and notification keys; verify valid, missing, malformed, and partially invalid localStorage records each produce the expected applied settings without startup errors.
- [x] 1.2 Add atomic settings persistence and runtime application for durations, theme, notification intent, and canonical work/break hex colors; verify one successful save writes every field and a storage failure leaves the timer usable with the in-memory values.
- [x] 1.3 Derive soft accent and readable foreground tokens from validated custom colors and expose them as CSS custom properties; verify representative light and dark selected colors retain readable text and visible keyboard focus in both base themes.

## 2. Settings Interface

- [x] 2.1 Replace the standalone theme and notification header buttons in `index.html` with one labeled settings icon button and a native dialog form containing duration, color, theme, and notification controls; verify every control has an associated label and the document retains a logical keyboard focus order.
- [x] 2.2 Style the dialog, grouped form controls, color swatches, validation states, and mobile layout in `styles.css` using the existing visual language; verify the settings surface fits without overlap or horizontal scrolling at narrow mobile and desktop widths in both Light and Dark themes.
- [x] 2.3 Implement dialog open, populate, cancel, Escape, save, validation-message, and focus-restoration behavior in `app.js`; verify unsaved edits are discarded, invalid durations from 1 through 120 are identified without closing, and successful saves update the visible app.

## 3. Timer And Notification Integration

- [x] 3.1 Replace fixed-duration lookups with configured focus and break durations while retaining `state.totalSeconds` as the active-session snapshot; verify idle settings changes update the matching timer, running and paused timers remain unchanged, mode transitions use the latest setting, and reset uses the configured focus duration.
- [x] 3.2 Record completed-session duration from the session snapshot and preserve restored running or paused state totals; verify changing a preference mid-session does not alter the countdown or cause the completed history duration to use the newer preference.
- [x] 3.3 Move notification enablement and permission status into the settings workflow while retaining permission-aware delivery and independent audio alerts; verify granted, denied, default, and unsupported Notification API states do not block saving unrelated settings or timer transitions.

## 4. Compatibility And End-To-End Verification

- [x] 4.1 Verify existing timer state, history, legacy theme preference, and legacy notification preference survive the first load of the new version, and verify invalid saved settings fall back per field to 25-minute focus, 5-minute break, existing accent colors, Dark theme, and notifications off as applicable.
- [x] 4.2 Exercise the complete settings workflow with keyboard-only interaction and browser accessibility inspection, including open/close focus behavior, labels, validation announcements, custom colors, both themes, and mobile/desktop layouts; verify all scenarios in `specs/pomodoro-timer/spec.md` are satisfied.
- [x] 4.3 Increment the cache version in `sw.js` after updating the static assets; install or reload the PWA once online, then verify the settings dialog opens and saved settings restore during an offline reload without network errors blocking the timer.