## 1. Notification preference and permission state

- [x] 1.1 Add a versioned localStorage notification preference with safe handling for missing or malformed values, and verify existing timer, history, theme, and statistics keys remain unchanged.
- [x] 1.2 Implement Notification API feature detection and permission-aware state resolution without requesting permission during initialization, and verify unsupported, default, granted, and denied states are represented safely.
- [x] 1.3 Add an explicit accessible opt-in control with enabled, disabled, denied, and unavailable feedback, and verify keyboard operation and visible focus styling.

## 2. Completion notification delivery

- [x] 2.1 Implement guarded browser notification delivery for completed work sessions and verify the title/body identifies that a break is ready.
- [x] 2.2 Implement guarded browser notification delivery for completed break sessions and verify the title/body identifies that work is ready.
- [x] 2.3 Integrate browser notification delivery beside the existing audio notification and verify notification failures do not interrupt state transitions, history persistence, or audio attempts.

## 3. Persistence and resilience

- [x] 3.1 Restore the notification preference and permission-aware control state after reload without automatically requesting permission, and verify the behavior in the static file/PWA startup path.
- [x] 3.2 Handle denied permission, revoked permission, unsupported browsers, and notification-construction failures with audio-only fallback, and verify no unhandled errors reach the console.

## 4. Final validation

- [x] 4.1 Run browser flows for opt-in, granted, denied, unsupported, reload, work completion, and break completion states and verify the timer remains usable in each case.
- [x] 4.2 Validate the changed HTML, CSS, and JavaScript files for syntax and whitespace issues and verify the feature requires no backend or new dependency.
