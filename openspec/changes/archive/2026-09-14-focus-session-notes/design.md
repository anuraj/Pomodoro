## Context

The timer UI has a timer workspace with the ring and controls, while completed sessions are stored as localStorage history objects containing date, type, and durationSeconds. History rows already support localized timestamps and safe rendering of older records. See `proposal.md` for motivation and `specs/pomodoro-timer/spec.md` for the behavior contract.

## Goals / Non-Goals

**Goals:**

- Add a compact, labeled note field for the next work session with a hard 24-character limit.
- Capture the normalized note only when a work session completes.
- Display notes in history without disturbing date/time, type, duration, chart calculations, or existing records.
- Keep the input usable in the desktop split layout, stacked mobile layout, narrow text-only timer mode, both themes, and keyboard navigation.

**Non-Goals:**

- Building a task list, editing completed notes, search, filtering, or note history management.
- Attaching notes to break sessions.
- Persisting an in-progress note across reloads unless the implementation needs it for the existing timer-state restoration model.
- Adding backend storage, accounts, synchronization, or a new dependency.

## Decisions

### Use a native labeled text input

Place a labeled text input in the timer workspace near the controls. Set `maxlength="24"`, expose the label to assistive technology, and allow the input to wrap or shrink within the existing responsive columns.

**Alternative considered:** A free-form contenteditable area. Rejected because it complicates character enforcement, keyboard semantics, and sanitization for a simple single-line note.

### Normalize at completion

Trim leading/trailing whitespace and store an empty string as no note. Capture the note only for a completed work session; break completion leaves the note unattached. The 24-character boundary is enforced by the input and rechecked in JavaScript before persistence.

**Alternative considered:** Persist the note in the main timer state continuously. Rejected because it expands the timer-state contract and is not required for completed-history behavior.

### Render optional notes safely

Treat missing or non-string legacy `note` values as absent. Render only normalized text and use DOM text assignment or escaping so note content cannot become markup. Keep the note as a distinct secondary line in the history metadata when present.

**Alternative considered:** Insert note text directly into an HTML template. Rejected because user-entered text must not be interpreted as HTML.

### Keep statistics unchanged

Continue filtering and aggregating history by session type and duration only. Notes are descriptive metadata and do not affect counts, averages, streaks, or charts.

**Alternative considered:** Add note-based statistics or chart labels. Rejected as outside the requested history annotation scope.

## Risks / Trade-offs

- [Localized labels and note text increase timer-column height] -> Use compact spacing and allow normal vertical growth rather than fixed heights.
- [User enters whitespace-only text] -> Trim it and omit the note from the stored/rendered record.
- [Legacy history records have no note] -> Treat the field as optional and preserve existing row rendering.
- [User-entered text contains markup or unusual characters] -> Render through text-safe DOM APIs and retain the maxlength boundary.
- [Desktop split column becomes narrow] -> Set a flexible input width with `min-width: 0` and verify at the desktop breakpoint and zoomed widths.

## Migration Plan

1. Add the labeled input and responsive styles without changing existing controls or history rows.
2. Normalize and capture the note only when a work session completes.
3. Render optional notes safely in history while preserving old records and statistics.
4. Verify empty, maximum-length, whitespace, special-character, desktop, mobile, reload, and break-session cases.
5. Roll back by removing the input and optional note rendering; existing history data remains valid.
