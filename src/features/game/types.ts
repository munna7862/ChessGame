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

export const PlayerConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.enum(["w", "b"]),
  type: PlayerTypeSchema,
  rating: z.number().optional(),
});
export type PlayerConfig = z.infer<typeof PlayerConfigSchema>;

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
