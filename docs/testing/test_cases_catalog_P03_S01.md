# Test Cases Catalog: Phase 03 · Sprint 01 — Chess Domain Types & Adapter Contract

## 1. Overview & Objective

This document defines the test catalog, verification criteria, invariants, and quality gates for **Phase 03 · Sprint 01: Chess Domain Types and Adapter Contract**. The primary objective is to guarantee that the core chess domain types, runtime schemas, unified error models, port interfaces, and third-party library adapters satisfy all FIDE chess domain requirements, adhere to [ADR-001](file:///c:/Workspace/ChessGame/docs/adr/ADR-001-decoupled-pure-chess-domain.md) and [ADR-005](file:///c:/Workspace/ChessGame/docs/adr/ADR-005-unified-typed-error-contracts.md), and operate completely decoupled from React and DOM environments.

---

## 2. Test Cases Matrix

| Test ID       | Category                  | Scenario / Description                               | Expected Outcome                                                                                                                                            | Verification Method                        |
| :------------ | :------------------------ | :--------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------- |
| **TC-DOM-01** | Core Types & Coordinates  | Square coordinates & coordinate conversions          | 64 square coordinates (`a1`..`h8`) map bi-directionally to file/rank indices (`0..7`). Out-of-bound coordinates are rejected.                               | Vitest unit test                           |
| **TC-DOM-02** | Schema Validation         | Zod runtime schema validation                        | `SquareSchema`, `ColorSchema`, `PieceTypeSchema`, and `MoveInputSchema` validate valid inputs and cleanly fail on invalid/malformed inputs.                 | Vitest unit test                           |
| **TC-DOM-03** | Domain Error Contract     | Discriminated union error modeling & Result helper   | `ChessDomainError` returns structured codes (`ILLEGAL_MOVE`, `INVALID_FEN`, etc.). `ok()` and `err()` monadic helpers preserve type narrowing.              | Vitest unit test                           |
| **TC-DOM-04** | Port Specification        | `ChessGame` & `ChessAdapterPort` interface contracts | All essential operations (`getPosition`, `getLegalMoves`, `makeMove`, `undo`, `loadFen`, `exportFen`, `importPgn`, `exportPgn`, `getStatus`) are typed.     | TypeScript compilation (`tsc --noEmit`)    |
| **TC-DOM-05** | Adapter Initial State     | Initial chess position via `ChessJsAdapter`          | Standard starting position has 32 pieces, White to move, castling rights `KQkq`, en passant `-`, halfmove `0`, fullmove `1`, status `active`.               | Vitest unit test                           |
| **TC-DOM-06** | Legal Move Generation     | Initial position legal move calculations             | Exactly 20 legal moves for White (16 pawn pushes, 4 knight jumps). Correct moves returned for specific squares (e.g. `e2` -> `e3`, `e4`).                   | Vitest unit test                           |
| **TC-DOM-07** | Move Execution            | Legal move execution & state transition              | Playing `1. e4` returns a successful `Move` object, updates board position, switches active color to `'b'`, updates history, and increments move counter.   | Vitest unit test                           |
| **TC-DOM-08** | Illegal Move Rejection    | Attempting illegal moves                             | Attempting an illegal move (e.g. `e2 -> e5`, moving into check, moving empty square) returns `err({ code: 'ILLEGAL_MOVE' })` with 0 state mutation.         | Vitest unit test                           |
| **TC-DOM-09** | Move Reversibility        | Move undo / redo capability                          | Invoking `undo()` restores the previous board position, active color, castling rights, and move history precisely. Undo at starting position returns error. | Vitest unit test                           |
| **TC-DOM-10** | FEN Codec Round-Trip      | FEN import and export                                | Valid FEN string loads accurately, exports identical FEN string, and rejects malformed/invalid FEN inputs with `INVALID_FEN`.                               | Vitest unit test & golden FENs             |
| **TC-DOM-11** | PGN Codec Round-Trip      | PGN import and export                                | Valid PGN imports and reconstructs complete move history and final game status. Malformed PGN returns `INVALID_PGN`.                                        | Vitest unit test                           |
| **TC-DOM-12** | Game Status Detection     | Check, Checkmate, and Stalemate status mapping       | Correctly detects `isCheck: true`, `state: 'checkmate'` (with winner `'w'` or `'b'`), and `state: 'stalemate'` (with winner `null`).                        | Vitest golden fixture tests                |
| **TC-DOM-13** | Dependency Inversion      | Framework decoupling (`src/domain/chess`)            | Domain package has 0 dependencies on `react`, `react-dom`, `@testing-library/*`, or DOM browser globals. Compiles in isolation.                             | Static AST import test & independent build |
| **TC-DOM-14** | Third-Party Encapsulation | `chess.js` library encapsulation                     | Third-party `chess.js` is imported ONLY in `src/domain/chess/adapters/chessJsAdapter.ts`. Zero leaked third-party types in domain port signatures.          | AST import inspection test                 |
| **TC-DOM-15** | Chess Invariant Fuzzing   | Invariant preservation across moves                  | Both White and Black kings remain on board after any legal move; active turn alternates; position match history count.                                      | Fast-check property test                   |

---

## 3. Detailed Test Specifications & Golden Fixtures

### 3.1 TC-DOM-05 & TC-DOM-06: Initial Position & Move Generation

- **Golden FEN:** `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`
- **Invariants:**
  - Piece count: 16 White pieces, 16 Black pieces.
  - Active color: `'w'`.
  - Legal moves: 20 total moves.
  - Square `e2` moves: `e3`, `e4`.
  - Square `g1` moves: `f3`, `h3`.
  - Square `e7` moves: 0 (not black's turn).

### 3.2 TC-DOM-08: Illegal Move Non-Mutation

- **Scenario:** Initial position, attempt `makeMove({ from: 'e2', to: 'e5' })`.
- **Expected Result:** Returns `err({ code: 'ILLEGAL_MOVE' })`.
- **Board State Check:** Board FEN remains `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`, active turn remains `'w'`, history length remains `0`.

### 3.3 TC-DOM-12: Checkmate & Stalemate Golden FENs

- **Scholar's Mate Final Position:**
  - FEN: `r1bqkb1r/pppp1Qpp/2n5/4p3/2B1n3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4`
  - Expected Status: `isOver: true`, `state: 'checkmate'`, `winner: 'w'`, `isCheck: true`.
- **Stalemate Position (King cornered by Queen):**
  - FEN: `k7/8/1Q6/8/8/8/8/K7 b - - 0 1`
  - Expected Status: `isOver: true`, `state: 'stalemate'`, `winner: null`, `isCheck: false`, `inDraw: true`.

### 3.4 TC-DOM-13 & TC-DOM-14: Architecture Boundary & Dependency Inversion

- **Test Logic:**
  - Recursively parse all `.ts` files under `src/domain/chess/**`.
  - Assert that no file outside `src/domain/chess/adapters/` contains `import ... from 'chess.js'`.
  - Assert that no file in `src/domain/chess/**` imports `react`, `react-dom`, `@tauri-apps/*`, or UI modules.

---

## 4. Quality Gate Execution Criteria

Before sprint completion:

1. Vitest domain unit, contract, and architecture tests pass (100% green, 0 skips).
2. TypeScript strict typecheck passes (`npm run typecheck`) with 0 errors.
3. ESLint passes (`npm run lint`) with 0 warnings.
4. Prettier formatting checks pass (`npm run format:check`).
