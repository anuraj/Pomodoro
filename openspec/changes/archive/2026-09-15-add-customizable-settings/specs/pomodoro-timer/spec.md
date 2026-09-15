## ADDED Requirements

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

## MODIFIED Requirements

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