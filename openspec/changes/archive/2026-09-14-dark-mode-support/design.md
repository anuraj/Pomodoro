## Context

The current static PWA applies `html.theme-light` or `html.theme-dark` from `prefers-color-scheme` in the browser and defines both palettes in `styles.css`. Timer state and session history already use browser localStorage, while `manifest.webmanifest` supplies fixed PWA metadata. See `proposal.md` for the motivation and `specs/pomodoro-timer/spec.md` for the behavior contract.

## Goals / Non-Goals

**Goals:**

- Add a compact, accessible Light/Dark control to the existing timer card.
- Resolve the active palette from the persisted choice, falling back to Dark when the choice is absent or invalid.
- Keep theme changes consistent across timer states, statistics, history, focus styles, and chart rendering.
- Persist the preference independently from timer state and session history.
- Keep the implementation compatible with file-based development, static hosting, offline PWA use, and the existing plain JavaScript architecture.

**Non-Goals:**

- Redesign the existing dark or light palettes.
- Add accounts, server synchronization, or cross-device preference storage.
- Add a new UI framework or theme dependency.
- Change timer durations, session history behavior, or statistics calculations.

## Decisions

### Use an explicit two-state preference

Store `light` or `dark` as a small versioned localStorage value. Dark remains the default. Treat a legacy `system` value as invalid and migrate it to Dark.

**Alternative considered:** A system-following third state. Rejected because the requested product behavior is an explicit Light/Dark choice independent of operating-system settings.

### Centralize theme resolution

Add one theme-resolution path that reads the stored preference, updates the document theme classes and body data attributes, and updates the browser theme-color metadata. Call it during initialization and after each toggle.

**Alternative considered:** Scattered class changes in individual controls or timer states. Rejected because it would allow the chart, PWA metadata, and interface panels to drift out of sync.

### Keep the control icon-based and compact

Use a single sun/moon button in the existing header area. Its accessible name and tooltip expose the current theme and the next theme action, with visible `:focus-visible` styling. Keep the control within the current card width.

**Alternative considered:** A dropdown selector. Rejected because the requested interaction is a single compact icon control and the button can remain discoverable through its accessible label and tooltip.

### Make chart colors theme-aware at render time

When statistics render or the theme changes, derive ECharts colors from computed CSS variables and resize or refresh the existing chart instance as needed. Do not duplicate light and dark color literals in JavaScript.

**Alternative considered:** Hard-coded chart palettes in JavaScript. Rejected because they can diverge from the CSS theme tokens.

### Update PWA metadata without changing the manifest contract

Use the document's theme-color meta element for the active runtime theme. Keep the manifest's static `theme_color` and `background_color` as the install-time fallback because a single manifest cannot dynamically represent a user's runtime choice.

**Alternative considered:** Generating or rewriting the manifest at runtime. Rejected because it adds complexity and is not reliably supported across installed PWA clients.

## Risks / Trade-offs

- [Stored preference is malformed or unavailable] -> Treat it as `dark` and continue using the timer without blocking.
- [Legacy `system` preference exists] -> Treat it as invalid and persist Dark on the next theme interaction.
- [Older browsers lack runtime meta updates] -> Retain the static manifest and CSS dark-first fallback.
- [Chart instance retains colors after a theme switch] -> Reapply chart options from computed theme variables and call the chart resize/update path after the active theme changes.
- [Long localized theme labels increase header width] -> Use a responsive control layout with flexible width and avoid fixed text widths.

## Migration Plan

1. Add the theme preference key and icon button markup without changing existing timer or history keys.
2. Route initialization and button changes through the centralized theme resolver.
3. Add persistence, accessible selector states, and theme-aware chart/meta updates.
4. Validate Light and Dark behavior on reload, narrow viewports, keyboard navigation, and offline startup.
5. Roll back by removing the button and preference resolver; absent preference values continue to use the existing dark-first behavior.
