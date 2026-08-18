import { describe, it, expect, beforeEach, vi } from "vitest";
import { EngineServiceImpl } from "../EngineServiceImpl";
import { MockEngineWorkerBridge } from "../MockEngineWorkerBridge";
import {
  EngineNotReadyError,
  EngineSearchCancelledError,
  EngineFatalError,
  EngineDisposedError,
  type EngineLifecycleState,
  type EngineSearchInfo,
} from "../types";

describe("EngineServiceImpl Contract Tests", () => {
  let bridge: MockEngineWorkerBridge;
  let engine: EngineServiceImpl;

  beforeEach(() => {
    bridge = new MockEngineWorkerBridge({
      autoRespondReady: true,
      defaultBestMove: "e2e4",
    });
    engine = new EngineServiceImpl(bridge);
  });

  describe("TC-ENG-01: Engine Initialization and State Transitions", () => {
    it("starts in idle state and transitions idle -> starting -> ready upon init", async () => {
      bridge.setAutoRespondReady(false);
      const states: EngineLifecycleState[] = [];
      engine.onStateChange((s) => states.push(s));

      expect(engine.getState()).toBe("idle");

      const initPromise = engine.init();
      expect(engine.getState()).toBe("starting");

      // Simulate worker sending READY
      bridge.respondReady("Stockfish 16 Mock");
      await initPromise;

      expect(engine.getState()).toBe("ready");
      expect(states).toEqual(["starting", "ready"]);
      expect(bridge.getLastRequest()?.type).toBe("INIT");
    });

    it("resolves immediately if init is called while already ready", async () => {
      await engine.init();
      expect(engine.getState()).toBe("ready");

      bridge.clearRequests();
      await engine.init();
      expect(bridge.getRequests()).toHaveLength(0);
    });

    it("shares existing init promise if init is called concurrently", async () => {
      bridge.setAutoRespondReady(false);
      const p1 = engine.init();
      const p2 = engine.init();

      bridge.respondReady();
      await Promise.all([p1, p2]);
      expect(engine.getState()).toBe("ready");
    });
  });

  describe("TC-ENG-02: Best Move Search Dispatch and Resolution", () => {
    it("transitions ready -> thinking -> ready and resolves best move result", async () => {
      await engine.init();
      const states: EngineLifecycleState[] = [];
      engine.onStateChange((s) => states.push(s));

      bridge.setAutoRespondBestMove(false); // disable auto-response to control timing
      const searchPromise = engine.searchBestMove({
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        depth: 12,
        skillLevel: 10,
        sessionId: "sess-1",
      });

      expect(engine.getState()).toBe("thinking");
      const searchReq = bridge.getLastRequest();
      expect(searchReq?.type).toBe("SEARCH");
      if (searchReq?.type !== "SEARCH") return;

      const token = searchReq.request.searchToken;
      expect(token).toBeDefined();

      // Emit search info then bestmove
      bridge.respondSearchInfo({
        searchToken: token,
        depth: 12,
        scoreCp: 28,
        nodes: 10000,
        pv: ["e2e4", "e7e5"],
      });

      bridge.respondBestMove(token, "e2e4", "e7e5");
      const result = await searchPromise;

      expect(result.searchToken).toBe(token);
      expect(result.bestMoveUci).toBe("e2e4");
      expect(result.ponderMoveUci).toBe("e7e5");
      expect(result.scoreCp).toBe(28);
      expect(result.depth).toBe(12);
      expect(engine.getState()).toBe("ready");
      expect(states).toEqual(["thinking", "ready"]);
    });

    it("handles auto-response mock configuration instantly", async () => {
      await engine.init();
      bridge.setAutoRespondBestMove("d2d4");

      const result = await engine.searchBestMove({
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      });

      expect(result.bestMoveUci).toBe("d2d4");
      expect(engine.getState()).toBe("ready");
    });
  });

  describe("TC-ENG-03: Real-Time Search Evaluation Streaming", () => {
    it("emits evaluation info stream to registered subscribers", async () => {
      await engine.init();
      bridge.setAutoRespondBestMove(false);

      const receivedInfos: EngineSearchInfo[] = [];
      engine.onEvaluationInfo((info) => receivedInfos.push(info));

      const searchPromise = engine.searchBestMove({
        fen: "8/8/8/8/8/8/4K3/4Q2k w - - 0 1",
      });

      const searchReq = bridge.getLastRequest();
      if (searchReq?.type !== "SEARCH") throw new Error("Expected SEARCH");
      const token = searchReq.request.searchToken;

      bridge.respondSearchInfo({
        searchToken: token,
        depth: 4,
        scoreCp: 500,
        nodes: 1000,
      });
      bridge.respondSearchInfo({
        searchToken: token,
        depth: 8,
        mate: 2,
        nodes: 5000,
      });

      expect(receivedInfos).toHaveLength(2);
      expect(receivedInfos[0]?.scoreCp).toBe(500);
      expect(receivedInfos[1]?.mate).toBe(2);

      bridge.respondBestMove(token, "e1h4");
      await searchPromise;
    });

    it("allows unsubscribing from evaluation info stream", async () => {
      await engine.init();
      bridge.setAutoRespondBestMove(false);

      const receivedInfos: EngineSearchInfo[] = [];
      const unsub = engine.onEvaluationInfo((info) => receivedInfos.push(info));

      const searchPromise = engine.searchBestMove({ fen: "startpos" });
      const searchReq = bridge.getLastRequest();
      if (searchReq?.type !== "SEARCH") throw new Error("Expected SEARCH");
      const token = searchReq.request.searchToken;

      bridge.respondSearchInfo({ searchToken: token, depth: 4, scoreCp: 10 });
      expect(receivedInfos).toHaveLength(1);

      unsub();
      bridge.respondSearchInfo({ searchToken: token, depth: 8, scoreCp: 20 });
      expect(receivedInfos).toHaveLength(1); // not incremented

      bridge.respondBestMove(token, "e2e4");
      await searchPromise;
    });
  });

  describe("TC-ENG-04: Options Configuration", () => {
    it("dispatches SET_OPTION messages for configured parameters", async () => {
      await engine.init();
      bridge.clearRequests();

      await engine.setOptions({
        skillLevel: 18,
        threads: 4,
        hashSizeMb: 64,
        multiPv: 2,
      });

      const requests = bridge.getRequests();
      expect(requests).toEqual([
        { type: "SET_OPTION", name: "Skill Level", value: 18 },
        { type: "SET_OPTION", name: "Threads", value: 4 },
        { type: "SET_OPTION", name: "Hash", value: 64 },
        { type: "SET_OPTION", name: "MultiPV", value: 2 },
      ]);
    });

    it("sends NEW_GAME message when notifyNewGame is called", async () => {
      await engine.init();
      bridge.clearRequests();

      await engine.notifyNewGame();
      expect(bridge.getLastRequest()).toEqual({ type: "NEW_GAME" });
    });
  });

  describe("TC-ENG-05: Synchronous Search Cancellation", () => {
    it("rejects active search promise with EngineSearchCancelledError and returns to ready state", async () => {
      await engine.init();
      bridge.setAutoRespondBestMove(false);

      const searchPromise = engine.searchBestMove({ fen: "startpos" });
      expect(engine.getState()).toBe("thinking");

      await engine.cancelSearch();
      expect(engine.getState()).toBe("ready");
      expect(bridge.getLastRequest()).toEqual({ type: "STOP" });

      await expect(searchPromise).rejects.toThrow(EngineSearchCancelledError);
    });

    it("is safe to call cancelSearch when not thinking (no-op)", async () => {
      await engine.init();
      expect(engine.getState()).toBe("ready");
      await engine.cancelSearch();
      expect(engine.getState()).toBe("ready");
    });
  });

  describe("TC-ENG-06: Out-of-Order Stale Response Discard (INV-ENG-04)", () => {
    it("silently drops late responses from older search tokens without corrupting state", async () => {
      await engine.init();
      bridge.setAutoRespondBestMove(false);

      // Search 1 dispatched
      const search1Promise = engine.searchBestMove({ fen: "positionA" });
      const req1 = bridge.getLastRequest();
      if (req1?.type !== "SEARCH") throw new Error("Expected SEARCH");
      const token1 = req1.request.searchToken;

      // Cancel Search 1
      await engine.cancelSearch();
      await expect(search1Promise).rejects.toThrow(EngineSearchCancelledError);

      // Search 2 dispatched
      const search2Promise = engine.searchBestMove({ fen: "positionB" });
      const req2 = bridge.getLastRequest();
      if (req2?.type !== "SEARCH") throw new Error("Expected SEARCH");
      const token2 = req2.request.searchToken;
      expect(token1).not.toBe(token2);

      // Late stale message from Search 1 arrives
      bridge.respondSearchInfo({
        searchToken: token1,
        depth: 20,
        scoreCp: 999,
      });
      bridge.respondBestMove(token1, "a2a3");

      // State is still thinking for Search 2
      expect(engine.getState()).toBe("thinking");

      // Now legitimate Search 2 result arrives
      bridge.respondBestMove(token2, "e7e5");
      const res2 = await search2Promise;

      expect(res2.searchToken).toBe(token2);
      expect(res2.bestMoveUci).toBe("e7e5");
      expect(engine.getState()).toBe("ready");
    });
  });

  describe("TC-ENG-07: Error Handling, Fault Recovery & Disposal", () => {
    it("transitions to error state and rejects active search on fatal worker error", async () => {
      await engine.init();
      bridge.setAutoRespondBestMove(false);

      const searchPromise = engine.searchBestMove({ fen: "startpos" });
      bridge.simulateWorkerCrash("WASM Out Of Memory", true);

      expect(engine.getState()).toBe("error");
      await expect(searchPromise).rejects.toThrow(EngineFatalError);
    });

    it("resets cleanly from error state", async () => {
      await engine.init();
      bridge.simulateWorkerCrash("Fatal crash", true);
      expect(engine.getState()).toBe("error");

      await engine.reset();
      expect(engine.getState()).toBe("ready");
    });

    it("throws EngineNotReadyError when searching from uninitialized or non-ready states", async () => {
      expect(engine.getState()).toBe("idle");
      await expect(engine.searchBestMove({ fen: "startpos" })).rejects.toThrow(
        EngineNotReadyError
      );
    });

    it("cleans up resources and rejects active operations on dispose", async () => {
      await engine.init();
      bridge.setAutoRespondBestMove(false);

      const searchPromise = engine.searchBestMove({ fen: "startpos" });
      engine.dispose();

      expect(engine.getState()).toBe("disposed");
      expect(bridge.isTerminated()).toBe(true);
      await expect(searchPromise).rejects.toThrow(EngineDisposedError);

      await expect(engine.searchBestMove({ fen: "startpos" })).rejects.toThrow(
        EngineDisposedError
      );
      await expect(engine.init()).rejects.toThrow(EngineDisposedError);
    });
  });

  describe("TC-ENG-08: MockEngineWorkerBridge Control Suite", () => {
    it("supports simulated thinking delay", async () => {
      vi.useFakeTimers();
      const delayedBridge = new MockEngineWorkerBridge({
        autoRespondReady: true,
        defaultBestMove: "c2c4",
        defaultThinkingDelayMs: 300,
      });
      const delayedEngine = new EngineServiceImpl(delayedBridge);
      await delayedEngine.init();

      const searchPromise = delayedEngine.searchBestMove({ fen: "startpos" });
      expect(delayedEngine.getState()).toBe("thinking");

      vi.advanceTimersByTime(300);
      const res = await searchPromise;
      expect(res.bestMoveUci).toBe("c2c4");
      expect(delayedEngine.getState()).toBe("ready");

      delayedEngine.dispose();
      vi.useRealTimers();
    });

    it("supports function-based dynamic move response", async () => {
      bridge.setAutoRespondBestMove((req) => {
        if (req.type === "SEARCH" && req.request.fen.includes("black")) {
          return "c7c5";
        }
        return "g1f3";
      });

      await engine.init();
      const res1 = await engine.searchBestMove({ fen: "fen_with_black" });
      expect(res1.bestMoveUci).toBe("c7c5");

      const res2 = await engine.searchBestMove({ fen: "fen_with_white" });
      expect(res2.bestMoveUci).toBe("g1f3");
    });
  });
});
