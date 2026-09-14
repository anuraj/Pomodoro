## Why

The Pomodoro timer records when a session happened but not what the user intended to focus on. A short optional note for the next work session will make history more useful for reviewing completed focus work without adding accounts, backend storage, or a complex task-management workflow.

## What Changes

- Add an optional text input for the next focus/work session.
- Enforce a maximum length of 24 characters at the input boundary.
- Capture the note when a work session completes and store it with that history record.
- Display the saved note in the corresponding history entry when present.
- Preserve existing behavior for break sessions and older history records without notes.
- Keep the feature keyboard accessible, responsive, localStorage-backed, and compatible with static/offline PWA use.

## Capabilities

### New Capabilities

### Modified Capabilities

- `pomodoro-timer`: extend work-session history records and the timer UI with an optional focus note limited to 24 characters.

## Impact

- Affected files: `index.html` for the note input, `styles.css` for compact responsive styling, and `app.js` for validation, capture, persistence, and history rendering.
- Persistence: extend new work-session history records with an optional note field; existing records remain valid and render without a note.
- Compatibility: no backend, dependency, manifest, or migration required; static hosting and offline browser persistence remain unchanged.
