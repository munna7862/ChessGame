import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { EnginePositionSynchronizer } from "../EnginePositionSynchronizer";
import { EngineServiceImpl } from "../EngineServiceImpl";
import { MockEngineWorkerBridge } from "../MockEngineWorkerBridge";
import { createGameSession } from "../../game/GameSessionController";
import type {
  EngineSyncStatus,
  SynchronizedEvalInfo,
  EngineEvaluationResult,
} from "../types";

describe("EnginePositionSynchronizer", () => {
  let mockBridge: MockEngineWorkerBridge;
  let engineService: EngineServiceImpl;

  beforeEach(() => {
    mockBridge = new MockEngineWorkerBridge();
    engineService = new EngineServiceImpl(mockBridge);
  });

  afterEach(() => {
    engineService.dispose();
  });

  it("TC-SYNC-01: exports FEN from game session and synchronizes search position", async () => {
    mockBridge.setAutoRespondBestMove(false);
    const session = createGameSession();
    const synchronizer = new EnginePositionSynchronizer({
      engineService,
      sessionController: session,
    });

    await engineService.init();

    const searchPromise = synchronizer.syncPosition({ movetimeMs: 100 });
    expect(synchronizer.status).toBe("analyzing");

    const searchReq = mockBridge.getLastRequest();
    expect(searchReq).toBeDefined();
    expect(searchReq?.type).toBe("SEARCH");

    if (searchReq?.type === "SEARCH") {
      expect(searchReq.request.fen).toContain(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      );
      expect(searchReq.request.sessionId).toBe(session.getState().id);

      mockBridge.respondBestMove(searchReq.request.searchToken, "e2e4");
    }

    const result = await searchPromise;
    expect(result).not.toBeNull();
    expect(result?.bestMoveUci).toBe("e2e4");
    expect(synchronizer.status).toBe("idle");

    synchronizer.dispose();
  });

  it("TC-SYNC-02: preempts and cancels active search when user plays a move", async () => {
    mockBridge.setAutoRespondBestMove(false);
    const session = createGameSession();
    const synchronizer = new EnginePositionSynchronizer({
      engineService,
      sessionController: session,
      autoAnalyze: true,
    });

    await engineService.init();

    // Start sync on initial position
    const firstSyncPromise = synchronizer.syncPosition({ movetimeMs: 500 });
    expect(synchronizer.status).toBe("analyzing");

    const searchReq = mockBridge.getLastRequest();
    expect(searchReq?.type).toBe("SEARCH");
    const firstSearchToken =
      searchReq?.type === "SEARCH" ? searchReq.request.searchToken : null;
    expect(firstSearchToken).not.toBeNull();

    // User plays move 'e2e4'
    const moveRes = session.makeMove({ from: "e2", to: "e4" });
    expect(moveRes.success).toBe(true);

    // Verify stop signal was dispatched to engine
    const stopMessages = mockBridge
      .getRequests()
      .filter((m) => m.type === "STOP");
    expect(stopMessages.length).toBeGreaterThanOrEqual(1);

    // Emitting best move for the OLD search token must be dropped / resolved to null
    if (firstSearchToken) {
      mockBridge.respondBestMove(firstSearchToken, "d7d5");
    }

    const firstResult = await firstSyncPromise;
    expect(firstResult).toBeNull(); // Discarded as stale

    // Synchronizer should have epoch bumped and FEN updated
    expect(synchronizer.currentEpoch).toBeGreaterThanOrEqual(2);
    expect(synchronizer.currentFen).toBe(session.exportFen());

    synchronizer.dispose();
  });

  it("TC-SYNC-03: invalidates active search when game session is reset", async () => {
    mockBridge.setAutoRespondBestMove(false);
    const session = createGameSession();
    const synchronizer = new EnginePositionSynchronizer({
      engineService,
      sessionController: session,
    });

    await engineService.init();

    const searchPromise = synchronizer.syncPosition({ movetimeMs: 500 });
    const searchReq = mockBridge.getLastRequest();
    const oldToken =
      searchReq?.type === "SEARCH" ? searchReq.request.searchToken : null;
    expect(oldToken).not.toBeNull();

    // Reset game session
    session.reset();

    // Late bestmove arrives for the old session token
    if (oldToken) {
      mockBridge.respondBestMove(oldToken, "g1f3");
    }

    const result = await searchPromise;
    expect(result).toBeNull(); // Discarded

    // Engine received NEW_GAME
    expect(mockBridge.getRequests().some((m) => m.type === "NEW_GAME")).toBe(
      true
    );

    synchronizer.dispose();
  });

  it("TC-SYNC-04: invalidates active search on move undo", async () => {
    mockBridge.setAutoRespondBestMove(false);
    const session = createGameSession();
    session.makeMove({ from: "e2", to: "e4" });

    const synchronizer = new EnginePositionSynchronizer({
      engineService,
      sessionController: session,
    });

    await engineService.init();

    const searchPromise = synchronizer.syncPosition({ movetimeMs: 500 });
    const searchReq = mockBridge.getLastRequest();
    const oldToken =
      searchReq?.type === "SEARCH" ? searchReq.request.searchToken : null;
    expect(oldToken).not.toBeNull();

    // Undo move
    session.undo();

    if (oldToken) {
      mockBridge.respondBestMove(oldToken, "e7e5");
    }

    const result = await searchPromise;
    expect(result).toBeNull(); // Discarded

    synchronizer.dispose();
  });

  it("TC-SYNC-05: discards delayed out-of-order bestmove responses", async () => {
    mockBridge.setAutoRespondBestMove(false);
    const session = createGameSession();
    const synchronizer = new EnginePositionSynchronizer({
      engineService,
      sessionController: session,
    });

    await engineService.init();

    const receivedBestMoves: EngineEvaluationResult[] = [];
    synchronizer.onSynchronizedBestMove((res) => {
      receivedBestMoves.push(res);
    });

    // Start search 1
    const p1 = synchronizer.syncPosition({ movetimeMs: 500 });
    const req1 = mockBridge.getLastRequest();
    const token1 = req1?.type === "SEARCH" ? req1.request.searchToken : "";

    // Immediately start search 2
    const p2 = synchronizer.syncPosition({ movetimeMs: 500 });
    const req2 = mockBridge.getLastRequest();
    const token2 = req2?.type === "SEARCH" ? req2.request.searchToken : "";
    expect(token1).not.toBe(token2);

    // Emit bestmove for token 1 (delayed)
    mockBridge.respondBestMove(token1, "e2e4");
    // Emit bestmove for token 2
    mockBridge.respondBestMove(token2, "d2d4");

    const r1 = await p1;
    const r2 = await p2;

    expect(r1).toBeNull(); // Discarded
    expect(r2).not.toBeNull();
    expect(r2?.bestMoveUci).toBe("d2d4");
    expect(receivedBestMoves).toHaveLength(1);
    expect(receivedBestMoves[0]?.bestMoveUci).toBe("d2d4");

    synchronizer.dispose();
  });

  it("TC-SYNC-06: synchronizes position on custom FEN load", async () => {
    mockBridge.setAutoRespondBestMove(false);
    const session = createGameSession();
    const synchronizer = new EnginePositionSynchronizer({
      engineService,
      sessionController: session,
    });

    await engineService.init();

    const customFen = "8/8/8/4k3/8/8/4K3/8 w - - 0 1";
    session.loadFen(customFen);

    const searchPromise = synchronizer.syncPosition({ movetimeMs: 100 });
    const searchReq = mockBridge.getLastRequest();
    const token =
      searchReq?.type === "SEARCH" ? searchReq.request.searchToken : "";

    const searchMsg = mockBridge
      .getRequests()
      .find((m) => m.type === "SEARCH" && m.request.searchToken === token);
    expect(searchMsg).toBeDefined();
    if (searchMsg?.type === "SEARCH") {
      expect(searchMsg.request.fen).toBe(customFen);
    }

    mockBridge.respondBestMove(token, "e2e3");
    const result = await searchPromise;
    expect(result?.bestMoveUci).toBe("e2e3");

    synchronizer.dispose();
  });

  it("TC-SYNC-07: streams real-time evaluation info strictly for active token", async () => {
    mockBridge.setAutoRespondBestMove(false);
    const session = createGameSession();
    const synchronizer = new EnginePositionSynchronizer({
      engineService,
      sessionController: session,
    });

    await engineService.init();

    const streamedEvalInfos: SynchronizedEvalInfo[] = [];
    synchronizer.onSynchronizedEval((info) => {
      streamedEvalInfos.push(info);
    });

    const searchPromise = synchronizer.syncPosition({ movetimeMs: 200 });
    const searchReq = mockBridge.getLastRequest();
    const activeToken =
      searchReq?.type === "SEARCH" ? searchReq.request.searchToken : "";

    // Emit info for active token
    mockBridge.respondSearchInfo({
      searchToken: activeToken,
      depth: 12,
      scoreCp: 35,
      nodes: 10000,
      pv: ["e2e4", "e7e5"],
    });

    // Emit info for a foreign/stale token
    mockBridge.respondSearchInfo({
      searchToken: "foreign-stale-token",
      depth: 20,
      scoreCp: 999,
    });

    // Complete search
    mockBridge.respondBestMove(activeToken, "e2e4");
    await searchPromise;

    expect(streamedEvalInfos).toHaveLength(1);
    expect(streamedEvalInfos[0]?.searchToken).toBe(activeToken);
    expect(streamedEvalInfos[0]?.depth).toBe(12);
    expect(streamedEvalInfos[0]?.scoreCp).toBe(35);
    expect(streamedEvalInfos[0]?.pv).toEqual(["e2e4", "e7e5"]);

    synchronizer.dispose();
  });

  it("TC-SYNC-08: isolates engine fatal errors without corrupting game session", async () => {
    mockBridge.setAutoRespondBestMove(false);
    const session = createGameSession();
    session.makeMove({ from: "e2", to: "e4" });

    const synchronizer = new EnginePositionSynchronizer({
      engineService,
      sessionController: session,
    });

    await engineService.init();

    const searchPromise = synchronizer.syncPosition({ movetimeMs: 500 });
    expect(synchronizer.status).toBe("analyzing");

    // Inject engine crash error
    mockBridge.simulateWorkerCrash("Stockfish WASM out of memory", true);

    const result = await searchPromise;
    expect(result).toBeNull();
    expect(synchronizer.status).toBe("error");

    // Game session remains 100% intact
    expect(session.getState().moveHistory).toHaveLength(1);
    expect(session.getState().turn).toBe("b");
    expect(session.getState().status.isOver).toBe(false);

    synchronizer.dispose();
  });

  it("TC-SYNC-09: tracks state transitions through onStatusChange listener", async () => {
    mockBridge.setAutoRespondBestMove(false);
    const session = createGameSession();
    const synchronizer = new EnginePositionSynchronizer({
      engineService,
      sessionController: session,
    });

    await engineService.init();

    const transitions: EngineSyncStatus[] = [];
    synchronizer.onStatusChange((status) => {
      transitions.push(status);
    });

    const searchPromise = synchronizer.syncPosition({ movetimeMs: 100 });
    const searchReq = mockBridge.getLastRequest();
    const token =
      searchReq?.type === "SEARCH" ? searchReq.request.searchToken : "";
    mockBridge.respondBestMove(token, "e2e4");
    await searchPromise;

    expect(transitions).toEqual(["analyzing", "idle"]);

    // Test explicit cancel
    const cancelPromise = synchronizer.syncPosition({ movetimeMs: 500 });
    await synchronizer.cancelActiveSync();
    await cancelPromise;

    expect(transitions).toContain("cancelled");
    expect(synchronizer.status).toBe("idle");

    synchronizer.dispose();
  });

  it("TC-SYNC-10: cleans up listeners and cancels searches on dispose", async () => {
    const session = createGameSession();
    const synchronizer = new EnginePositionSynchronizer({
      engineService,
      sessionController: session,
    });

    await engineService.init();

    synchronizer.dispose();
    expect(synchronizer.status).toBe("idle");

    await expect(synchronizer.syncPosition()).rejects.toThrow(
      "Engine has been disposed"
    );
  });
});
