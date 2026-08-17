import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { ChessJsAdapter } from "../adapters/chessJsAdapter";
import type { Square } from "../types";

describe("Negative Move Rejection & State Immutability (TC-REG-22 to TC-REG-25)", () => {
  const ALL_SQUARES: Square[] = [];
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["1", "2", "3", "4", "5", "6", "7", "8"];
  for (const f of files) {
    for (const r of ranks) {
      ALL_SQUARES.push(`${f}${r}` as Square);
    }
  }

  it("TC-REG-22: Invariant 4 - Negative Fuzzing: no illegal move can ever mutate domain state", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 63 }),
        fc.integer({ min: 0, max: 63 }),
        (fromIdx, toIdx) => {
          const game = new ChessJsAdapter();
          // Play 1 standard move to create a non-initial state
          game.makeMove({ from: "e2", to: "e4" });

          const fenBefore = game.exportFen();
          const historyBefore = game.getHistory();
          const turnBefore = game.getPosition().turn;
          const statusBefore = game.getStatus();

          const fromSq = ALL_SQUARES[fromIdx]!;
          const toSq = ALL_SQUARES[toIdx]!;

          // Check if this random square pair is illegal
          const isLegal = game.isLegalMove({ from: fromSq, to: toSq });

          if (!isLegal) {
            const result = game.makeMove({ from: fromSq, to: toSq });
            expect(result.success).toBe(false);

            // Assert absolute state immutability
            expect(game.exportFen()).toBe(fenBefore);
            expect(game.getHistory().length).toBe(historyBefore.length);
            expect(game.getPosition().turn).toBe(turnBefore);
            expect(game.getStatus()).toEqual(statusBefore);
          }
        }
      ),
      { seed: 7777, numRuns: 100 }
    );
  });

  it("TC-REG-23: Invariant 4 - Malformed FEN input guarantees zero state mutation", () => {
    const corruptedFens = [
      "",
      " ",
      "invalid_fen_string",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0",
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR x KQkq - 0 1",
      "8/8/8/8/8/8/8/8 w - - 0 1", // Missing kings
      "4K2K/8/8/8/8/8/8/4k3 w - - 0 1", // Two white kings
      "P3k3/8/8/8/8/8/8/4K3 w - - 0 1", // Pawn on rank 8
    ];

    const game = new ChessJsAdapter();
    game.makeMove({ from: "d2", to: "d4" });
    const fenBefore = game.exportFen();
    const historyBefore = game.getHistory();

    for (const badFen of corruptedFens) {
      const res = game.loadFen(badFen);
      expect(res.success).toBe(false);
      expect(game.exportFen()).toBe(fenBefore);
      expect(game.getHistory()).toEqual(historyBefore);
    }
  });

  it("TC-REG-24: Invariant 4 - Malformed PGN input guarantees zero state mutation", () => {
    const corruptedPgns = [
      "",
      "   \n\t ",
      "1. e4 e5 2. Ke2 Ke7 3. Ke8", // Illegal move
      "1. e4 invalid_san_token# 2. d4",
      '[SetUp "1"][FEN "corrupted/fen"] 1. e4',
      '[SetUp "1"] 1. e4', // Missing FEN tag with SetUp 1
    ];

    const game = new ChessJsAdapter();
    game.makeMove({ from: "g1", to: "f3" });
    const fenBefore = game.exportFen();
    const historyBefore = game.getHistory();

    for (const badPgn of corruptedPgns) {
      const res = game.importPgn(badPgn);
      expect(res.success).toBe(false);
      expect(game.exportFen()).toBe(fenBefore);
      expect(game.getHistory()).toEqual(historyBefore);
    }
  });
});
