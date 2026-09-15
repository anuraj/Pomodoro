## 1. Ready Session Identity

- [x] 1.1 Extend timer-state defaults and loading with a nullable ready-session token while preserving older saved states; verify missing, valid, and malformed token values load without changing existing mode, phase, total, or remaining time.
- [x] 1.2 Assign and persist a unique ready-session token when completion advances to the next idle mode, and clear it on manual start or reset; verify each transition gets a new token and ordinary timer controls cannot retain a stale token.
- [x] 1.3 Add one guarded next-session command that starts only when expected mode, ready token, and idle phase all match; verify valid, stale, repeated, wrong-mode, and already-running commands leave the correct timer state.

## 2. Detailed Notification Delivery

- [x] 2.1 Build work and break notification content from the completed history record, including type and snapshot duration plus an optional work focus note; verify work with note, work without note, and break payloads contain no empty placeholders or incorrect current-setting values.
- [x] 2.2 Reorder completion persistence so the next idle state and token are saved before notification delivery while audio remains independent; verify immediate action handling sees the ready state and display failures do not interrupt history, transition, or audio attempts.
- [x] 2.3 Display completion notifications through the active service-worker registration with one context-specific `start-next` action and mode/token data, retaining a non-action page-notification fallback; verify supported and fallback payloads remain informative and permission-aware.

## 3. Notification Click Routing

- [x] 3.1 Add a `notificationclick` handler in `sw.js` that closes the notification and focuses an existing same-origin app client or opens one when absent; verify notification body clicks never send a start command.
- [x] 3.2 Route `start-next` clicks to an open client with a mode/token message and to a newly opened client with equivalent short-lived URL parameters; verify only one matching client receives the command and all click promises are contained by the event lifetime.
- [x] 3.3 Handle service-worker messages and startup URL commands in `app.js` through the same guarded command, then remove consumed URL parameters; verify valid commands start once while body clicks, malformed input, stale tokens, and duplicate delivery do not reset or replace timer state.

## 4. PWA And End-To-End Verification

- [x] 4.1 Increment the service-worker cache version and verify updated page and worker scripts replace the prior offline cache together after an online load.
- [x] 4.2 Exercise notification flows with an open app for completed work with and without a note, completed break, body click, valid Start action, stale action, repeated action, unsupported actions, and notification failures; verify all scenarios in `specs/pomodoro-timer/spec.md` and existing audio/history behavior pass.
- [x] 4.3 Exercise closed-client Start and body-click flows after the PWA is cached, including an offline launch; verify the app opens to the expected ready timer, starts only for a valid Start action, restores local settings/state, and requires no backend or new dependency.
- [x] 4.4 Run JavaScript syntax, workspace diagnostics, whitespace, strict OpenSpec validation, and final browser console checks; verify no new errors remain and every implementation task is complete.