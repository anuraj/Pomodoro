## Why

The session history currently shows only the completion date, which makes multiple sessions completed on the same day difficult to distinguish. Showing the local completion time will make the history useful for reviewing when focus and break sessions occurred without changing stored records or adding backend requirements.

## What Changes

- Display the localized completion time alongside the existing localized date in each history entry.
- Preserve the existing ISO timestamp stored in each session record as the source for both date and time.
- Keep history ordering, empty states, session type, and duration display unchanged.
- Use browser locale formatting so the time follows the user's regional 12-hour or 24-hour convention.
- Provide a safe fallback for malformed or missing timestamps without breaking history rendering.
- Keep the change compatible with static hosting, localStorage persistence, and offline PWA use.

## Capabilities

### New Capabilities

### Modified Capabilities

- `pomodoro-timer`: extend compact session history to show localized completion time in addition to the date.

## Impact

- Affected code: `app.js` history date/time formatting and history row rendering; minimal `styles.css` adjustments may be needed for the additional metadata.
- Persistence: no storage migration; existing `date` ISO values remain the source data.
- Compatibility: no new dependency, backend, or manifest change; malformed legacy records should continue to render safely.
