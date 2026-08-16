# Test Cases Catalog: Phase 03 · Sprint 03 — Special Moves

## 1. Overview & Objective

This document defines the comprehensive test cases catalog, verification criteria, invariants, edge cases, and quality gates for **Phase 03 · Sprint 03: Special Moves**.

The primary objective is to verify that **Castling** (Kingside & Queenside for White and Black), **En Passant** (trigger, immediate window, removal of captured pawn, horizontal pin check), and **Pawn Promotion** (Queen, Rook, Bishop, Knight, underpromotions, capture-promotions, check/checkmate flags) are completely verified as authoritative first-class chess domain behavior with 100% mathematical and FIDE compliance.

---

## 2. Test Cases Matrix

| Test ID        | Category                     | Scenario / Description                                                         | Expected Outcome                                                                                                                   | Verification Method      |
| :------------- | :--------------------------- | :----------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- | :----------------------- |
| **TC-SPEC-01** | Castling: White Kingside     | White executes `O-O` from starting rank (`e1g1`)                               | King moves `e1` $\to$ `g1`, Rook moves `h1` $\to$ `f1`, White castling rights revoked (`K=false, Q=false`), SAN is `O-O`.          | Golden FEN unit test     |
| **TC-SPEC-02** | Castling: White Queenside    | White executes `O-O-O` from starting rank (`e1c1`)                             | King moves `e1` $\to$ `c1`, Rook moves `a1` $\to$ `d1`, White castling rights revoked (`K=false, Q=false`), SAN is `O-O-O`.        | Golden FEN unit test     |
| **TC-SPEC-03** | Castling: Black Kingside     | Black executes `O-O` from starting rank (`e8g8`)                               | King moves `e8` $\to$ `g8`, Rook moves `h8` $\to$ `f8`, Black castling rights revoked (`k=false, q=false`), SAN is `O-O`.          | Golden FEN unit test     |
| **TC-SPEC-04** | Castling: Black Queenside    | Black executes `O-O-O` from starting rank (`e8c8`)                             | King moves `e8` $\to$ `c8`, Rook moves `a8` $\to$ `d8`, Black castling rights revoked (`k=false, q=false`), SAN is `O-O-O`.        | Golden FEN unit test     |
| **TC-SPEC-05** | Castling: Origin In Check    | Attempt castling while King is in check                                        | Move is rejected with `ILLEGAL_MOVE` / `false`; 0 mutation to board, FEN, turn.                                                    | Golden FEN unit test     |
| **TC-SPEC-06** | Castling: Transit Attacked   | Attempt castling when square `f1`/`d1`/`f8`/`d8` is attacked                   | Move is rejected with `ILLEGAL_MOVE`; 0 mutation.                                                                                  | Golden FEN unit test     |
| **TC-SPEC-07** | Castling: Landing Attacked   | Attempt castling when square `g1`/`c1`/`g8`/`c8` is attacked                   | Move is rejected with `ILLEGAL_MOVE`; 0 mutation.                                                                                  | Golden FEN unit test     |
| **TC-SPEC-08** | Castling: Non-Restrictions   | Queenside castling when `b1`/`b8` is attacked, or Rook is attacked             | Castling is legal and succeeds normally.                                                                                           | Golden FEN unit test     |
| **TC-SPEC-09** | Castling: Obstructed Path    | Pieces present between King and Rook                                           | Castling move not present in legal moves; `makeMove` returns `ILLEGAL_MOVE`.                                                       | Golden FEN unit test     |
| **TC-SPEC-10** | Castling: King Moved Prior   | King moved away and returned to `e1`/`e8`                                      | Castling rights remain permanently lost; castling rejected.                                                                        | Sequential moves test    |
| **TC-SPEC-11** | Castling: Rook Moved Prior   | Rook moved away and returned to `h1`/`a1`/`h8`/`a8`                            | Castling right for that flank permanently lost; other flank retains rights if unmoved.                                             | Sequential moves test    |
| **TC-SPEC-12** | Castling: Rook Captured      | Opponent captures corner rook on original square                               | Castling rights string in FEN updates removing that flank right.                                                                   | Golden FEN unit test     |
| **TC-SPEC-13** | Castling: Check/Checkmate    | Castling move simultaneously delivering Check (`+`) or Checkmate (`#`)         | `Move.isCheck === true` / `Move.isCheckmate === true`, SAN formatted as `O-O+` or `O-O#`.                                          | Golden FEN unit test     |
| **TC-SPEC-14** | En Passant: White Capture    | White pawn on 5th rank captures adjacent 2-step Black pawn (`exd6`)            | Capturing pawn moves to `d6`; Black pawn on `d5` removed; `isEnPassant: true`; `captured: { type: 'p', color: 'b' }`.              | Golden FEN unit test     |
| **TC-SPEC-15** | En Passant: Black Capture    | Black pawn on 4th rank captures adjacent 2-step White pawn (`dxe3`)            | Capturing pawn moves to `e3`; White pawn on `e4` removed; `isEnPassant: true`; `captured: { type: 'p', color: 'w' }`.              | Golden FEN unit test     |
| **TC-SPEC-16** | En Passant: Expiration       | Player plays a non-e.p. move on the turn e.p. was available                    | En passant target square in FEN resets to `-`; e.p. capture on next turn is rejected.                                              | Sequential moves test    |
| **TC-SPEC-17** | En Passant: Horizontal Pin   | Discovered check along the rank if both pawns removed                          | Move is illegal; rejected with `ILLEGAL_MOVE` / `false`; 0 mutation.                                                               | Golden FEN unit test     |
| **TC-SPEC-18** | En Passant: Check/Mate       | En passant capture delivering Check or Mate                                    | `Move.isCheck === true` / `isCheckmate === true`, SAN formatted as `exd6+` or `exd6#`.                                             | Golden FEN unit test     |
| **TC-SPEC-19** | Promotion: Queen (`q`)       | Pawn advances to 8th rank promoting to Queen                                   | Pawn replaced by Queen; metadata has `promotion: 'q'`; quiet SAN `e8=Q`, capture `exd8=Q`.                                         | Golden FEN unit test     |
| **TC-SPEC-20** | Promotion: Rook (`r`)        | Underpromotion to Rook                                                         | Pawn replaced by Rook; metadata has `promotion: 'r'`; SAN `e8=R`.                                                                  | Golden FEN unit test     |
| **TC-SPEC-21** | Promotion: Bishop (`b`)      | Underpromotion to Bishop                                                       | Pawn replaced by Bishop; metadata has `promotion: 'b'`; SAN `e8=B`.                                                                | Golden FEN unit test     |
| **TC-SPEC-22** | Promotion: Knight (`n`)      | Underpromotion to Knight                                                       | Pawn replaced by Knight; metadata has `promotion: 'n'`; SAN `e8=N`.                                                                | Golden FEN unit test     |
| **TC-SPEC-23** | Promotion: Check/Mate        | Promoted piece attacks opposing King                                           | Metadata has `isCheck: true` / `isCheckmate: true`; SAN reflects check `e8=Q+` or mate `bxc8=R#`.                                  | Golden FEN unit test     |
| **TC-SPEC-24** | Promotion: Invalid / Missing | Pawn moves to 8th rank with invalid promotion piece (`k`, `p`, `x`) or missing | Rejected with error / `false`; 0 mutation.                                                                                         | Vitest unit test         |
| **TC-SPEC-25** | Failure Immutability         | Rejection of illegal special moves                                             | Board matrix, FEN, turn, move history, clocks unchanged.                                                                           | Vitest unit test         |
| **TC-SPEC-26** | Move Undo Reversibility      | `undo()` after castling, en passant, or promotion                              | Restores exact prior board, king & rook positions, captured pawn on board, original pawn on 7th rank, castling rights, and clocks. | Vitest unit test         |
| **TC-SPEC-27** | Property Invariant Fuzzing   | Generative legal move playout with `fast-check`                                | All special moves encountered in random legal games preserve king safety, exact piece counts, and reversibility.                   | fast-check property test |

---

## 3. Golden FEN Fixture Reference

```typescript
export const SPECIAL_MOVES_FIXTURES = {
  // Castling
  CASTLE_ALL_AVAILABLE: "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1",
  CASTLE_WHITE_IN_CHECK: "r3k2r/8/8/4r3/8/8/8/R3K2R w KQkq - 0 1",
  CASTLE_TRANSIT_F1_ATTACKED: "r3k2r/8/8/8/5b2/8/8/R3K2R w KQkq - 0 1",
  CASTLE_TRANSIT_D1_ATTACKED: "r3k2r/8/8/8/3b4/8/8/R3K2R w KQkq - 0 1",
  CASTLE_LANDING_G1_ATTACKED: "r3k2r/8/8/8/6b1/8/8/R3K2R w KQkq - 0 1",
  CASTLE_LANDING_C1_ATTACKED: "r3k2r/8/8/8/2b5/8/8/R3K2R w KQkq - 0 1",
  CASTLE_B1_ATTACKED_SAFE_KING: "r3k2r/8/8/8/8/1b6/8/R3K2R w KQkq - 0 1",
  CASTLE_ROOK_ATTACKED: "r3k2r/8/8/8/7b/8/8/R3K2R w KQkq - 0 1", // b attacks h1 directly? wait, if bishop on h4 attacks e1, that's check; bishop on g2 attacks h1, etc.
  CASTLE_OBSTRUCTED: "rn2k11r/8/8/8/8/8/8/R1B1KB1R w KQkq - 0 1",

  // En Passant
  EP_WHITE_AVAILABLE:
    "rnbqkbnr/pp1p1ppp/8/2pPp3/8/8/PPP1PPPP/RNBQKBNR w KQkq c6 0 3",
  EP_BLACK_AVAILABLE:
    "rnbqkbnr/ppp1pppp/8/8/3pP3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 2",
  EP_HORIZONTAL_PIN_ILLEGAL: "8/8/8/r2Pp2K/8/8/8/8 w - e6 0 1",
  EP_DELIVERING_CHECK: "8/8/8/3Pp3/8/8/8/4K2k w - e6 0 1", // e.g. with discovered rook check behind

  // Promotion
  PROMO_WHITE_ALL_PIECES: "8/4P3/8/8/8/8/8/4K2k w - - 0 1",
  PROMO_WHITE_CAPTURE: "3r4/4P3/8/8/8/8/8/4K2k w - - 0 1",
  PROMO_BLACK_ALL_PIECES: "4k3/8/8/8/8/8/4p3/4K3 b - - 0 1",
  PROMO_UNDERPROMO_AVOID_STALEMATE: "k7/P7/1K6/8/8/8/8/8 w - - 0 1",
  PROMO_DELIVERING_CHECKMATE: "6k1/4P1P1/6K1/8/8/8/8/8 w - - 0 1",
};
```

---

## 4. Sign-Off & Persona Gate

- **Role:** SDET Architect
- **Status:** **APPROVED**
- **Handing off to:** Dev Architect / Senior SDE for domain review, verification, and code acceptance review.
