import type {
  EngineWorkerBridge,
  EngineWorkerMessageHandler,
  EngineWorkerErrorHandler,
} from "./workerBridge";
import type {
  EngineWorkerRequest,
  EngineWorkerResponse,
  EngineConfig,
} from "./types";
import {
  formatUci,
  formatIsReady,
  formatUciNewGame,
  formatSetOption,
  formatPosition,
  formatGo,
  formatStop,
  formatQuit,
  parseUciLine,
} from "./uciProtocol";

/**
 * Minimal WebWorker contract required by StockfishWorkerBridge.
 */
export interface IWorkerLike {
  postMessage(message: unknown): void;
  addEventListener(
    type: string,
    listener: (event: MessageEvent | ErrorEvent) => void
  ): void;
  removeEventListener(
    type: string,
    listener: (event: MessageEvent | ErrorEvent) => void
  ): void;
  terminate(): void;
}

/**
 * Factory creating default browser Worker loading vendored Stockfish WASM/JS.
 */
export function createDefaultStockfishWorker(): IWorkerLike {
  if (typeof Worker === "undefined") {
    throw new Error("WebWorker is not available in current environment");
  }

  // Use stockfish.js for self-contained execution without external binary fetch dependencies
  const scriptPath = "/vendor/stockfish/stockfish.js";

  return new Worker(scriptPath);
}

type HandshakeStage =
  | "UNINITIALIZED"
  | "WAITING_UCIOK"
  | "SETTING_OPTIONS"
  | "WAITING_READYOK"
  | "READY";

/**
 * Concrete EngineWorkerBridge wrapping Stockfish WASM/JS WebWorker with UCI protocol.
 */
export class StockfishWorkerBridge implements EngineWorkerBridge {
  private worker: IWorkerLike | null = null;
  private readonly workerFactory: () => IWorkerLike;
  private readonly messageHandlers = new Set<EngineWorkerMessageHandler>();
  private readonly errorHandlers = new Set<EngineWorkerErrorHandler>();
  private handshakeStage: HandshakeStage = "UNINITIALIZED";
  private pendingInitConfig: EngineConfig | null = null;
  private activeSearchToken: string | null = null;
  private cancelledSearchToken: string | null = null;

  private readonly boundOnMessage: (e: MessageEvent | ErrorEvent) => void;
  private readonly boundOnError: (e: MessageEvent | ErrorEvent) => void;
  private readonly boundOnMessageError: (e: MessageEvent | ErrorEvent) => void;

  constructor(workerOrFactory?: IWorkerLike | (() => IWorkerLike)) {
    if (typeof workerOrFactory === "function") {
      this.workerFactory = workerOrFactory;
    } else if (workerOrFactory) {
      this.workerFactory = () => workerOrFactory;
    } else {
      this.workerFactory = createDefaultStockfishWorker;
    }

    this.boundOnMessage = (e) => this.handleWorkerMessage(e as MessageEvent);
    this.boundOnError = (e) => this.handleWorkerError(e as ErrorEvent);
    this.boundOnMessageError = (e) => this.handleWorkerError(e as ErrorEvent);
  }

  public postMessage(request: EngineWorkerRequest): void {
    this.ensureWorker();

    switch (request.type) {
      case "INIT": {
        this.handshakeStage = "WAITING_UCIOK";
        this.pendingInitConfig = request.config
          ? {
              threads: request.config.threads ?? 1,
              hashSizeMb: request.config.hashSizeMb ?? 16,
              skillLevel: request.config.skillLevel ?? 10,
              ...(request.config.multiPv !== undefined
                ? { multiPv: request.config.multiPv }
                : {}),
            }
          : null;
        this.sendToWorker(formatUci());
        break;
      }

      case "SET_OPTION": {
        this.sendToWorker(formatSetOption(request.name, request.value));
        break;
      }

      case "NEW_GAME": {
        this.sendToWorker(formatUciNewGame());
        this.sendToWorker(formatIsReady());
        break;
      }

      case "SEARCH": {
        this.activeSearchToken = request.request.searchToken;
        if (request.request.skillLevel !== undefined) {
          this.sendToWorker(
            formatSetOption("Skill Level", request.request.skillLevel)
          );
        }
        this.sendToWorker(formatPosition(request.request.fen));
        this.sendToWorker(
          formatGo({
            ...(request.request.depth !== undefined
              ? { depth: request.request.depth }
              : {}),
            ...(request.request.movetimeMs !== undefined
              ? { movetimeMs: request.request.movetimeMs }
              : {}),
          })
        );
        break;
      }

      case "STOP": {
        const token = this.activeSearchToken ?? this.cancelledSearchToken ?? "";
        this.sendToWorker(formatStop());
        this.cancelledSearchToken = this.activeSearchToken;
        this.activeSearchToken = null;
        this.emitMessage({ type: "STOPPED", searchToken: token });
        break;
      }

      case "TERMINATE": {
        this.terminate();
        break;
      }
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
    if (this.worker) {
      try {
        this.sendToWorker(formatQuit());
      } catch {
        // Worker may already be terminated
      }
      this.worker.removeEventListener("message", this.boundOnMessage);
      this.worker.removeEventListener("error", this.boundOnError);
      this.worker.removeEventListener("messageerror", this.boundOnMessageError);
      this.worker.terminate();
      this.worker = null;
    }
    this.handshakeStage = "UNINITIALIZED";
    this.activeSearchToken = null;
    this.cancelledSearchToken = null;
  }

  // ---------------------------------------------------------------------------
  // Internal Worker Communication & UCI Parsing
  // ---------------------------------------------------------------------------

  private ensureWorker(): void {
    if (!this.worker) {
      this.worker = this.workerFactory();
      this.worker.addEventListener("message", this.boundOnMessage);
      this.worker.addEventListener("error", this.boundOnError);
      this.worker.addEventListener("messageerror", this.boundOnMessageError);
    }
  }

  private sendToWorker(command: string): void {
    if (!this.worker) {
      throw new Error("Worker is not initialized");
    }
    const cleanCommand = command.trim();
    if (cleanCommand) {
      this.worker.postMessage(cleanCommand);
    }
  }

  private handleWorkerMessage(event: MessageEvent): void {
    const rawData = event.data;
    if (typeof rawData !== "string") {
      return;
    }

    // A single message from Stockfish could contain multiple lines separated by \n
    const lines = rawData.split(/\r?\n/);
    for (const line of lines) {
      const parsed = parseUciLine(line);
      if (!parsed) continue;

      this.handleParsedUciMessage(parsed);
    }
  }

  private handleParsedUciMessage(msg: ReturnType<typeof parseUciLine>): void {
    if (!msg) return;

    switch (msg.type) {
      case "UCIOK": {
        if (this.handshakeStage === "WAITING_UCIOK") {
          this.handshakeStage = "SETTING_OPTIONS";
          const cfg = this.pendingInitConfig;
          if (cfg?.threads && cfg.threads > 1) {
            this.sendToWorker(formatSetOption("Threads", cfg.threads));
          }
          if (cfg?.hashSizeMb !== undefined) {
            this.sendToWorker(formatSetOption("Hash", cfg.hashSizeMb));
          }
          if (cfg?.skillLevel !== undefined) {
            this.sendToWorker(formatSetOption("Skill Level", cfg.skillLevel));
          }
          if (cfg?.multiPv !== undefined) {
            this.sendToWorker(formatSetOption("MultiPV", cfg.multiPv));
          }
          this.handshakeStage = "WAITING_READYOK";
          this.sendToWorker(formatIsReady());
        }
        break;
      }

      case "READYOK": {
        this.handshakeStage = "READY";
        this.emitMessage({ type: "READY" });
        break;
      }

      case "INFO": {
        if (this.activeSearchToken) {
          this.emitMessage({
            type: "SEARCH_INFO",
            searchToken: this.activeSearchToken,
            depth: msg.depth ?? 0,
            ...(msg.scoreCp !== undefined ? { scoreCp: msg.scoreCp } : {}),
            ...(msg.mate !== undefined ? { mate: msg.mate } : {}),
            ...(msg.nodes !== undefined ? { nodes: msg.nodes } : {}),
            ...(msg.nps !== undefined ? { nps: msg.nps } : {}),
            ...(msg.timeMs !== undefined ? { timeMs: msg.timeMs } : {}),
            ...(msg.pv && msg.pv.length > 0 ? { pv: msg.pv } : {}),
          });
        }
        break;
      }

      case "BEST_MOVE": {
        if (this.activeSearchToken) {
          const token = this.activeSearchToken;
          this.activeSearchToken = null;
          this.emitMessage({
            type: "BEST_MOVE",
            searchToken: token,
            uciMove: msg.uciMove,
            ...(msg.ponderMove ? { ponderMove: msg.ponderMove } : {}),
          });
        } else if (this.cancelledSearchToken) {
          const token = this.cancelledSearchToken;
          this.cancelledSearchToken = null;
          this.emitMessage({
            type: "BEST_MOVE",
            searchToken: token,
            uciMove: msg.uciMove,
            ...(msg.ponderMove ? { ponderMove: msg.ponderMove } : {}),
          });
        }
        break;
      }

      case "IGNORED":
        break;
    }
  }

  private handleWorkerError(event: ErrorEvent): void {
    const errorMsg =
      event.message || "Stockfish worker encountered an unknown error";
    const error = new Error(errorMsg);

    for (const handler of this.errorHandlers) {
      handler(error);
    }

    this.emitMessage({
      type: "ERROR",
      message: errorMsg,
      fatal: true,
    });
  }

  private emitMessage(response: EngineWorkerResponse): void {
    for (const handler of this.messageHandlers) {
      handler(response);
    }
  }
}
