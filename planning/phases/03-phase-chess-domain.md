# Phase 03: Chess Domain

## Objective

Build the authoritative chess/game domain that all UI and engine
functionality depends on.

## Outcome

ChessForge can represent, validate, execute and reconstruct complete
legal chess games independently of React.

## Scope

-   Board/game state
-   Legal moves
-   Move execution
-   Undo
-   Turn handling
-   Check
-   Checkmate
-   Stalemate
-   Draw conditions
-   Castling
-   En passant
-   Promotion
-   SAN
-   FEN
-   PGN
-   Game status
-   Domain errors

## Core rule

The domain layer is authoritative.

The UI may suggest moves, but only the domain decides whether a move is
legal.

## Domain boundaries

``` text
React
  |
Game Application Service
  |
Chess Domain Adapter
  |
Mature Chess Rules Library
```

The rest of the application should not depend directly on the
third-party chess library.

## Suggested contracts

``` ts
interface ChessGame {
  getPosition(): Position;
  getLegalMoves(square?: Square): Move[];
  makeMove(move: MoveInput): MoveResult;
  undo(): void;
  loadFen(fen: string): void;
  exportFen(): string;
  importPgn(pgn: string): void;
  exportPgn(): string;
  getStatus(): GameStatus;
}
```

Keep the real implementation flexible.

## Test strategy

Minimum rule matrix:

``` text
Pawn movement
Pawn capture
Double pawn move
Knight
Bishop
Rook
Queen
King
Castling
En passant
Promotion
Pinned pieces
Check
Checkmate
Stalemate
Threefold repetition
Fifty-move rule
Insufficient material
FEN
PGN
```

## Strong verification

Add invariants and property-based tests where useful:

-   Both kings remain represented.
-   Turn changes correctly.
-   Legal move results reconstruct the expected position.
-   FEN round-trip preserves position.
-   PGN replay reconstructs the final position.
-   Illegal moves never mutate state.

Use known chess positions for regression testing.

## Antigravity strategy

Assign a chess-domain engineer agent.

Ask the agent to:

1.  Inspect the selected chess library.
2.  Identify its legal move/status capabilities.
3.  Design the adapter.
4.  Produce a plan artifact.
5.  Implement only after review.
6.  Generate regression tests.
7.  Run the complete domain suite.

Do not ask the agent to invent a chess engine.

## Acceptance criteria

-   All supported chess rules work.
-   Illegal moves are rejected.
-   Game state transitions are deterministic.
-   FEN import/export works.
-   PGN import/export works.
-   Domain tests pass.
-   Domain package can run without React.
-   Error handling is defined.

## Exit criteria

A command-line or test-level client can play a complete legal game
without any UI.

## Sprint decomposition candidates

-   Domain types
-   Chess library adapter
-   Move execution
-   Special moves
-   Game status
-   FEN
-   SAN
-   PGN
-   Error model
-   Rule regression suite
-   Property testing
