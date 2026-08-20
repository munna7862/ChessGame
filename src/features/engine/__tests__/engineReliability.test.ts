import { describe, expect, it } from "vitest";
import { EngineServiceImpl } from "../EngineServiceImpl";
import { MockEngineWorkerBridge } from "../MockEngineWorkerBridge";
import { EngineSearchCancelledError } from "../types";

describe("Performance & Reliability Suite: Engine Service (TC-PERF-03, TC-PERF-06)", () => {
  describe("Engine Worker Responsiveness & Search Cancellation (TC-PERF-03)", () => {
    it("TC-PERF-03: dispatches and cancels search requests in < 25ms", async () => {
      const mockBridge = new MockEngineWorkerBridge({
        autoRespondBestMove: false,
      });
      const engine = new EngineServiceImpl(mockBridge);
      await engine.init();

      const startTime = performance.now();

      // Launch search
      const searchPromise = engine.searchBestMove({
        sessionId: "perf-session-1",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        depth: 20,
      });

      expect(engine.getState()).toBe("thinking");

      // Immediately cancel
      const cancelPromise = engine.cancelSearch();
      await cancelPromise;

      const totalCancelTime = performance.now() - startTime;
      expect(totalCancelTime).toBeLessThan(25.0);
      expect(engine.getState()).toBe("ready");

      await expect(searchPromise).rejects.toThrow(EngineSearchCancelledError);
      engine.dispose();
    });

    it("streams search evaluation info updates with sub-millisecond dispatch", async () => {
      const mockBridge = new MockEngineWorkerBridge({
        autoRespondBestMove: false,
      });
      const engine = new EngineServiceImpl(mockBridge);
      await engine.init();

      const infoEvents: number[] = [];
      const unsub = engine.onEvaluationInfo((info) => {
        infoEvents.push(info.depth ?? 0);
      });

      const searchPromise = engine.searchBestMove({
        sessionId: "perf-session-2",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        depth: 10,
      });

      const req = mockBridge.getLastRequest();
      expect(req?.type).toBe("SEARCH");
      const searchToken = req?.type === "SEARCH" ? req.request.searchToken : "";

      const startStream = performance.now();
      for (let depth = 1; depth <= 10; depth++) {
        mockBridge.respondSearchInfo({
          searchToken,
          depth,
          scoreCp: depth * 15,
          nodes: depth * 1000,
          nps: 500000,
          timeMs: depth * 20,
        });
      }
      const streamElapsed = performance.now() - startStream;

      expect(infoEvents.length).toBe(10);
      expect(infoEvents[9]).toBe(10);
      expect(streamElapsed).toBeLessThan(10.0);

      mockBridge.respondBestMove(searchToken, "e2e4");
      const result = await searchPromise;
      expect(result.bestMoveUci).toBe("e2e4");
      expect(result.scoreCp).toBe(150);

      unsub();
      engine.dispose();
    });
  });

  describe("Repeated Engine Worker Start/Stop Stress Lifecycle (TC-PERF-06)", () => {
    it("TC-PERF-06: executes 25 consecutive engine reset and restart cycles cleanly", async () => {
      let bridgeCounter = 0;
      const factory = () => {
        bridgeCounter++;
        return new MockEngineWorkerBridge({ autoRespondReady: true });
      };

      const engine = new EngineServiceImpl(factory);
      const startStress = performance.now();

      for (let i = 0; i < 25; i++) {
        await engine.init({ skillLevel: i % 20 });
        expect(engine.getState()).toBe("ready");

        await engine.notifyNewGame();

        // Perform reset
        await engine.reset({ skillLevel: (i + 1) % 20 });
        expect(engine.getState()).toBe("ready");
      }

      const totalElapsed = performance.now() - startStress;
      // 25 resets should complete swiftly in memory
      expect(totalElapsed).toBeLessThan(250.0);
      expect(bridgeCounter).toBeGreaterThanOrEqual(25);

      engine.dispose();
      expect(engine.getState()).toBe("disposed");
    });

    it("recovers gracefully from simulated fatal worker crash during active search", async () => {
      const mockBridge = new MockEngineWorkerBridge({
        autoRespondBestMove: false,
      });
      const engine = new EngineServiceImpl(mockBridge);
      await engine.init();

      const searchPromise = engine.searchBestMove({
        sessionId: "crash-test",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        depth: 15,
      });

      mockBridge.simulateWorkerCrash("WASM memory out of bounds", true);

      await expect(searchPromise).rejects.toThrow();
      expect(engine.getState()).toBe("error");

      // Reset to recover
      await engine.reset();
      expect(engine.getState()).toBe("ready");

      engine.dispose();
    });
  });
});
