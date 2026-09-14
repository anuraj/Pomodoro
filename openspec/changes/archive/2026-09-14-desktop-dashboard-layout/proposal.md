## Why

The current Pomodoro card uses a single vertical flow on desktop, leaving wide screens with unused space and forcing users to scroll through the timer before reaching statistics. A desktop workspace layout will make the timer and analytics visible together while preserving the compact stacked experience on phones and narrow windows.

## What Changes

- Introduce a desktop breakpoint that places the timer circle and controls in a left column.
- Place statistics, chart, and session history in a right column on desktop-sized viewports.
- Keep theme and notification controls available in the shared top area without disrupting either column.
- Preserve the current single-column mobile and narrow-window layout.
- Keep timer state, chart rendering, history behavior, accessibility labels, and PWA/static hosting behavior unchanged.
- Ensure the desktop composition fits within the viewport without horizontal scrolling and remains usable at browser zoom.

## Capabilities

### New Capabilities

### Modified Capabilities

- `pomodoro-timer`: extend responsive behavior to provide a side-by-side desktop timer and dashboard layout while preserving the mobile stack.

## Impact

- Affected files: `index.html` for layout grouping if needed and `styles.css` for responsive grid/flex rules; `app.js` behavior should remain unchanged.
- Persistence and data: no changes to localStorage, timer state, history, statistics, or notification preferences.
- Dependencies: no new runtime dependency or backend; remain compatible with the static PWA and file-based browser use.
- Accessibility: preserve existing semantic sections, control order, keyboard focus, and readable responsive flow.
