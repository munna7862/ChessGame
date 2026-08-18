# Test Cases Catalog: Phase 05 · Sprint 04 — Undo, Restart, and Resign

**Document Ref:** `docs/testing/test_cases_catalog_P05_S04.md`  
**Author:** SDET Architect  
**Sprint:** Phase 05 · Sprint 04: Undo Restart and Resign  
**Quality Target:** 100% Green, Zero Skips, Fast-Check Invariants & Playwright E2E Parity

---

## 1. Test Suite Matrix

| Test ID        | Category    | Description                                                                            | Verification Method |
| :------------- | :---------- | :------------------------------------------------------------------------------------- | :------------------ |
| **TC-CTRL-01** | Unit / UI   | Undo button disabled when history is empty or game is over                             | RTL Component Test  |
| **TC-CTRL-02** | Unit / UI   | Single move undo reverts board piece to previous square & updates turn                 | RTL Component Test  |
| **TC-CTRL-03** | Unit / UI   | Multi-move undo sequence step-by-step reversibility to start                           | RTL Component Test  |
| **TC-CTRL-04** | Unit / UI   | Undo capture restores captured piece and updates material advantage badge              | RTL Component Test  |
| **TC-CTRL-05** | Unit / UI   | Undo pawn promotion reverts pawn to rank 7 and updates piece model                     | RTL Component Test  |
| **TC-CTRL-06** | Unit / UI   | Undo en passant restores captured pawn on rank 5                                       | RTL Component Test  |
| **TC-CTRL-07** | Unit / UI   | Undo clears active square selection and dismisses pending promotion dialog             | RTL Component Test  |
| **TC-CTRL-08** | Unit / UI   | Restart button opens accessible confirmation modal with warning style                  | RTL Component Test  |
| **TC-CTRL-09** | Unit / UI   | Cancelling Restart modal preserves current game state, moves, and board                | RTL Component Test  |
| **TC-CTRL-10** | Unit / UI   | Confirming Restart modal cleanses session, history, and transient UI                   | RTL Component Test  |
| **TC-CTRL-11** | Unit / UI   | Resign button opens accessible confirmation modal identifying resigning player         | RTL Component Test  |
| **TC-CTRL-12** | Unit / UI   | Cancelling Resign modal leaves game active and board interactive                       | RTL Component Test  |
| **TC-CTRL-13** | Unit / UI   | Confirming Resign transitions domain to resigned state and declares opponent winner    | RTL Component Test  |
| **TC-CTRL-14** | Unit / UI   | Game-over board is non-interactive (`aria-disabled="true"`, zero clicks/moves)         | RTL Component Test  |
| **TC-CTRL-15** | Unit / A11y | `ConfirmationModal` traps keyboard focus, handles Escape & Enter keys                  | RTL Component Test  |
| **TC-CTRL-16** | Property    | Fast-check fuzzing: $N$ random moves reverted via $N$ undos yield $P_0$                | Vitest + Fast-Check |
| **TC-E2E-01**  | E2E         | Playwright E2E: Game playout with move undo, restart flow, and resignation termination | Playwright E2E      |

---

## 2. Test Specifications & Invariants

### 2.1 TC-CTRL-01 to TC-CTRL-07: Move Undo Operations

- **Given** an active game session with moves played.
- **When** the user clicks "Undo" (`btn-undo-move`):
  - Last move is popped from domain history.
  - Position reverts to exact prior state.
  - Captured pieces and material score update instantly.
  - Last-move indicator updates to previous move $m_{N-1}$ (or is removed if $N=1$).
  - ARIA announcement announces move reversal.

### 2.2 TC-CTRL-08 to TC-CTRL-10: Restart Confirmation Workflow

- **Given** an active game with moves played.
- **When** the user clicks "Restart" (`btn-restart-game`):
  - Confirmation modal appears with `role="dialog"`, `aria-modal="true"`, title "Restart Game?", and message warning of lost progress.
  - If "Cancel" clicked or `Escape` pressed: modal closes, no state change.
  - If "Restart" confirmed: board resets to start, move history emptied, captured pieces cleared, last move cleared, and announcement made.

### 2.3 TC-CTRL-11 to TC-CTRL-14: Resignation Workflow & Terminal State

- **Given** an active game session.
- **When** the user clicks "Resign" (`btn-resign-game`):
  - Confirmation modal appears with title "Resign Game?", indicating which player is resigning.
  - If confirmed:
    - Domain calls `resign(player)`.
    - Status bar displays resignation indicator (`check-badge` / `resignation-indicator`).
    - Board is disabled (`aria-disabled="true"`).
    - Clicks on squares do not select or execute moves.
    - Undo button is disabled.

### 2.4 TC-CTRL-15 & TC-CTRL-16: Modal Accessibility & Property Invariants

- `ConfirmationModal` implements focus management, initial focus on primary/secondary button, Tab cycling, Escape dismissal.
- Generative fuzzing tests arbitrary sequence lengths ($1 \le N \le 20$) verifying that applying $N$ moves followed by $N$ undos restores initial FEN, piece counts, turn, and empty move history.
