## MODIFIED Requirements

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