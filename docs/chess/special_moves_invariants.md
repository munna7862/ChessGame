# ChessForge Chess Domain: Special Moves Invariants & Formal Semantics

## 1. Executive Summary & Domain Authority

This document defines the formal chess semantics, FIDE rules compliance, state transitions, validation invariants, SAN/UCI notation standards, and golden FEN fixtures for all **Special Moves** in **ChessForge**:

1. **Castling** (Kingside `O-O` and Queenside `O-O-O`).
2. **En Passant** (Pawn-two-step trigger, immediate capture window, target expiration, horizontal pin invariants).
3. **Pawn Promotion** (Mandatory 8th-rank promotion, piece types Queen, Rook, Bishop, Knight, underpromotion check/mate semantics).

The domain layer is the single authoritative source of truth. All UI components, engine interfaces, and persistence serializers consume these invariants via the [IChessDomainAdapter](file:///c:/Workspace/ChessGame/src/domain/chess/ports.ts) port.

---

## 2. Castling Invariants & FIDE Rule Compliance

According to FIDE Handbook (Art 3.8.2), castling is a composite move of the King and one of the Rooks of the same color along the player's first rank.

### 2.1 Basic Geometries

| Color     | Flank           | King From $\to$ To | Rook From $\to$ To | SAN     | UCI    |
| :-------- | :-------------- | :----------------- | :----------------- | :------ | :----- |
| **White** | Kingside ($K$)  | `e1` $\to$ `g1`    | `h1` $\to$ `f1`    | `O-O`   | `e1g1` |
| **White** | Queenside ($Q$) | `e1` $\to$ `c1`    | `a1` $\to$ `d1`    | `O-O-O` | `e1c1` |
| **Black** | Kingside ($k$)  | `e8` $\to$ `g8`    | `h8` $\to$ `f8`    | `O-O`   | `e8g8` |
| **Black** | Queenside ($q$) | `e8` $\to$ `c8`    | `a8` $\to$ `d8`    | `O-O-O` | `e8c8` |

### 2.2 Castling Preconditions & Prohibition Invariants

Castling is **legal IF AND ONLY IF** all of the following conditions hold:

1. **Unmoved King:** The King has not moved since the start of the game. If the King moves, all castling rights ($K$ and $Q$, or $k$ and $q$) are permanently revoked.
2. **Unmoved Rook:** The specific Rook involved has not moved since the start of the game. If the $h$-file Rook moves, kingside castling right is permanently revoked. If the $a$-file Rook moves, queenside castling right is permanently revoked.
3. **Clear Transit Path (No Obstacles):** All squares between the King and the Rook must be empty:
   - White Kingside: `f1` and `g1` must be vacant.
   - White Queenside: `b1`, `c1`, and `d1` must be vacant.
   - Black Kingside: `f8` and `g8` must be vacant.
   - Black Queenside: `b8`, `c8`, and `d8` must be vacant.
4. **King Not in Check (Origin Safety):** The square currently occupied by the King (`e1` or `e8`) must NOT be under attack by any opposing piece.
5. **Transit Squares Not Under Attack (Pass-Through Safety):** The square through which the King passes (`f1` for White $K$-side, `d1` for White $Q$-side; `f8` for Black $k$-side, `d8` for Black $q$-side) must NOT be under attack by any opposing piece.
6. **Destination Square Not Under Attack (Landing Safety):** The destination square of the King (`g1` or `c1` for White; `g8` or `c8` for Black) must NOT be under attack by any opposing piece.

### 2.3 Clarifications on Castling Non-Restrictions

The following conditions **DO NOT** prevent castling:

- **Rook Under Attack:** If the Rook is attacked (e.g., White Rook on `h1` attacked by a Black Bishop on `a8`), castling is still legal as long as `e1`, `f1`, and `g1` are safe and clear.
- **Rook Passing Square Under Attack (`b1` / `b8`):** For Queenside castling, if square `b1` (or `b8`) is under attack by an opposing piece, Queenside castling is still legal because the King only travels across `d1` to `c1` (the King never touches `b1`).
- **Prior Check:** If the King was previously in check but moved out of check _without moving the King_ (e.g., interposing a piece or capturing the attacker) and the King never moved, castling rights remain valid.

### 2.4 Castling Rights Revocation on Capture

- If an opposing piece captures a Rook on its original corner square (e.g., `h1`, `a1`, `h8`, `a8`), the corresponding castling right is permanently revoked from the FEN rights string.

---

## 3. En Passant Invariants & Pawn Mechanics

According to FIDE Handbook (Art 3.7.4):

### 3.1 Trigger Condition

When a pawn advances two squares from its initial rank (rank 2 to rank 4 for White, rank 7 to rank 5 for Black) and lands horizontally adjacent to an enemy pawn (on rank 4 for Black pawns, or rank 5 for White pawns), the enemy pawn is granted an En Passant capture right.

- **FEN Target Square:** The square skipped over by the two-step pawn (e.g., if White plays `e2-e4`, the en passant target square in FEN is `e3`).

### 3.2 Immediate Window & Expiration

- **Strict One-Ply Lifespan:** The En Passant capture can **ONLY** be executed on the immediate turn following the two-square pawn advance.
- If the opponent plays any other move, the En Passant right for that target square **expires permanently** and the FEN field resets to `-`.

### 3.3 State Transition & Board Mutation

When En Passant is executed:

- The capturing pawn moves diagonally to the skipped target square (e.g., White pawn on `e5` moves to `d6`).
- The captured enemy pawn (located on `d5`, NOT `d6`) is removed from the board.
- Move metadata records:
  - `isCapture: true`
  - `capturedPiece: { type: 'p', color: <enemyColor>, square: <adjacentSquare> }`
  - `flags: 'e'` (or domain equivalent).
  - Halfmove clock resets to `0`.

### 3.4 Discovered Check / Horizontal Pin Invariant

- **Horizontal King Safety:** When two adjacent pawns on the 4th/5th rank are removed simultaneously during En Passant, it opens the entire rank.
- **Invariant:** If removing both pawns exposes the player's own King to an attack from a Rook or Queen along that rank, the En Passant move is **ILLEGAL** and must be rejected with `MOVE_ILLEGAL` / `AppError`.

---

## 4. Pawn Promotion Invariants

According to FIDE Handbook (Art 3.7.5):

### 4.1 Mandatory Promotion

When a pawn reaches the farthest rank from its starting square (Rank 8 for White, Rank 1 for Black), it must be immediately and atomically exchanged for a new piece of the same color:

- Queen (`'q'`)
- Rook (`'r'`)
- Bishop (`'b'`)
- Knight (`'n'`)

Promoting to a King (`'k'`) or another Pawn (`'p'`) is **strictly illegal**.

### 4.2 Atomicity & Game State

- Promotion is executed in a single atomic step: the pawn is replaced by the chosen piece on the destination square.
- Halfmove clock resets to `0` (pawn move).
- If the promotion square was occupied by an enemy piece, the move is a **Capture-Promotion** (`isCapture: true`).
- The new promoted piece immediately exerts attacks, potentially delivering check (`+`) or checkmate (`#`).

### 4.3 Underpromotion Semantics

- Underpromotion (Rook, Bishop, Knight) must be fully supported across all query, execution, undo, SAN formatting, and Stockfish UCI parsing interfaces.
- Strategic underpromotions to avoid stalemate (e.g. promoting to Rook instead of Queen) or deliver immediate knight forks must evaluate with complete tactical precision.

---

## 5. SAN & UCI Notation Standards

### 5.1 Standard Algebraic Notation (SAN)

| Move Type                    | Pattern                               | Examples                         |
| :--------------------------- | :------------------------------------ | :------------------------------- |
| **Kingside Castling**        | `O-O`                                 | `O-O`, `O-O+`, `O-O#`            |
| **Queenside Castling**       | `O-O-O`                               | `O-O-O`, `O-O-O+`, `O-O-O#`      |
| **En Passant Capture**       | `<originFile>x<targetSquare>`         | `exd6`, `gxh3`, `cxd6+`          |
| **Pawn Promotion (Quiet)**   | `<targetSquare>=<PIECE>`              | `e8=Q`, `a8=N`, `h1=R+`, `d8=B#` |
| **Pawn Promotion (Capture)** | `<originFile>x<targetSquare>=<PIECE>` | `exd8=Q`, `axb1=N+`, `fxg8=R#`   |

### 5.2 Universal Chess Interface (UCI)

| Move Type              | UCI String Format              | Examples                  |
| :--------------------- | :----------------------------- | :------------------------ |
| **Kingside Castling**  | `e1g1` (White), `e8g8` (Black) | `e1g1`, `e8g8`            |
| **Queenside Castling** | `e1c1` (White), `e8c8` (Black) | `e1c1`, `e8c8`            |
| **En Passant**         | `<from><to>`                   | `e5d6`, `d4e3`            |
| **Pawn Promotion**     | `<from><to><promoPiece>`       | `e7e8q`, `a7a8n`, `e7d8r` |

---

## 6. Golden FEN Fixture Catalog for Special Moves

The following deterministic FEN fixtures are established for Tier 1 & Tier 2 test suites:

### 6.1 Castling Golden Fixtures

- **GOLDEN_CASTLE_INITIAL**: `r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1`
  - White and Black have both $O-O$ and $O-O-O$ available.
- **GOLDEN_CASTLE_CHECK**: `r3k2r/8/8/4r3/8/8/8/R3K2R w KQkq - 0 1`
  - White King on `e1` is in check from Black Rook on `e5`. Both `e1g1` and `e1c1` are illegal.
- **GOLDEN_CASTLE_TRANSIT_ATTACKED**: `r3k2r/8/8/8/5b2/8/8/R3K2R w KQkq - 0 1`
  - Black Bishop on `f4` attacks `f1`. White `e1g1` is illegal; White `e1c1` is legal.
- **GOLDEN_CASTLE_DESTINATION_ATTACKED**: `r3k2r/8/8/8/6b1/8/8/R3K2R w KQkq - 0 1`
  - Black Bishop on `g4` attacks `g1`. White `e1g1` is illegal.
- **GOLDEN_CASTLE_ROOK_ATTACKED_B1**: `r3k2r/8/8/8/1b6/8/8/R3K2R w KQkq - 0 1`
  - Black Bishop on `b4` gives check to `e1`. (Illegal castling due to check).
- **GOLDEN_CASTLE_ROOK_ATTACKED_B1_SAFE_KING**: `r3k2r/8/8/8/8/1b6/8/R3K2R w KQkq - 0 1`
  - Black Bishop on `b3` attacks `b1`. White King is safe; `d1` and `c1` are safe. White `O-O-O` (`e1c1`) is **LEGAL**.
- **GOLDEN_CASTLE_OBSTRUCTED**: `rn2k11r/8/8/8/8/8/8/R1B1KB1R w KQkq - 0 1`
  - Pieces on `c1` and `f1` prevent castling until cleared.

### 6.2 En Passant Golden Fixtures

- **GOLDEN_EP_WHITE_TRIGGER**: `rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1`
- **GOLDEN_EP_WHITE_EXECUTION**: `rnbqkbnr/pp1p1ppp/8/2pPp3/8/8/PPP1PPPP/RNBQKBNR w KQkq c6 0 3`
  - White pawn on `d5` can capture `c6` via En Passant (`d5xc6` / `dxc6`).
- **GOLDEN_EP_BLACK_EXECUTION**: `rnbqkbnr/ppp1pppp/8/8/3pP3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 2`
  - Black pawn on `d4` can capture `e3` via En Passant (`d4xe3` / `dxe3`).
- **GOLDEN_EP_HORIZONTAL_PIN_ILLEGAL**: `8/8/8/r2Pp2K/8/8/8/8 w - e6 0 1`
  - White King on `h5`, Black Rook on `a5`, White Pawn on `d5`, Black Pawn on `e5` (just moved `e7-e5`).
  - If White plays `d5xe6` e.p., both pawns on `d5` and `e5` vacate rank 5, exposing White King on `h5` to Rook on `a5`.
  - **Verdict:** `dxe6` is **ILLEGAL**.
- **GOLDEN_EP_EXPIRATION**: `rnbqkbnr/pp1p1ppp/8/2pPp3/8/8/PPP1PPPP/RNBQKBNR w KQkq - 0 3`
  - Target square is `-`. White `d5xc6` is **ILLEGAL**.

### 6.3 Promotion Golden Fixtures

- **GOLDEN_PROMO_WHITE_QUIET**: `8/4P3/8/8/8/8/8/4K2k w - - 0 1`
  - White pawn on `e7` can promote to `e8=Q`, `e8=R`, `e8=B`, `e8=N`.
- **GOLDEN_PROMO_WHITE_CAPTURE**: `3r4/4P3/8/8/8/8/8/4K2k w - - 0 1`
  - White pawn on `e7` can promote quietly to `e8` or capture-promote to `d8` (`exd8=Q`, `exd8=R`, `exd8=B`, `exd8=N`).
- **GOLDEN_PROMO_UNDERPROMO_STALEMATE_AVOIDANCE**: `k7/P7/1K6/8/8/8/8/8 w - - 0 1`
  - If White plays `a7-a8=Q` or `a7-a8=R`, Black is stalemated (draw). Promoting to Bishop (`a8=B`) avoids stalemate or tests underpromotion dynamics.
- **GOLDEN_PROMO_UNDERPROMO_KNIGHT_FORK_MATE**: `6k1/5p1P/8/8/8/8/8/4K3 w - - 0 1`
  - White pawn delivers check on promotion.
- **GOLDEN_PROMO_BLACK**: `4k3/8/8/8/8/8/4p3/4K3 b - - 0 1`
  - Black pawn on `e2` can promote to `e1=q`, `e1=r`, `e1=b`, `e1=n`.

---

## 7. Sign-Off & Persona Gate

- **Role:** Chess Domain Architect
- **Status:** **APPROVED**
- **Handing off to:** SDET Architect for Sprint 03 Test Cases Catalog authoring (`docs/testing/test_cases_catalog_P03_S03.md`).
