import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { ChessJsAdapter } from "../adapters/chessJsAdapter";

describe("PGN Round-Trip & Generative Invariance (TC-PGN-31)", () => {
  it("TC-PGN-31: property-based generative fuzzing across randomized legal move games", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 100 }), {
          minLength: 2,
          maxLength: 30,
        }),
        (moveIndexChoices) => {
          const originGame = new ChessJsAdapter();

          // Play pseudo-random legal moves
          for (const choice of moveIndexChoices) {
            if (originGame.getStatus().isOver) {
              break;
            }
            const legalMoves = originGame.getLegalMoves();
            if (legalMoves.length === 0) {
              break;
            }
            const selectedMove = legalMoves[choice % legalMoves.length];
            if (!selectedMove) {
              break;
            }
            const moveRes = originGame.makeMove({
              from: selectedMove.from,
              to: selectedMove.to,
              promotion: selectedMove.promotion,
            });
            if (!moveRes.success) {
              break;
            }
          }

          // Export origin game to PGN
          const exportedPgn = originGame.exportPgn({
            Event: "Fuzzing Match",
            White: "Fuzzer A",
            Black: "Fuzzer B",
          });

          // Import into a fresh adapter instance
          const importedGame = new ChessJsAdapter();
          const importRes = importedGame.importPgn(exportedPgn);

          expect(
            importRes.success,
            `Failed to import generated PGN: \n${exportedPgn}`
          ).toBe(true);

          // Assert round-trip state invariance
          expect(importedGame.exportFen()).toBe(originGame.exportFen());
          expect(importedGame.getHistory().length).toBe(
            originGame.getHistory().length
          );
          expect(importedGame.getPosition().turn).toBe(
            originGame.getPosition().turn
          );
          expect(importedGame.getPosition().isCheck).toBe(
            originGame.getPosition().isCheck
          );
          expect(importedGame.getStatus().state).toBe(
            originGame.getStatus().state
          );
          expect(importedGame.getLegalMoves().length).toBe(
            originGame.getLegalMoves().length
          );

          // Re-export and verify exact string equality
          expect(importedGame.exportPgn()).toBe(exportedPgn);
        }
      ),
      { numRuns: 50 }
    );
  });
});
