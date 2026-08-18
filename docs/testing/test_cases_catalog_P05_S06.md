# Test Cases Catalog: Phase 05 · Sprint 06 — Human vs Human End-to-End

**Document Ref:** `docs/testing/test_cases_catalog_P05_S06.md`  
**Author:** SDET Architect  
**Sprint:** Phase 05 · Sprint 06: Human vs Human End-to-End  
**Quality Target:** 100% Green, Zero Skips, Vitest Integration & Playwright E2E Parity

---

## 1. Test Suite Matrix

| Test ID       | Category          | Description                                                                                                                                        | Verification Method |
| :------------ | :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------ |
| **TC-HVH-01** | E2E / Integration | Complete Human vs Human opening playout (e4 e5, Nf3 Nc6, Bc4 Bc5) with turn alternation and SAN history sync                                       | Vitest & Playwright |
| **TC-HVH-02** | E2E / Integration | Scholar's Mate 4-move checkmate delivery (1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7#) triggering GameResultModal ("White Wins!", "by Checkmate", 1-0) | Vitest & Playwright |
| **TC-HVH-03** | E2E / Integration | Fool's Mate 2-move checkmate delivery (1. f3 e5 2. g4 Qh4#) triggering GameResultModal ("Black Wins!", "by Checkmate", 0-1)                        | Vitest & Playwright |
| **TC-HVH-04** | E2E / Integration | Resignation workflow: Active player resigns with confirmation, triggering GameResultModal with correct winner and "by Resignation"                 | Vitest & Playwright |
| **TC-HVH-05** | E2E / Integration | Restart workflow: Mid-game restart prompt, cancellation preserves state, confirmation clears history and restores starting position                | Vitest & Playwright |
| **TC-HVH-06** | E2E / Integration | Draw offer & bilateral acceptance flow: White offers, Black accepts, modal displays "Game Drawn", "by Mutual Agreement", ½-½                       | Vitest & Playwright |
| **TC-HVH-07** | E2E / Integration | Draw offer declined flow: White offers, Black declines, modal dismisses, game continues seamlessly                                                 | Vitest & Playwright |
| **TC-HVH-08** | E2E / Integration | In-game Pawn Promotion modal workflow: Pawn reaches promotion rank, user selects Queen, piece updates and playout continues                        | Vitest & Playwright |
| **TC-HVH-09** | E2E / Integration | Review Board mode after game-over: Modal closes, board remains disabled, "View Result" button re-opens modal with intact scoreline                 | Vitest & Playwright |
| **TC-HVH-10** | E2E / Integration | Post-game Rematch flow: Clicking "Rematch" starts a fresh game with identical player names and active clocks                                       | Vitest & Playwright |
| **TC-HVH-11** | E2E / Integration | New Game dialog workflow: Customizing player names and orientation starts fresh game with flipped board                                            | Vitest & Playwright |
| **TC-HVH-12** | E2E / Integration | Post-game move immunity: Clicking or dragging pieces after checkmate/resignation/draw is strictly ignored                                          | Vitest & Playwright |
| **TC-HVH-13** | E2E / Integration | Multi-move Undo and capture restoration: Step-by-step undo accurately reverts position, SAN history, and material balance tray                     | Vitest & Playwright |
| **TC-HVH-14** | Property          | Fast-check generative fuzzing: Complete randomized legal playouts uphold King invariants, piece counts, and clean reset                            | Vitest + Fast-Check |

---

## 2. Detailed Test Scenarios & Expectations

### 2.1 TC-HVH-01: Full Gameplay & Turn Alternation

- **Given** a new game with White ("White Player") and Black ("Black Player").
- **When** players execute legal moves in sequence:
  1. White: `e2 -> e4`
  2. Black: `e7 -> e5`
  3. White: `g1 -> f3`
  4. Black: `b8 -> c6`
- **Then**:
  - Turn indicator alternates White $\rightarrow$ Black $\rightarrow$ White $\rightarrow$ Black $\rightarrow$ White.
  - Move History table displays `1. e4 e5`, `2. Nf3 Nc6`.
  - Active ply highlighting accurately tracks the latest move.

### 2.2 TC-HVH-02 & TC-HVH-03: Checkmate Scenarios (Scholar's Mate & Fool's Mate)

- **Scholar's Mate (White Checkmates Black):**
  - Moves: `1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7#`
  - Board status becomes `checkmate`.
  - `GameResultModal` opens automatically with:
    - Title: `"White Player Wins!"` (or `"White Wins!"`)
    - Subtitle: `"by Checkmate"`
    - Score: `"1 - 0"`
- **Fool's Mate (Black Checkmates White):**
  - Moves: `1. f3 e5 2. g4 Qh4#`
  - Board status becomes `checkmate`.
  - `GameResultModal` opens automatically with:
    - Title: `"Black Player Wins!"` (or `"Black Wins!"`)
    - Subtitle: `"by Checkmate"`
    - Score: `"0 - 1"`

### 2.3 TC-HVH-04 & TC-HVH-05: Resignation & Restart Flows

- **Resignation:**
  - Active player clicks "Resign" $\rightarrow$ Confirmation dialog opens $\rightarrow$ Player confirms.
  - Winner is opponent, Score is `1 - 0` or `0 - 1`, Subtitle is `"by Resignation"`.
- **Restart:**
  - Player clicks "Restart" mid-game $\rightarrow$ Confirmation dialog opens.
  - If "Cancel" clicked: game remains intact.
  - If "Restart Game" clicked: board resets to initial FEN, history cleared, undo disabled.

### 2.4 TC-HVH-06 & TC-HVH-07: Draw Offer / Accept / Decline

- **Draw Offer & Accept:**
  - Active player clicks "Offer Draw" $\rightarrow$ Modal opens for opponent $\rightarrow$ Opponent clicks "Accept Draw".
  - Game status becomes `draw_agreement`, `GameResultModal` displays `"Game Drawn"`, `"by Mutual Agreement"`, `"½ - ½"`.
- **Draw Offer & Decline:**
  - Active player clicks "Offer Draw" $\rightarrow$ Opponent clicks "Decline".
  - Modal dismisses, game continues with turn unchanged.

### 2.5 TC-HVH-08 to TC-HVH-12: Promotion, Review Board, Rematch, and Move Immunity

- **Pawn Promotion:**
  - Pawn moved to promotion rank $\rightarrow$ `PromotionDialog` renders 4 choices (Queen, Rook, Bishop, Knight).
  - Clicking Queen places Queen on board and advances turn.
- **Review Board:**
  - In `GameResultModal`, clicking "Review Board" closes modal, keeps terminal position, displays "View Result" button.
  - Clicking "View Result" reopens `GameResultModal`.
- **Rematch:**
  - In `GameResultModal`, clicking "Rematch" cleanly starts fresh game.
- **Move Immunity:**
  - Once game is over, clicking or dragging squares does not select pieces or make moves.

---

## 3. Automation Sign-Off

- **Test Catalog Status:** **APPROVED**.
- **Handing off to:** Dev Architect / Senior SDE for test authoring and integration hardening.
