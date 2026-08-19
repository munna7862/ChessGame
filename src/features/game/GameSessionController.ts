import { createChessAdapter } from "../../domain/chess/adapters/chessJsAdapter";
import type { ChessDomainError, Result } from "../../domain/chess/errors";
import type { PgnTags } from "../../domain/chess/pgn";
import type { ChessGame } from "../../domain/chess/ports";
import type {
  Color,
  GameStatus,
  Move,
  MoveInput,
  Piece,
  PieceType,
  Position,
  Square,
} from "../../domain/chess/types";
import type {
  CapturedPieces,
  GameMode,
  GameSessionConfig,
  GameSessionState,
  IGameSessionController,
  PlayerConfig,
} from "./types";
import type { TimeControl } from "../../domain/clock/types";
import type {
  PersistedActiveGame,
  PersistedClockState,
} from "../../domain/persistence/schema";

export const DEFAULT_WHITE_PLAYER: PlayerConfig = Object.freeze({
  id: "player-white",
  name: "White",
  color: "w",
  type: "human",
});

export const DEFAULT_BLACK_PLAYER: PlayerConfig = Object.freeze({
  id: "player-black",
  name: "Black",
  color: "b",
  type: "human",
});

/**
 * Derives captured pieces accurately from the complete authoritative move history.
 */
export function deriveCapturedPieces(history: readonly Move[]): CapturedPieces {
  const white: PieceType[] = [];
  const black: PieceType[] = [];

  for (const move of history) {
    if (move.captured) {
      if (move.piece.color === "w") {
        white.push(move.captured.type);
      } else {
        black.push(move.captured.type);
      }
    }
  }

  return {
    white: Object.freeze(white),
    black: Object.freeze(black),
  };
}

let sessionCounter = 0;
function generateSessionId(): string {
  sessionCounter += 1;
  return `game-session-${Date.now()}-${sessionCounter}`;
}

/**
 * Authoritative controller managing the lifecycle, moves, status, and state distribution
 * of an active chess game session.
 */
export class GameSessionController implements IGameSessionController {
  private readonly chessGame: ChessGame;
  private readonly facadeGame: ChessGame;
  private id: string;
  private mode: GameMode;
  private players: {
    w: PlayerConfig;
    b: PlayerConfig;
  };
  private timeControl?: TimeControl | undefined;
  private startedAt: number;
  private cachedState: GameSessionState | null = null;
  private readonly listeners: Set<(state: GameSessionState) => void> =
    new Set();

  constructor(config?: GameSessionConfig, chessGame?: ChessGame) {
    this.chessGame = chessGame ?? createChessAdapter(config?.initialFen);
    this.id = config?.id ?? generateSessionId();
    this.mode = config?.mode ?? "human_vs_human";
    this.players = {
      w: config?.players?.w ?? { ...DEFAULT_WHITE_PLAYER },
      b: config?.players?.b ?? { ...DEFAULT_BLACK_PLAYER },
    };
    this.timeControl = config?.timeControl;
    this.startedAt = Date.now();

    this.facadeGame = {
      getPosition: () => this.chessGame.getPosition(),
      getPiece: (sq) => this.chessGame.getPiece(sq),
      getLegalMoves: (sq) => this.chessGame.getLegalMoves(sq),
      isLegalMove: (m) => this.chessGame.isLegalMove(m),
      makeMove: (m) => this.makeMove(m),
      undo: () => this.undo(),
      loadFen: (fen) => this.loadFen(fen),
      exportFen: () => this.exportFen(),
      importPgn: (pgn) => {
        const res = this.chessGame.importPgn(pgn);
        if (res.success) {
          this.notifyListeners();
        }
        return res;
      },
      exportPgn: (tags) => this.exportPgn(tags),
      getStatus: () => this.getStatus(),
      resign: (player) => this.resign(player),
      timeout: (player) => this.timeout(player),
      agreeDraw: () => this.agreeDraw(),
      getHistory: () => this.getHistory(),
      reset: () => this.reset(),
    };
  }

  /**
   * Returns a complete, immutable snapshot of the current session state.
   */
  public getState(): GameSessionState {
    if (!this.cachedState) {
      const position = this.chessGame.getPosition();
      const status = this.chessGame.getStatus();
      const moveHistory = Object.freeze(this.chessGame.getHistory());
      const capturedPieces = deriveCapturedPieces(moveHistory);

      this.cachedState = Object.freeze({
        id: this.id,
        mode: this.mode,
        players: {
          w: { ...this.players.w },
          b: { ...this.players.b },
        },
        position,
        turn: position.turn,
        status,
        moveHistory,
        capturedPieces,
        startedAt: this.startedAt,
        isGameOver: status.isOver,
        isCheck: status.isCheck,
        isCheckmate: status.state === "checkmate",
        timeControl: this.timeControl,
      });
    }

    return this.cachedState;
  }

  /**
   * Subscribes a listener callback to state updates.
   * Returns an unsubscribe function.
   */
  public subscribe(listener: (state: GameSessionState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.cachedState = null;
    const currentState = this.getState();
    for (const listener of this.listeners) {
      try {
        listener(currentState);
      } catch (err) {
        console.error("Error in GameSessionController listener:", err);
      }
    }
  }

  /**
   * Dispatches a move to the domain.
   */
  public makeMove(move: MoveInput): Result<Move, ChessDomainError> {
    const status = this.chessGame.getStatus();
    if (status.isOver) {
      return {
        success: false,
        error: {
          code: "GAME_ALREADY_OVER",
          message: `Cannot execute move: Game has concluded with status '${status.state}'.`,
        },
      };
    }

    const result = this.chessGame.makeMove(move);
    if (result.success) {
      this.notifyListeners();
    }
    return result;
  }

  /**
   * Undoes the last move played.
   */
  public undo(): Result<Move, ChessDomainError> {
    const result = this.chessGame.undo();
    if (result.success) {
      this.notifyListeners();
    }
    return result;
  }

  /**
   * Resets the game session cleanly.
   */
  public reset(config?: Partial<GameSessionConfig>): void {
    if (config?.initialFen) {
      this.chessGame.loadFen(config.initialFen);
    } else {
      this.chessGame.reset();
    }

    this.id = config?.id ?? generateSessionId();
    this.mode = config?.mode ?? this.mode;
    if (config?.players?.w) {
      this.players.w = { ...config.players.w };
    }
    if (config?.players?.b) {
      this.players.b = { ...config.players.b };
    }
    if (config?.timeControl !== undefined) {
      this.timeControl = config.timeControl;
    }
    this.startedAt = Date.now();
    this.notifyListeners();
  }

  /**
   * Restores a complete active game session snapshot.
   */
  public restoreSession(
    snapshot: PersistedActiveGame
  ): Result<void, ChessDomainError> {
    let replaySuccess = false;
    if (snapshot.moveHistorySan && snapshot.moveHistorySan.length > 0) {
      try {
        const tempAdapter = createChessAdapter();
        const pgnStr = snapshot.moveHistorySan.join(" ");
        const importRes = tempAdapter.importPgn(pgnStr);
        if (importRes.success && tempAdapter.exportFen() === snapshot.fen) {
          this.chessGame.reset();
          this.chessGame.importPgn(pgnStr);
          replaySuccess = true;
        }
      } catch {
        replaySuccess = false;
      }
    }

    if (!replaySuccess) {
      const loadRes = this.chessGame.loadFen(snapshot.fen);
      if (!loadRes.success) {
        return loadRes;
      }
    }

    this.id = snapshot.id;
    this.mode = snapshot.mode;
    this.players = {
      w: {
        id: snapshot.players.w.id,
        name: snapshot.players.w.name,
        color: "w",
        type: snapshot.players.w.type,
        rating: snapshot.players.w.rating,
        difficulty: snapshot.players.w.difficulty,
      },
      b: {
        id: snapshot.players.b.id,
        name: snapshot.players.b.name,
        color: "b",
        type: snapshot.players.b.type,
        rating: snapshot.players.b.rating,
        difficulty: snapshot.players.b.difficulty,
      },
    };
    if (snapshot.clock?.timeControl) {
      const tc = snapshot.clock.timeControl;
      this.timeControl = {
        type: tc.type,
        initialMs: tc.initialMs,
        incrementMs: tc.incrementMs,
        ...(tc.label !== undefined ? { label: tc.label } : {}),
      };
    }
    this.startedAt = snapshot.startedAt;
    this.notifyListeners();
    return { success: true, data: undefined };
  }

  /**
   * Generates a persistent snapshot of the current active session.
   */
  public toSnapshot(
    userOrientation: "w" | "b",
    clockState?: PersistedClockState
  ): PersistedActiveGame {
    const state = this.getState();
    return {
      id: this.id,
      mode: this.mode,
      fen: state.position.fen,
      moveHistorySan: state.moveHistory.map((m) => m.san),
      players: {
        w: { ...this.players.w },
        b: { ...this.players.b },
      },
      clock: clockState,
      userOrientation,
      startedAt: this.startedAt,
      updatedAt: Date.now(),
    };
  }

  /**
   * Updates game mode and player types in-place without resetting board position or history.
   */
  public updateGameMode(
    mode: GameMode,
    players?: { w?: PlayerConfig; b?: PlayerConfig }
  ): void {
    this.mode = mode;
    if (players?.w) {
      this.players.w = { ...players.w };
    }
    if (players?.b) {
      this.players.b = { ...players.b };
    }
    this.notifyListeners();
  }

  /**
   * Player resignation.
   */
  public resign(player: Color): Result<GameStatus, ChessDomainError> {
    const result = this.chessGame.resign(player);
    if (result.success) {
      this.notifyListeners();
    }
    return result;
  }

  /**
   * Clock timeout / flag fall.
   */
  public timeout(player: Color): Result<GameStatus, ChessDomainError> {
    const result = this.chessGame.timeout(player);
    if (result.success) {
      this.notifyListeners();
    }
    return result;
  }

  /**
   * Mutual draw agreement.
   */
  public agreeDraw(): Result<GameStatus, ChessDomainError> {
    const result = this.chessGame.agreeDraw();
    if (result.success) {
      this.notifyListeners();
    }
    return result;
  }

  /**
   * Load custom FEN position.
   */
  public loadFen(fen: string): Result<void, ChessDomainError> {
    const result = this.chessGame.loadFen(fen);
    if (result.success) {
      this.startedAt = Date.now();
      this.notifyListeners();
    }
    return result;
  }

  /**
   * Export current FEN position.
   */
  public exportFen(): string {
    return this.chessGame.exportFen();
  }

  /**
   * Export PGN with optional tags.
   */
  public exportPgn(tags?: Partial<PgnTags>): string {
    const defaultTags: Partial<PgnTags> = {
      White: this.players.w.name,
      Black: this.players.b.name,
      ...tags,
    };
    return this.chessGame.exportPgn(defaultTags);
  }

  public getLegalMoves(square?: Square): Move[] {
    return this.chessGame.getLegalMoves(square);
  }

  public isLegalMove(move: MoveInput): boolean {
    return this.chessGame.isLegalMove(move);
  }

  public getPiece(square: Square): Piece | null {
    return this.chessGame.getPiece(square);
  }

  public getPosition(): Position {
    return this.chessGame.getPosition();
  }

  public getStatus(): GameStatus {
    return this.chessGame.getStatus();
  }

  public getHistory(): Move[] {
    return this.chessGame.getHistory();
  }

  public getCapturedPieces(): CapturedPieces {
    return deriveCapturedPieces(this.chessGame.getHistory());
  }

  public getChessGame(): ChessGame {
    return this.facadeGame;
  }
}

/**
 * Factory helper to create a GameSessionController instance.
 */
export function createGameSession(
  config?: GameSessionConfig,
  chessGame?: ChessGame
): GameSessionController {
  return new GameSessionController(config, chessGame);
}
