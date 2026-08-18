import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  calculateMaterialScore,
  calculateMaterialAdvantage,
  groupMovesIntoPairs,
  sortCapturedPieces,
} from "../moveHistoryUtils";

import { GameSessionController } from "../GameSessionController";
import type { Move, PieceType } from "../../../domain/chess/types";

describe("Move History & Captured Pieces Invariants (TC-HIST-11, TC-CAPT-01 to TC-CAPT-07)", () => {
  describe("Material Score & Advantage Calculations", () => {
    it("TC-CAPT-03: accurately sums standard piece values", () => {
      expect(calculateMaterialScore([])).toBe(0);
      expect(calculateMaterialScore(["p"])).toBe(1);
      expect(calculateMaterialScore(["n"])).toBe(3);
      expect(calculateMaterialScore(["b"])).toBe(3);
      expect(calculateMaterialScore(["r"])).toBe(5);
      expect(calculateMaterialScore(["q"])).toBe(9);
      expect(calculateMaterialScore(["p", "p", "n", "r", "q"])).toBe(
        1 + 1 + 3 + 5 + 9 // 19
      );
    });

    it("TC-CAPT-04: computes net material differential correctly", () => {
      // Balanced
      expect(
        calculateMaterialAdvantage({
          white: ["p", "n"],
          black: ["p", "b"],
        })
      ).toEqual({
        whiteScore: 4,
        blackScore: 4,
        leader: null,
        diff: 0,
      });

      // White leads
      expect(
        calculateMaterialAdvantage({
          white: ["q"],
          black: ["r", "p"],
        })
      ).toEqual({
        whiteScore: 9,
        blackScore: 6,
        leader: "w",
        diff: 3,
      });

      // Black leads
      expect(
        calculateMaterialAdvantage({
          white: ["b"],
          black: ["q"],
        })
      ).toEqual({
        whiteScore: 3,
        blackScore: 9,
        leader: "b",
        diff: 6,
      });
    });

    it("sorts captured pieces in standard descending hierarchy", () => {
      const unsorted: PieceType[] = ["p", "q", "p", "r", "b", "n"];
      const sorted = sortCapturedPieces(unsorted);
      expect(sorted).toEqual(["q", "r", "b", "n", "p", "p"]);
    });
  });

  describe("Move Pairing Invariants", () => {
    it("TC-HIST-02 & TC-HIST-03: groups moves into pairs with correct indexing", () => {
      const dummyMove = (san: string, color: "w" | "b"): Move => ({
        from: "a1",
        to: "a2",
        piece: { type: "p", color },
        san,
        lan: "a1a2",
        beforeFen: "8/8/8/8/8/8/8/8 w - - 0 1",
        afterFen: "8/8/8/8/8/8/8/8 b - - 0 1",
      });

      const moves: Move[] = [
        dummyMove("e4", "w"),
        dummyMove("e5", "b"),
        dummyMove("Nf3", "w"),
      ];

      const pairs = groupMovesIntoPairs(moves);
      expect(pairs).toHaveLength(2);

      expect(pairs[0]).toEqual({
        moveNumber: 1,
        white: moves[0],
        black: moves[1],
        whitePlyIndex: 0,
        blackPlyIndex: 1,
      });

      expect(pairs[1]).toEqual({
        moveNumber: 2,
        white: moves[2],
        black: undefined,
        whitePlyIndex: 2,
        blackPlyIndex: undefined,
      });
    });
  });

  describe("En Passant & Capture Attribution in GameSession", () => {
    it("TC-CAPT-05: correctly attributes en passant capture to capturing player", () => {
      const controller = new GameSessionController();
      // Setup en passant: 1. e4 a6 2. e5 d5 3. exd6 (en passant capture)
      controller.makeMove({ from: "e2", to: "e4" });
      controller.makeMove({ from: "a7", to: "a6" });
      controller.makeMove({ from: "e4", to: "e5" });
      controller.makeMove({ from: "d7", to: "d5" });
      const epResult = controller.makeMove({ from: "e5", to: "d6" });

      expect(epResult.success).toBe(true);
      if (epResult.success) {
        expect(epResult.data.san).toBe("exd6");
        expect(epResult.data.captured).toBeDefined();
        expect(epResult.data.captured?.type).toBe("p");
      }

      const state = controller.getState();
      expect(state.capturedPieces.white).toContain("p");
      expect(state.capturedPieces.black).toEqual([]);
    });

    it("TC-CAPT-07: restores captured pieces to active state on undo()", () => {
      const controller = new GameSessionController();
      // 1. e4 d5 2. exd5 (White captures Black pawn)
      controller.makeMove({ from: "e2", to: "e4" });
      controller.makeMove({ from: "d7", to: "d5" });
      controller.makeMove({ from: "e4", to: "d5" });

      expect(controller.getState().capturedPieces.white).toEqual(["p"]);
      expect(controller.getState().moveHistory).toHaveLength(3);

      // Undo capture
      const undoRes = controller.undo();
      expect(undoRes.success).toBe(true);

      expect(controller.getState().capturedPieces.white).toEqual([]);
      expect(controller.getState().moveHistory).toHaveLength(2);
    });
  });

  describe("Generative Property Fuzzing (TC-HIST-11)", () => {
    it("preserves move pairing, monotonic move numbers, and non-negative material balance under randomized legal games", () => {
      fc.assert(
        fc.property(
          fc.array(fc.nat({ max: 50 }), { minLength: 1, maxLength: 30 }),
          (randomPicks) => {
            const controller = new GameSessionController();

            for (const pick of randomPicks) {
              if (controller.getState().isGameOver) break;
              const legalMoves = controller.getLegalMoves();
              if (legalMoves.length === 0) break;
              const move = legalMoves[pick % legalMoves.length];
              if (!move) break;
              controller.makeMove(move);
            }

            const state = controller.getState();
            const pairs = groupMovesIntoPairs(state.moveHistory);

            // Invariant 1: Total pairs equals ceil(history.length / 2)
            expect(pairs.length).toBe(Math.ceil(state.moveHistory.length / 2));

            // Invariant 2: Move numbers strictly monotonic 1, 2, ...
            for (let i = 0; i < pairs.length; i++) {
              const pair = pairs[i];
              if (!pair) continue;
              expect(pair.moveNumber).toBe(i + 1);
              expect(pair.whitePlyIndex).toBe(i * 2);
              if (pair.black) {
                expect(pair.blackPlyIndex).toBe(i * 2 + 1);
              }
            }

            // Invariant 3: Material score non-negative
            const balance = calculateMaterialAdvantage(state.capturedPieces);
            expect(balance.whiteScore).toBeGreaterThanOrEqual(0);
            expect(balance.blackScore).toBeGreaterThanOrEqual(0);
            expect(balance.diff).toBeGreaterThanOrEqual(0);

            // Invariant 4: Captured piece count bounded by max captured chess pieces (16 per color)
            expect(state.capturedPieces.white.length).toBeLessThanOrEqual(16);
            expect(state.capturedPieces.black.length).toBeLessThanOrEqual(16);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
