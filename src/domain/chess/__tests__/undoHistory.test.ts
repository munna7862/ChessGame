import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { ChessJsAdapter } from "../adapters/chessJsAdapter";

describe("Move Undo, History & Position Reconstruction (TC-MOVE-20 to TC-MOVE-23)", () => {
  describe("TC-MOVE-20: Move Undo Capability", () => {
    it("restores exact previous board state, turn, and clocks on single undo", () => {
      const game = new ChessJsAdapter();
      const initialFen = game.exportFen();
      const initialTurn = game.getPosition().turn;

      // 1. Play e4
      const moveRes = game.makeMove({ from: "e2", to: "e4" });
      expect(moveRes.success).toBe(true);
      expect(game.getHistory()).toHaveLength(1);

      // 2. Undo move
      const undoRes = game.undo();
      expect(undoRes.success).toBe(true);
      if (!undoRes.success) return;

      expect(undoRes.data.from).toBe("e2");
      expect(undoRes.data.to).toBe("e4");
      expect(undoRes.data.san).toBe("e4");

      // Verify board is completely restored
      expect(game.exportFen()).toBe(initialFen);
      expect(game.getPosition().turn).toBe(initialTurn);
      expect(game.getPiece("e2")).toEqual({ type: "p", color: "w" });
      expect(game.getPiece("e4")).toBeNull();
      expect(game.getHistory()).toHaveLength(0);
    });

    it("restores board state across a multi-ply move chain", () => {
      const game = new ChessJsAdapter();
      const rootFen = game.exportFen();

      const movesToPlay = [
        { from: "e2", to: "e4" },
        { from: "e7", to: "e5" },
        { from: "g1", to: "f3" },
        { from: "b8", to: "c6" },
        { from: "f1", to: "c4" },
      ] as const;

      for (const m of movesToPlay) {
        expect(game.makeMove(m).success).toBe(true);
      }
      expect(game.getHistory()).toHaveLength(5);

      // Undo all 5 moves in reverse order
      for (let i = movesToPlay.length - 1; i >= 0; i--) {
        const expectedUndone = movesToPlay[i];
        const undoRes = game.undo();
        expect(undoRes.success).toBe(true);
        if (undoRes.success && expectedUndone) {
          expect(undoRes.data.from).toBe(expectedUndone.from);
          expect(undoRes.data.to).toBe(expectedUndone.to);
        }
      }

      // Final state must equal initial root FEN exactly
      expect(game.exportFen()).toBe(rootFen);
      expect(game.getHistory()).toHaveLength(0);
      expect(game.getPosition().turn).toBe("w");
    });
  });

  describe("TC-MOVE-21: Undo on Empty History", () => {
    it("returns NO_MOVE_TO_UNDO error and preserves initial position", () => {
      const game = new ChessJsAdapter();
      const beforeFen = game.exportFen();

      const undoRes = game.undo();
      expect(undoRes.success).toBe(false);
      if (!undoRes.success) {
        expect(undoRes.error.code).toBe("NO_MOVE_TO_UNDO");
        expect(undoRes.error.message).toContain("No previous move exists");
      }

      expect(game.exportFen()).toBe(beforeFen);
    });
  });

  describe("TC-MOVE-22: Position Reconstruction from History", () => {
    it("replaying move history on fresh board reconstructs identical final position", () => {
      const game = new ChessJsAdapter();

      // Play Scholar's Mate game sequence
      const moves = [
        { from: "e2", to: "e4" },
        { from: "e7", to: "e5" },
        { from: "f1", to: "c4" },
        { from: "b8", to: "c6" },
        { from: "d1", to: "h5" },
        { from: "g8", to: "f6" },
        { from: "h5", to: "f7" },
      ] as const;

      for (const m of moves) {
        const res = game.makeMove(m);
        expect(res.success).toBe(true);
      }

      const originalFinalFen = game.exportFen();
      const originalHistory = game.getHistory();
      const originalStatus = game.getStatus();

      // Create new clean instance and replay history
      const replayedGame = new ChessJsAdapter();
      for (const histMove of originalHistory) {
        const replayRes = replayedGame.makeMove({
          from: histMove.from,
          to: histMove.to,
          promotion: histMove.promotion,
        });
        expect(replayRes.success).toBe(true);
      }

      expect(replayedGame.exportFen()).toBe(originalFinalFen);
      expect(replayedGame.getPosition().board).toEqual(
        game.getPosition().board
      );
      expect(replayedGame.getStatus()).toEqual(originalStatus);
    });
  });

  describe("TC-MOVE-23: Generative Property-Based Invariant Fuzzing", () => {
    it("preserves King invariants, turn alternation, and undo reversibility across random legal playouts", () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 0, max: 100 }), {
            minLength: 1,
            maxLength: 15,
          }),
          (moveIndexSequence) => {
            const game = new ChessJsAdapter();
            const fenHistory: string[] = [game.exportFen()];

            // 1. Play sequence of random legal moves
            for (const moveSeed of moveIndexSequence) {
              if (game.getStatus().isOver) break;

              const legalMoves = game.getLegalMoves();
              if (legalMoves.length === 0) break;

              const chosenMove = legalMoves[moveSeed % legalMoves.length];
              if (!chosenMove) break;
              const expectedTurn = game.getPosition().turn;

              const moveRes = game.makeMove({
                from: chosenMove.from,
                to: chosenMove.to,
                promotion: chosenMove.promotion,
              });

              expect(moveRes.success).toBe(true);

              // Invariant 1: Exactly 1 White King and 1 Black King
              const board = game.getPosition().board;
              let whiteKingCount = 0;
              let blackKingCount = 0;
              for (const row of board) {
                for (const cell of row) {
                  if (cell?.type === "k" && cell.color === "w") {
                    whiteKingCount++;
                  }
                  if (cell?.type === "k" && cell.color === "b") {
                    blackKingCount++;
                  }
                }
              }
              expect(whiteKingCount).toBe(1);
              expect(blackKingCount).toBe(1);

              // Invariant 2: Turn toggles
              const nextTurn = game.getPosition().turn;
              expect(nextTurn).toBe(expectedTurn === "w" ? "b" : "w");

              fenHistory.push(game.exportFen());
            }

            // 2. Undo all played moves in reverse and verify exact FEN restoration
            for (let i = fenHistory.length - 1; i > 0; i--) {
              expect(game.exportFen()).toBe(fenHistory[i]);
              const undoRes = game.undo();
              expect(undoRes.success).toBe(true);
            }

            // Final state must equal root FEN
            expect(game.exportFen()).toBe(fenHistory[0]);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
