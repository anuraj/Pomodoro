## Context

The static PWA currently records completed sessions in localStorage and calls `playCompletionTone()` from the single `completeSession()` path for both work and break transitions. There is no notification permission control or notification preference. See `proposal.md` for motivation and `specs/pomodoro-timer/spec.md` for the behavior contract.

## Goals / Non-Goals

**Goals:**

- Add an explicit, accessible local opt-in control for browser completion notifications.
- Request permission only from a user gesture and never on page load or timer start.
- Persist the user's intent separately from timer state, history, and theme preference.
- Send useful work-complete and break-complete notifications when permission is granted.
- Keep audio alerts active independently and preserve all timer transitions when notifications are unavailable.
- Keep the implementation dependency-free and compatible with static hosting and offline PWA use.

**Non-Goals:**

- Push notifications while the app is closed or not running.
- Server-side notification delivery, user accounts, or cross-device synchronization.
- Replacing audio alerts with browser notifications.
- Automatically prompting users for permission without an explicit opt-in action.

## Decisions

### Use a native opt-in control with explicit state

Add a compact labeled checkbox or toggle in the existing timer shell. The control exposes disabled, enabled, denied, and unsupported states through visible text and accessible state information. A user gesture starts the permission request when needed.

**Alternative considered:** Request permission when the timer starts. Rejected because browsers restrict unsolicited permission prompts and users have not explicitly requested notification setup.

### Store intent separately from browser permission

Use a versioned localStorage key for the user's opt-in intent. Treat the browser's `Notification.permission` as authoritative for actual delivery. On reload, restore the intent and inspect current permission without requesting permission again.

**Alternative considered:** Treat `Notification.permission === 'granted'` as the preference. Rejected because permission can be revoked externally and the UI needs to distinguish user intent from current browser capability.

### Centralize completion notification delivery

Add one guarded notification function beside the existing audio function and call it from `completeSession()` using the completed session type before state advances. It should feature-detect `window.Notification`, check the persisted opt-in and current permission, build session-specific title/body content, and catch construction errors.

**Alternative considered:** Add separate notification logic inside work and break branches. Rejected because it duplicates permission checks and risks inconsistent failure handling.

### Gracefully degrade to audio-only

Notification failures, denied permission, unsupported browsers, and background delivery limitations must not throw into the timer transition. The existing audio alert remains an independent attempt, and history/state updates happen regardless of notification outcome.

**Alternative considered:** Block session completion until permission is resolved. Rejected because notifications are an enhancement and must not interrupt the core timer workflow.

## Risks / Trade-offs

- [Permission is denied] -> Keep the preference off, show an unavailable/denied state, and continue with audio-only alerts.
- [Notification API is unavailable] -> Hide or disable the opt-in control with an explanatory accessible status; keep the timer fully usable.
- [Permission is revoked after enabling] -> Reconcile the control state on load and before delivery without re-prompting automatically.
- [Browser notifications are suppressed in background or installed contexts] -> Treat delivery as best effort and preserve audio and in-app state transitions.
- [Notification construction throws] -> Catch the error and continue session completion without surfacing an unhandled exception.

## Migration Plan

1. Add the notification preference key, control markup, and accessible status text without changing existing storage keys.
2. Implement feature detection, explicit permission requesting, preference persistence, and permission-aware UI state.
3. Add guarded work/break completion notification delivery alongside the current audio call.
4. Validate granted, denied, unsupported, reload, and failure paths in the browser, including offline/static-file operation.
5. Roll back by removing the control and notification function; existing timer, history, and audio behavior remain unchanged.
