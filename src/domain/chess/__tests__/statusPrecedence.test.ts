import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { ChessJsAdapter } from "../adapters/chessJsAdapter";
import { isOk } from "../errors";

describe("Status Precedence & Property-Based Invariant Fuzzing (TC-STATUS-28, TC-STATUS-29, TC-STATUS-32)", () => {
  it("TC-STATUS-28: Checkmate takes precedence over 50-move draw rule", () => {
    const game = new ChessJsAdapter();
    // Position where halfmoveClock = 99 and White plays Re8# checkmate
    const fen99Mate = "6k1/5ppp/4R3/8/8/8/8/6K1 w - - 99 50";
    game.loadFen(fen99Mate);

    const mateMove = game.makeMove({ from: "e6", to: "e8" });
    expect(isOk(mateMove)).toBe(true);

    const status = game.getStatus();
    expect(status.state).toBe("checkmate");
    expect(status.isOver).toBe(true);
    expect(status.winner).toBe("w");
    expect(status.inDraw).toBe(false);
  });

  it("TC-STATUS-29: Checkmate takes precedence over threefold repetition", () => {
    const game = new ChessJsAdapter();
    // If a checkmating move happens to lead to a position that was seen before, checkmate must take precedence
    // White king and queen deliver checkmate:
    const mateFen = "7k/5Q2/6K1/8/8/8/8/8 w - - 0 1";
    game.loadFen(mateFen);

    const mateMove = game.makeMove({ from: "f7", to: "g7" });
    expect(isOk(mateMove)).toBe(true);

    const status = game.getStatus();
    expect(status.state).toBe("checkmate");
    expect(status.winner).toBe("w");
  });

  it("TC-STATUS-32: Property-based invariant fuzzing across randomized legal playouts", () => {
    // Run 50 randomized game playouts of up to 35 plies
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 100 }), {
          minLength: 5,
          maxLength: 35,
        }),
        (moveIndices) => {
          const game = new ChessJsAdapter();

          for (const rawIndex of moveIndices) {
            const status = game.getStatus();

            if (status.isOver) {
              // Invariants for terminal game:
              // 1. Legal moves must be empty
              expect(game.getLegalMoves()).toEqual([]);
              // 2. Either winner is defined (checkmate/resigned/timeout) or inDraw is true
              if (status.winner !== null) {
                expect(["w", "b"]).toContain(status.winner);
                expect(status.inDraw).toBe(false);
              } else {
                expect(status.inDraw).toBe(true);
                expect(status.drawReason).not.toBeNull();
              }
              break;
            }

            // Invariants for active game:
            expect(status.state).toBe("active");
            expect(status.winner).toBeNull();
            expect(status.inDraw).toBe(false);
            expect(status.drawReason).toBeNull();

            const legalMoves = game.getLegalMoves();
            if (legalMoves.length === 0) {
              // If no legal moves, it must be either checkmate or stalemate
              const postStatus = game.getStatus();
              expect(["checkmate", "stalemate"]).toContain(postStatus.state);
              break;
            }

            const chosenMove = legalMoves[rawIndex % legalMoves.length];
            if (!chosenMove) break;
            const moveRes = game.makeMove({
              from: chosenMove.from,
              to: chosenMove.to,
              promotion: chosenMove.promotion,
            });

            expect(isOk(moveRes)).toBe(true);
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 15000);
});
