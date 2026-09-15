## Context

The app currently creates page-owned notifications with `new Notification(...)` immediately before advancing to and persisting the next idle timer. The notification receives only the completed session type. The completed history record already contains the actual duration and optional work focus note, while `sw.js` only manages the offline cache and has no notification-click handler.

Notification action buttons require service-worker-displayed notifications and are not supported consistently across browsers and operating systems. A click may also arrive after the app has closed or after later timer activity, so a mode-only command is insufficient to prove that the originally advertised next session is still ready. See `proposal.md` for motivation and `specs/pomodoro-timer/spec.md` for required behavior.

## Goals / Non-Goals

**Goals:**

- Build notification content from the completed session record so displayed duration and note match persisted history.
- Use service-worker notifications for actionable delivery without introducing push infrastructure.
- Make notification body clicks and Start actions work whether an app client is open or must be launched.
- Prevent delayed or repeated commands from mutating a different timer session.
- Preserve completion, audio, and history behavior when notification APIs fail.

**Non-Goals:**

- Delivering notifications after the timer page and service worker have both stopped receiving local timer events.
- Guaranteeing that every notification platform renders action buttons or all body text.
- Adding pause, reset, skip, or dismissal analytics to notifications.
- Making focus-note visibility separately configurable from the existing notification opt-in.

## Decisions

### Build notification details from the completed record

Pass the completed session record to the notification builder after history persistence. Format the body from the record's type and `durationSeconds`, append the work focus note only when it is non-empty, and state which configured session is ready next. Keep the title concise so useful details remain available on platforms that truncate body content.

This reuses the same snapshot that history records and avoids reading the latest duration setting after a session has completed. The focus note is already limited to 24 characters, which bounds notification content.

Alternative considered: derive details from current timer state and settings. That can report the wrong duration after settings change and loses the note once the input is cleared.

### Persist an identity for each newly ready timer

Extend persisted timer state with a nullable `readySessionToken`. When completion transitions to the next idle mode, assign a token derived from the completed record's unique id and include it with the notification's expected next mode. Clear the token whenever the timer starts or resets.

A notification Start command may start the timer only when the current state is idle and both mode and token match. Body clicks never start the timer. Missing tokens in older saved state normalize to `null`, so existing users remain compatible.

Alternative considered: validate only mode and idle phase. A delayed work-complete notification could otherwise start a later break after an entire additional cycle.

### Persist the ready state before displaying the notification

Reorder completion handling so history is saved, the app transitions to the next idle mode with its token, and that timer state is rendered and persisted before notification delivery begins. Audio remains an independent best-effort attempt. Notification delivery stays non-blocking and catches failures so it cannot roll back or delay the timer transition.

Alternative considered: retain the current notify-before-transition order. A fast notification click could reach an app client before the advertised ready state exists, causing a valid Start action to be discarded.

### Prefer service-worker display with an informative fallback

When notifications are enabled and permission is granted, use the active service worker registration's `showNotification()` with notification data containing the ready mode and token. Include one `start-next` action labeled `Start break` or `Start focus`. Browsers that ignore the `actions` option still display the same title and body.

If a usable service-worker registration is unavailable, fall back to the existing page Notification API without actions. Its click handler focuses the current page when possible; notification failures remain contained.

Alternative considered: use page notifications exclusively. They cannot provide reliable service-worker action handling or launch a closed PWA client.

### Route clicks through one idempotent client command

In `sw.js`, handle `notificationclick`, close the notification, and inspect `event.action`. Find an existing same-origin window client and focus it, or open the app when none exists. For `start-next`, send or encode a command containing the expected mode and ready token; for a body click, only focus or open the app.

An open client receives the command with `postMessage`. A newly opened client receives equivalent short-lived URL query parameters, processes them after timer state initialization, and removes them with `history.replaceState`. Both paths call the same validator before `startTimer()`. Duplicate messages are harmless because the first start clears the token and changes the phase from idle.

Alternative considered: let the service worker modify timer state directly. Service workers cannot use localStorage and should not duplicate the page's timer-state ownership.

## Risks / Trade-offs

- [Focus notes can appear on an operating-system notification surface] -> Include notes only after the user explicitly enables browser notifications, keep the existing 24-character limit, and omit empty notes.
- [Platforms omit or truncate action buttons and text] -> Put essential completion/next-session information in the title and body and make body activation open the ready timer.
- [A service worker is installing or unavailable at completion] -> Fall back to an informative page notification and preserve the timer transition.
- [A click races with timer activity in another tab] -> Validate persisted mode, idle phase, and ready token in the receiving client before starting.
- [Multiple open app clients receive inconsistent commands] -> Focus and message one matching window client; persisted state validation remains authoritative on the selected client.
- [Notification display or click handling throws] -> Wrap delivery and click promises, leaving history, timer state, and audio independent.

## Migration Plan

1. Add nullable ready-session token normalization to existing timer-state loading without changing the localStorage key.
2. Update completion order and notification payload construction in the page script.
3. Add service-worker notification display/click messaging and page-side command handling.
4. Increment the static cache version so installed PWAs replace both scripts together.
5. Verify action-supported, action-unsupported, open-client, closed-client, stale-action, duplicate-action, offline, and failure paths.
6. Roll back by restoring the previous page and service-worker scripts; older code ignores the additional timer-state property.