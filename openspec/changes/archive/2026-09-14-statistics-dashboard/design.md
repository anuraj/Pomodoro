## Context

The app already stores completed Pomodoro sessions in browser localStorage and renders a simple session history list. The new statistics dashboard should extend that existing data model without introducing a backend, server-rendered pipeline, or additional framework.

## Goals / Non-Goals

**Goals:**
- Derive recent performance insights from the existing local session history.
- Show a seven-day trend chart and summary metrics in a compact dashboard.
- Keep the experience static-site friendly and compatible with the current PWA approach.

**Non-Goals:**
- Building a backend service or cloud analytics pipeline.
- Tracking per-task analytics beyond completed session history.
- Introducing a heavy frontend framework or complex state-management layer.

## Decisions

### Use localStorage history as the source of truth
The dashboard will read the app’s existing session history object and compute metrics from that data on the client. This preserves the current browser-only architecture and avoids adding sync or persistence complexity.

**Why this approach:**
- It fits the project’s static hosting model.
- It avoids new storage formats or migrations.
- It reuses the same historical data already captured for the session list.

**Alternatives considered:**
- Storing a second analytics dataset in parallel storage; rejected as redundant and harder to maintain.
- Fetching data from a backend; rejected because the app is intentionally static and offline-friendly.

### Render charting with Apache ECharts
The dashboard will use Apache ECharts for the 7-day bar chart because it offers a simple static-site integration pattern and a compact visualization suitable for a lightweight PWA.

**Why this approach:**
- It matches the requirement to render via Apache ECharts.
- It keeps the chart lightweight and visually consistent with the existing UI.
- It works well with direct browser-based data binding.

**Alternatives considered:**
- Canvas or SVG custom chart code; rejected for implementation cost and maintainability.
- Third-party charting libraries that require a framework or build step; rejected to stay consistent with the repo’s simple static frontend.

### Compute stats at render time
The app will calculate the last seven days, session totals, average duration, and streak from the stored session history whenever the dashboard is opened or refreshed.

**Why this approach:**
- It keeps the logic straightforward and deterministic.
- It avoids state duplication and reduces risk of stale analytics.
- It naturally updates as session history changes.

**Trade-off:**
- The metrics are derived, not precomputed, so the dashboard must recalculate on each render; this is acceptable for a small browser-only data set.

## Risks / Trade-offs

- [Data freshness] → The dashboard relies on stored history data, so if the browser storage is cleared the metrics reset as well. This is acceptable because the app already treats localStorage as the source of truth.
- [Dependency loading] → Loading Apache ECharts via a CDN introduces an external script dependency; this is acceptable for a static site and is the most straightforward option without a build pipeline.
- [Empty-data UX] → The dashboard must clearly handle days without completed sessions and a missing history state so the user sees a valid empty state instead of misleading zeros.

## Migration Plan

No migration is required. The dashboard will read from the existing session history format and compute metrics in the browser. If the existing storage shape changes later, the summary logic can be updated in one place.

## Open Questions

None at this time. The required behavior is sufficiently defined to proceed with planning and implementation.
