## MODIFIED Requirements

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
