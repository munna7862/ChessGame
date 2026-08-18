import { z } from "zod";

/**
 * Lifecycle states of the chess engine subsystem.
 */
export type EngineLifecycleState =
  | "idle"
  | "starting"
  | "ready"
  | "thinking"
  | "stopping"
  | "error"
  | "disposed";

/**
 * Standard configuration options for the chess engine.
 */
export interface EngineConfig {
  readonly threads: number;
  readonly hashSizeMb: number;
  readonly skillLevel: number;
  readonly multiPv?: number | undefined;
}

export const DEFAULT_ENGINE_CONFIG: EngineConfig = {
  threads: 1,
  hashSizeMb: 16,
  skillLevel: 10,
  multiPv: 1,
};

/**
 * Options provided when requesting a best-move search.
 */
export interface EngineSearchOptions {
  readonly fen: string;
  readonly depth?: number | undefined;
  readonly movetimeMs?: number | undefined;
  readonly skillLevel?: number | undefined;
  readonly sessionId?: string | undefined;
}

/**
 * Real-time evaluation info streamed during engine thinking.
 */
export interface EngineSearchInfo {
  readonly searchToken: string;
  readonly depth: number;
  readonly scoreCp?: number | undefined;
  readonly mate?: number | undefined;
  readonly nodes?: number | undefined;
  readonly nps?: number | undefined;
  readonly timeMs?: number | undefined;
  readonly pv?: readonly string[] | undefined;
}

/**
 * Final evaluation and best-move result returned when search completes.
 */
export interface EngineEvaluationResult {
  readonly searchToken: string;
  readonly bestMoveUci: string;
  readonly ponderMoveUci?: string | undefined;
  readonly depth?: number | undefined;
  readonly scoreCp?: number | undefined;
  readonly mateIn?: number | undefined;
}

// ---------------------------------------------------------------------------
// Worker Request & Response Zod Schemas
// ---------------------------------------------------------------------------

export const EngineWorkerRequestSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("INIT"),
    config: z
      .object({
        threads: z.number().int().min(1).optional(),
        hashSizeMb: z.number().int().min(1).max(1024).optional(),
        skillLevel: z.number().int().min(0).max(20).optional(),
        multiPv: z.number().int().min(1).optional(),
      })
      .optional(),
  }),
  z.object({
    type: z.literal("SET_OPTION"),
    name: z.string().min(1),
    value: z.union([z.string(), z.number(), z.boolean()]),
  }),
  z.object({
    type: z.literal("NEW_GAME"),
  }),
  z.object({
    type: z.literal("SEARCH"),
    request: z.object({
      searchToken: z.string().min(1),
      sessionId: z.string().optional(),
      fen: z.string().min(1),
      depth: z.number().int().min(1).optional(),
      movetimeMs: z.number().int().min(1).optional(),
      skillLevel: z.number().int().min(0).max(20).optional(),
    }),
  }),
  z.object({
    type: z.literal("STOP"),
  }),
  z.object({
    type: z.literal("TERMINATE"),
  }),
]);

export type EngineWorkerRequest = z.infer<typeof EngineWorkerRequestSchema>;

export const EngineWorkerResponseSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("READY"),
    engineName: z.string().optional(),
  }),
  z.object({
    type: z.literal("SEARCH_INFO"),
    searchToken: z.string().min(1),
    depth: z.number().int().min(0),
    scoreCp: z.number().int().optional(),
    mate: z.number().int().optional(),
    nodes: z.number().int().min(0).optional(),
    nps: z.number().int().min(0).optional(),
    timeMs: z.number().int().min(0).optional(),
    pv: z.array(z.string()).optional(),
  }),
  z.object({
    type: z.literal("BEST_MOVE"),
    searchToken: z.string().min(1),
    uciMove: z.string().min(4).max(5),
    ponderMove: z.string().min(4).max(5).optional(),
  }),
  z.object({
    type: z.literal("STOPPED"),
    searchToken: z.string().min(1),
  }),
  z.object({
    type: z.literal("ERROR"),
    message: z.string(),
    fatal: z.boolean().optional(),
  }),
]);

export type EngineWorkerResponse = z.infer<typeof EngineWorkerResponseSchema>;

// ---------------------------------------------------------------------------
// Error Hierarchy
// ---------------------------------------------------------------------------

export class EngineError extends Error {
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "EngineError";
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class EngineNotReadyError extends EngineError {
  constructor(currentState: EngineLifecycleState) {
    super(
      `Engine is not ready for search. Current state: ${currentState}`,
      "ENGINE_NOT_READY"
    );
    this.name = "EngineNotReadyError";
    Object.setPrototypeOf(this, EngineNotReadyError.prototype);
  }
}

export class EngineSearchCancelledError extends EngineError {
  public readonly searchToken: string;

  constructor(searchToken: string) {
    super(
      `Engine search was cancelled for token: ${searchToken}`,
      "SEARCH_CANCELLED"
    );
    this.name = "EngineSearchCancelledError";
    this.searchToken = searchToken;
    Object.setPrototypeOf(this, EngineSearchCancelledError.prototype);
  }
}

export class EngineFatalError extends EngineError {
  constructor(message: string) {
    super(`Engine fatal error: ${message}`, "ENGINE_FATAL");
    this.name = "EngineFatalError";
    Object.setPrototypeOf(this, EngineFatalError.prototype);
  }
}

export class EngineDisposedError extends EngineError {
  constructor() {
    super(
      "Engine has been disposed and cannot accept requests",
      "ENGINE_DISPOSED"
    );
    this.name = "EngineDisposedError";
    Object.setPrototypeOf(this, EngineDisposedError.prototype);
  }
}

export class EngineTimeoutError extends EngineError {
  constructor(timeoutMs: number) {
    super(
      `Engine operation timed out after ${timeoutMs}ms`,
      "ENGINE_TIMEOUT"
    );
    this.name = "EngineTimeoutError";
    Object.setPrototypeOf(this, EngineTimeoutError.prototype);
  }
}

// ---------------------------------------------------------------------------
// Engine Service Interface
// ---------------------------------------------------------------------------

export interface EngineService {
  /**
   * Current lifecycle state of the engine.
   */
  readonly state: EngineLifecycleState;

  /**
   * Returns the current lifecycle state.
   */
  getState(): EngineLifecycleState;

  /**
   * Initializes the engine worker and waits until the engine is in 'ready' state.
   */
  init(config?: Partial<EngineConfig>): Promise<void>;

  /**
   * Applies runtime engine configuration options.
   */
  setOptions(config: Partial<EngineConfig>): Promise<void>;

  /**
   * Dispatches a new game signal to the engine.
   */
  notifyNewGame(): Promise<void>;

  /**
   * Starts a best-move search on the given position.
   */
  searchBestMove(options: EngineSearchOptions): Promise<EngineEvaluationResult>;

  /**
   * Immediately stops any in-progress search calculation and invalidates the active search token.
   */
  cancelSearch(): Promise<void>;

  /**
   * Resets or restarts the engine from an error or uninitialized state.
   */
  reset(config?: Partial<EngineConfig>): Promise<void>;

  /**
   * Disposes of the engine worker, aborts pending operations, and cleans up all listeners.
   */
  dispose(): void;

  /**
   * Subscribes to engine lifecycle state changes.
   * Returns an unsubscribe function.
   */
  onStateChange(listener: (state: EngineLifecycleState) => void): () => void;

  /**
   * Subscribes to real-time search evaluation info updates.
   * Returns an unsubscribe function.
   */
  onEvaluationInfo(listener: (info: EngineSearchInfo) => void): () => void;
}
