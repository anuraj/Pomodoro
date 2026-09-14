## MODIFIED Requirements

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
