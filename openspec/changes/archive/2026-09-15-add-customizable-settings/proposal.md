## Why

Timer durations, appearance controls, and notification preferences are currently fixed or scattered across header actions, which makes personalization difficult to discover and manage. A single persistent settings surface will let users tailor focus and break sessions without disrupting an active timer or requiring a backend.

## What Changes

- Add an accessible settings surface that groups focus duration, break duration, work accent color, break accent color, theme, and browser notification preferences.
- Allow users to configure focus and break durations, with changes applying to the next matching session rather than altering a running or paused session.
- Allow users to choose separate accent colors for work and break states while retaining Light and Dark as the base themes.
- Move the existing theme and notification controls from the timer header into settings without removing their current capabilities or permission-aware behavior.
- Persist all settings in browser localStorage and restore them after reload or PWA launch, using safe defaults when stored values are missing or invalid.
- Keep the settings experience responsive, keyboard accessible, and compatible with offline static hosting.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `pomodoro-timer`: Add a unified, locally persisted settings experience for configurable session durations, work and break accent colors, theme selection, and browser notifications.

## Impact

- Affects the timer state and duration logic in `app.js`, including reset, transition, history duration, and persisted-state restoration behavior.
- Replaces the standalone theme and notification header controls in `index.html` with a settings trigger and responsive settings UI.
- Extends the theme tokens and settings-control styles in `styles.css` so custom accents work across Light and Dark themes.
- Extends browser localStorage data with validated settings while remaining compatible with existing timer, theme, notification, and history data.
- Requires no backend, server-side runtime, or new framework dependency and remains suitable for the existing static PWA deployment.