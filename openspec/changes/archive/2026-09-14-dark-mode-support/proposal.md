## Why

The Pomodoro app needs a direct theme choice that does not depend on the operating system color preference. An explicit Light/Dark control will make the dark-first PWA predictable in different lighting conditions and easy to switch while working.

## What Changes

- Add a compact theme icon control that switches between Light and Dark choices.
- Use Dark as the default theme when no valid preference has been saved.
- Persist the selected theme locally and restore it on reload and PWA startup.
- Apply the selected theme consistently to the timer, statistics dashboard, history, focus states, and chart colors.
- Keep theme selection functional without a backend or network connection.
- Update browser and PWA theme metadata when the active theme changes.
- Provide an accessible action label, keyboard operation, and visible focus feedback for the control.

## Capabilities

### New Capabilities

### Modified Capabilities

- `pomodoro-timer`: extend theme behavior from system-preference light-mode support to an explicit persisted Light/Dark selection.

## Impact

- Affected files: `index.html`, `styles.css`, `app.js`, and `manifest.webmanifest` if static PWA theme metadata needs adjustment.
- Persistence: add a versioned localStorage preference key; existing timer state and session history remain unchanged.
- Dependencies: no new runtime dependency; continue using the existing static JavaScript, CSS, and PWA assets.
- Compatibility: preserve static hosting, offline operation, responsive layout, and migrate any legacy `system` preference to Dark.
