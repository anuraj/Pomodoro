## Why

The Pomodoro timer records completed work sessions in browser storage, but it does not help users understand their recent focus patterns or momentum. A lightweight statistics dashboard will make it easier to review the last seven days of effort, spot trends, and track consistency without introducing any backend or server dependency.

## What Changes

- Add a statistics dashboard for the PWA that summarizes recent Pomodoro performance.
- Render a bar chart of completed work sessions over the last seven days using Apache ECharts.
- Show summary metrics for average session duration and current streak of consecutive days with at least one completed work session.
- Derive metrics from the existing localStorage history so the dashboard works in a static-hosted browser app.
- Keep the dashboard mobile-friendly and visually aligned with the current dark-themed Pomodoro UI.

## Capabilities

### New Capabilities
- `statistics-dashboard`: Summary metrics and trend visualization for recent Pomodoro activity using browser-held session data.

### Modified Capabilities
- None

## Impact

- Frontend UI in the static app shell, including the dashboard layout and data presentation.
- Browser-side logic that reads and aggregates the existing session history from localStorage.
- Additional client-side dependency on Apache ECharts for the chart rendering, loaded in a static-site-compatible way.
- No server API, database, or deployment-level changes required.
