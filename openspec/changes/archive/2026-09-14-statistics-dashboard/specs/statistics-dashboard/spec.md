## Purpose

This capability gives users a compact dashboard that summarizes recent Pomodoro performance, highlights trend data across the last seven days, and shows whether their current focus streak is improving or slipping.

## ADDED Requirements

### Requirement: Dashboard shows recent Pomodoro activity
The system SHALL present a dashboard summary that surfaces recent productivity patterns from the stored completed session history.

#### Scenario: Open the statistics dashboard
- **WHEN** the user opens the dashboard view for the app
- **THEN** the system SHALL load the completed session records and calculate the last seven days of Pomodoro activity

#### Scenario: Render the seven-day bar chart
- **WHEN** the dashboard is displayed
- **THEN** the system SHALL render a bar chart of completed work sessions for each of the last seven days using Apache ECharts

### Requirement: Dashboard reports average session duration
The system SHALL calculate and display the average duration of completed work sessions based on the tracked session history.

#### Scenario: Average session duration is computed
- **WHEN** session history includes one or more completed work sessions
- **THEN** the system SHALL calculate the average duration across those completed sessions and show the result in the dashboard

#### Scenario: No completed sessions exist
- **WHEN** the user has no prior completed work sessions in localStorage
- **THEN** the system SHALL display a sensible empty-state value rather than a misleading metric

### Requirement: Dashboard reports current streak of consecutive days
The system SHALL calculate and display the current streak of consecutive days on which the user completed at least one work session.

#### Scenario: Consecutive-day streak is active
- **WHEN** the user has completed at least one work session on the current day and on previous consecutive days
- **THEN** the system SHALL count the streak and display the current number of consecutive days

#### Scenario: Streak resets after a missed day
- **WHEN** the user does not complete any work session on a day in the sequence
- **THEN** the system SHALL stop the streak and display the last valid consecutive count

### Requirement: Dashboard remains compatible with static app hosting
The system SHALL keep the statistics dashboard compatible with the existing static-site PWA architecture and browser-only data persistence model.

#### Scenario: Dashboard loads without backend support
- **WHEN** the dashboard is displayed in a static hosted environment
- **THEN** the system SHALL calculate and render all metrics using client-side browser storage and front-end rendering only
