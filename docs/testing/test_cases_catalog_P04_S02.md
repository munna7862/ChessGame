# Test Cases Catalog: Phase 04 · Sprint 02 - Piece Rendering

This catalog defines the deterministic test scenarios, golden fixtures, accessibility assertions, fallback verifications, and property invariants for chess piece rendering within **ChessForge**.

---

## 1. Test Matrix Summary

| Test ID         | Category    | Target Component / Area    | Description                                                  | Expected Outcome                                                                         |
| :-------------- | :---------- | :------------------------- | :----------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| **TC-PIECE-01** | Positive    | `Piece.tsx`                | Render White Pawn (`w`, `p`)                                 | SVG renders with `data-testid="piece-wp"`, `aria-label="White Pawn"`, role `img`         |
| **TC-PIECE-02** | Positive    | `Piece.tsx`                | Render White Knight (`w`, `n`)                               | SVG renders with `data-testid="piece-wn"`, `aria-label="White Knight"`                   |
| **TC-PIECE-03** | Positive    | `Piece.tsx`                | Render White Bishop (`w`, `b`)                               | SVG renders with `data-testid="piece-wb"`, `aria-label="White Bishop"`                   |
| **TC-PIECE-04** | Positive    | `Piece.tsx`                | Render White Rook (`w`, `r`)                                 | SVG renders with `data-testid="piece-wr"`, `aria-label="White Rook"`                     |
| **TC-PIECE-05** | Positive    | `Piece.tsx`                | Render White Queen (`w`, `q`)                                | SVG renders with `data-testid="piece-wq"`, `aria-label="White Queen"`                    |
| **TC-PIECE-06** | Positive    | `Piece.tsx`                | Render White King (`w`, `k`)                                 | SVG renders with `data-testid="piece-wk"`, `aria-label="White King"`                     |
| **TC-PIECE-07** | Positive    | `Piece.tsx`                | Render Black Pawn (`b`, `p`)                                 | SVG renders with `data-testid="piece-bp"`, `aria-label="Black Pawn"`                     |
| **TC-PIECE-08** | Positive    | `Piece.tsx`                | Render Black Knight (`b`, `n`)                               | SVG renders with `data-testid="piece-bn"`, `aria-label="Black Knight"`                   |
| **TC-PIECE-09** | Positive    | `Piece.tsx`                | Render Black Bishop (`b`, `b`)                               | SVG renders with `data-testid="piece-bb"`, `aria-label="Black Bishop"`                   |
| **TC-PIECE-10** | Positive    | `Piece.tsx`                | Render Black Rook (`b`, `r`)                                 | SVG renders with `data-testid="piece-br"`, `aria-label="Black Rook"`                     |
| **TC-PIECE-11** | Positive    | `Piece.tsx`                | Render Black Queen (`b`, `q`)                                | SVG renders with `data-testid="piece-bq"`, `aria-label="Black Queen"`                    |
| **TC-PIECE-12** | Positive    | `Piece.tsx`                | Render Black King (`b`, `k`)                                 | SVG renders with `data-testid="piece-bk"`, `aria-label="Black King"`                     |
| **TC-PIECE-13** | Boundary    | `Square.tsx` / `Board.tsx` | Empty square rendering (`piece: null` or `undefined`)        | No piece child element rendered in square container                                      |
| **TC-PIECE-14** | Integration | `Board.tsx`                | Starting position board rendering (32 pieces)                | All 16 White pieces and 16 Black pieces render on standard initial squares               |
| **TC-PIECE-15** | Integration | `Board.tsx`                | Custom position containing all 12 piece types                | Exactly 12 pieces render on their specified squares; remaining 52 squares are empty      |
| **TC-PIECE-16** | Integration | `Board.tsx`                | Orientation perspective flip (White vs Black)                | Pieces remain on correct algebraic squares regardless of board flip                      |
| **TC-PIECE-17** | Unit        | `pieceUtils.ts`            | Piece accessible label generation                            | Returns exact human-readable strings (e.g. `"White King"`, `"Black Knight"`)             |
| **TC-PIECE-18** | Unit        | `Piece.tsx`                | Custom CSS class names and size styling                      | Classes merged cleanly; SVG viewBox is preserved                                         |
| **TC-PIECE-19** | Negative    | `Piece.tsx`                | Unknown / invalid piece type fallback                        | Graceful fallback rendering with `data-fallback="true"`, zero React crash                |
| **TC-PIECE-20** | Negative    | `Piece.tsx`                | Malformed piece props                                        | Renders fallback symbol or empty container safely                                        |
| **TC-PIECE-21** | Invariant   | `Piece.tsx` / `Board.tsx`  | Domain position immutability                                 | Rendering 1,000 piece iterations does not mutate the input `Position` or `Piece` objects |
| **TC-PIECE-22** | Property    | `Piece.tsx` (`fast-check`) | Property-based invariant for all 12 pieces across 64 squares | Generative verification of piece render fidelity                                         |
| **TC-PIECE-23** | E2E         | Desktop UI (`Playwright`)  | End-to-end desktop board piece rendering                     | Pieces are visible and styled on initial application launch                              |

---

## 2. Golden FEN Fixture Scenarios

### Scenario A: Initial Chess Starting Position

- **FEN:** `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`
- **Verification:**
  - Rank 8: `r`, `n`, `b`, `q`, `k`, `b`, `n`, `r` (Black major pieces)
  - Rank 7: 8x `p` (Black pawns)
  - Ranks 6-3: 32 empty squares
  - Rank 2: 8x `P` (White pawns)
  - Rank 1: `R`, `N`, `B`, `Q`, `K`, `B`, `N`, `R` (White major pieces)

### Scenario B: All 12 Piece Variants Display Position

- **FEN:** `8/8/8/3k4/4K3/1q1r1b1n/1Q1R1B1N/2p2p1P w - - 0 1`
- **Verification:**
  - White pieces: `K` (e4), `Q` (b2), `R` (d2), `B` (f2), `N` (h2), `P` (h1)
  - Black pieces: `k` (d5), `q` (b3), `r` (d3), `b` (f3), `n` (h3), `p` (c1)
  - All 12 unique piece combinations are visually present simultaneously on a single board.
