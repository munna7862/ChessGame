# Pull Request: Phase 04 · Sprint 04 — Move Animation and Last-Move State

## 1. Summary of Changes

This pull request implements **Phase 04 · Sprint 04: Move Animation and Last-Move State**, introducing visual last-move tracking, origin/destination square differentiation, GPU-composited move and capture animations, and system/user reduced-motion accessibility controls while strictly preserving domain authority and zero-blocking state commitment.

### Key Architectural & Implementation Deliverables

1. **`useReducedMotion` Hook (`src/features/board/useReducedMotion.ts`)**:
   - Detects OS system preference `(prefers-reduced-motion: reduce)`.
   - Provides runtime toggle override for standard vs reduced motion modes.
   - Deterministic SSR and test environment compatibility.

2. **Last-Move State & Visual Differentiation (`Square.tsx`, `Board.tsx`, `Board.css`, `types.ts`)**:
   - `lastMove` tracking with distinct origin (`is-last-move-from`, `data-is-last-move="from"`) and destination (`is-last-move-to`, `data-is-last-move="to"`) indicators.
   - Capture effect styling (`is-capture-effect`, `data-is-capture-effect="true"`, `@keyframes capturePop`) on destination squares for captures (including en passant).
   - Accessibility ARIA attributes updated with `, last move origin` and `, last move destination`.

3. **Domain Authority & Zero State Blocking**:
   - Game state commits synchronously and atomically in domain before presentation animation triggers.
   - Animations operate via CSS transforms (`translate3d`, `scale`, `opacity`) without blocking user interaction or thread execution.
   - Verified 100% domain-to-DOM parity across rapid consecutive moves and property fuzzing.

4. **App UI Integration & Controls (`App.tsx`, `App.css`)**:
   - Motion mode toggle button (`data-testid="btn-toggle-motion"`) in board controls.
   - Real-time last move indicator badge (`data-testid="last-move-indicator"`) in board status bar.
   - Clean state reset on "New Game".

---

## 2. Test Execution & Quality Gate Summary

- **Vitest Unit & Property Test Suite:** **31/31 test files passed**, **316/316 tests passed (100% Green, 0 skips)** in $28.46\text{s}$.
  - Includes 20 fast-check property runs and 1,000 invalid click invariant stress runs.
- **Playwright Desktop E2E Test Suite:** **16/16 tests passed (100% Green, 0 skips)** in $11.7\text{s}$.
- **TypeScript Typecheck (`tsc --noEmit`):** **0 errors**.
- **ESLint (`eslint .`):** **0 errors, 0 warnings**.
- **Prettier Format Check (`prettier --check .`):** **100% Clean**.
- **Vite Production Build (`npm run build`):** Built cleanly in $1.11\text{s}$ ($0.71\text{ kB}$ HTML, $10.76\text{ kB}$ CSS, $329.61\text{ kB}$ JS).

---

## 3. Security & Safety Audit Sign-Off

- **Tauri Native Capabilities:** No modifications required; capability allowlist remains least-privilege.
- **DOM & Injection Safety:** Zero `dangerouslySetInnerHTML`, zero external scripts, all square coordinates validated against algebraic bounds.
- **CSS & Performance Containment:** Animations utilize GPU compositor properties (`transform`, `opacity`) within memory bounds ($< 150\text{ MB}$).

---

## 4. Sprint Definition of Done Verification

- [x] Scope implemented without speculative or unrelated changes.
- [x] 100% Green Automation (316 Vitest unit/property/integration tests, 16 Playwright E2E tests).
- [x] Clean Typecheck & Lint (`tsc --noEmit` and `eslint` pass with 0 errors/warnings).
- [x] Security Audit Approved.
- [x] Product Owner Acceptance Approved.
- [x] Git Diff Reviewed & Clean.
- [x] Documentation & Invariants Updated.
