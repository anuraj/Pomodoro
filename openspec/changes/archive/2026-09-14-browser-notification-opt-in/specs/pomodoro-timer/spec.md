## ADDED Requirements

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
