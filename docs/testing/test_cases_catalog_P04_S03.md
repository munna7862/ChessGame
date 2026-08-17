# Test Cases Catalog: Phase 04 · Sprint 03 - Selection and Legal Move Interaction

This catalog defines the test scenarios, golden fixtures, accessibility assertions, state transition verifications, and property invariants for piece selection and legal move visualization within **ChessForge**.

---

## 1. Test Matrix Summary

| Test ID       | Category  | Target Component / Area            | Description                                                       | Expected Outcome                                                                                  |
| :------------ | :-------- | :--------------------------------- | :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| **TC-SEL-01** | Positive  | `Square.tsx` / `Board.tsx`         | Select active White piece (e.g. pawn on e2)                       | Square receives `is-selected` class, `aria-selected="true"`, and legal destinations are computed  |
| **TC-SEL-02** | Positive  | `Square.tsx` / `Board.tsx`         | Render quiet move target indicators                               | Legal empty squares receive `data-target-type="move"` / `is-legal-target`, dot indicator rendered |
| **TC-SEL-03** | Positive  | `Square.tsx` / `Board.tsx`         | Render capture target indicators                                  | Enemy piece squares receive `data-target-type="capture"` / capture ring/halo indicator rendered   |
| **TC-SEL-04** | Positive  | `Square.tsx` / `Board.tsx`         | Render en passant capture target indicator                        | En passant target square receives `data-target-type="capture"` indicator                          |
| **TC-SEL-05** | Positive  | `useBoardInteraction` / `App.tsx`  | Switch selection to another friendly piece                        | Old square deselected, new square selected, legal move indicators update immediately              |
| **TC-SEL-06** | Positive  | `useBoardInteraction` / `App.tsx`  | Deselect by clicking already selected square                      | Selection cleared, legal destination indicators removed                                           |
| **TC-SEL-07** | Positive  | `useBoardInteraction` / `App.tsx`  | Deselect by clicking non-legal empty square                       | Selection cleared, legal destination indicators removed, 0 domain mutation                        |
| **TC-SEL-08** | Positive  | `useBoardInteraction` / `App.tsx`  | Deselect by clicking non-legal opponent piece                     | Selection cleared, legal destination indicators removed, 0 domain mutation                        |
| **TC-SEL-09** | Positive  | `useBoardInteraction` / `App.tsx`  | Click legal quiet destination square                              | Move dispatched (`from`, `to`), state updated to next turn, selection cleared                     |
| **TC-SEL-10** | Positive  | `useBoardInteraction` / `App.tsx`  | Click legal capture destination square                            | Move dispatched (`from`, `to`), captured piece removed, state updated, selection cleared          |
| **TC-SEL-11** | Negative  | `useBoardInteraction` / `App.tsx`  | Click empty square when idle                                      | No selection change, no errors, no legal indicators                                               |
| **TC-SEL-12** | Negative  | `useBoardInteraction` / `App.tsx`  | Click opponent piece when idle                                    | No selection change (cannot move opponent piece), no errors                                       |
| **TC-SEL-13** | Negative  | `Square.tsx` / `Board.tsx`         | Game over state (`isGameOver: true` / `disabled: true`)           | All square interactions locked (`is-disabled`, `aria-disabled="true"`), click produces no state   |
| **TC-SEL-14** | Boundary  | `Board.tsx`                        | Piece with 0 legal moves selected                                 | Square highlighted `is-selected`, but 0 legal destination indicators rendered                     |
| **TC-SEL-15** | Boundary  | `Board.tsx`                        | Absolute pinned piece selected                                    | Only legal moves along pin ray are highlighted (matches domain `getLegalMoves(sq)`)               |
| **TC-SEL-16** | Boundary  | `Board.tsx`                        | King in check: selecting king vs defending piece                  | Only legal moves escaping/blocking check are highlighted                                          |
| **TC-SEL-17** | Boundary  | `Board.tsx`                        | Black perspective orientation (`orientation: 'b'`)                | Active Black piece selection correctly maps visual squares and legal move highlights              |
| **TC-SEL-18** | A11y      | `Square.tsx`                       | Keyboard interaction (`Enter` / `Space`)                          | Square selection and move execution work via keyboard navigation with proper aria attributes      |
| **TC-SEL-19** | A11y      | `Square.tsx`                       | Accessible labels for selected square and destinations            | `aria-label` reflects selection state and legal destination/capture status                        |
| **TC-SEL-20** | Invariant | `useBoardInteraction`              | Domain position immutability on invalid clicks                    | 1,000 invalid destination clicks produce zero mutations to `Position` or move history             |
| **TC-SEL-21** | Property  | `useBoardInteraction` (fast-check) | Generative legal destination property verification                | Highlighted destinations match `game.getLegalMoves(sq)` for any legal reachable position          |
| **TC-SEL-22** | E2E       | Desktop UI (`Playwright`)          | End-to-end piece selection, move highlighting, and move execution | Click e2 -> highlights e3/e4, click e4 -> pawn moves to e4, black's turn                          |

---

## 2. Golden FEN Fixtures

### Scenario A: Initial Position (Pawn & Knight Move Highlights)

- **FEN:** `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`
- **Verification:**
  - Selecting `e2` yields 2 quiet moves: `e3`, `e4`.
  - Selecting `b1` yields 2 quiet moves: `a3`, `c3`.
  - Selecting `e1` yields 0 legal moves (blocked by pawns/pieces).

### Scenario B: Tactical Position with Captures & En Passant

- **FEN:** `r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5`
- **Verification:**
  - Selecting Bishop on `c4`: Quiet moves to `b3`, `a2`, `d3`, `e2`, `f1`, `b5`, `a6`, `d5`; Capture move on `f7` (`c4xf7+`).
  - Capture destination `f7` displays `data-target-type="capture"`.

### Scenario C: En Passant Capture Opportunity

- **FEN:** `rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 3`
- **Verification:**
  - Selecting Pawn on `e5`: Quiet move `e6`; Capture moves on `d6` and `f6` (en passant).
  - Target square `f6` is empty but displays `data-target-type="capture"`.

### Scenario D: Terminal Checkmate Position (Game Over Locking)

- **FEN:** `rnb1kbnr/pppp1ppp/4p3/8/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3`
- **Verification:**
  - Game is over (`isCheckmate: true`).
  - Board is disabled. Clicking any square does not select piece or compute moves.
