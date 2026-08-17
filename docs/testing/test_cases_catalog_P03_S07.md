# Test Cases Catalog: Phase 03 · Sprint 07 (Domain Regression & Property Testing)

This document defines the pre-implementation test catalog for **ChessForge** Phase 03 Sprint 07: Domain Regression and Property Testing.

---

## 1. Test Suite Matrix Overview

| Test ID       | Category               | Objective                                                        | Input / Condition                                                                                         | Expected Outcome                                                              |
| :------------ | :--------------------- | :--------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| **TC-REG-01** | Perft Benchmark        | Validate starting position move generation node count at Depth 1 | `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`, Depth 1                                       | Exactly 20 legal leaf nodes generated.                                        |
| **TC-REG-02** | Perft Benchmark        | Validate starting position move generation node count at Depth 2 | Initial FEN, Depth 2                                                                                      | Exactly 400 legal leaf nodes generated.                                       |
| **TC-REG-03** | Perft Benchmark        | Validate starting position move generation node count at Depth 3 | Initial FEN, Depth 3                                                                                      | Exactly 8,902 legal leaf nodes generated.                                     |
| **TC-REG-04** | Perft Benchmark        | Validate Kiwipete position at Depth 1                            | `r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1`, Depth 1                           | Exactly 48 legal leaf nodes generated.                                        |
| **TC-REG-05** | Perft Benchmark        | Validate Kiwipete position at Depth 2                            | Kiwipete FEN, Depth 2                                                                                     | Exactly 2,039 legal leaf nodes generated.                                     |
| **TC-REG-06** | Perft Benchmark        | Validate Kiwipete position at Depth 3                            | Kiwipete FEN, Depth 3                                                                                     | Exactly 97,862 legal leaf nodes generated.                                    |
| **TC-REG-07** | Perft Benchmark        | Validate Position 3 (Endgame Pins) at Depth 1 & 2                | `8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1`, Depths 1, 2                                                  | Depth 1: 14 nodes; Depth 2: 191 nodes.                                        |
| **TC-REG-08** | Perft Benchmark        | Validate Position 3 at Depth 3                                   | Position 3 FEN, Depth 3                                                                                   | Exactly 2,812 legal leaf nodes generated.                                     |
| **TC-REG-09** | Perft Benchmark        | Validate Position 4 (Dual Promotions) at Depth 1 & 2             | `r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1`, Depths 1, 2                           | Depth 1: 6 nodes; Depth 2: 264 nodes.                                         |
| **TC-REG-10** | Perft Benchmark        | Validate Position 4 at Depth 3                                   | Position 4 FEN, Depth 3                                                                                   | Exactly 9,467 legal leaf nodes generated.                                     |
| **TC-REG-11** | Perft Benchmark        | Validate Position 5 (Promotions & Sharp Pins) at Depth 1 & 2     | `rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8`, Depths 1, 2                                  | Depth 1: 44 nodes; Depth 2: 1,486 nodes.                                      |
| **TC-REG-12** | Tactical Regression    | Discovered checks with double check resolution                   | Position where knight move discovers rook check while delivering knight check                             | Defending king must move (cannot block or capture both checking pieces).      |
| **TC-REG-13** | Tactical Regression    | En passant capture delivering check                              | Pawn performs en passant capture opening discovered bishop check                                          | Opponent king is in check; en passant square cleared.                         |
| **TC-REG-14** | Tactical Regression    | Castling through attacked square prohibition                     | Opponent rook controls `f1` / `f8`                                                                        | Castling kingside is excluded from legal moves.                               |
| **TC-REG-15** | Tactical Regression    | Absolute pin against Queen / Rook                                | Rook pinned against King by Bishop                                                                        | Pinned piece cannot move off the pinning diagonal.                            |
| **TC-REG-16** | Tactical Regression    | Stalemate in complex piece endgame                               | King cornered with no legal moves and not in check                                                        | `getStatus().state === "stalemate"`, `getStatus().inDraw === true`.           |
| **TC-REG-17** | Tactical Regression    | Checkmate with minor pieces (Bishop + Knight)                    | King trapped on edge in corner square                                                                     | `getStatus().state === "checkmate"`, `getStatus().winner` matches attacker.   |
| **TC-REG-18** | Seeded Property Test   | King Safety Invariant over 50 randomized games                   | Seeded `fast-check` generator (seed 42)                                                                   | Moving player is NEVER in check after making any legal move.                  |
| **TC-REG-19** | Seeded Property Test   | Move Reversibility Invariant across random playouts              | Make $N$ legal moves, undo $N$ moves                                                                      | Position, FEN, turn, castling rights, and clocks match initial position 100%. |
| **TC-REG-20** | Seeded Property Test   | FEN Codec Bijectivity under randomized game trees                | Random playout $\to$ FEN export $\to$ reload                                                              | Reloaded position matches active board state across all fields.               |
| **TC-REG-21** | Seeded Property Test   | PGN Replay Invariance under randomized game trees                | Random playout $\to$ PGN export $\to$ re-import                                                           | Re-imported game matches move count, board matrix, turn, and status 100%.     |
| **TC-REG-22** | Negative Invariance    | Illegal Move State Immutability (Randomized Fuzzing)             | Generate 100 randomized illegal move inputs (wrong turns, invalid squares, pseudo-legal moves into check) | Every attempt returns structured `Result.err`, game state has 0% mutation.    |
| **TC-REG-23** | Negative Invariance    | Malformed FEN Loading State Immutability                         | Attempt to load corrupted FEN strings                                                                     | Returns `Result.err(INVALID_FEN)`, existing game session intact.              |
| **TC-REG-24** | Negative Invariance    | Malformed PGN Loading State Immutability                         | Attempt to load corrupted PGN strings                                                                     | Returns `Result.err(INVALID_PGN)`, existing game session intact.              |
| **TC-REG-25** | Stability Verification | Full domain test suite reproducibility                           | Execute entire Vitest domain suite repeatedly                                                             | 0 flaky failures, 100% deterministic green run.                               |

---

## 2. Invariant Checklist for Automation Sign-off

- [x] All 25 test cases mapped to automated test files.
- [x] Perft positions 1 through 5 node counts validated.
- [x] Seeded property-based fuzzing configured with deterministic seeds.
- [x] Negative state immutability fuzzing implemented.
