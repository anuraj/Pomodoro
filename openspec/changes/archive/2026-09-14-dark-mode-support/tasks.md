## 1. Theme preference and resolution

- [x] 1.1 Add a versioned localStorage theme preference with `light` and `dark` values, including legacy/invalid-value fallback to `dark`, and verify existing timer/history storage remains unchanged.
- [x] 1.2 Implement centralized theme resolution for explicit Light/Dark choices and verify the document classes, body theme state, and active palette match each choice.
- [x] 1.3 Update the browser theme-color metadata when the active theme changes and verify the correct value is exposed for Light and Dark resolutions.

## 2. Theme selector UI

- [x] 2.1 Add a compact accessible Light/Dark icon control to the existing timer shell and verify its current/next-theme label, keyboard operation, and visible focus state.
- [x] 2.2 Style the icon control across the existing dark and light palettes without breaking the card width or narrow mobile layout.

## 3. Dashboard and PWA integration

- [x] 3.1 Refresh ECharts colors from the active CSS theme tokens after theme changes and verify chart bars, axes, labels, and tooltip surfaces remain legible in both palettes.
- [x] 3.2 Verify the Light/Dark toggle remains stable regardless of operating-system theme changes.
- [x] 3.3 Verify the preference restores after reload and offline PWA startup while timer state, history, statistics, and service-worker behavior remain intact.

## 4. Final validation

- [x] 4.1 Run the browser flow for Light and Dark selections on desktop and narrow mobile viewports and verify no layout, focus, or contrast regressions.
- [x] 4.2 Validate the changed HTML, CSS, JavaScript, and manifest files for syntax/errors and verify the static app still loads without a backend.
