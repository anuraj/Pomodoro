## ADDED Requirements

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
