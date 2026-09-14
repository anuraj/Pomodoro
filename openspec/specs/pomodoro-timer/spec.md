## Purpose

This capability provides a lightweight Pomodoro timer experience that runs in the browser, persists user data locally, and supports a responsive PWA layout for static hosting.

## Requirements

### Requirement: User can manage a Pomodoro session
The system SHALL provide a timer that tracks a work cycle of 25 minutes and a break cycle of 5 minutes.

#### Scenario: Start work session
- **WHEN** the user presses the start control while the timer is idle or reset
- **THEN** the system SHALL begin the 25-minute work countdown and update the visible timer state

#### Scenario: Pause work session
- **WHEN** the user presses the pause control during an active countdown
- **THEN** the system SHALL stop the countdown without resetting the remaining time

#### Scenario: Reset current session
- **WHEN** the user presses the reset control during any state
- **THEN** the system SHALL return the timer to the default work duration and clear the active countdown

### Requirement: Timer transitions between work and break states
The system SHALL automatically transition between work and break modes according to the configured Pomodoro cycle.

#### Scenario: Work session completes
- **WHEN** the active work timer reaches zero
- **THEN** the system SHALL switch to the break state, trigger a sound notification, and record the completed work session

#### Scenario: Break session completes
- **WHEN** the active break timer reaches zero
- **THEN** the system SHALL switch back to the work state and trigger a sound notification

### Requirement: User can annotate a focus session
The system SHALL provide an optional focus note for the next work session, limit the note to 24 characters, and preserve the note in the completed work-session history when the session finishes.

#### Scenario: Enter a focus note
- **WHEN** the user enters text for the next work session
- **THEN** the system SHALL accept at most 24 characters and keep the input usable with keyboard and assistive technology controls

#### Scenario: Complete a work session with a note
- **WHEN** a work session completes with a non-empty focus note
- **THEN** the system SHALL store the note with that completed work-session history record and display it in the corresponding history entry

#### Scenario: Complete a work session without a note
- **WHEN** a work session completes without a focus note
- **THEN** the system SHALL store and display the completed history record using the existing date/time, session type, and duration fields without an empty note placeholder

#### Scenario: Break sessions do not receive a focus note
- **WHEN** a break session completes
- **THEN** the system SHALL preserve the existing break history behavior and SHALL NOT attach the current focus note to the break record

#### Scenario: Existing history records remain compatible
- **WHEN** the user views a history record created before focus notes were supported
- **THEN** the system SHALL render the record normally without throwing an error or requiring a note field

### Requirement: User can opt into browser completion notifications
The system SHALL allow the user to explicitly enable browser notifications for completed work and break sessions, while preserving the existing audio completion notification independently.

#### Scenario: Enable browser notifications
- **WHEN** the user activates the notification preference control and grants browser notification permission
- **THEN** the system SHALL persist the enabled preference locally and show that browser notifications are enabled

#### Scenario: Work session completion notification
- **WHEN** an enabled notification preference exists, browser notification permission is granted, and a work session completes
- **THEN** the system SHALL display a browser notification identifying that the work session is complete and a break is ready, while also attempting the existing audio notification

#### Scenario: Break session completion notification
- **WHEN** an enabled notification preference exists, browser notification permission is granted, and a break session completes
- **THEN** the system SHALL display a browser notification identifying that the break is complete and work is ready, while also attempting the existing audio notification

#### Scenario: Permission denied or browser unsupported
- **WHEN** the user denies notification permission or the browser does not support the Notification API
- **THEN** the system SHALL keep browser notifications disabled, communicate that browser notifications are unavailable, and continue the timer with audio-only completion alerts when audio is available

#### Scenario: Notification failure does not interrupt the timer
- **WHEN** creating or displaying a browser notification fails after a session completes
- **THEN** the system SHALL handle the failure without preventing the session transition, history persistence, or audio notification attempt

#### Scenario: Preference restores after reload
- **WHEN** the user reloads the app after enabling browser notifications
- **THEN** the system SHALL restore the local preference and current permission-aware control state without requesting permission again automatically

### Requirement: History records completed sessions
The system SHALL persist completed session records in localStorage with a date and duration value.

#### Scenario: Save completed work record
- **WHEN** a work cycle finishes successfully
- **THEN** the system SHALL store a record containing the completion date, duration, and session type

#### Scenario: Display compact history
- **WHEN** the user views the session history
- **THEN** the system SHALL render a compact list of recent completed records, ordered by most recent entry first

#### Scenario: Display completion date and time
- **WHEN** the user views a completed session history entry with a valid completion timestamp
- **THEN** the system SHALL display the localized completion date and localized completion time for that entry

#### Scenario: Handle an invalid completion timestamp
- **WHEN** a history entry has a missing or invalid completion timestamp
- **THEN** the system SHALL render the entry without throwing an error and display a safe fallback for its date/time metadata

### Requirement: UI reflects timer state and accessibility needs
The system SHALL present distinct visual states for work, break, and pause states using color and transition tokens suited to a dark-first interface.

#### Scenario: Work state appearance
- **WHEN** the timer is in the work phase
- **THEN** the system SHALL display the warm accent styling that distinguishes the active work cycle

#### Scenario: Break state appearance
- **WHEN** the timer is in the break phase
- **THEN** the system SHALL display the cool accent styling that distinguishes the active break cycle

#### Scenario: Pause state appearance
- **WHEN** the timer is paused
- **THEN** the system SHALL display the muted pause styling and keep the digital timer stable

### Requirement: Browser persistence is local and offline-friendly
The system SHALL persist timer configuration and completed session data using browser localStorage so that progress is retained across page reloads without a backend.

#### Scenario: Reload while timer is active
- **WHEN** the user reloads the page during an active countdown
- **THEN** the system SHALL restore the last known state and remaining time when possible

#### Scenario: View stored history after reload
- **WHEN** the user reloads the page after prior session completion
- **THEN** the system SHALL load the saved session history from localStorage and display it

### Requirement: UI follows responsive design and typography standards
The system SHALL present a centered circular timer with a monospace digital display, a dark theme by default, and responsive sizing. On desktop-sized viewports, the system SHALL present the timer circle and controls in a left column with the statistics dashboard and completed-session history in a right column. On narrow or mobile-sized viewports, the system SHALL return to a readable single-column layout.

#### Scenario: Mobile layout
- **WHEN** the app is displayed on a phone-sized viewport
- **THEN** the timer, controls, statistics, and history SHALL remain in a single centered column while remaining readable and free of horizontal scrolling

#### Scenario: Narrow desktop or tablet layout
- **WHEN** the app is displayed in a viewport below the desktop split threshold
- **THEN** the app SHALL preserve the stacked layout and keep the timer circle, controls, statistics, and history within the available width

#### Scenario: Desktop layout
- **WHEN** the app is displayed on a larger viewport
- **THEN** the timer SHALL remain centered and capped to a maximum width suitable for the main focus experience

#### Scenario: Desktop split layout
- **WHEN** the app is displayed on a desktop-sized viewport with sufficient horizontal space
- **THEN** the timer circle and controls SHALL occupy the left side while the statistics dashboard and history occupy the right side

#### Scenario: Desktop layout remains usable
- **WHEN** the desktop layout is displayed at supported browser zoom levels
- **THEN** the two-column composition SHALL remain within the viewport without horizontal scrolling and each column SHALL retain readable spacing and focus order

#### Scenario: Theme and notification controls remain available
- **WHEN** the desktop split layout is active
- **THEN** the theme and notification controls SHALL remain accessible without changing their existing behavior or keyboard focus visibility

#### Scenario: Dark theme
- **WHEN** the active theme is Dark
- **THEN** the system SHALL apply the dark palette regardless of the operating system preference

#### Scenario: Light theme
- **WHEN** the active theme is Light
- **THEN** the system SHALL apply the light palette regardless of the operating system preference

#### Scenario: Theme selection persists
- **WHEN** the user reloads the app or opens the installed PWA after selecting a theme
- **THEN** the system SHALL restore the selected theme from browser-local persistence

#### Scenario: Theme toggle is keyboard accessible
- **WHEN** a keyboard or assistive technology user navigates to the theme control
- **THEN** the control SHALL expose the current theme and next action, support changing the theme without a pointer, and provide a visible focus state
