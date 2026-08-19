# Test Cases Catalog: Phase 09 · Sprint 04 (Keyboard and Accessibility Completion)

## 1. Overview & Test Objectives

This catalog defines the pre-implementation verification suite for Phase 09 · Sprint 04: Keyboard and Accessibility Completion. The suite ensures that ChessForge achieves flawless keyboard navigability, robust focus trapping and restoration, screen reader friendliness, WCAG AAA compliant high-contrast theming, and deterministic reduced-motion safety without flakiness or state delays.

---

## 2. Traceability Matrix

| Requirement ID    | Test Case ID  | Test Category | Description                                                   | Verification Method      |
| :---------------- | :------------ | :------------ | :------------------------------------------------------------ | :----------------------- |
| `REQ-KBD-01`      | `TC-KBD-01`   | Integration   | Global Shortcut: `Ctrl+N` opens New Game modal                | RTL Simulation           |
| `REQ-KBD-01`      | `TC-KBD-02`   | Integration   | Global Shortcut: `Ctrl+Z` / `u` performs Move Undo            | RTL Simulation           |
| `REQ-KBD-01`      | `TC-KBD-03`   | Integration   | Global Shortcut: `Ctrl+F` / `f` flips board orientation       | RTL Simulation           |
| `REQ-KBD-01`      | `TC-KBD-04`   | Integration   | Global Shortcut: `Ctrl+,` opens Settings modal                | RTL Simulation           |
| `REQ-KBD-01`      | `TC-KBD-05`   | Integration   | Global Shortcut: `Ctrl+E` & `Ctrl+I` open PGN modals          | RTL Simulation           |
| `REQ-KBD-01`      | `TC-KBD-06`   | Integration   | Global Shortcut: `?` / `F1` opens Shortcuts Help modal        | RTL Simulation           |
| `REQ-KBD-01`      | `TC-KBD-07`   | Integration   | Global Shortcut: `Escape` closes modals or clears selection   | RTL Simulation           |
| `REQ-KBD-04`      | `TC-KBD-08`   | Unit          | Shortcut suppression when typing inside text inputs           | RTL Input Typing         |
| `REQ-TRAP-01`     | `TC-TRAP-01`  | Component     | Modal dialog focus trapping (`Tab` & `Shift+Tab` cycles)      | DOM Focus Query          |
| `REQ-TRAP-02`     | `TC-TRAP-02`  | Component     | Trigger element focus restoration upon modal dismissal        | `activeElement` check    |
| `REQ-TRAP-03`     | `TC-TRAP-03`  | Unit / Static | Zero `setTimeout` sleeps in focus management                  | Static AST / fake timers |
| `REQ-A11Y-01`     | `TC-A11Y-01`  | Component     | Accessible names and ARIA labels on all interactive controls  | `@testing-library/react` |
| `REQ-A11Y-02`     | `TC-A11Y-02`  | Component     | Live announcer polite updates for moves, checks, and results  | `aria-live` polling      |
| `REQ-A11Y-03`     | `TC-A11Y-03`  | Visual / A11y | Non-color check, checkmate, and legal move indicators         | DOM & SVG verification   |
| `REQ-KBD-03`      | `TC-A11Y-04`  | Component     | Skip link renders and focuses chessboard properly             | DOM click / focus        |
| `REQ-MOT-A11Y-01` | `TC-A11Y-05`  | Style / CSS   | High-contrast tokens, contrast ratios >= 7:1, and focus rings | CSS / Vitest token check |
| `REQ-MOT-A11Y-02` | `TC-A11Y-06`  | Integration   | Reduced-motion mode completely suppresses transitions         | CSS property assert      |
| `REQ-KBD-01..03`  | `TC-E2E-A11Y` | E2E           | End-to-end full keyboard playthrough                          | Playwright Automation    |

---

## 3. Granular Test Case Specifications

### 3.1 Global Keyboard Shortcuts (`TC-KBD-01` to `TC-KBD-08`)

- **`TC-KBD-01: Global Shortcut Ctrl+N / Cmd+N`**:
  1. Render `App`.
  2. Dispatch `keydown` with `{ key: 'n', ctrlKey: true }`.
  3. Verify `data-testid="new-game-modal"` is rendered in document.
  4. Dispatch `Escape`.
  5. Verify `new-game-modal` is dismissed.

- **`TC-KBD-02: Global Shortcut Ctrl+Z and 'u' for Undo`**:
  1. Render `App`, play `e2-e4`.
  2. Dispatch `keydown` with `{ key: 'u' }` when no input is focused.
  3. Verify move is undone, board is back to starting position.
  4. Play `e2-e4`, dispatch `keydown` with `{ key: 'z', ctrlKey: true }`.
  5. Verify move is undone.

- **`TC-KBD-03: Global Shortcut Ctrl+F and 'f' for Flip Board`**:
  1. Render `App` in White orientation (`data-orientation="w"`).
  2. Dispatch `keydown` with `{ key: 'f' }`.
  3. Verify board updates to `data-orientation="b"`.
  4. Dispatch `keydown` with `{ key: 'f', ctrlKey: true }`.
  5. Verify board flips back to `data-orientation="w"`.

- **`TC-KBD-04: Global Shortcut Ctrl+, for Settings`**:
  1. Render `App`.
  2. Dispatch `keydown` with `{ key: ',', ctrlKey: true }`.
  3. Verify `data-testid="settings-modal"` is open.

- **`TC-KBD-05: Global Shortcuts Ctrl+E and Ctrl+I for PGN`**:
  1. Render `App`.
  2. Dispatch `keydown` with `{ key: 'e', ctrlKey: true }` -> verify `pgn-export-modal` is open.
  3. Close modal.
  4. Dispatch `keydown` with `{ key: 'i', ctrlKey: true }` -> verify `pgn-import-modal` is open.

- **`TC-KBD-06: Global Shortcut '?' / 'F1' for Keyboard Shortcuts Modal`**:
  1. Render `App`.
  2. Dispatch `keydown` with `{ key: '?' }`.
  3. Verify `data-testid="shortcuts-modal"` is open, displaying full shortcut reference table.
  4. Close modal, dispatch `F1` -> verify shortcuts modal is open.

- **`TC-KBD-08: Shortcut Suppression in Text Inputs`**:
  1. Open `NewGameModal`.
  2. Focus the player name input (`data-testid="input-player1-name"`).
  3. Type characters `u`, `f`, `n`, `?`.
  4. Verify no shortcuts triggered (board did not flip, new game modal did not duplicate).

---

### 3.2 Modal Focus Trapping & Restoration (`TC-TRAP-01` to `TC-TRAP-03`)

- **`TC-TRAP-01: Focus Trapping in Modals`**:
  1. Open `ConfirmationModal`.
  2. Verify initial focus is on the primary action button.
  3. Tab through all elements until the last element is focused.
  4. Press `Tab` -> verify focus wraps to the first focusable element.
  5. Press `Shift+Tab` -> verify focus wraps to the last focusable element.

- **`TC-TRAP-02: Focus Restoration on Dismissal`**:
  1. Focus the "Settings" button in Header.
  2. Press `Enter` to open `SettingsModal`.
  3. Verify focus is inside `SettingsModal`.
  4. Press `Escape` or click close.
  5. Verify focus is returned to the "Settings" button.

- **`TC-TRAP-03: Zero Real-Time Sleeps`**:
  1. Inspect `useFocusTrap` implementation to ensure zero `setTimeout` calls are used for modal focus.

---

### 3.3 Assistive Technology & ARIA Semantics (`TC-A11Y-01` to `TC-A11Y-06`)

- **`TC-A11Y-01: Accessible Names & Roles`**:
  1. Render `App`.
  2. Query all interactive elements (`button`, `input`, `select`, `[role="gridcell"]`).
  3. Assert that every interactive element has a non-empty accessible name (`aria-label`, `aria-labelledby`, or text content).

- **`TC-A11Y-02: Polite Live Announcements`**:
  1. Render `App`.
  2. Execute move `e2-e4`.
  3. Verify `board-live-announcer` content announces the move.
  4. Execute check / checkmate sequence -> verify live announcer announces check/checkmate.

- **`TC-A11Y-04: Skip-to-Board Navigation Link`**:
  1. Render `App`.
  2. Verify skip link exists with `href="#main-chessboard"`.
  3. Click / activate skip link -> verify chessboard or first square receives focus.

- **`TC-A11Y-05: High-Contrast Mode & Focus Ring Styling`**:
  1. Verify CSS tokens provide high-contrast definitions and universal `:focus-visible` styling.

- **`TC-A11Y-06: Reduced Motion State Invariance`**:
  1. Toggle reduced-motion mode.
  2. Verify `data-reduced-motion="true"` on board and root containers.
  3. Confirm instantaneous board state updates without CSS transition lag.

---

### 3.4 E2E Accessibility Suite (`TC-E2E-A11Y`)

- **`TC-E2E-A11Y: Keyboard-Only Playthrough`**:
  1. Launch Playwright test.
  2. Navigate via keyboard: Open Shortcuts dialog via `?`, close via `Escape`.
  3. Focus board via skip link or `Tab`.
  4. Navigate board with Arrow keys to `e2`, press `Enter` to select.
  5. Navigate to `e4`, press `Enter` to execute move.
  6. Press `u` to undo move.
  7. Open Settings via `Ctrl+,`, toggle reduced motion, close via `Escape`.
