## Context

This change adds a standalone browser experience to a static Jekyll site. It must work without a backend, be lightweight enough for a simple landing-page environment, and remain easy to maintain using plain JavaScript and Bootstrap.

## Goals / Non-Goals

**Goals:**
- Create a simple Pomodoro workflow with stateful countdown logic.
- Preserve session data locally in the browser.
- Match the requested dark-first UX with functional state transitions and responsive visuals.
- Keep the implementation compatible with static site deployment and PWA installation.

**Non-Goals:**
- No backend APIs, multi-user accounts, or remote synchronization.
- No complex framework architecture or task orchestration beyond a single-page timer interface.
- No unnecessary animations beyond the required UI state transitions and timer progress updates.

## Decisions

### 1. Plain JavaScript + Bootstrap + custom CSS
The app will use simple browser-native JavaScript for timer logic and state management, Bootstrap for layout and controls, and custom CSS for the circular SVG timer, theme tokens, and polish. This keeps the app small, fast, and compatible with a static Jekyll site.

**Alternatives considered:** React/Vue or a larger frontend build pipeline. These were rejected because the site is static, the feature is small, and the host environment does not justify a framework or bundle step.

### 2. localStorage for persistence
Completed sessions and user settings will be stored in localStorage so the app survives page refreshes without requiring a backend service. The timer will restore the last known state when feasible, while keeping the design simple and browser-only.

**Alternatives considered:** IndexedDB or a server API. IndexedDB is more complex than needed; a server API is not feasible in the static-hosting model.

### 3. Circular SVG timer with CSS transitions
A circular SVG progress ring will represent remaining time, while the digital text will use a monospace font to avoid layout shifting. The timer states will use CSS variable tokens for warm, cool, and muted themes, with a 300ms transition for functional state changes.

**Alternatives considered:** Canvas or DOM-based animated circle logic. SVG is lighter and easier to integrate with static HTML/CSS while still offering clean progress updates.

### 4. Web Audio API notifications
The app will use the browser Web Audio API to generate short audio notifications when a work period ends or a break begins. This avoids the dependency on external sound files and keeps the feature self-contained.

**Alternatives considered:** Embedded audio files or notification APIs. The Web Audio API is simpler, smaller, and works well in a browser-only environment.

### 5. PWA-first static hosting compatibility
The implementation will be structured to support service worker registration and manifest metadata in the static site context without introducing server requirements. This keeps the feature installable while remaining compatible with the Jekyll hosting model.

**Alternatives considered:** App shell complexity or manifest generation tied to a server runtime. The PWA requirement is satisfied by static assets and browser APIs.

## Risks / Trade-offs

- [State restoration across reloads] → Mitigation: persist timer state, remaining seconds, and last update time in localStorage and reconcile on init.
- [Web Audio notification support varies by browser] → Mitigation: degrade gracefully by falling back to a browser notification or silent state when audio cannot start.
- [localStorage availability can be restricted] → Mitigation: guard persistence with try/catch and keep the app functional when storage is unavailable.
- [Dark/light theme preferences need fallback behavior] → Mitigation: use CSS media queries with a dark-first default and explicit token mapping for light-mode adjustments.

## Migration Plan

No migration is required because this is a new feature introduced into a static frontend. Deployment will be a simple static asset update in the Jekyll site, with the new timer markup, styles, and JS loaded as part of the page.

## Open Questions

- Whether the PWA manifest and service worker should be added in the same static site bundle or in a dedicated frontend subdirectory.
- Whether the session history should cap at five entries or scroll within a fixed-height list as required by the design.

These questions are safe to resolve during implementation without changing the product requirements as defined here.
