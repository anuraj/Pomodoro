## Context

The app currently renders one `.pomodoro-card` column containing the header, timer ring, controls, statistics panel, and history panel. The timer and dashboard already have stable widths, accessible labels, and independent sections, so the change can be implemented as a responsive layout composition without changing timer logic or persistence. See `proposal.md` for motivation and `specs/pomodoro-timer/spec.md` for the behavior contract.

## Goals / Non-Goals

**Goals:**

- Create a wide desktop workspace with a left timer area and right dashboard area.
- Keep the current stacked order and compact ring behavior below the desktop threshold.
- Preserve logical DOM and keyboard order: theme/notification controls, timer controls, statistics, then history.
- Reserve stable space for the chart and history so the desktop layout does not shift during normal updates.
- Maintain readable card widths at browser zoom and prevent horizontal overflow.

**Non-Goals:**

- Changing timer behavior, statistics calculations, chart data, history data, or notification behavior.
- Adding tabs, routing, a second page, or a separate dashboard screen.
- Replacing the existing visual theme, typography, icon controls, or card treatment.
- Requiring a framework, CSS grid library, backend, or new asset.

## Decisions

### Use a responsive two-column shell

Group the timer ring and controls as the left workspace region and the statistics/history sections as the right dashboard region. Use CSS Grid at a desktop breakpoint with flexible tracks and a bounded overall card width; below the breakpoint, use the current single-column flow.

**Alternative considered:** Keep the DOM flat and position individual panels with absolute positioning. Rejected because it would create brittle overlap and make zoom, content growth, and keyboard order harder to maintain.

### Keep the header shared across both columns

Place the theme and notification controls in the shared top row spanning the desktop composition. This preserves the existing control locations and avoids duplicating global controls in either column.

**Alternative considered:** Put theme controls in the timer column and notifications in the dashboard column. Rejected because it fragments global controls and creates inconsistent mobile-to-desktop movement.

### Preserve DOM order and use layout placement only

Use grid-area or flex placement to move visual regions while keeping a logical source order. Timer controls remain immediately after the timer, followed by statistics and history for assistive technology and keyboard users.

**Alternative considered:** Duplicate dashboard markup for desktop and mobile. Rejected because it would create state synchronization and accessibility duplication risks.

### Set a desktop threshold from available content

Use a breakpoint wide enough for the timer circle, controls, and dashboard column to coexist without squeezing the ring or chart. The exact pixel value should be verified against the existing maximum card width and narrow-window behavior during implementation, not hard-coded as a product requirement.

**Alternative considered:** Trigger the split at every tablet width. Rejected because the desktop composition needs enough horizontal space for readable metrics and history rows.

## Risks / Trade-offs

- [Desktop card becomes too tall for short screens] -> Allow the page to scroll vertically while keeping the timer region visible and avoid fixed viewport-height clipping.
- [Statistics/history content expands] -> Use flexible right-column sizing, stable chart dimensions, and bounded history scrolling rather than absolute positioning.
- [Browser zoom reduces available width] -> Let the media query fall back to the stacked layout when the effective viewport is below the split threshold and verify at zoomed widths.
- [Visual order differs from DOM order] -> Preserve semantic source order and explicitly test keyboard traversal and screen-reader regions.
- [Narrow desktop windows receive the split too early] -> Tune the breakpoint against measured rendered widths and retain the existing stacked layout below it.

## Migration Plan

1. Add minimal grouping hooks or classes around the timer workspace and dashboard workspace if required.
2. Implement desktop grid placement and bounded card sizing while preserving the existing base/mobile rules.
3. Verify desktop, tablet, mobile, zoomed, light, and dark renders for overflow, focus order, and stable chart/history sizing.
4. Roll back by removing the desktop media-query layout and grouping hooks; timer logic and persisted data require no migration.
