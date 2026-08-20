# Pre-Implementation Test Cases Catalog: Phase 10 · Sprint 02

**Sprint:** Phase 10 · Sprint 02: Chess Regression Hardening  
**Target Specification:** [Product Requirements Baseline](file:///c:/Workspace/ChessGame/docs/product-requirements.md), [Testing Strategy](file:///c:/Workspace/ChessGame/docs/testing-strategy.md), [Chess Domain Architecture](file:///c:/Workspace/ChessGame/docs/architecture.md), [QA Traceability Matrix](file:///c:/Workspace/ChessGame/docs/qa-matrix.md)  
**Author:** SDET Architect & Chess Domain Architect  
**Status:** `Approved & Ready for Execution`

---

## 1. Overview & Objectives

The primary objective of **Phase 10 · Sprint 02** is to aggressively stress and harden the ChessForge chess domain and UI/engine integration against complex, adversarial, and historically controversial chess rule scenarios.

This catalog establishes the test requirements, golden FEN positions, edge-case invariants, and validation criteria across:

1. **Extended Regression Corpus:** Expanding standard test positions with classic endgame studies (Saavedra, Lasker-Reichhelm, Reti), historical masterpieces (Immortal Game, Opera Game, Deep Blue vs Kasparov), and perft depth benchmarks.
2. **Adversarial Pins, Discovered Checks & Double Checks:** Absolute vs relative pins, cross-pins, pieces pinned against king delivering check to opponent, king evasion constraints in double check, and pins along rank/file/diagonal rays.
3. **Special-Move Edge Cases:** Castling through attacked squares vs rook passing through attack on b1/b8, king passing through check prohibition, en passant king exposure unpinning defect, en passant delivering check/checkmate, underpromotions avoiding stalemate or delivering fork/mate.
4. **Draw & Repetition Boundaries:** Threefold repetition with castling right / en passant expiration nuances, 50-move rule counter resets on pawn push or capture, and full insufficient material matrices.
5. **UI & Domain Consistency:** Guaranteeing that board drag-and-drop, keyboard moves, promotion dialogs, and game session state transitions strictly enforce domain rules without bypassing validation or getting into out-of-sync states.

---

## 2. Test Cases Specification

### 2.1 Extended Known-Position Corpus (TC-REG-CORPUS-01 to TC-REG-CORPUS-06)

| Test ID              | Category                | Description & FEN Scenario                                                                                       | Expected Outcome                                                                                                               | Verification Tier    |
| :------------------- | :---------------------- | :--------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- | :------------------- |
| **TC-REG-CORPUS-01** | Positive / Corpus       | **Saavedra Position (1895)**<br>`8/8/1P6/8/8/1r6/p7/k6K w - - 0 1`                                               | Correct move sequence and legal move generation; underpromotion `c8=R` avoids stalemate caused by `c8=Q Rc4+! Qxc4` stalemate. | Tier 1 Unit / Vitest |
| **TC-REG-CORPUS-02** | Positive / Corpus       | **Lasker-Reichhelm Trebuchet Study (1901)**<br>`8/k7/3p4/p2P1p2/P2P1P2/8/8/K7 w - - 0 1`                         | Correct legal move counts, opposition triangulation, and exact FEN serialization round-trip without corruption.                | Tier 1 Unit / Vitest |
| **TC-REG-CORPUS-03** | Positive / Corpus       | **Reti Endgame Study (1921)**<br>`7K/8/k1P5/7p/8/8/8/8 w - - 0 1`                                                | Move validation and legal king/pawn navigation preserving diagonal path mechanics towards both pawns.                          | Tier 1 Unit / Vitest |
| **TC-REG-CORPUS-04** | Positive / Corpus       | **Opera Game (Morphy 1858)** & **Immortal Game (1851)**<br>Full PGN game replays from standard initial position. | PGN parser executes full move sequence seamlessly, reaching exact final checkmate position and recording winner.               | Tier 1 Unit / Vitest |
| **TC-REG-CORPUS-05** | Positive / Corpus       | **Kasparov vs Deep Blue 1997 Game 6**<br>Rapid piece sacrifice and open-line tactical pressure PGN.              | PGN parser accurately reproduces all 19 moves, intermediate check flags, and final resignation status (`1-0`).                 | Tier 1 Unit / Vitest |
| **TC-REG-CORPUS-06** | Invariant / Performance | **Perft Positions 1 through 6 Comprehensive Movegen**                                                            | Leaf node counts match canonical perft standards exactly across all 6 standard test positions.                                 | Tier 1 Unit / Perft  |

---

### 2.2 Adversarial Pins, Discovered Checks & Double Checks (TC-REG-PIN-01 to TC-REG-PIN-06)

| Test ID           | Category                  | Description & FEN Scenario                                                                                                                                        | Expected Outcome                                                                                                                                                                              | Verification Tier    |
| :---------------- | :------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------- |
| **TC-REG-PIN-01** | Negative / Invariant      | **Absolute Pin Ray Preservation**<br>White King on `e1`, White Bishop on `e4`, Black Rook on `e8`.                                                                | Bishop cannot move diagonally off `e` file (moves to `d5`, `f3`, etc. return `ILLEGAL_MOVE`). Bishop can only move along attack ray if applicable.                                            | Tier 1 Unit / Vitest |
| **TC-REG-PIN-02** | Boundary / FIDE Semantics | **Pinned Piece Delivering Check / Defending**<br>White King on `d1`, Black King on `f1`, Black Queen on `e2` checked by White Rook on `e8` pinning Queen to King. | Black Queen is absolutely pinned to King `f1` and cannot move off file, yet Queen STILL delivers check to White King `d1` (White King cannot step to `e1` or `d2` into Queen's line of fire). | Tier 1 Unit / Vitest |
| **TC-REG-PIN-03** | Boundary / Evasion        | **Double Check Strict King Evasion**<br>White Knight and Rook deliver simultaneous double check.                                                                  | All non-king moves (interpositions, captures of one checking piece) are illegal; King has only evasive escape moves.                                                                          | Tier 1 Unit / Vitest |
| **TC-REG-PIN-04** | Negative / Ray Pin        | **Cross-Pin Resolution**<br>White Rook pins Black Bishop to Black King; Black Queen pins White Rook to White King.                                                | Neither pinned piece can move off their respective absolute king defense rays.                                                                                                                | Tier 1 Unit / Vitest |
| **TC-REG-PIN-05** | Boundary / Discovery      | **Discovered Check with Checkmate**<br>Moving a blocking piece exposes opponent king to checkmate.                                                                | Correctly sets `isCheck: true`, `state: 'checkmate'`, and disables all subsequent move attempts.                                                                                              | Tier 1 Unit / Vitest |
| **TC-REG-PIN-06** | Negative / Invariant      | **King Moving Adjacent to Opponent King**                                                                                                                         | King move adjacent to opponent king is strictly rejected with `ILLEGAL_MOVE`.                                                                                                                 | Tier 1 Unit / Vitest |

---

### 2.3 Special-Move Edge Cases: Castling, En Passant & Promotion (TC-REG-SPEC-01 to TC-REG-SPEC-06)

| Test ID            | Category             | Description & FEN Scenario                                                                                                                                   | Expected Outcome                                                                                                                                                                      | Verification Tier    |
| :----------------- | :------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------- |
| **TC-REG-SPEC-01** | Boundary / FIDE      | **Queenside Castling with Rook Passing Through Attacked Square (`b1`/`b8`)**                                                                                 | White King on `e1`, White Rook on `a1`, Black Bishop attacks `b1`. Queenside castling (`O-O-O` / `e1-c1`) is LEGAL because only King transit squares (`d1`, `c1`) cannot be attacked. | Tier 1 Unit / Vitest |
| **TC-REG-SPEC-02** | Negative / FIDE      | **Castling with King Passing Through Check (`f1`/`d1`/`f8`/`d8`)**                                                                                           | Castling move is strictly excluded from `getLegalMoves()` and rejected by `makeMove()`.                                                                                               | Tier 1 Unit / Vitest |
| **TC-REG-SPEC-03** | Negative / FIDE      | **Castling Out of Check**<br>King currently in check attempting `O-O` or `O-O-O`.                                                                            | Rejected with `ILLEGAL_MOVE`. King must evade, block, or capture checking piece.                                                                                                      | Tier 1 Unit / Vitest |
| **TC-REG-SPEC-04** | Boundary / Rare Rule | **En Passant Rank Pin (Horizontal King Exposure)**<br>White King on `e5`, White pawn on `f5`, Black pawn on `g7`, Black Rook on `a5`. Black plays `1... g5`. | White playing `fxg6 e.p.` would remove both `f5` and `g5` pawns from 5th rank, exposing White King `e5` to horizontal check from `a5` Rook. `fxg6` MUST BE ILLEGAL.                   | Tier 1 Unit / Vitest |
| **TC-REG-SPEC-05** | Boundary / Special   | **En Passant Delivering Checkmate**<br>En passant capture simultaneously discovers check and seals all escape squares.                                       | Game status correctly updates to `checkmate`, winner set, halfmove clock reset.                                                                                                       | Tier 1 Unit / Vitest |
| **TC-REG-SPEC-06** | Positive / Boundary  | **Underpromotion to Knight Delivering Smothered Mate or Fork**                                                                                               | Pawn promotes to Knight (`g7-g8=N#`), delivers mate without queen promotion requirement.                                                                                              | Tier 1 Unit / Vitest |

---

### 2.4 Draw Rules, Repetition & Terminal Boundary Invariants (TC-REG-DRAW-01 to TC-REG-DRAW-06)

| Test ID            | Category               | Description & FEN Scenario                                                                                                 | Expected Outcome                                                                                                                                  | Verification Tier    |
| :----------------- | :--------------------- | :------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------- |
| **TC-REG-DRAW-01** | Boundary / State       | **Threefold Repetition with Changing Castling Rights**<br>Identical piece positions with vs without castling availability. | Positions without castling rights do NOT count toward repetition with positions that had castling rights.                                         | Tier 1 Unit / Vitest |
| **TC-REG-DRAW-02** | Boundary / State       | **Threefold Repetition with Expired En Passant Rights**                                                                    | Position with active en passant target square is not identical to same position after target square expires.                                      | Tier 1 Unit / Vitest |
| **TC-REG-DRAW-03** | Boundary / Counter     | **50-Move Rule Exact Reset on Pawn Push or Capture**<br>Halfmove clock reaches 99 plies; pawn push resets clock to 0.      | Status remains `active` on 99 plies; resets to 0 on pawn push/capture; transitions to `draw_fifty_moves` upon reaching 100 plies (50 full moves). | Tier 1 Unit / Vitest |
| **TC-REG-DRAW-04** | Boundary / Material    | **Insufficient Material Matrix**<br>`K vs K`, `K+B vs K`, `K+N vs K`, `K+B vs K+B` (same colored square bishops).          | Authoritative status immediately reflects `draw_insufficient_material`, `inDraw: true`, `isOver: true`.                                           | Tier 1 Unit / Vitest |
| **TC-REG-DRAW-05** | Invariant / Precedence | **Checkmate vs Stalemate vs Draw Precedence in Complex Entrapments**                                                       | Checkmate strictly supersedes any simultaneous draw conditions (e.g. 50th move checkmate is checkmate, not 50-move draw).                         | Tier 1 Unit / Vitest |
| **TC-REG-DRAW-06** | Invariant / Terminal   | **Immutability of Terminal Game-Over States**                                                                              | Once status is `isOver: true`, any subsequent `makeMove()`, `resign()`, or `agreeDraw()` calls return `GAME_ALREADY_OVER`.                        | Tier 1 Unit / Vitest |

---

### 2.5 UI & Domain Integration Consistency (TC-REG-UI-01 to TC-REG-UI-04)

| Test ID          | Category             | Description & Preconditions                                                                             | Expected Outcome                                                                                                                                              | Verification Tier         |
| :--------------- | :------------------- | :------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------ |
| **TC-REG-UI-01** | Integration / UI     | **UI Board Interaction in Pinned Piece Scenarios**<br>User selects or drags an absolutely pinned piece. | Board only highlights legal moves along the pin ray; illegal drop destinations are rejected with smooth snapback animation without mutating state.            | Tier 4 RTL Integration    |
| **TC-REG-UI-02** | Integration / UI     | **Underpromotion Selection via Promotion Dialog**<br>User moves pawn to 8th rank in Saavedra position.  | Promotion dialog appears with Queen, Rook, Bishop, Knight; selecting Rook executes `c8=R`, updates board state and status correctly.                          | Tier 4 RTL Integration    |
| **TC-REG-UI-03** | Integration / UI     | **UI Move History & PGN Consistency under Adversarial Games**                                           | Move history panel and PGN export accurately display complex SAN annotations (`O-O-O`, `exd6 e.p.`, `c8=N#`, `++` / `+`).                                     | Tier 4 RTL Integration    |
| **TC-REG-UI-04** | Integration / Engine | **GameSessionController Engine Move Validation Defense**                                                | If Stockfish WASM engine or external input submits an illegal move or move on terminal state, controller intercepts, rejects, and preserves domain integrity. | Tier 3 Vitest Integration |

---

## 3. Quality Gate Pass / Fail Criteria

- **100% Green Vitest Automation:** All domain unit tests, invariant tests, tactical regressions, and fixture checks pass with 0 failures and 0 skipped tests (`npm test`).
- **Clean Typecheck & Linter:** `npm run typecheck` and `npm run lint` execute with 0 errors and 0 warnings.
- **Bijective Codec Validation:** FEN and PGN import/export preserve exact position state, move history, and draw flags across all corpus positions.
- **Zero UI-Domain Divergence:** UI components never permit a move that the domain adapter rejects, and domain state remains the single authoritative source of truth.
