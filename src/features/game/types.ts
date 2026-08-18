import { z } from "zod";
import type {
  Color,
  PieceType,
  Square,
  Piece,
  Position,
  GameStatus,
  Move,
  MoveInput,
} from "../../domain/chess/types";
import type { ChessGame } from "../../domain/chess/ports";
import type { ChessDomainError, Result } from "../../domain/chess/errors";
import type { PgnTags } from "../../domain/chess/pgn";

export const PlayerTypeSchema = z.enum(["human", "engine"]);
export type PlayerType = z.infer<typeof PlayerTypeSchema>;

export const GameModeSchema = z.enum(["human_vs_human", "human_vs_engine"]);
export type GameMode = z.infer<typeof GameModeSchema>;

export const PlayerColorChoiceSchema = z.enum(["w", "b", "random"]);
export type PlayerColorChoice = z.infer<typeof PlayerColorChoiceSchema>;

export const PlayerConfigSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(32),
  color: z.enum(["w", "b"]),
  type: PlayerTypeSchema,
  rating: z.number().optional(),
});
export type PlayerConfig = z.infer<typeof PlayerConfigSchema>;

export interface NewGameConfigOptions {
  readonly mode: GameMode;
  readonly player1Name: string;
  readonly player2Name: string;
  readonly player1Color: PlayerColorChoice;
  readonly player1Rating?: number | undefined;
  readonly player2Rating?: number | undefined;
  readonly initialFen?: string | undefined;
}

export interface ResolvedNewGameSession {
  readonly config: GameSessionConfig;
  readonly userOrientation: "w" | "b";
}

/**
 * Resolves user-facing new game options into a valid authoritative GameSessionConfig.
 */
export function resolveNewGameSession(
  options: NewGameConfigOptions,
  randomResolver: () => number = Math.random
): ResolvedNewGameSession {
  const p1Name = options.player1Name.trim() || "Player 1";
  const defaultP2Name =
    options.mode === "human_vs_engine" ? "Stockfish" : "Player 2";
  const p2Name = options.player2Name.trim() || defaultP2Name;

  let p1AssignedColor: "w" | "b";
  if (options.player1Color === "random") {
    p1AssignedColor = randomResolver() >= 0.5 ? "w" : "b";
  } else {
    p1AssignedColor = options.player1Color;
  }

  const whitePlayer: PlayerConfig =
    p1AssignedColor === "w"
      ? {
          id: "player-w",
          name: p1Name,
          color: "w",
          type: "human",
          rating: options.player1Rating,
        }
      : {
          id: "player-w",
          name: p2Name,
          color: "w",
          type: options.mode === "human_vs_engine" ? "engine" : "human",
          rating: options.player2Rating,
        };

  const blackPlayer: PlayerConfig =
    p1AssignedColor === "b"
      ? {
          id: "player-b",
          name: p1Name,
          color: "b",
          type: "human",
          rating: options.player1Rating,
        }
      : {
          id: "player-b",
          name: p2Name,
          color: "b",
          type: options.mode === "human_vs_engine" ? "engine" : "human",
          rating: options.player2Rating,
        };

  return {
    config: {
      mode: options.mode,
      players: {
        w: whitePlayer,
        b: blackPlayer,
      },
      initialFen: options.initialFen?.trim() || undefined,
    },
    userOrientation: p1AssignedColor,
  };
}

export interface CapturedPieces {
  /** Pieces captured by White (i.e. Black pieces captured and removed from board) */
  readonly white: readonly PieceType[];
  /** Pieces captured by Black (i.e. White pieces captured and removed from board) */
  readonly black: readonly PieceType[];
}

export interface GameSessionConfig {
  readonly id?: string | undefined;
  readonly mode?: GameMode | undefined;
  readonly players?:
    | {
        readonly w: PlayerConfig;
        readonly b: PlayerConfig;
      }
    | undefined;
  readonly initialFen?: string | undefined;
}

export interface GameSessionState {
  readonly id: string;
  readonly mode: GameMode;
  readonly players: {
    readonly w: PlayerConfig;
    readonly b: PlayerConfig;
  };
  readonly position: Position;
  readonly turn: Color;
  readonly status: GameStatus;
  readonly moveHistory: readonly Move[];
  readonly capturedPieces: CapturedPieces;
  readonly startedAt: number;
  readonly isGameOver: boolean;
  readonly isCheck: boolean;
  readonly isCheckmate: boolean;
}

export interface IGameSessionController {
  getState(): GameSessionState;
  subscribe(listener: (state: GameSessionState) => void): () => void;
  makeMove(move: MoveInput): Result<Move, ChessDomainError>;
  undo(): Result<Move, ChessDomainError>;
  reset(config?: Partial<GameSessionConfig>): void;
  resign(player: Color): Result<GameStatus, ChessDomainError>;
  timeout(player: Color): Result<GameStatus, ChessDomainError>;
  agreeDraw(): Result<GameStatus, ChessDomainError>;
  loadFen(fen: string): Result<void, ChessDomainError>;
  exportFen(): string;
  exportPgn(tags?: Partial<PgnTags>): string;
  getLegalMoves(square?: Square): Move[];
  isLegalMove(move: MoveInput): boolean;
  getPiece(square: Square): Piece | null;
  getPosition(): Position;
  getStatus(): GameStatus;
  getHistory(): Move[];
  getCapturedPieces(): CapturedPieces;
  getChessGame(): ChessGame;
}
