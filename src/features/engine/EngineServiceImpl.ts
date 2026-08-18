import {
  type EngineService,
  type EngineLifecycleState,
  type EngineConfig,
  type EngineSearchOptions,
  type EngineSearchInfo,
  type EngineEvaluationResult,
  DEFAULT_ENGINE_CONFIG,
  EngineWorkerResponseSchema,
  EngineNotReadyError,
  EngineSearchCancelledError,
  EngineFatalError,
  EngineDisposedError,
} from "./types";
import type { EngineWorkerBridge } from "./workerBridge";
import { engineDiagnostics } from "./engineDiagnostics";

export type WorkerBridgeFactory = () => EngineWorkerBridge;

/**
 * Production implementation of EngineService managing WebWorker communication,
 * state machine transitions, search correlation, and stale response rejection.
 */
export class EngineServiceImpl implements EngineService {
  private _state: EngineLifecycleState = "idle";
  private bridge: EngineWorkerBridge | null = null;
  private readonly bridgeFactory: WorkerBridgeFactory;
  private readonly stateListeners = new Set<
    (state: EngineLifecycleState) => void
  >();
  private readonly evalInfoListeners = new Set<
    (info: EngineSearchInfo) => void
  >();
  private tokenCounter = 0;
  private currentSearchToken: string | null = null;
  private activeSearch: {
    token: string;
    resolve: (result: EngineEvaluationResult) => void;
    reject: (err: Error) => void;
  } | null = null;
  private pendingInit: {
    resolve: () => void;
    reject: (err: Error) => void;
  } | null = null;
  private latestSearchInfo: EngineSearchInfo | null = null;
  private bridgeUnsubscribe: (() => void) | null = null;
  private bridgeErrorUnsubscribe: (() => void) | null = null;

  constructor(bridgeOrFactory: EngineWorkerBridge | WorkerBridgeFactory) {
    if (typeof bridgeOrFactory === "function") {
      this.bridgeFactory = bridgeOrFactory;
    } else {
      this.bridgeFactory = () => bridgeOrFactory;
      this.bridge = bridgeOrFactory;
    }
  }

  public get state(): EngineLifecycleState {
    return this._state;
  }

  public getState(): EngineLifecycleState {
    return this._state;
  }

  public async init(config?: Partial<EngineConfig>): Promise<void> {
    if (this._state === "disposed") {
      throw new EngineDisposedError();
    }

    if (this._state === "ready") {
      return;
    }

    if (this._state === "starting" && this.pendingInit) {
      // Return existing pending init
      return new Promise<void>((resolve, reject) => {
        const prevResolve = this.pendingInit!.resolve;
        const prevReject = this.pendingInit!.reject;
        this.pendingInit = {
          resolve: () => {
            prevResolve();
            resolve();
          },
          reject: (err) => {
            prevReject(err);
            reject(err);
          },
        };
      });
    }

    this.ensureBridge();
    this.setState("starting");

    const fullConfig: EngineConfig = {
      ...DEFAULT_ENGINE_CONFIG,
      ...config,
    };

    return new Promise<void>((resolve, reject) => {
      this.pendingInit = { resolve, reject };
      this.bridge!.postMessage({
        type: "INIT",
        config: {
          threads: fullConfig.threads,
          hashSizeMb: fullConfig.hashSizeMb,
          skillLevel: fullConfig.skillLevel,
          multiPv: fullConfig.multiPv,
        },
      });
    });
  }

  public async setOptions(config: Partial<EngineConfig>): Promise<void> {
    if (this._state === "disposed") {
      throw new EngineDisposedError();
    }

    this.ensureBridge();

    if (config.skillLevel !== undefined) {
      this.bridge!.postMessage({
        type: "SET_OPTION",
        name: "Skill Level",
        value: config.skillLevel,
      });
    }

    if (config.threads !== undefined) {
      this.bridge!.postMessage({
        type: "SET_OPTION",
        name: "Threads",
        value: config.threads,
      });
    }

    if (config.hashSizeMb !== undefined) {
      this.bridge!.postMessage({
        type: "SET_OPTION",
        name: "Hash",
        value: config.hashSizeMb,
      });
    }

    if (config.multiPv !== undefined) {
      this.bridge!.postMessage({
        type: "SET_OPTION",
        name: "MultiPV",
        value: config.multiPv,
      });
    }
  }

  public async notifyNewGame(): Promise<void> {
    if (this._state === "disposed") {
      throw new EngineDisposedError();
    }

    this.ensureBridge();
    this.bridge!.postMessage({ type: "NEW_GAME" });
  }

  public async searchBestMove(
    options: EngineSearchOptions
  ): Promise<EngineEvaluationResult> {
    if (this._state === "disposed") {
      throw new EngineDisposedError();
    }

    if (this._state !== "ready") {
      throw new EngineNotReadyError(this._state);
    }

    this.ensureBridge();

    const searchToken = `search-${++this.tokenCounter}-${Date.now()}`;
    this.currentSearchToken = searchToken;
    this.latestSearchInfo = null;

    this.setState("thinking");

    return new Promise<EngineEvaluationResult>((resolve, reject) => {
      this.activeSearch = {
        token: searchToken,
        resolve,
        reject,
      };

      this.bridge!.postMessage({
        type: "SEARCH",
        request: {
          searchToken,
          sessionId: options.sessionId,
          fen: options.fen,
          depth: options.depth,
          movetimeMs: options.movetimeMs,
          skillLevel: options.skillLevel,
        },
      });
    });
  }

  public async cancelSearch(): Promise<void> {
    if (this._state === "disposed") {
      return;
    }

    if (this._state !== "thinking" && this._state !== "stopping") {
      return;
    }

    const cancelledToken = this.currentSearchToken;
    this.currentSearchToken = null;

    if (this.activeSearch) {
      const { reject } = this.activeSearch;
      this.activeSearch = null;
      reject(new EngineSearchCancelledError(cancelledToken ?? "unknown"));
    }

    if (this.bridge) {
      this.bridge.postMessage({ type: "STOP" });
    }

    this.setState("ready");
  }

  public async reset(config?: Partial<EngineConfig>): Promise<void> {
    if (this._state === "disposed") {
      throw new EngineDisposedError();
    }

    engineDiagnostics.log("RESTART_ATTEMPT", "Attempting engine restart", {
      previousState: this._state,
    });

    if (this.activeSearch) {
      const { reject, token } = this.activeSearch;
      this.activeSearch = null;
      this.currentSearchToken = null;
      reject(new EngineSearchCancelledError(token));
    }

    if (this.pendingInit) {
      const { reject } = this.pendingInit;
      this.pendingInit = null;
      reject(new EngineSearchCancelledError("init cancelled by reset"));
    }

    if (this.bridge) {
      try {
        this.bridge.postMessage({ type: "TERMINATE" });
        this.bridge.terminate();
      } catch {
        // Bridge may already be terminated or corrupted
      }
    }

    this.cleanupBridge();
    this.setState("idle");
    try {
      await this.init(config);
      engineDiagnostics.log(
        "RESTART_SUCCESS",
        "Engine successfully restarted to ready state"
      );
    } catch (err) {
      engineDiagnostics.log("RESTART_FAILED", "Engine restart failed", {
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }

  public dispose(): void {
    if (this._state === "disposed") {
      return;
    }

    if (this.activeSearch) {
      const { reject } = this.activeSearch;
      this.activeSearch = null;
      this.currentSearchToken = null;
      reject(new EngineDisposedError());
    }

    if (this.pendingInit) {
      const { reject } = this.pendingInit;
      this.pendingInit = null;
      reject(new EngineDisposedError());
    }

    if (this.bridge) {
      this.bridge.postMessage({ type: "TERMINATE" });
      this.bridge.terminate();
    }

    this.cleanupBridge();
    this.stateListeners.clear();
    this.evalInfoListeners.clear();
    this.setState("disposed");
  }

  public onStateChange(
    listener: (state: EngineLifecycleState) => void
  ): () => void {
    this.stateListeners.add(listener);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  public onEvaluationInfo(
    listener: (info: EngineSearchInfo) => void
  ): () => void {
    this.evalInfoListeners.add(listener);
    return () => {
      this.evalInfoListeners.delete(listener);
    };
  }

  // -------------------------------------------------------------------------
  // Worker Bridge Message Dispatch & Lifecycle
  // -------------------------------------------------------------------------

  private ensureBridge(): void {
    if (!this.bridge) {
      this.bridge = this.bridgeFactory();
    }

    if (!this.bridgeUnsubscribe) {
      this.bridgeUnsubscribe = this.bridge.onMessage((response) => {
        this.handleWorkerResponse(response);
      });
    }

    if (!this.bridgeErrorUnsubscribe) {
      this.bridgeErrorUnsubscribe = this.bridge.onError((error) => {
        this.handleWorkerError(error.message);
      });
    }
  }

  private handleWorkerResponse(rawResponse: unknown): void {
    const parseResult = EngineWorkerResponseSchema.safeParse(rawResponse);
    if (!parseResult.success) {
      // Malformed worker message - ignore or report
      return;
    }

    const response = parseResult.data;

    switch (response.type) {
      case "READY": {
        this.setState("ready");
        if (this.pendingInit) {
          const { resolve } = this.pendingInit;
          this.pendingInit = null;
          resolve();
        }
        break;
      }

      case "SEARCH_INFO": {
        // Discard stale info messages that don't match active search token (INV-ENG-04)
        if (
          !this.currentSearchToken ||
          response.searchToken !== this.currentSearchToken
        ) {
          return;
        }

        const info: EngineSearchInfo = {
          searchToken: response.searchToken,
          depth: response.depth,
          scoreCp: response.scoreCp,
          mate: response.mate,
          nodes: response.nodes,
          nps: response.nps,
          timeMs: response.timeMs,
          pv: response.pv ? [...response.pv] : undefined,
        };

        this.latestSearchInfo = info;
        for (const listener of this.evalInfoListeners) {
          listener(info);
        }
        break;
      }

      case "BEST_MOVE": {
        // Discard stale best-move messages (INV-ENG-04)
        if (
          !this.currentSearchToken ||
          response.searchToken !== this.currentSearchToken
        ) {
          return;
        }

        const search = this.activeSearch;
        this.activeSearch = null;
        this.currentSearchToken = null;

        const result: EngineEvaluationResult = {
          searchToken: response.searchToken,
          bestMoveUci: response.uciMove,
          ponderMoveUci: response.ponderMove,
          depth: this.latestSearchInfo?.depth,
          scoreCp: this.latestSearchInfo?.scoreCp,
          mateIn: this.latestSearchInfo?.mate,
        };

        this.setState("ready");

        if (search) {
          search.resolve(result);
        }
        break;
      }

      case "STOPPED": {
        if (this._state === "stopping") {
          this.setState("ready");
        }
        break;
      }

      case "ERROR": {
        this.handleWorkerError(response.message, response.fatal ?? true);
        break;
      }
    }
  }

  private handleWorkerError(message: string, fatal = true): void {
    engineDiagnostics.log(fatal ? "WORKER_CRASH" : "WORKER_ERROR", message, {
      fatal,
      currentState: this._state,
      searchToken: this.currentSearchToken,
    });

    if (fatal) {
      this.setState("error");

      if (this.pendingInit) {
        const { reject } = this.pendingInit;
        this.pendingInit = null;
        reject(new EngineFatalError(message));
      }

      if (this.activeSearch) {
        const { reject } = this.activeSearch;
        this.activeSearch = null;
        this.currentSearchToken = null;
        reject(new EngineFatalError(message));
      }
    }
  }

  private setState(newState: EngineLifecycleState): void {
    if (this._state === newState) {
      return;
    }
    const oldState = this._state;
    this._state = newState;
    engineDiagnostics.log(
      "STATE_CHANGE",
      `Engine transitioned from ${oldState} to ${newState}`,
      { oldState, newState }
    );
    for (const listener of this.stateListeners) {
      listener(newState);
    }
  }

  private cleanupBridge(): void {
    if (this.bridgeUnsubscribe) {
      this.bridgeUnsubscribe();
      this.bridgeUnsubscribe = null;
    }
    if (this.bridgeErrorUnsubscribe) {
      this.bridgeErrorUnsubscribe();
      this.bridgeErrorUnsubscribe = null;
    }
    this.bridge = null;
  }
}
