# Test Cases Catalog: Phase 05 · Sprint 05 — Draw Flow and Game Result

**Document Ref:** `docs/testing/test_cases_catalog_P05_S05.md`  
**Author:** SDET Architect  
**Sprint:** Phase 05 · Sprint 05: Draw Flow and Game Result  
**Quality Target:** 100% Green, Zero Skips, Fast-Check Invariants & Playwright E2E Parity

---

## 1. Test Suite Matrix

| Test ID        | Category    | Description                                                                                                                                               | Verification Method |
| :------------- | :---------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------ |
| **TC-DRAW-01** | Unit / UI   | Draw button disabled when game is over                                                                                                                    | RTL Component Test  |
| **TC-DRAW-02** | Unit / UI   | Offer Draw opens confirmation dialog indicating offering player and addressing recipient                                                                  | RTL Component Test  |
| **TC-DRAW-03** | Unit / UI   | Declining Draw offer closes dialog, leaves game active, keeps board interactive, broadcasts decline announcement                                          | RTL Component Test  |
| **TC-DRAW-04** | Unit / UI   | Accepting Draw offer invokes `agreeDraw()`, terminates game with `state: "draw_agreement"`, `inDraw: true`, score `½ - ½`, and displays `GameResultModal` | RTL Component Test  |
| **TC-DRAW-05** | Unit / UI   | Checkmate game-over automatically triggers `GameResultModal` with title "[Winner] Wins!", subtitle "by Checkmate", score `1-0` or `0-1`                   | RTL Component Test  |
| **TC-DRAW-06** | Unit / UI   | Resignation game-over automatically triggers `GameResultModal` with title "[Winner] Wins!", subtitle "by Resignation", score `1-0` or `0-1`               | RTL Component Test  |
| **TC-DRAW-07** | Unit / UI   | Automatic draw: Stalemate triggers `GameResultModal` with title "Game Drawn", subtitle "by Stalemate", score `½ - ½`                                      | RTL Component Test  |
| **TC-DRAW-08** | Unit / UI   | Automatic draw: Threefold Repetition triggers `GameResultModal` with title "Game Drawn", subtitle "by Threefold Repetition", score `½ - ½`                | RTL Component Test  |
| **TC-DRAW-09** | Unit / UI   | Automatic draw: 50-Move Rule triggers `GameResultModal` with title "Game Drawn", subtitle "by 50-Move Rule", score `½ - ½`                                | RTL Component Test  |
| **TC-DRAW-10** | Unit / UI   | Automatic draw: Insufficient Material triggers `GameResultModal` with title "Game Drawn", subtitle "by Insufficient Material", score `½ - ½`              | RTL Component Test  |
| **TC-DRAW-11** | Unit / UI   | `GameResultModal` "Review Board" action dismisses modal, preserves terminal board state, disables moves, and presents "View Result" button                | RTL Component Test  |
| **TC-DRAW-12** | Unit / UI   | Clicking "View Result" button in review mode reopens `GameResultModal`                                                                                    | RTL Component Test  |
| **TC-DRAW-13** | Unit / UI   | `GameResultModal` "Rematch" action resets game cleanly with same players and config                                                                       | RTL Component Test  |
| **TC-DRAW-14** | Unit / UI   | `GameResultModal` "New Game" action opens `NewGameModal`                                                                                                  | RTL Component Test  |
| **TC-DRAW-15** | Unit / A11y | `GameResultModal` accessibility (dialog role, focus trap, Escape handling, aria-labelledby, aria-describedby)                                             | RTL Component Test  |
| **TC-DRAW-16** | Property    | Fast-check property fuzzing: agreed and automatic draw games yield valid terminal state invariants, score `½ - ½`, and disabled board interactions        | Vitest + Fast-Check |
| **TC-E2E-02**  | E2E         | Playwright E2E: Full draw offer/accept flow, checkmate result modal display, and board review navigation                                                  | Playwright E2E      |

---

## 2. Detailed Test Specifications

### 2.1 TC-DRAW-01 to TC-DRAW-04: Draw Offer & Response

- **Given** an active Human-vs-Human game.
- **When** the active player clicks "Offer Draw" (`btn-offer-draw`):
  - A modal opens with title "Draw Offered?" stating "[Player 1] offers a draw. Does [Player 2] accept?".
  - If "Decline" clicked: modal closes, announcement indicates draw offer was declined, game remains active.
  - If "Accept" clicked: `agreeDraw()` is called, game status updates to `draw_agreement`, `GameResultModal` is shown with score `½ - ½`.

### 2.2 TC-DRAW-05 to TC-DRAW-10: Game Result Taxonomy & Reasons

- **Given** games terminating via Checkmate, Resignation, Stalemate, Threefold Repetition, 50-Move Rule, or Insufficient Material.
- **Then** the `GameResultModal` displays:
  - Exact winner and title (`"White Wins!"`, `"Black Wins!"`, `"Game Drawn"`).
  - Exact reason subtitle (`"by Checkmate"`, `"by Resignation"`, `"by Stalemate"`, `"by Threefold Repetition"`, `"by 50-Move Rule"`, `"by Insufficient Material"`, `"by Mutual Agreement"`).
  - Official scoreline (`"1 - 0"`, `"0 - 1"`, `"½ - ½"`).
  - Matchup summary with player names and total moves played.

### 2.3 TC-DRAW-11 to TC-DRAW-15: Post-Game Actions & Accessibility

- **When** the player clicks "Review Board" (`btn-review-board`):
  - Modal closes, board remains disabled, and a "View Result" button (`btn-view-result`) appears in the controls.
- **When** the player clicks "Rematch" (`btn-rematch`):
  - Game resets to start position with same player names.
- **When** the player clicks "New Game" (`btn-result-new-game`):
  - `NewGameModal` opens.
- **Accessibility:**
  - Dialog has `role="dialog"`, `aria-modal="true"`, `aria-labelledby="game-result-title"`, `aria-describedby="game-result-description"`.
  - Focus trapped inside modal; `Escape` key closes modal (entering Review Board mode).

### 2.4 TC-DRAW-16: Property-Based Fuzzing

- Generates randomized legal game plies resulting in draw/terminal states.
- Asserts that all terminal draw states have `isOver === true`, `inDraw === true`, `winner === null`, valid `drawReason`, and score `½ - ½`.
