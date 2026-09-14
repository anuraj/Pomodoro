## 1. Data and statistics calculations

- [x] 1.1 Inspect the existing session history structure and verify the stored work-session records can be aggregated for the last seven days, average duration, and streak logic.
- [x] 1.2 Implement the 7-day aggregation utilities and verify the counts and totals match the localStorage session data across multiple sample histories.
- [x] 1.3 Implement the average-duration and current-streak calculations and verify the empty-state behavior is correct when no work sessions exist.

## 2. Dashboard UI shell

- [x] 2.1 Create the statistics dashboard layout in the app shell and verify the section renders in a compact, mobile-friendly card layout consistent with the Pomodoro design.
- [x] 2.2 Add summary metric cards for the total work sessions in the last seven days, average duration, and current streak, and verify each KPI shows the expected value from loaded history.

## 3. Chart rendering

- [x] 3.1 Load Apache ECharts in the static app and verify the script loads successfully without a build step or backend dependency.
- [x] 3.2 Render the seven-day bar chart from the computed daily totals and verify the chart labels and bars match the stored session history for the last seven days.

## 4. Integration and polish

- [x] 4.1 Integrate the dashboard update flow with the existing timer and session history state so the statistics refresh after a work session completes and after page reload.
- [x] 4.2 Add empty-state and fallback handling for no recent data and verify the dashboard displays meaningful values instead of broken or misleading numbers.
- [x] 4.3 Verify the dashboard remains readable in dark mode and on narrow mobile widths while preserving the existing PWA/static hosting behavior.

## 5. Final validation

- [x] 5.1 Run the browser flow end-to-end and verify the dashboard reflects a realistic 7-day trend, average session duration, and current streak when session data is present.
- [x] 5.2 Validate the empty-state behavior and confirm the dashboard remains usable when the app is loaded with no completed sessions.
