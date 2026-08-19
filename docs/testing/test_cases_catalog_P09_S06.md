# Test Cases Catalog: Visual Regression & UX Review

**Sprint:** Phase 09 · Sprint 06  
**Document:** `docs/testing/test_cases_catalog_P09_S06.md`  
**Status:** Approved  
**Author:** SDET Architect

---

## 1. Overview & Scope

This catalog outlines deterministic test cases for verifying the visual rendering, theme fidelity, responsive layouts, modal overlays, and UX accessibility of ChessForge v1. Tests span Tier 1/4 (Vitest DOM & Layout Invariants) and Tier 5 (Playwright E2E Visual Verification).

---

## 2. Detailed Test Cases

### 2.1 Board & Game State Visual Verifications

| Test ID         | Category  | Scenario & Steps                                                                                                          | Expected Result                                                                                                                                                          |
| :-------------- | :-------- | :------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`TC-VIS-01`** | Unit / UI | Render board in initial starting position. Verify rank/file coordinates, alternating square colors, and piece placements. | $8 \times 8$ grid mounts with correct aspect ratio; coordinate labels ($a$–$h$, $1$–$8$) render with distinct contrast; pieces are centered in their respective squares. |
| **`TC-VIS-02`** | Unit / UI | Select piece (e.g. White pawn on `e2`). Verify square state and destination square indicators.                            | Selected square receives `is-selected` styling; legal target squares (`e3`, `e4`) render translucent move indicator dots; no adjacent squares are corrupted.             |
| **`TC-VIS-03`** | Unit / UI | Load position where King is in check (e.g. Scholar's Mate threat or check FEN).                                           | King square receives `is-in-check` highlight with crimson glow and non-color-only alert status; move history and status bar reflect check state.                         |
| **`TC-VIS-04`** | Unit / UI | Trigger checkmate or stalemate game termination.                                                                          | Game over modal / banner renders with prominent outcome text ("Checkmate", "Stalemate"), winner announcement, and primary CTA ("New Game").                              |
| **`TC-VIS-05`** | Unit / UI | Cycle through all 5 board themes (`classic`, `wood`, `slate`, `modern`, `high-contrast`).                                 | Board CSS variables update dynamically; light and dark squares match token values; contrast ratio $\ge 4.5:1$ is maintained.                                             |
| **`TC-VIS-06`** | Unit / UI | Cycle through all 5 piece sets (`standard`, `alpha`, `classic`, `wood`, `high-contrast`).                                 | Piece SVG elements render cleanly without missing glyphs, broken images, or layout shifts.                                                                               |

### 2.2 Modal Dialogs & Overlay Layouts

| Test ID         | Category         | Scenario & Steps                                                                             | Expected Result                                                                                                                                  |
| :-------------- | :--------------- | :------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| **`TC-VIS-07`** | UI / Integration | Open `NewGameModal`, `SettingsModal`, `FenModal`, `PgnExportModal`, and `ConfirmationModal`. | Modals render centered with backdrop blur, accessible focus traps, clear headings, interactive form elements, and dismiss buttons.               |
| **`TC-VIS-08`** | UI / Integration | Mount `EngineErrorBanner` and `ErrorBoundary` fallback views.                                | Error notifications render cleanly above the board or in full-container fallback without raw stack dumps, featuring actionable recovery buttons. |

### 2.3 Windows Viewport & Responsive Scaling

| Test ID           | Category    | Scenario & Steps                                                                   | Expected Result                                                                                                           |
| :---------------- | :---------- | :--------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| **`TC-SCALE-01`** | Desktop E2E | Set viewport to Compact Display ($1024 \times 768$). Verify full app rendering.    | Layout fits without horizontal scrollbars; chessboard scales appropriately; panels stack or condense cleanly.             |
| **`TC-SCALE-02`** | Desktop E2E | Set viewport to Standard Laptop ($1280 \times 800$). Verify board and sidebar.     | Dual-column layout renders symmetrically; board is prominent; move history, clocks, and action buttons are fully legible. |
| **`TC-SCALE-03`** | Desktop E2E | Set viewport to Full HD ($1920 \times 1080$). Verify high-resolution presentation. | Board scales smoothly to maximum bounds; piece SVGs are ultra-sharp; margins and padding feel balanced and premium.       |

### 2.4 UX & Accessibility Invariants

| Test ID             | Category         | Scenario & Steps                                                                           | Expected Result                                                                                                     |
| :------------------ | :--------------- | :----------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| **`TC-UX-01`**      | Unit / Invariant | Verify keyboard navigation focus outlines across board squares, buttons, and inputs.       | Elements exhibit high-visibility `:focus-visible` styles with minimum $2\text{px}$ outline and $2\text{px}$ offset. |
| **`TC-UX-02`**      | Unit / Invariant | Enable `reducedMotion` and verify animation CSS tokens.                                    | Transition durations collapse to $0\text{ms}$; piece slide animations transition immediately without visual lag.    |
| **`TC-UX-03`**      | Unit / Invariant | Enable High Contrast theme.                                                                | Monochrome borders and high contrast backgrounds are applied to all interactive controls and board squares.         |
| **`TC-E2E-VIS-01`** | Desktop E2E      | Execute complete visual review walkthrough across themes, moves, modals, and screen sizes. | All visual layout assertions pass with 100% green status.                                                           |

---

## 3. Quality Gate Thresholds

- **Unit & Integration:** 100% Pass across Vitest suites.
- **E2E Visual Walkthrough:** 100% Pass across Playwright scenarios.
- **No Skips / Suppressions:** Strict compliance with AGENTS.md rule 6.
