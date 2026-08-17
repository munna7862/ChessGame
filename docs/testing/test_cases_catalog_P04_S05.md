# Test Cases Catalog: Phase 04 · Sprint 05 (Check and Promotion UI)

## Scope & Target Verification

This test cases catalog establishes the pre-implementation test contracts for **King Check / Checkmate Highlighting** and **Interactive Pawn Promotion Dialog** in **ChessForge**.

---

## 1. Test Cases Specification

| Test ID        | Category                | Description                                                       | Input / Setup                                                  | Expected Outcome                                                                                    |
| :------------- | :---------------------- | :---------------------------------------------------------------- | :------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| **TC-PROM-01** | Visual / Check          | King in check displays visual highlight and icon                  | Position with White in check (`findCheckSquare` returns `e1`)  | Square `e1` has `is-check` class, `data-is-check="true"`, and renders check badge indicator.        |
| **TC-PROM-02** | Accessibility           | Check state communicated beyond color                             | King square in check                                           | `aria-label` includes `", in check"`, badge has `aria-hidden="true"`.                               |
| **TC-PROM-03** | Visual / Checkmate      | King in checkmate shows distinct state                            | Scholar's mate position (Black King on `e8` mated)             | Square `e8` has `data-is-check="true"`, `data-is-checkmate="true"`, and checkmate status indicator. |
| **TC-PROM-04** | Negative / Check        | King not in check does not show check styling                     | Initial board starting position                                | Zero squares have `is-check` or check badges.                                                       |
| **TC-PROM-05** | Interaction / Trigger   | White pawn moving to rank 8 triggers promotion                    | White pawn on `e7`, click `e7` then `e8`                       | `pendingPromotion` state becomes active; `PromotionDialog` is displayed.                            |
| **TC-PROM-06** | Interaction / Trigger   | Black pawn moving to rank 1 triggers promotion                    | Black pawn on `a2`, click `a2` then `a1`                       | `pendingPromotion` state becomes active; `PromotionDialog` is displayed with Black pieces.          |
| **TC-PROM-07** | Interaction / Capture   | Pawn capture onto back rank triggers promotion                    | White pawn on `e7`, enemy knight on `d8`, click `e7` then `d8` | `PromotionDialog` opens for capture square `d8`.                                                    |
| **TC-PROM-08** | Negative / Trigger      | Non-pawn moving to 8th rank does not trigger promotion            | White Rook on `a1` moves to `a8`                               | Move executes immediately without opening promotion dialog.                                         |
| **TC-PROM-09** | UI / Promotion Choices  | Dialog renders 4 piece options (Q, R, B, N)                       | Promotion dialog active                                        | Buttons for Queen, Rook, Bishop, Knight rendered with piece graphics.                               |
| **TC-PROM-10** | Domain / Execution      | Selecting Queen commits Queen promotion                           | User clicks Queen option in dialog                             | `game.makeMove({ from, to, promotion: 'q' })` executed; Queen on target square; dialog closes.      |
| **TC-PROM-11** | Domain / Execution      | Selecting Rook commits Rook promotion (Underpromotion)            | User clicks Rook option in dialog                              | `game.makeMove({ from, to, promotion: 'r' })` executed; Rook on target square.                      |
| **TC-PROM-12** | Domain / Execution      | Selecting Bishop commits Bishop promotion                         | User clicks Bishop option in dialog                            | `game.makeMove({ from, to, promotion: 'b' })` executed; Bishop on target square.                    |
| **TC-PROM-13** | Domain / Execution      | Selecting Knight commits Knight promotion                         | User clicks Knight option in dialog                            | `game.makeMove({ from, to, promotion: 'n' })` executed; Knight on target square.                    |
| **TC-PROM-14** | Interaction / Escape    | Escape key cancels pending promotion                              | Dialog open, user presses `Escape`                             | Dialog dismissed; no move committed; position unchanged.                                            |
| **TC-PROM-15** | Interaction / Backdrop  | Backdrop/cancel click cancels pending promotion                   | Dialog open, user clicks outside / cancel                      | Dialog dismissed; board remains intact with no move committed.                                      |
| **TC-PROM-16** | Accessibility / Hotkeys | Hotkeys `Q`, `R`, `B`, `N` or `1`, `2`, `3`, `4` commit promotion | Dialog open, user presses key `N`                              | Knight promotion committed immediately.                                                             |
| **TC-PROM-17** | Accessibility / Focus   | Keyboard Arrow and Tab navigation in dialog                       | Dialog opens                                                   | Focus placed on default Queen option; Arrow keys navigate choices smoothly.                         |
| **TC-PROM-18** | Visual / Orientation    | Promotion dialog renders correctly with Black perspective         | Board orientation = 'b', promotion triggered                   | Dialog positioned accurately relative to promotion target square.                                   |
| **TC-PROM-19** | Edge Case / Reset       | Resetting game dismisses active promotion dialog                  | Dialog active, user clicks New Game                            | Dialog closes cleanly; initial board state restored.                                                |
| **TC-PROM-20** | Property / Fuzzing      | fast-check invariant test on promotion choices                    | Randomized FEN positions with ready-to-promote pawns           | Invariant: All 4 promotion moves succeed, produce valid FEN, and are reversible.                    |
| **TC-PROM-21** | E2E Playout             | Playwright E2E promotion & check test                             | End-to-end game flow to promotion                              | Full UI interaction verifies promotion dialog appearance, selection, and board update.              |

---

## 2. Quality Gate Thresholds

- **Unit & Integration Tests**: 100% Pass (0 skips, 0 failures).
- **Property-Based Tests**: Minimum 100 iterations of randomized promotion positions.
- **E2E Playwright Suite**: 100% Pass across desktop browser viewports.
- **Typecheck & Linter**: 0 errors, 0 warnings (`npm run typecheck`, `npm run lint`).
