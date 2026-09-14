## Context

History entries already store an ISO timestamp in `item.date`, and the UI currently formats only the localized calendar date before rendering the session type and duration. The app is a static browser PWA with localStorage persistence and no server-side date formatting. See `proposal.md` for motivation and `specs/pomodoro-timer/spec.md` for the behavior contract.

## Goals / Non-Goals

**Goals:**

- Show localized date and time for each completed history entry.
- Preserve the existing ordering, session type, duration, empty state, and storage format.
- Handle malformed legacy timestamps without breaking the history list.
- Keep the metadata readable in the existing compact mobile and desktop layouts.

**Non-Goals:**

- Changing how timestamps are stored or migrating existing localStorage records.
- Adding timezone settings, server time, or user-configurable date formats.
- Adding filters, grouping, pagination, or history export.
- Changing timer completion behavior or statistics calculations.

## Decisions

### Use the browser Intl locale formatter

Add a formatter for the existing ISO value using `toLocaleString` with date and time fields, allowing the browser locale to choose 12-hour or 24-hour conventions. Keep date and time together in one metadata string so each history row remains compact.

**Alternative considered:** Hard-coded `MM/DD/YYYY HH:mm` formatting. Rejected because it ignores the user's locale and creates avoidable ambiguity between month and day.

### Validate timestamps before formatting

Check `Date#getTime()` for `NaN` before rendering. For invalid or missing values, use a neutral fallback such as `Unknown time` rather than throwing or displaying `Invalid Date`.

**Alternative considered:** Let `toLocaleString` format every value directly. Rejected because malformed legacy localStorage data could surface confusing text or interrupt rendering.

### Preserve the existing history structure

Keep the current `.history-date` metadata element and update its content to include date and time, avoiding a new DOM hierarchy unless responsive testing shows the text needs separate lines.

**Alternative considered:** Add separate date and time spans. Deferred because the existing row already supports compact metadata and one localized string reduces layout complexity.

## Risks / Trade-offs

- [Localized time strings are longer] -> Allow metadata to wrap within the existing flex item and preserve minimum-width constraints.
- [User timezone differs from completion timezone] -> Use the browser's local timezone consistently with local calendar formatting; no timezone claims are introduced.
- [Legacy records lack valid timestamps] -> Render a safe fallback and keep the remaining entry data visible.
- [12-hour and 24-hour locales differ] -> Rely on `Intl` so the browser applies the user's regional convention.

## Migration Plan

1. Add a validated local date/time formatter for history timestamps.
2. Update history row rendering and styles only as needed for the additional time text.
3. Verify existing records, malformed records, empty history, desktop layout, narrow mobile layout, and both light/dark themes.
4. Roll back by restoring date-only rendering; no stored data or schema changes are required.
