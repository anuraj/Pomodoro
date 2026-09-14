## 1. Focus note input

- [x] 1.1 Add an accessible optional focus-note input to the timer workspace with a hard 24-character limit and verify keyboard labeling, maxlength enforcement, and responsive sizing.
- [x] 1.2 Normalize the note value at work-session completion and verify empty, whitespace-only, 24-character, overlong, and special-character inputs are handled safely.

## 2. History persistence and rendering

- [x] 2.1 Store the normalized note only on completed work-session records while preserving break records, statistics calculations, ordering, and existing localStorage fields, and verify new records contain the expected optional field.
- [x] 2.2 Render non-empty notes safely in the matching history entry and verify older records without notes render unchanged without markup interpretation or errors.
- [x] 2.3 Style the note metadata for desktop split, stacked mobile, narrow timer, light, and dark layouts and verify long localized history content does not create horizontal overflow.

## 3. Final validation

- [x] 3.1 Run browser flows for empty notes, maximum-length notes, special characters, work completion, break completion, reload, and old history records and verify the timer/history remain usable.
- [x] 3.2 Validate changed HTML, CSS, and JavaScript syntax and whitespace, and verify no backend or new dependency is required.
