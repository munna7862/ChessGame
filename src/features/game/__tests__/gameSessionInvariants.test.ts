import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { createGameSession } from "../GameSessionController";

describe("GameSession Property Invariants (Phase 05 · Sprint 01 - fast-check)", () => {
  it("TC-GS-14: Generative property fuzzing: move history length, piece count conservation, and clean reset", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 100 }), {
          minLength: 1,
          maxLength: 25,
        }),
        (choices) => {
          const session = createGameSession();
          let executedMovesCount = 0;

          for (const choice of choices) {
            const state = session.getState();
            if (state.isGameOver) break;

            const legalMoves = session.getLegalMoves();
            if (legalMoves.length === 0) break;

            const move = legalMoves[choice % legalMoves.length];
            if (!move) break;

            const result = session.makeMove({
              from: move.from,
              to: move.to,
              promotion: move.promotion,
            });

            if (result.success) {
              executedMovesCount += 1;
            }
          }

          const finalState = session.getState();
          // Invariant 1: moveHistory length matches executed moves count
          expect(finalState.moveHistory).toHaveLength(executedMovesCount);

          // Invariant 2: total captured count + pieces remaining on board equals 32 (ignoring promotion count increase)
          let piecesOnBoard = 0;
          for (let r = 0; r < 8; r += 1) {
            for (let c = 0; c < 8; c += 1) {
              if (finalState.position.board[r]?.[c]) {
                piecesOnBoard += 1;
              }
            }
          }
          const totalCaptures =
            finalState.capturedPieces.white.length +
            finalState.capturedPieces.black.length;
          expect(piecesOnBoard + totalCaptures).toBe(32);

          // Invariant 3: Clean reset restores standard initial state
          session.reset();
          const resetState = session.getState();
          expect(resetState.moveHistory).toHaveLength(0);
          expect(resetState.capturedPieces).toEqual({ white: [], black: [] });
          expect(resetState.turn).toBe("w");
          expect(resetState.isGameOver).toBe(false);
        }
      ),
      { numRuns: 30 }
    );
  });
});
