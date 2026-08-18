import {
  type EngineWorkerRequest,
  type EngineWorkerResponse,
  type EngineSearchInfo,
  EngineWorkerResponseSchema,
} from "./types";
import type {
  EngineWorkerBridge,
  EngineWorkerMessageHandler,
  EngineWorkerErrorHandler,
} from "./workerBridge";

export interface MockEngineOptions {
  readonly autoRespondReady?: boolean | undefined;
  readonly autoRespondBestMove?:
    | boolean
    | string
    | ((req: EngineWorkerRequest) => string)
    | undefined;
  readonly defaultBestMove?: string | undefined;
  readonly defaultPonderMove?: string | undefined;
  readonly defaultThinkingDelayMs?: number | undefined;
  readonly engineName?: string | undefined;
}

/**
 * Deterministic, controllable in-memory worker bridge for unit, integration,
 * and contract testing without requiring browser WebWorkers or Stockfish WASM.
 */
export class MockEngineWorkerBridge implements EngineWorkerBridge {
  private readonly messageHandlers = new Set<EngineWorkerMessageHandler>();
  private readonly errorHandlers = new Set<EngineWorkerErrorHandler>();
  private readonly postedRequests: EngineWorkerRequest[] = [];
  private autoRespondReady: boolean;
  private autoRespondBestMove:
    | boolean
    | string
    | ((req: EngineWorkerRequest) => string);
  private defaultBestMove: string;
  private defaultPonderMove?: string | undefined;
  private defaultThinkingDelayMs: number;
  private engineName: string;
  private terminated = false;
  private activeTimers = new Set<ReturnType<typeof setTimeout>>();

  constructor(options: MockEngineOptions = {}) {
    this.autoRespondReady = options.autoRespondReady ?? true;
    this.autoRespondBestMove = options.autoRespondBestMove ?? true;
    this.defaultBestMove = options.defaultBestMove ?? "e2e4";
    this.defaultPonderMove = options.defaultPonderMove;
    this.defaultThinkingDelayMs = options.defaultThinkingDelayMs ?? 0;
    this.engineName = options.engineName ?? "MockStockfish 16 WASM";
  }

  public postMessage(request: EngineWorkerRequest): void {
    if (this.terminated) {
      return;
    }

    this.postedRequests.push(request);

    if (request.type === "INIT" && this.autoRespondReady) {
      this.respondReady(this.engineName);
    } else if (request.type === "SEARCH") {
      this.handleSearchRequest(request);
    } else if (request.type === "STOP") {
      // Worker acknowledges stop if needed
    }
  }

  public onMessage(handler: EngineWorkerMessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  public onError(handler: EngineWorkerErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => {
      this.errorHandlers.delete(handler);
    };
  }

  public terminate(): void {
    this.terminated = true;
    this.clearTimers();
    this.messageHandlers.clear();
    this.errorHandlers.clear();
  }

  // -------------------------------------------------------------------------
  // Deterministic Control & Simulation Hooks
  // -------------------------------------------------------------------------

  public respondReady(engineName = this.engineName): void {
    this.emitResponse({
      type: "READY",
      engineName,
    });
  }

  public respondBestMove(
    searchToken: string,
    uciMove = this.defaultBestMove,
    ponderMove = this.defaultPonderMove
  ): void {
    this.emitResponse({
      type: "BEST_MOVE",
      searchToken,
      uciMove,
      ponderMove,
    });
  }

  public respondSearchInfo(info: EngineSearchInfo): void {
    this.emitResponse({
      type: "SEARCH_INFO",
      searchToken: info.searchToken,
      depth: info.depth,
      scoreCp: info.scoreCp,
      mate: info.mate,
      nodes: info.nodes,
      nps: info.nps,
      timeMs: info.timeMs,
      pv: info.pv ? [...info.pv] : undefined,
    });
  }

  public respondStopped(searchToken: string): void {
    this.emitResponse({
      type: "STOPPED",
      searchToken,
    });
  }

  public simulateWorkerCrash(errorMessage: string, fatal = true): void {
    this.emitResponse({
      type: "ERROR",
      message: errorMessage,
      fatal,
    });
  }

  public simulateUncaughtError(error: Error): void {
    for (const handler of this.errorHandlers) {
      handler(error);
    }
  }

  public simulateStaleResponse(staleToken: string, uciMove = "d2d4"): void {
    this.respondBestMove(staleToken, uciMove);
  }

  public simulateRawMessage(data: unknown): void {
    const parsed = EngineWorkerResponseSchema.safeParse(data);
    if (parsed.success) {
      this.emitResponse(parsed.data);
    } else {
      for (const handler of this.errorHandlers) {
        handler(
          new Error(`Invalid worker response payload: ${parsed.error.message}`)
        );
      }
    }
  }

  public setAutoRespondBestMove(
    mode: boolean | string | ((req: EngineWorkerRequest) => string)
  ): void {
    this.autoRespondBestMove = mode;
  }

  public setAutoRespondReady(enabled: boolean): void {
    this.autoRespondReady = enabled;
  }

  public getLastRequest(): EngineWorkerRequest | undefined {
    return this.postedRequests[this.postedRequests.length - 1];
  }

  public getRequests(): readonly EngineWorkerRequest[] {
    return [...this.postedRequests];
  }

  public clearRequests(): void {
    this.postedRequests.length = 0;
  }

  public isTerminated(): boolean {
    return this.terminated;
  }

  // -------------------------------------------------------------------------
  // Internal Helpers
  // -------------------------------------------------------------------------

  private handleSearchRequest(
    request: Extract<EngineWorkerRequest, { type: "SEARCH" }>
  ): void {
    if (this.autoRespondBestMove === false) {
      return;
    }

    const move =
      typeof this.autoRespondBestMove === "function"
        ? this.autoRespondBestMove(request)
        : typeof this.autoRespondBestMove === "string"
          ? this.autoRespondBestMove
          : this.defaultBestMove;

    if (this.defaultThinkingDelayMs > 0) {
      const timer = setTimeout(() => {
        this.activeTimers.delete(timer);
        if (!this.terminated) {
          this.respondBestMove(
            request.request.searchToken,
            move,
            this.defaultPonderMove
          );
        }
      }, this.defaultThinkingDelayMs);
      this.activeTimers.add(timer);
    } else {
      this.respondBestMove(
        request.request.searchToken,
        move,
        this.defaultPonderMove
      );
    }
  }

  private emitResponse(response: EngineWorkerResponse): void {
    if (this.terminated) {
      return;
    }
    for (const handler of this.messageHandlers) {
      handler(response);
    }
  }

  private clearTimers(): void {
    for (const timer of this.activeTimers) {
      clearTimeout(timer);
    }
    this.activeTimers.clear();
  }
}
