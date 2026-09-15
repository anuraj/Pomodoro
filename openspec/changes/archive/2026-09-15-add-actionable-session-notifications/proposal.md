## Why

Current completion notifications only announce that the next timer is ready, so users cannot identify what just finished or begin the next interval directly from supported notification surfaces. Adding concise session context and a next-session action will make background Pomodoro transitions more useful while keeping notification delivery optional and local.

## What Changes

- Include the completed session type and duration in work and break completion notifications.
- Include the completed work session's focus note when one exists; omit note content for break sessions and work sessions without a note.
- Offer a context-specific notification action to start the ready break or next focus session on platforms that support notification actions.
- When the Start action is activated, open or focus the PWA and start the currently ready next session without changing its configured duration.
- When the notification body is activated, or notification actions are unsupported, open or focus the PWA with the next session idle and ready rather than starting it automatically.
- Preserve the existing notification opt-in, permission checks, audio alert, history persistence, timer transition, and graceful failure behavior.
- Keep notification handling compatible with static hosting and offline PWA operation without adding a backend or push-notification service.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `pomodoro-timer`: Enrich completion notifications with completed-session details and best-effort controls for starting the ready break or focus session.

## Impact

- `app.js` notification construction and session-completion flow will provide completed-session details and use the service-worker notification path when available.
- `sw.js` will display actionable notifications, handle action/body clicks, focus or open the app, and communicate whether the ready timer should start.
- The app/service-worker interaction will need an idempotent command contract so delayed or repeated notification clicks cannot restart or replace a timer that is no longer idle in the expected mode.
- The service-worker cache version will change so installed/offline PWAs receive the updated scripts.
- Existing localStorage settings, timer state, history, static hosting, and offline operation remain compatible; no new dependency or server-side component is required.