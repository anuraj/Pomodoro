## Why

The Pomodoro app currently plays an audio tone when work or break sessions complete, but users can miss that signal when the tab is backgrounded, minimized, or muted. An explicit local opt-in for browser notifications will provide a visible completion signal without sending notifications until the user grants permission.

## What Changes

- Add a compact notification preference control with a clear disabled, enabled, and unavailable state.
- Request browser notification permission only after an explicit user action.
- Persist the user's notification opt-in preference locally without affecting timer or history data.
- Display a browser notification when a work or break session completes and the permission is granted.
- Continue playing the existing audio notification independently of browser notification availability.
- Handle denied permission, unsupported browsers, background-tab limitations, and notification construction failures without interrupting the timer.
- Keep the feature compatible with static hosting, offline PWA use, and browser-only execution.

## Capabilities

### New Capabilities

### Modified Capabilities

- `pomodoro-timer`: extend session completion notifications with an explicit local browser-notification opt-in alongside the existing audio notification.

## Impact

- Affected files: `index.html`, `styles.css`, and `app.js`; `manifest.webmanifest` only if notification-related PWA metadata is required by implementation constraints.
- Persistence: add a versioned localStorage preference key; existing timer state, history, statistics, and theme preference remain unchanged.
- Browser API: use the Notification API through feature detection and permission checks; no new dependency or backend is required.
- Compatibility: unsupported or denied notifications degrade to audio-only completion alerts, and the core timer remains usable offline and on static hosting.
