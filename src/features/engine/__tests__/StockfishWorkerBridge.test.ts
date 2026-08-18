import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  StockfishWorkerBridge,
  type IWorkerLike,
} from "../StockfishWorkerBridge";
import { EngineServiceImpl } from "../EngineServiceImpl";
import type { EngineWorkerResponse } from "../types";

class MockWorkerLike implements IWorkerLike {
  public sentMessages: string[] = [];
  public terminated = false;
  private messageListeners = new Set<(e: MessageEvent) => void>();
  private errorListeners = new Set<(e: ErrorEvent) => void>();

  public postMessage(message: unknown): void {
    if (typeof message === "string") {
      this.sentMessages.push(message);
    }
  }

  public addEventListener(
    type: string,
    listener: (event: MessageEvent | ErrorEvent) => void
  ): void {
    if (type === "message") {
      this.messageListeners.add(listener as (e: MessageEvent) => void);
    } else if (type === "error") {
      this.errorListeners.add(listener as (e: ErrorEvent) => void);
    }
  }

  public removeEventListener(
    type: string,
    listener: (event: MessageEvent | ErrorEvent) => void
  ): void {
    if (type === "message") {
      this.messageListeners.delete(listener as (e: MessageEvent) => void);
    } else if (type === "error") {
      this.errorListeners.delete(listener as (e: ErrorEvent) => void);
    }
  }

  public terminate(): void {
    this.terminated = true;
    this.messageListeners.clear();
    this.errorListeners.clear();
  }

  // Test helpers to simulate incoming worker messages
  public emitMessage(data: string): void {
    const event = { data } as MessageEvent;
    for (const listener of this.messageListeners) {
      listener(event);
    }
  }

  public emitError(message: string): void {
    const event = { message } as ErrorEvent;
    for (const listener of this.errorListeners) {
      listener(event);
    }
  }
}

describe("StockfishWorkerBridge Integration Suite (TC-SF-06 to TC-SF-11)", () => {
  let mockWorker: MockWorkerLike;
  let bridge: StockfishWorkerBridge;

  beforeEach(() => {
    mockWorker = new MockWorkerLike();
    bridge = new StockfishWorkerBridge(() => mockWorker);
  });

  it("orchestrates two-stage UCI initialization handshake (TC-SF-06)", () => {
    const receivedResponses: EngineWorkerResponse[] = [];
    bridge.onMessage((res) => receivedResponses.push(res));

    bridge.postMessage({
      type: "INIT",
      config: { threads: 2, hashSizeMb: 32, skillLevel: 10, multiPv: 1 },
    });

    // Stage 1: bridge must send "uci"
    expect(mockWorker.sentMessages).toContain("uci");

    // Worker replies with banner and uciok
    mockWorker.emitMessage("id name Stockfish 10\nuciok\n");

    // Stage 2: bridge must configure options and send "isready"
    expect(mockWorker.sentMessages).toContain("setoption name Threads value 2");
    expect(mockWorker.sentMessages).toContain("setoption name Hash value 32");
    expect(mockWorker.sentMessages).toContain(
      "setoption name Skill Level value 10"
    );
    expect(mockWorker.sentMessages).toContain("setoption name MultiPV value 1");
    expect(mockWorker.sentMessages).toContain("isready");

    // Worker replies with readyok
    mockWorker.emitMessage("readyok\n");

    // Bridge emits READY
    expect(receivedResponses).toContainEqual({ type: "READY" });
  });

  it("dispatches search and streams tokenized evaluation info (TC-SF-07)", () => {
    const receivedResponses: EngineWorkerResponse[] = [];
    bridge.onMessage((res) => receivedResponses.push(res));

    // Initialize first
    bridge.postMessage({ type: "INIT" });
    mockWorker.emitMessage("uciok\n");
    mockWorker.emitMessage("readyok\n");

    const fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";
    bridge.postMessage({
      type: "SEARCH",
      request: {
        searchToken: "tok-search-1",
        sessionId: "sess-1",
        fen,
        depth: 10,
        skillLevel: 12,
      },
    });

    expect(mockWorker.sentMessages).toContain(
      "setoption name Skill Level value 12"
    );
    expect(mockWorker.sentMessages).toContain(`position fen ${fen}`);
    expect(mockWorker.sentMessages).toContain("go depth 10");

    // Engine streams search info
    mockWorker.emitMessage(
      "info depth 6 score cp 15 nodes 1200 time 8 pv e7e5 g1f3\n"
    );

    expect(receivedResponses).toContainEqual({
      type: "SEARCH_INFO",
      searchToken: "tok-search-1",
      depth: 6,
      scoreCp: 15,
      nodes: 1200,
      timeMs: 8,
      pv: ["e7e5", "g1f3"],
    });

    // Engine finishes search
    mockWorker.emitMessage("bestmove e7e5 ponder g1f3\n");

    expect(receivedResponses).toContainEqual({
      type: "BEST_MOVE",
      searchToken: "tok-search-1",
      uciMove: "e7e5",
      ponderMove: "g1f3",
    });
  });

  it("handles STOP cancellation and discards stale search results (TC-SF-08)", () => {
    const receivedResponses: EngineWorkerResponse[] = [];
    bridge.onMessage((res) => receivedResponses.push(res));

    bridge.postMessage({ type: "INIT" });
    mockWorker.emitMessage("uciok\nreadyok\n");

    bridge.postMessage({
      type: "SEARCH",
      request: {
        searchToken: "tok-cancel",
        sessionId: "sess-1",
        fen: "8/8/8/8/8/8/8/8 w - - 0 1",
        depth: 15,
      },
    });

    bridge.postMessage({ type: "STOP" });

    expect(mockWorker.sentMessages).toContain("stop");
    expect(receivedResponses).toContainEqual({
      type: "STOPPED",
      searchToken: "tok-cancel",
    });

    // Late bestmove arrives after stop
    mockWorker.emitMessage("bestmove e2e4\n");

    // Late bestmove carries cancelled token
    expect(receivedResponses).toContainEqual({
      type: "BEST_MOVE",
      searchToken: "tok-cancel",
      uciMove: "e2e4",
    });
  });

  it("forwards SET_OPTION and NEW_GAME commands (TC-SF-09)", () => {
    bridge.postMessage({ type: "SET_OPTION", name: "Threads", value: 4 });
    expect(mockWorker.sentMessages).toContain("setoption name Threads value 4");

    bridge.postMessage({ type: "NEW_GAME" });
    expect(mockWorker.sentMessages).toContain("ucinewgame");
    expect(mockWorker.sentMessages).toContain("isready");
  });

  it("terminates worker cleanly on disposal (TC-SF-10)", () => {
    bridge.postMessage({ type: "INIT" });
    expect(mockWorker.terminated).toBe(false);

    bridge.terminate();

    expect(mockWorker.sentMessages).toContain("quit");
    expect(mockWorker.terminated).toBe(true);
  });

  it("propagates worker error events (TC-SF-11)", () => {
    const receivedResponses: EngineWorkerResponse[] = [];
    const errorListener = vi.fn();

    bridge.onMessage((res) => receivedResponses.push(res));
    bridge.onError(errorListener);

    bridge.postMessage({ type: "INIT" });
    mockWorker.emitError("Stockfish Out of Memory");

    expect(errorListener).toHaveBeenCalledWith(expect.any(Error));
    expect(receivedResponses).toContainEqual({
      type: "ERROR",
      message: "Stockfish Out of Memory",
      fatal: true,
    });
  });

  it("runs full EngineServiceImpl lifecycle with StockfishWorkerBridge", async () => {
    const service = new EngineServiceImpl(bridge);

    const initPromise = service.init({ threads: 1, hashSizeMb: 16 });
    mockWorker.emitMessage("uciok\n");
    mockWorker.emitMessage("readyok\n");
    await initPromise;

    expect(service.state).toBe("ready");

    const searchPromise = service.searchBestMove({
      sessionId: "game-1",
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      depth: 12,
    });

    expect(service.state).toBe("thinking");

    mockWorker.emitMessage(
      "info depth 6 score cp 20 nodes 500 time 10 pv e2e4\n"
    );
    mockWorker.emitMessage("bestmove e2e4 ponder e7e5\n");

    const result = await searchPromise;
    expect(result.bestMoveUci).toBe("e2e4");
    expect(result.ponderMoveUci).toBe("e7e5");
    expect(result.depth).toBe(6);
    expect(result.scoreCp).toBe(20);
    expect(service.state).toBe("ready");

    service.dispose();
    expect(service.state).toBe("disposed");
  });
});
