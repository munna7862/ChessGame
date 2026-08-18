# Pull Request: Phase 05 · Sprint 03 — Move History and Captured Pieces

## 1. Summary of Changes

This pull request implements the **Move History and Captured Pieces** subsystem for **ChessForge** (Phase 05 · Sprint 03), providing a high-performance, accessible game review panel and real-time material balance tracking.

### Key Architectural & Feature Deliverables

1. **`MoveHistoryPanel` (`src/features/game/MoveHistoryPanel.tsx` & `.css`):**
   - Renders authoritative FIDE Standard Algebraic Notation (SAN) moves.
   - Automatically groups half-moves (plies) into monotonic move rows (`1. e4 e5`, `2. Nf3 Nc6`, etc.).
   - Distinguishes and highlights the active/latest move with `data-active="true"` and glowing cyan indicator.
   - Implements auto-scrolling to ensure latest move visibility as game length grows.
   - Semantic accessibility structure with `role="region"`, `role="table"`, and descriptive ARIA labels for each move cell.
   - Clean empty state when no moves have been made.

2. **`CapturedPiecesView` & Material Balance Utilities (`src/features/game/moveHistoryUtils.ts`, `CapturedPiecesView.tsx` & `.css`):**
   - Calculates material values: Pawn (1), Knight (3), Bishop (3), Rook (5), Queen (9).
   - Computes net material differential ($\Delta = \text{Score}_{\text{white}} - \text{Score}_{\text{black}}$) and displays `+N` badge next to the leading player.
   - Sorts captured piece glyphs in standard hierarchy ($Q \to R \to B \to N \to P$).
   - Integrated into both `MoveHistoryPanel` summary header and `PlayerPanel` trays.

3. **Desktop Layout & App Integration (`src/App.tsx` & `src/App.css`):**
   - Two-column responsive desktop layout placing `BoardSection` and `SidebarSection` side-by-side on wide screens.
   - Synchronous atomicity: move execution and undo operations update board, history, captures, and material balance in the same state tick.

---

## 2. Test Execution & Quality Gates Report

| Quality Gate              | Tool / Command                                | Target                    | Status                          |
| :------------------------ | :-------------------------------------------- | :------------------------ | :------------------------------ |
| **Typecheck**             | `npm run typecheck` (`tsc --noEmit`)          | TypeScript strict mode    | **PASS (0 errors)**             |
| **Linter**                | `npm run lint` (`eslint .`)                   | TypeScript ESLint rules   | **PASS (0 errors, 0 warnings)** |
| **Code Style**            | `npm run format:check` (`prettier --check .`) | Codebase formatting       | **PASS (All files match)**      |
| **Unit & Property Tests** | `npm test` (`vitest run`)                     | 43 test suites, 404 tests | **PASS (404/404, 0 skips)**     |
| **E2E UI Automation**     | `npm run test:e2e` (`playwright test`)        | 27 browser scenarios      | **PASS (27/27 green)**          |
| **Production Build**      | `npm run build` (`vite build`)                | Vite bundle & packaging   | **PASS (1.45s, 0 errors)**      |

---

## 3. Security Sign-off

- **Tauri Capability Audit:** No new native OS permissions, capabilities, or IPC commands added.
- **Untrusted Input Handling:** All move notations originate directly from the chess engine/adapter. Material balances are pure numeric computations.
- **Zero Remote Telemetry:** 100% local Windows desktop architecture strictly preserved.

---

## 4. Sprint Definition of Done (DoD) Verification

- [x] Scope complete without speculative or unrelated modifications.
- [x] 100% Green test automation (404 Vitest unit/property tests, 27 Playwright E2E tests).
- [x] Clean typecheck and linting (0 errors, 0 warnings).
- [x] Prettier code formatting verified.
- [x] Security Officer audit approved.
- [x] Product Owner acceptance criteria approved.
- [x] Git diff reviewed and atomic conventional commits prepared.
