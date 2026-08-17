import type { ChessDomainError, Result } from "./errors";
import type { PgnTags } from "./pgn";
import type {
  Color,
  GameStatus,
  Move,
  MoveInput,
  Piece,
  Position,
  Square,
} from "./types";

/**
 * Authoritative interface for interacting with a chess game session.
 * Decouples domain consumers (services, coordinators, UI) from specific engine/adapter implementations.
 */
export interface ChessGame {
  /**
   * Returns the complete immutable current board position.
   */
  getPosition(): Position;

  /**
   * Returns piece located at square, or null if empty.
   */
  getPiece(square: Square): Piece | null;

  /**
   * Returns all legal moves available for the current player,
   * optionally filtered by the starting square.
   */
  getLegalMoves(square?: Square): Move[];

  /**
   * Checks whether a proposed move is legal without mutating board state.
   */
  isLegalMove(move: MoveInput): boolean;

  /**
   * Executes a legal move, mutating the domain game state.
   * Returns the executed Move or a structured ChessDomainError.
   */
  makeMove(move: MoveInput): Result<Move, ChessDomainError>;

  /**
   * Undoes the last move played, reverting board position and clocks.
   */
  undo(): Result<Move, ChessDomainError>;

  /**
   * Loads a position from a FEN string.
   */
  loadFen(fen: string): Result<void, ChessDomainError>;

  /**
   * Exports the current position as a FEN string.
   */
  exportFen(): string;

  /**
   * Imports and replays a game from PGN string text.
   */
  importPgn(pgn: string): Result<void, ChessDomainError>;

  /**
   * Exports the entire played game as a PGN string, optionally merging custom tags.
   */
  exportPgn(tags?: Partial<PgnTags>): string;

  /**
   * Returns the authoritative game status (active, checkmate, draw reason, etc.).
   */
  getStatus(): GameStatus;

  /**
   * Records a player's resignation, concluding the game session immediately.
   * Returns the updated GameStatus or an error if the game is already over.
   */
  resign(player: Color): Result<GameStatus, ChessDomainError>;

  /**
   * Records a player's clock timeout / flag fall, concluding the game session immediately.
   * Returns the updated GameStatus or an error if the game is already over.
   */
  timeout(player: Color): Result<GameStatus, ChessDomainError>;

  /**
   * Records a mutual draw agreed by both players, concluding the game session.
   * Returns the updated GameStatus or an error if the game is already over.
   */
  agreeDraw(): Result<GameStatus, ChessDomainError>;

  /**
   * Returns the sequential list of moves made in this game session.
   */
  getHistory(): Move[];

  /**
   * Resets the game to the standard starting position.
   */
  reset(): void;
}

/**
 * Adapter port contract for underlying chess calculation engines / libraries.
 */
export type ChessAdapterPort = ChessGame;
