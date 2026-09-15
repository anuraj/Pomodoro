## Context

The app is a static PWA implemented in `index.html`, `styles.css`, and `app.js`. Focus and break durations are compile-time constants, work and break colors are CSS tokens, and theme and notification preferences use separate localStorage keys controlled by two header buttons. Persisted timer state already stores `totalSeconds`, which can serve as a snapshot of the duration assigned when a session starts.

The implementation must continue to run without a backend or build step, preserve existing saved timer/history/preferences, and work offline after the service worker has cached the static assets. See `proposal.md` for motivation and `specs/pomodoro-timer/spec.md` for the behavior contract.

## Goals / Non-Goals

**Goals:**

- Centralize all user preferences in an accessible, responsive settings dialog.
- Validate and persist settings through a single versioned data model.
- Preserve an active or paused session when duration preferences change.
- Apply custom work and break accents consistently in either base theme while maintaining readable controls.
- Migrate existing theme and notification preferences without losing them.

**Non-Goals:**

- Synchronizing settings across browsers or devices.
- Adding long-break scheduling, multiple presets, or per-task durations.
- Allowing arbitrary customization of backgrounds, text, pause colors, or the full theme palette.
- Changing browser notification permission outside the browser-provided permission flow.

## Decisions

### Use one versioned settings record

Add a `pomodoro-settings-v1` localStorage record containing `focusMinutes`, `breakMinutes`, `workColor`, `breakColor`, `theme`, and `notificationsEnabled`. A loader will parse and validate each property independently, replacing an invalid or absent value with its default so one bad field does not discard the rest of the record.

On first load without the unified record, the loader will import valid values from the existing `pomodoro-theme-v1` and `pomodoro-notifications-v1` keys and use defaults for new settings. The next successful settings save will write the unified record. Existing keys can remain untouched for rollback compatibility, but the unified record becomes authoritative once present.

Alternative considered: continue storing one key per preference. A unified versioned record makes validation, form population, and future schema migration explicit and prevents partial writes from leaving the settings UI internally inconsistent.

### Use a native dialog with an atomic form submission

Replace the two header preference buttons with one icon-only settings trigger that opens a native `<dialog>`. The form will use number inputs for whole-minute durations, color inputs for work and break accents, a segmented or select-style Light/Dark theme control, and a notification checkbox with permission status. Save validates the complete form before applying any changes; Cancel closes without applying draft values.

Opening the dialog populates controls from applied settings and moves focus to the dialog. Closing restores focus to the trigger. Labels, validation messages, Escape handling, and dialog semantics provide keyboard and assistive-technology support without adding a UI dependency.

Alternative considered: an always-visible settings panel. A dialog keeps the timer and dashboard compact on mobile while preserving a single predictable entry point on desktop.

### Treat timer state as a session-duration snapshot

Configured durations are converted from minutes to seconds only when an idle timer is initialized, reset, or transitions to a new mode. The persisted timer state's `totalSeconds` and `remainingSeconds` remain unchanged when settings are saved during a running or paused session. If the current timer is idle, saving a new duration for that mode updates both values immediately.

Session completion records use the session snapshot in `state.totalSeconds`, not the latest preference, so history remains accurate if a preference changes mid-session. Reset always returns to an idle work timer using the latest configured focus duration.

Alternative considered: proportionally recalculate an active countdown. That would make a settings change unexpectedly add or remove time and complicate restored-session behavior.

### Apply validated accent tokens at runtime

Accept canonical six-digit hexadecimal colors from the settings form and assign them to runtime CSS custom properties for work and break accents. Derive soft-state colors and readable foreground colors from those values, and replace hard-coded work/break glow colors with variables. Light and Dark continue to control backgrounds, text, borders, and neutral tokens.

Color validation occurs before values are written to storage or CSS. The timer continues to distinguish paused state with the existing neutral pause tokens.

Alternative considered: expose the entire CSS palette. Limiting customization to mode accents preserves the tested Light/Dark foundations and reduces contrast and layout risks.

### Keep notification permission separate from preference intent

Saving notifications as enabled triggers the existing permission request from the user-initiated save action when needed. The stored preference records intent, but effective notification delivery still requires `Notification.permission === 'granted'`. Denied or unsupported states disable the control and present status without blocking other settings from saving.

Alternative considered: request permission when opening settings or loading the app. Browsers may reject non-user-initiated prompts, and automatic prompting would violate the existing opt-in behavior.

## Risks / Trade-offs

- [Custom accent colors can have poor contrast against fixed foregrounds] -> Calculate a light or dark foreground from color luminance and keep neutral text for non-accent surfaces.
- [Legacy and unified preference keys can disagree] -> Treat the unified record as authoritative whenever it parses successfully and consult legacy keys only during first-run migration.
- [A corrupted settings record can prevent startup] -> Catch storage and parse failures, validate fields independently, and fall back to defaults.
- [Changing settings while a timer runs can make displayed preferences differ from that session] -> Preserve the visible countdown and document the next-session behavior through the settings UI state and tests.
- [Browser notification permission can change outside the app] -> Re-evaluate permission whenever settings opens and whenever notification state renders.

## Migration Plan

1. Deploy the updated static HTML, CSS, JavaScript, and service-worker cache metadata together.
2. On load, prefer a valid `pomodoro-settings-v1` record; otherwise import valid legacy theme and notification values and fill new fields with defaults.
3. Preserve existing timer and history records. Normalize an idle timer to configured duration only after settings are explicitly saved; retain persisted running or paused session totals.
4. Roll back by restoring the previous static assets. Existing legacy keys remain available, and the previous app will ignore the new settings key.