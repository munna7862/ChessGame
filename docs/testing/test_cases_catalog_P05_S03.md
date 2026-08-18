# Test Cases Catalog: Phase 05 · Sprint 03 (Move History and Captured Pieces)

This catalog defines the test requirements, domain invariants, positive/negative/boundary scenarios, and quality gate criteria for **Move History Panel, SAN Move Grouping, Active Move Highlight, Auto-Scrolling, Captured Pieces Tray, and Material Differential Calculation** in **ChessForge**.

---

## 1. Test Coverage Matrix

| Test ID        | Category          | Description                                                               | Target Component / Module                    | Invariant / Rule                                                                                               |
| :------------- | :---------------- | :------------------------------------------------------------------------ | :------------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| **TC-HIST-01** | Positive / UI     | Move history SAN list rendering                                           | `MoveHistoryPanel.tsx`                       | Renders accurate SAN strings for all played moves (`e4`, `Nf3`, `O-O`, etc.)                                   |
| **TC-HIST-02** | Positive / UI     | Move row grouping by move number                                          | `MoveHistoryPanel.tsx`                       | Groups plies into rows with monotonic move numbers (`1.`, `2.`, `3.`, ...)                                     |
| **TC-HIST-03** | Boundary / UI     | Odd number of plies (White-only move row)                                 | `MoveHistoryPanel.tsx`                       | When only White has moved in the current turn, renders White move with empty Black slot                        |
| **TC-HIST-04** | Positive / UI     | Active / latest move highlight                                            | `MoveHistoryPanel.tsx`                       | The most recent move in history has `data-active="true"` or `.move-cell--active` highlight                     |
| **TC-HIST-05** | Positive / UI     | Move history empty state                                                  | `MoveHistoryPanel.tsx`                       | Displays clean placeholder ("No moves played yet") when `moveHistory` is empty                                 |
| **TC-HIST-06** | Positive / A11y   | Accessibility and ARIA labeling                                           | `MoveHistoryPanel.tsx`                       | Uses `role="region"`, `aria-label="Move history"`, informative move ARIA labels                                |
| **TC-HIST-07** | Integration       | Auto-scroll to latest move                                                | `MoveHistoryPanel.tsx`                       | Container auto-scrolls to bottom when moves are added, keeping latest move visible                             |
| **TC-HIST-08** | Integration       | Synchronization with GameSession moves                                    | `App.tsx` / `MoveHistoryPanel.tsx`           | Dispatched board moves immediately appear in history atomically with state update                              |
| **TC-HIST-09** | Integration       | Undo reversibility & history truncation                                   | `GameSessionController.ts` / UI              | Undoing a move removes the last ply from history and updates the latest move highlight                         |
| **TC-HIST-10** | Integration       | New Game / Reset cleans history                                           | `App.tsx` / `GameSessionController.ts`       | Starting a new game completely resets move history and scroll container                                        |
| **TC-CAPT-01** | Positive / UI     | Captured pieces derivation and rendering                                  | `PlayerPanel.tsx` / `CapturedPiecesView.tsx` | Renders captured piece glyphs grouped by color (White captures vs Black captures)                              |
| **TC-CAPT-02** | Positive / UI     | Captured pieces count aggregation                                         | `CapturedPiecesView.tsx`                     | Multiple captured pieces of same type (e.g. 2 Pawns) display with aggregated counts or sequential glyphs       |
| **TC-CAPT-03** | Positive / Domain | Standard material point value calculation                                 | `types.ts` / `GameSessionController.ts`      | Pawn=1, Knight=3, Bishop=3, Rook=5, Queen=9                                                                    |
| **TC-CAPT-04** | Positive / UI     | Material advantage differential badge                                     | `PlayerPanel.tsx` / `MoveHistoryPanel.tsx`   | Displays `+N` badge next to the player holding the material lead; none when equal                              |
| **TC-CAPT-05** | Positive / Domain | En passant capture attribution                                            | `GameSessionController.ts`                   | Capturing pawn via en passant correctly adds opponent's pawn to capturer's list                                |
| **TC-CAPT-06** | Positive / Domain | Promotion capture attribution                                             | `GameSessionController.ts`                   | Capturing piece on promotion square adds captured piece to capturer's tray                                     |
| **TC-CAPT-07** | Integration       | Captured pieces undo restoration                                          | `GameSessionController.ts` / UI              | Undoing a capturing move restores captured piece to board and removes it from tray                             |
| **TC-HIST-11** | Property / Fuzz   | Generative property fuzzing across randomized legal playouts (fast-check) | `moveHistoryInvariants.test.ts`              | Validates ply numbering $\lfloor \text{ply}/2 \rfloor + 1$, monotonic SAN length, and material balance $\ge 0$ |
| **TC-E2E-01**  | E2E               | Desktop Playwright multi-move game review                                 | `e2e/moveHistory.spec.ts`                    | Plays multi-move game (Scholar's mate / Ruy Lopez), verifies move list, active highlight, and captures in UI   |

---

## 2. Quality Gate & Acceptance Criteria

1. **Unit & Property Automation:** 100% pass across all existing test suites and new `MoveHistoryPanel.test.tsx` and `moveHistoryInvariants.test.ts` in `Vitest`.
2. **Component Integration:** `@testing-library/react` tests verify move rendering, active highlights, empty state, capture displays, and material advantage badge.
3. **E2E Playwright Automation:** `npm run test:e2e` verifies end-to-end move recording, active highlight, and capture display during full game playout.
4. **Type Safety & Linting:** `npm run typecheck`, `npm run lint`, and `npm run format:check` pass with 0 errors/warnings.
5. **Desktop Packaging & Build:** `npm run build` succeeds cleanly.

**SDET Sign-off:** APPROVED for Dev Implementation.
