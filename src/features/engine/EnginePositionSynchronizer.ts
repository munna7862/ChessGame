import type {
  EngineService,
  EngineConfig,
  EngineEvaluationResult,
  EngineSearchInfo,
  EngineSyncStatus,
  PositionSyncOptions,
  SynchronizedEvalInfo,
  IEnginePositionSynchronizer,
} from "./types";
import { EngineDisposedError, EngineSearchCancelledError } from "./types";
import type { IGameSessionController, GameSessionState } from "../game/types";

export interface EnginePositionSynchronizerConfig {
  readonly engineService: EngineService;
  readonly sessionController?: IGameSessionController | undefined;
  readonly autoAnalyze?: boolean | undefined;
  readonly defaultDepth?: number | undefined;
  readonly defaultMovetimeMs?: number | undefined;
}

/**
 * Synchronizes chess domain game session state with the asynchronous chess engine.
 * Guarantees that the engine only analyzes the current position, tracking session/epoch
 * tokens and rejecting stale or obsolete responses (INV-SYNC-01 to INV-SYNC-07).
 */
export class EnginePositionSynchronizer implements IEnginePositionSynchronizer {
  private readonly engineService: EngineService;
  private readonly sessionController?: IGameSessionController | undefined;
  private autoAnalyze: boolean;
  private defaultDepth?: number | undefined;
  private defaultMovetimeMs?: number | undefined;

  private _status: EngineSyncStatus = "idle";
  private _currentSessionId: string | null = null;
  private _currentEpoch = 0;
  private _currentFen: string | null = null;

  private activeEpoch: number | null = null;
  private activeSessionId: string | null = null;

  private sessionUnsubscribe: (() => void) | null = null;
  private engineEvalUnsubscribe: (() => void) | null = null;
  private engineStateUnsubscribe: (() => void) | null = null;

  private readonly statusListeners = new Set<
    (status: EngineSyncStatus) => void
  >();
  private readonly evalListeners = new Set<
    (info: SynchronizedEvalInfo) => void
  >();
  private readonly bestMoveListeners = new Set<
    (result: EngineEvaluationResult) => void
  >();

  private isDisposed = false;

  constructor(config: EnginePositionSynchronizerConfig) {
    this.engineService = config.engineService;
    this.sessionController = config.sessionController;
    this.autoAnalyze = config.autoAnalyze ?? false;
    this.defaultDepth = config.defaultDepth;
    this.defaultMovetimeMs = config.defaultMovetimeMs;

    this.initEngineListeners();

    if (this.sessionController) {
      const initialState = this.sessionController.getState();
      this._currentSessionId = initialState.id;
      this._currentFen = this.sessionController.exportFen();
      this.attachSessionController(this.sessionController);
    }
  }

  public get status(): EngineSyncStatus {
    return this._status;
  }

  public get currentSessionId(): string | null {
    return this._currentSessionId;
  }

  public get currentEpoch(): number {
    return this._currentEpoch;
  }

  public get currentFen(): string | null {
    return this._currentFen;
  }

  public getStatus(): EngineSyncStatus {
    return this._status;
  }

  public setAutoAnalyze(enabled: boolean): void {
    this.autoAnalyze = enabled;
  }

  /**
   * Synchronizes the current or specified FEN position to the engine.
   * Cancels any in-flight search and strictly correlates incoming evaluation info and best moves.
   */
  public async syncPosition(
    options?: PositionSyncOptions
  ): Promise<EngineEvaluationResult | null> {
    if (this.isDisposed) {
      throw new EngineDisposedError();
    }

    // Determine target FEN and Session ID
    const targetFen =
      options?.fen ??
      (this.sessionController
        ? this.sessionController.exportFen()
        : this._currentFen);

    if (!targetFen) {
      return null;
    }

    const sessionId =
      options?.sessionId ??
      this._currentSessionId ??
      this.sessionController?.getState().id ??
      "default-session";

    this._currentSessionId = sessionId;
    this._currentFen = targetFen;

    // Advance epoch
    this._currentEpoch += 1;
    const epoch = this._currentEpoch;

    // Cancel existing search before dispatching new one
    this.cancelActiveSearchInternal();

    // Set active tracking state
    this.activeEpoch = epoch;
    this.activeSessionId = sessionId;

    this.setStatus("analyzing");

    try {
      // Ensure engine is ready
      if (this.engineService.state !== "ready") {
        this.setStatus("syncing");
        await this.engineService.init();
        if (
          this.activeEpoch !== epoch ||
          this.activeSessionId !== sessionId ||
          this.isDisposed
        ) {
          return null;
        }
        this.setStatus("analyzing");
      }

      const result = await this.engineService.searchBestMove({
        fen: targetFen,
        sessionId,
        depth: options?.depth ?? this.defaultDepth,
        movetimeMs: options?.movetimeMs ?? this.defaultMovetimeMs,
        skillLevel: options?.skillLevel,
      });

      // Verify response correlation (INV-SYNC-03)
      if (
        this.activeEpoch !== epoch ||
        this.activeSessionId !== sessionId ||
        this.isDisposed
      ) {
        // Discard stale response
        return null;
      }

      // Clean active tracking
      this.activeEpoch = null;
      this.activeSessionId = null;

      this.setStatus("idle");

      // Notify listeners
      for (const listener of this.bestMoveListeners) {
        try {
          listener(result);
        } catch (err) {
          console.error("Error in onSynchronizedBestMove listener:", err);
        }
      }

      return result;
    } catch (err) {
      if (err instanceof EngineSearchCancelledError) {
        if (this.activeEpoch === epoch) {
          this.activeEpoch = null;
          this.activeSessionId = null;
          this.setStatus("cancelled");
          this.setStatus("idle");
        }
        return null;
      }

      // Handle fatal / unexpected engine errors without crashing session
      this.activeEpoch = null;
      this.activeSessionId = null;
      this.setStatus("error");
      return null;
    }
  }

  /**
   * Explicitly cancels any active position search in progress.
   */
  public async cancelActiveSync(): Promise<void> {
    if (this.isDisposed) {
      return;
    }
    this.cancelActiveSearchInternal();
    this.setStatus("idle");
  }

  /**
   * Notifies the engine of a new game / session reset (INV-SYNC-05).
   */
  public async notifyNewGame(sessionId?: string): Promise<void> {
    if (this.isDisposed) {
      return;
    }

    this.cancelActiveSearchInternal();

    const newId =
      sessionId ??
      this.sessionController?.getState().id ??
      `session-${Date.now()}`;
    this._currentSessionId = newId;
    this._currentEpoch = 0;
    this._currentFen = this.sessionController?.exportFen() ?? null;

    await this.engineService.notifyNewGame();
    this.setStatus("idle");
  }

  /**
   * Resets the synchronizer and restarts the underlying engine.
   */
  public async reset(
    sessionId?: string,
    config?: Partial<EngineConfig>
  ): Promise<void> {
    if (this.isDisposed) {
      return;
    }

    this.cancelActiveSearchInternal();
    this._currentSessionId =
      sessionId ??
      this.sessionController?.getState().id ??
      `session-${Date.now()}`;
    this._currentEpoch = 0;
    this._currentFen = this.sessionController?.exportFen() ?? null;

    await this.engineService.reset(config);
    this.setStatus("idle");
  }

  public dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this.isDisposed = true;

    if (this.sessionUnsubscribe) {
      this.sessionUnsubscribe();
      this.sessionUnsubscribe = null;
    }

    if (this.engineEvalUnsubscribe) {
      this.engineEvalUnsubscribe();
      this.engineEvalUnsubscribe = null;
    }

    if (this.engineStateUnsubscribe) {
      this.engineStateUnsubscribe();
      this.engineStateUnsubscribe = null;
    }

    this.cancelActiveSearchInternal();

    this.statusListeners.clear();
    this.evalListeners.clear();
    this.bestMoveListeners.clear();
    this._status = "idle";
  }

  public onStatusChange(
    listener: (status: EngineSyncStatus) => void
  ): () => void {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  public onSynchronizedEval(
    listener: (info: SynchronizedEvalInfo) => void
  ): () => void {
    this.evalListeners.add(listener);
    return () => {
      this.evalListeners.delete(listener);
    };
  }

  public onSynchronizedBestMove(
    listener: (result: EngineEvaluationResult) => void
  ): () => void {
    this.bestMoveListeners.add(listener);
    return () => {
      this.bestMoveListeners.delete(listener);
    };
  }

  // -------------------------------------------------------------------------
  // Internal Helpers & Subscriptions
  // -------------------------------------------------------------------------

  private initEngineListeners(): void {
    this.engineEvalUnsubscribe = this.engineService.onEvaluationInfo(
      (info: EngineSearchInfo) => {
        this.handleEngineEvaluationInfo(info);
      }
    );

    this.engineStateUnsubscribe = this.engineService.onStateChange((state) => {
      if (state === "error") {
        this.setStatus("error");
      }
    });
  }

  private handleEngineEvaluationInfo(info: EngineSearchInfo): void {
    // Validate that info matches active session and epoch (INV-SYNC-03)
    if (
      this.activeEpoch === null ||
      !this.activeSessionId ||
      !this._currentFen ||
      this._status !== "analyzing"
    ) {
      return;
    }

    const syncdInfo: SynchronizedEvalInfo = {
      sessionId: this.activeSessionId,
      epoch: this.activeEpoch,
      fen: this._currentFen,
      searchToken: info.searchToken,
      depth: info.depth,
      scoreCp: info.scoreCp,
      mate: info.mate,
      nodes: info.nodes,
      nps: info.nps,
      timeMs: info.timeMs,
      pv: info.pv,
    };

    for (const listener of this.evalListeners) {
      try {
        listener(syncdInfo);
      } catch (err) {
        console.error("Error in onSynchronizedEval listener:", err);
      }
    }
  }

  private attachSessionController(controller: IGameSessionController): void {
    let lastKnownFen = controller.exportFen();
    let lastKnownSessionId = controller.getState().id;

    this.sessionUnsubscribe = controller.subscribe(
      (state: GameSessionState) => {
        if (this.isDisposed) {
          return;
        }

        const currentFen = controller.exportFen();

        // Detect session reset or new game
        if (state.id !== lastKnownSessionId) {
          lastKnownSessionId = state.id;
          lastKnownFen = currentFen;
          void this.notifyNewGame(state.id);
          if (this.autoAnalyze && !state.isGameOver) {
            void this.syncPosition();
          }
          return;
        }

        // Detect position change (move, undo, or loadFen)
        if (currentFen !== lastKnownFen) {
          lastKnownFen = currentFen;
          this._currentFen = currentFen;
          this._currentEpoch += 1;

          // Cancel existing search immediately on move (INV-SYNC-02)
          this.cancelActiveSearchInternal();

          if (this.autoAnalyze && !state.isGameOver) {
            void this.syncPosition();
          }
        }
      }
    );
  }

  private cancelActiveSearchInternal(): void {
    if (this.activeEpoch !== null) {
      this.activeEpoch = null;
      this.activeSessionId = null;
      this.setStatus("cancelled");
      void this.engineService.cancelSearch();
    }
  }

  private setStatus(newStatus: EngineSyncStatus): void {
    if (this._status === newStatus) {
      return;
    }
    this._status = newStatus;
    for (const listener of this.statusListeners) {
      try {
        listener(newStatus);
      } catch (err) {
        console.error("Error in onStatusChange listener:", err);
      }
    }
  }
}
