## Purpose

This capability provides a lightweight Pomodoro timer experience that runs in the browser, persists user data locally, and supports a responsive PWA layout for static hosting.

## Requirements

### Requirement: User can manage Pomodoro settings in one place
The system SHALL provide a settings surface containing focus duration, break duration, work accent color, break accent color, Light or Dark theme, and browser notification controls. The settings surface SHALL be operable by keyboard and assistive technology and SHALL remain usable at supported mobile and desktop viewport sizes.

#### Scenario: Open and close settings
- **WHEN** the user activates the settings control
- **THEN** the system SHALL display the current values for every supported setting, move keyboard focus into the settings surface, and allow the user to close it and return focus to the settings control

#### Scenario: Save valid settings
- **WHEN** the user saves valid settings
- **THEN** the system SHALL apply the settings, persist them in browser-local storage, and restore them after a reload or installed PWA launch

#### Scenario: Reject invalid duration settings
- **WHEN** the user attempts to save a focus or break duration that is not a whole number from 1 through 120 minutes
- **THEN** the system SHALL identify the invalid field, keep the settings surface open, and preserve the previously applied settings

#### Scenario: Configure work and break accent colors
- **WHEN** the user saves valid work and break accent colors
- **THEN** the system SHALL use the selected work accent for work states and the selected break accent for break states across both Light and Dark themes

#### Scenario: Retain defaults without saved settings
- **WHEN** no valid saved settings are available
- **THEN** the system SHALL use a 25-minute focus duration, a 5-minute break duration, the existing work and break accent colors, the Dark theme, and disabled browser notifications

#### Scenario: Cancel settings changes
- **WHEN** the user closes or cancels the settings surface without saving
- **THEN** the system SHALL discard unsaved duration, color, and theme changes without altering the active preferences

### Requirement: Existing preferences are available through settings
The system SHALL expose the existing Light or Dark theme preference and browser notification preference through the settings surface while preserving permission-aware notification behavior.

#### Scenario: Select a theme in settings
- **WHEN** the user saves a Light or Dark theme selection
- **THEN** the system SHALL apply and persist that base theme together with the configured work and break accent colors

#### Scenario: Enable notifications in settings
- **WHEN** the user saves notifications as enabled and browser permission has not been decided
- **THEN** the system SHALL request permission in response to that user action and enable notifications only when permission is granted

#### Scenario: Notifications are blocked or unsupported
- **WHEN** notification permission is denied or the browser does not support browser notifications
- **THEN** the settings surface SHALL communicate that notifications are unavailable and SHALL NOT prevent other settings from being saved

### Requirement: User can manage a Pomodoro session
The system SHALL provide a timer that tracks work and break cycles using the user's configured durations, with defaults of 25 minutes for work and 5 minutes for break.

#### Scenario: Start work session
- **WHEN** the user presses the start control while an idle work timer is displayed
- **THEN** the system SHALL begin the countdown using the displayed configured focus duration and update the visible timer state

#### Scenario: Pause work session
- **WHEN** the user presses the pause control during an active countdown
- **THEN** the system SHALL stop the countdown without resetting the remaining time

#### Scenario: Reset current session
- **WHEN** the user presses the reset control during any state
- **THEN** the system SHALL return the timer to an idle work session using the currently configured focus duration and clear the active countdown

#### Scenario: Change duration while matching timer is idle
- **WHEN** the user saves a new duration for the mode currently displayed while the timer is idle
- **THEN** the system SHALL update the idle timer to the newly configured duration

#### Scenario: Change duration during a running or paused session
- **WHEN** the user saves a new duration while the current timer is running or paused
- **THEN** the system SHALL preserve that session's total and remaining time and use the new duration the next time the matching mode begins

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
The system SHALL allow the user to explicitly enable browser notifications for completed work and break sessions, include relevant completed-session details, and offer a best-effort way to start the ready next session while preserving the existing audio completion notification independently.

#### Scenario: Enable browser notifications
- **WHEN** the user activates the notification preference control and grants browser notification permission
- **THEN** the system SHALL persist the enabled preference locally and show that browser notifications are enabled

#### Scenario: Work session completion notification
- **WHEN** an enabled notification preference exists, browser notification permission is granted, and a work session completes
- **THEN** the system SHALL display a browser notification identifying the completed work session, its duration, that a break is ready, and the focus note when one was recorded, while also attempting the existing audio notification

#### Scenario: Work session completes without a focus note
- **WHEN** an enabled notification preference exists and a work session without a focus note completes
- **THEN** the system SHALL display the completed work duration and ready break without an empty note label or placeholder

#### Scenario: Break session completion notification
- **WHEN** an enabled notification preference exists, browser notification permission is granted, and a break session completes
- **THEN** the system SHALL display a browser notification identifying the completed break, its duration, and that the next focus session is ready, while also attempting the existing audio notification

#### Scenario: Notification platform supports actions
- **WHEN** a completion notification is displayed on a platform that supports notification actions
- **THEN** the system SHALL offer one action labeled for starting the ready break or focus session according to the completed session type

#### Scenario: Start the ready session from a notification action
- **WHEN** the user activates the Start break or Start focus notification action and the expected next session is still idle
- **THEN** the system SHALL open or focus the app and start that ready session using its current configured duration

#### Scenario: Activate the notification body
- **WHEN** the user activates the completion notification body rather than its Start action
- **THEN** the system SHALL open or focus the app with the expected next session visible and idle without starting it automatically

#### Scenario: Notification actions are unsupported
- **WHEN** the notification platform does not display action buttons
- **THEN** the completion notification SHALL remain informative and activating its body SHALL open or focus the app with the next session idle and ready

#### Scenario: Notification action is stale or repeated
- **WHEN** a Start action is delivered after the expected next session has already started, completed, changed mode, or otherwise ceased to be the matching idle session
- **THEN** the system SHALL open or focus the app without restarting, resetting, or replacing the current timer state

#### Scenario: Permission denied or browser unsupported
- **WHEN** the user denies notification permission or the browser does not support the Notification API
- **THEN** the system SHALL keep browser notifications disabled, communicate that browser notifications are unavailable, and continue the timer with audio-only completion alerts when audio is available

#### Scenario: Notification failure does not interrupt the timer
- **WHEN** creating, displaying, or handling a browser notification fails after a session completes
- **THEN** the system SHALL handle the failure without preventing the session transition, history persistence, current timer state, or audio notification attempt

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
The system SHALL present distinct visual states for work, break, and pause states using the configured work and break accent colors and a stable muted pause treatment.

#### Scenario: Work state appearance
- **WHEN** the timer is in the work phase
- **THEN** the system SHALL display the configured work accent styling that distinguishes the active work cycle

#### Scenario: Break state appearance
- **WHEN** the timer is in the break phase
- **THEN** the system SHALL display the configured break accent styling that distinguishes the active break cycle

#### Scenario: Pause state appearance
- **WHEN** the timer is paused
- **THEN** the system SHALL display the muted pause styling and keep the digital timer stable

### Requirement: Browser persistence is local and offline-friendly
The system SHALL persist timer state, completed session data, and validated user settings using browser-local storage so that progress and preferences are retained across page reloads without a backend.

#### Scenario: Reload while timer is active
- **WHEN** the user reloads the page during an active countdown
- **THEN** the system SHALL restore the last known session state, session-specific total duration, and remaining time when possible without replacing them with newly configured duration values

#### Scenario: View stored history after reload
- **WHEN** the user reloads the page after prior session completion
- **THEN** the system SHALL load the saved session history from browser-local storage and display it

#### Scenario: Restore saved settings
- **WHEN** the user reloads the page or opens the installed PWA after saving settings
- **THEN** the system SHALL restore all valid saved duration, accent color, theme, and notification preferences without requiring a network connection

#### Scenario: Handle missing or invalid saved settings
- **WHEN** saved settings are missing, malformed, or outside supported values
- **THEN** the system SHALL fall back to safe defaults for the affected values without preventing the timer from loading

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
