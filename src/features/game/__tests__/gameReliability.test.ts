import { describe, expect, it } from "vitest";
import { GameSessionController } from "../GameSessionController";
import type { Square } from "../../../domain/chess/types";

describe("Performance & Reliability Suite: Game Session Controller (TC-PERF-04, TC-PERF-05, TC-PERF-08)", () => {
  describe("High-Ply Long Game Stress (TC-PERF-04)", () => {
    it("TC-PERF-04: executes 200 consecutive legal plies in < 5000ms with linear state scaling", () => {
      const controller = new GameSessionController();
      let listenerCallCount = 0;
      const unsub = controller.subscribe(() => {
        listenerCallCount++;
      });

      const startLoop = performance.now();
      let executedPlies = 0;
      while (executedPlies < 200) {
        const legalMoves = controller.getLegalMoves();
        if (legalMoves.length === 0 || controller.getState().isGameOver) {
          controller.reset();
          continue;
        }
        // Choose deterministic pseudo-varied moves
        const m = legalMoves[executedPlies % legalMoves.length]!;
        const res = controller.makeMove({
          from: m.from,
          to: m.to,
          promotion: m.promotion,
        });
        if (res.success) {
          executedPlies++;
        } else {
          controller.reset();
        }
      }
      const totalElapsed = performance.now() - startLoop;

      expect(executedPlies).toBe(200);
      expect(listenerCallCount).toBeGreaterThanOrEqual(200);
      expect(totalElapsed).toBeLessThan(5000.0);

      // Verify Deep Undo Across available history plies
      const startUndo = performance.now();
      const currentHistoryLen = controller.getState().moveHistory.length;
      for (let i = 0; i < currentHistoryLen; i++) {
        const undoRes = controller.undo();
        expect(undoRes.success).toBe(true);
      }
      const undoElapsed = performance.now() - startUndo;

      expect(controller.getState().moveHistory.length).toBe(0);
      expect(undoElapsed).toBeLessThan(5000.0);

      unsub();
    });
  });

  describe("Memory Soak & Reset Stability (TC-PERF-05)", () => {
    it("TC-PERF-05: executes 50 consecutive new games with active moves without state leakage in < 1000ms", () => {
      const controller = new GameSessionController();
      const moves = [
        { from: "e2", to: "e4" },
        { from: "e7", to: "e5" },
        { from: "g1", to: "f3" },
        { from: "b8", to: "c6" },
        { from: "f1", to: "c4" },
        { from: "f8", to: "c5" },
      ];

      const startSoak = performance.now();
      for (let run = 0; run < 50; run++) {
        controller.reset({
          mode: run % 2 === 0 ? "human_vs_human" : "human_vs_engine",
        });

        for (const m of moves) {
          const res = controller.makeMove({
            from: m.from as Square,
            to: m.to as Square,
          });
          expect(res.success).toBe(true);
        }

        const snapshot = controller.getState();
        expect(snapshot.moveHistory.length).toBe(moves.length);
        expect(snapshot.position.turn).toBe("w");
      }

      const totalElapsed = performance.now() - startSoak;
      expect(totalElapsed).toBeLessThan(1000.0);
    });
  });

  describe("Snapshot Persistence & Hydration Latency (TC-PERF-08)", () => {
    it("TC-PERF-08: serializes and restores game snapshot in < 20ms", () => {
      const controller = new GameSessionController();
      const opening = [
        { from: "e2", to: "e4" },
        { from: "c7", to: "c5" },
        { from: "g1", to: "f3" },
        { from: "d7", to: "d6" },
        { from: "d2", to: "d4" },
        { from: "c5", to: "d4" },
        { from: "f3", to: "d4" },
        { from: "g8", to: "f6" },
      ];

      for (const m of opening) {
        controller.makeMove({ from: m.from as Square, to: m.to as Square });
      }

      const startSnap = performance.now();
      const snapshot = controller.toSnapshot("w", {
        whiteMs: 180000,
        blackMs: 175000,
        timeControl: { type: "rapid", initialMs: 600000, incrementMs: 0 },
      });
      const snapElapsed = performance.now() - startSnap;

      expect(snapElapsed).toBeLessThan(10.0);
      expect(snapshot.moveHistorySan?.length).toBe(8);

      // Restore session
      const targetController = new GameSessionController();
      const startRestore = performance.now();
      const restoreRes = targetController.restoreSession(snapshot);
      const restoreElapsed = performance.now() - startRestore;

      expect(restoreElapsed).toBeLessThan(20.0);
      expect(restoreRes.success).toBe(true);
      expect(targetController.getState().position.fen).toBe(snapshot.fen);
      expect(targetController.getState().moveHistory.length).toBe(8);
    });
  });
});
