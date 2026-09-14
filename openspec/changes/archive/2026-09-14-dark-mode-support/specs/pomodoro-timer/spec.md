## MODIFIED Requirements

### Requirement: UI follows responsive design and typography standards
The system SHALL present a centered circular timer with a monospace digital display, mobile-first sizing, and a dark theme by default. The system SHALL provide an accessible control that switches between Light and Dark themes and persists the user's selection locally.

#### Scenario: Mobile layout
- **WHEN** the app is displayed on a phone-sized viewport
- **THEN** the timer SHALL occupy the available viewport width while remaining centered and readable

#### Scenario: Desktop layout
- **WHEN** the app is displayed on a larger viewport
- **THEN** the timer SHALL remain centered and capped to a maximum width suitable for the main focus experience

#### Scenario: Dark theme
- **WHEN** the active theme is Dark
- **THEN** the app SHALL apply the dark palette regardless of the operating system preference

#### Scenario: Light theme
- **WHEN** the active theme is Light
- **THEN** the app SHALL apply the light palette regardless of the operating system preference

#### Scenario: Theme selection persists
- **WHEN** the user reloads the app or opens the installed PWA after selecting a theme
- **THEN** the app SHALL restore the selected theme from browser-local persistence

#### Scenario: Theme toggle is keyboard accessible
- **WHEN** a keyboard or assistive technology user navigates to the theme control
- **THEN** the control SHALL expose the current theme and next action, support changing the theme without a pointer, and provide a visible focus state
