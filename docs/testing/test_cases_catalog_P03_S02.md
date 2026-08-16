# Test Cases Catalog: Phase 03 · Sprint 02 — Legal Move Execution

## 1. Overview & Objective

This document defines the comprehensive test catalog, verification criteria, invariant guardrails, and quality gates for **Phase 03 · Sprint 02: Legal Move Execution**.

The primary objective is to verify authoritative legal move querying, validation, execution, state transitions (turns, halfmove/fullmove clocks, castling rights, en passant expiration), rich move metadata generation, strict zero-mutation on illegal move rejection, LIFO undo reversibility, and position reconstruction.

---

## 2. Test Cases Matrix

| Test ID        | Category                        | Scenario / Description                                              | Expected Outcome                                                                                                                                        | Verification Method      |
| :------------- | :------------------------------ | :------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------ | :----------------------- |
| **TC-MOVE-01** | Legal Move Querying             | Query all legal moves in initial & tactical positions               | Returns complete list of legal moves with accurate `from`, `to`, `piece`, `san`, `lan`. Returns empty list for opponent's pieces or terminal positions. | Vitest unit test         |
| **TC-MOVE-02** | Square Move Querying            | Query legal moves filtered by specific square (`getLegalMoves(sq)`) | Returns only legal moves originating from `sq`. Returns `[]` if `sq` is empty or belongs to opponent or has no legal destinations.                      | Vitest unit test         |
| **TC-MOVE-03** | Move Legality Check             | `isLegalMove(moveInput)` predicate check                            | Returns `true` for legal moves (including valid promotions) and `false` for illegal moves, without mutating the board state.                            | Vitest unit test         |
| **TC-MOVE-04** | Standard Piece Moves            | Execution of Pawn, Knight, Bishop, Rook, Queen, and King moves      | Board updates correctly; moving piece is placed at destination; origin square is cleared; turn toggles.                                                 | Vitest unit test         |
| **TC-MOVE-05** | Standard Captures               | Capturing enemy pieces with various piece types                     | Destination replaced with moving piece; captured piece recorded in metadata; halfmove clock resets to 0.                                                | Vitest unit test         |
| **TC-MOVE-06** | Castling Execution              | White & Black Kingside (`O-O`) and Queenside (`O-O-O`) castling     | King and Rook both relocate correctly; castling rights revoked; move metadata has `isCastling: 'kingside' \| 'queenside'`.                              | Golden FEN unit tests    |
| **TC-MOVE-07** | En Passant Execution            | En passant pawn capture (`f5xe6`)                                   | Moving pawn moves diagonally to `e6`; enemy pawn on `e5` is removed; metadata has `isEnPassant: true` and `captured: { type: 'p', color: 'b' }`.        | Golden FEN unit test     |
| **TC-MOVE-08** | Pawn Promotion                  | Promotion to Queen, Rook, Bishop, Knight (underpromotion)           | Pawn is replaced with promoted piece on destination rank; metadata has `promotion: 'q' \| 'r' \| 'b' \| 'n'`.                                           | Golden FEN unit tests    |
| **TC-MOVE-09** | Checks & Checkmate              | Move delivering check (`+`) or checkmate (`#`)                      | Metadata has `isCheck: true` or `isCheckmate: true`; game status updates to check or checkmate immediately.                                             | Golden FEN unit tests    |
| **TC-MOVE-10** | Turn Transitions                | Active color transitions (`w -> b`, `b -> w`)                       | Turn strictly toggles on successful move. Fullmove clock increments after Black's move.                                                                 | Vitest unit test         |
| **TC-MOVE-11** | Clock Mechanics                 | 50-move halfmove clock updates                                      | Halfmove resets to `0` on pawn move or piece capture; increments by `1` on all quiet piece moves.                                                       | Vitest unit test         |
| **TC-MOVE-12** | Move Metadata Integrity         | Full verification of returned `Move` fields                         | `from`, `to`, `piece`, `captured`, `san`, `lan`, `isCheck`, `isCheckmate`, `beforeFen`, `afterFen` are 100% accurate.                                   | Vitest unit test         |
| **TC-MOVE-13** | Illegal Move: Empty Square      | `makeMove` from an empty square                                     | Returns `err(NO_PIECE_AT_SQUARE)`; 0 mutation to board, FEN, turn, history.                                                                             | Vitest unit test         |
| **TC-MOVE-14** | Illegal Move: Wrong Turn        | `makeMove` moving opponent's piece                                  | Returns `err(NOT_YOUR_TURN)`; 0 mutation to board, FEN, turn, history.                                                                                  | Vitest unit test         |
| **TC-MOVE-15** | Illegal Move: Invalid Square    | `makeMove` with coordinates outside `a1-h8`                         | Returns `err(INVALID_SQUARE)`; 0 mutation to board.                                                                                                     | Vitest unit test         |
| **TC-MOVE-16** | Illegal Move: Geometric / Rules | Piece jumping, moving through pieces, moving into check             | Returns `err(ILLEGAL_MOVE)`; 0 mutation to board, FEN, turn, history.                                                                                   | Vitest unit test         |
| **TC-MOVE-17** | Illegal Move: Pinned Piece      | Moving a pinned piece that exposes the King to check                | Returns `err(ILLEGAL_MOVE)`; 0 mutation to board.                                                                                                       | Golden FEN unit test     |
| **TC-MOVE-18** | Illegal Move: Castling In Check | Castling while in check or through an attacked square               | Returns `err(ILLEGAL_MOVE)`; 0 mutation to board.                                                                                                       | Golden FEN unit tests    |
| **TC-MOVE-19** | Illegal Move: Terminal State    | Attempting move after Checkmate or Stalemate                        | Returns `err(GAME_ALREADY_OVER)`; 0 mutation.                                                                                                           | Golden FEN unit test     |
| **TC-MOVE-20** | Move Undo (Single & Chain)      | Calling `undo()` after 1 or N moves                                 | Restores exact previous FEN, turn, castling rights, en passant, clocks; removes move from history stack.                                                | Vitest unit test         |
| **TC-MOVE-21** | Undo on Empty History           | Calling `undo()` on initial board position                          | Returns `err(NO_MOVE_TO_UNDO)`; board remains in initial state.                                                                                         | Vitest unit test         |
| **TC-MOVE-22** | Position Reconstruction         | Replaying `getHistory()` on a fresh board instance                  | Final FEN and board matrix of replayed game matches source game exactly.                                                                                | Vitest unit test         |
| **TC-MOVE-23** | Generative Invariant Fuzzing    | Property-based testing with random legal moves (`fast-check`)       | King count invariant (1 white, 1 black) preserved; turn alternates; `undo()` perfectly restores state.                                                  | fast-check property test |

---

## 3. Detailed Test Scenarios & Golden FENs

### 3.1 Castling Invariants (`TC-MOVE-06`, `TC-MOVE-18`)

- **Kingside Castling Setup:**
  - FEN: `r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5`
  - Move: `{ from: 'e1', to: 'g1' }`
  - Expected: `Move.isCastling === 'kingside'`, `Move.san === 'O-O'`, King on `g1`, Rook on `f1`, castling rights for White cleared (`K: false, Q: false`).
- **Castling Through Check (Illegal):**
  - FEN: `4k3/8/8/8/8/5b2/8/R3K2R w KQ - 0 1` (Black bishop on `f3` attacks `f1`)
  - Move: `{ from: 'e1', to: 'g1' }`
  - Expected: Fails with `ILLEGAL_MOVE` (king would pass through `f1` which is attacked).

### 3.2 En Passant Mechanics (`TC-MOVE-07`)

- **Golden FEN:** `rnbqkbnr/pp1p1ppp/8/2p1pP2/8/8/PPPPP1PP/RNBQKBNR w KQkq e6 0 3`
- Move: `{ from: 'f5', to: 'e6' }`
- Expected:
  - `Move.isEnPassant === true`
  - `Move.captured === { type: 'p', color: 'b' }`
  - Black pawn on `e5` is removed from the board.
  - White pawn is placed on `e6`.

### 3.3 Pawn Promotion & Underpromotion (`TC-MOVE-08`)

- **Golden FEN:** `8/4P3/8/8/8/8/k6K/8 w - - 0 1`
- Moves:
  - `{ from: 'e7', to: 'e8', promotion: 'q' }` -> Promotes to Queen (`san: 'e8=Q'`)
  - `{ from: 'e7', to: 'e8', promotion: 'n' }` -> Underpromotes to Knight (`san: 'e8=N'`)
  - `{ from: 'e7', to: 'e8', promotion: 'r' }` -> Underpromotes to Rook (`san: 'e8=R'`)
  - `{ from: 'e7', to: 'e8', promotion: 'b' }` -> Underpromotes to Bishop (`san: 'e8=B'`)

### 3.4 Failure Immutability Contract (`TC-MOVE-13` to `TC-MOVE-19`)

- Before attempting any illegal move: capture snapshot `const before = { fen: game.exportFen(), history: game.getHistory(), status: game.getStatus() }`.
- Execute illegal move -> verify `res.ok === false`.
- Verify: `game.exportFen() === before.fen`, `game.getHistory().length === before.history.length`, `game.getStatus() === before.status`.

---

## 4. Test Automation Quality Gate Criteria

The sprint will be accepted by SDET only when:

1. All 23 test cases (TC-MOVE-01 to TC-MOVE-23) pass with 100% success rate.
2. Zero skipped (`it.skip`), suppressed, or disabled tests.
3. Fast-check generative property tests pass across at least 100 runs.
4. TypeScript (`tsc --noEmit`) and ESLint (`npm run lint`) pass with 0 errors and 0 warnings.
