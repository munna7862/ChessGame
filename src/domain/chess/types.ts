import { z } from "zod";

/**
 * All 64 standard algebraic square notations (a1 through h8).
 */
export const SQUARES = [
  "a8",
  "b8",
  "c8",
  "d8",
  "e8",
  "f8",
  "g8",
  "h8",
  "a7",
  "b7",
  "c7",
  "d7",
  "e7",
  "f7",
  "g7",
  "h7",
  "a6",
  "b6",
  "c6",
  "d6",
  "e6",
  "f6",
  "g6",
  "h6",
  "a5",
  "b5",
  "c5",
  "d5",
  "e5",
  "f5",
  "g5",
  "h5",
  "a4",
  "b4",
  "c4",
  "d4",
  "e4",
  "f4",
  "g4",
  "h4",
  "a3",
  "b3",
  "c3",
  "d3",
  "e3",
  "f3",
  "g3",
  "h3",
  "a2",
  "b2",
  "c2",
  "d2",
  "e2",
  "f2",
  "g2",
  "h2",
  "a1",
  "b1",
  "c1",
  "d1",
  "e1",
  "f1",
  "g1",
  "h1",
] as const;

export type Square = (typeof SQUARES)[number];

export const SquareSchema = z.enum(SQUARES);

export const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
export type FileSymbol = (typeof FILES)[number];

export const RANKS = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;
export type RankSymbol = (typeof RANKS)[number];

/**
 * Standard chess player color: 'w' (White) or 'b' (Black).
 */
export const COLORS = ["w", "b"] as const;
export type Color = (typeof COLORS)[number];
export const ColorSchema = z.enum(COLORS);

export const oppositeColor = (color: Color): Color =>
  color === "w" ? "b" : "w";

/**
 * Standard FIDE piece types:
 * 'p' - Pawn
 * 'n' - Knight
 * 'b' - Bishop
 * 'r' - Rook
 * 'q' - Queen
 * 'k' - King
 */
export const PIECE_TYPES = ["p", "n", "b", "r", "q", "k"] as const;
export type PieceType = (typeof PIECE_TYPES)[number];
export const PieceTypeSchema = z.enum(PIECE_TYPES);

/**
 * Pieces eligible for pawn promotion.
 */
export const PROMOTION_PIECE_TYPES = ["q", "r", "b", "n"] as const;
export type PromotionPieceType = (typeof PROMOTION_PIECE_TYPES)[number];
export const PromotionPieceTypeSchema = z.enum(PROMOTION_PIECE_TYPES);

/**
 * Domain piece representation.
 */
export const PieceSchema = z.object({
  type: PieceTypeSchema,
  color: ColorSchema,
});
export type Piece = z.infer<typeof PieceSchema>;

/**
 * Input format for requesting a move.
 */
export const MoveInputSchema = z.object({
  from: SquareSchema,
  to: SquareSchema,
  promotion: PromotionPieceTypeSchema.optional(),
});
export type MoveInput = z.infer<typeof MoveInputSchema>;

/**
 * Semantic chess move with full metadata.
 */
export const MoveSchema = z.object({
  from: SquareSchema,
  to: SquareSchema,
  piece: PieceSchema,
  promotion: PromotionPieceTypeSchema.optional(),
  captured: PieceSchema.optional(),
  san: z.string(),
  lan: z.string(),
  isEnPassant: z.boolean().optional(),
  isCastling: z.enum(["kingside", "queenside"]).optional(),
  isCheck: z.boolean().optional(),
  isCheckmate: z.boolean().optional(),
  beforeFen: z.string(),
  afterFen: z.string(),
});
export type Move = z.infer<typeof MoveSchema>;

/**
 * Castling availability rights.
 */
export interface CastlingRights {
  readonly kingside: boolean;
  readonly queenside: boolean;
}

export interface PlayerCastlingRights {
  readonly w: CastlingRights;
  readonly b: CastlingRights;
}

/**
 * 8x8 Board Matrix: Rank 8 (index 0) down to Rank 1 (index 7), File a (index 0) to File h (index 7).
 */
export type BoardMatrix = ReadonlyArray<ReadonlyArray<Piece | null>>;

/**
 * Complete immutable position snapshot.
 */
export interface Position {
  readonly board: BoardMatrix;
  readonly turn: Color;
  readonly castling: PlayerCastlingRights;
  readonly enPassantSquare: Square | null;
  readonly halfmoveClock: number;
  readonly fullmoveNumber: number;
  readonly isCheck: boolean;
  readonly fen: string;
}

/**
 * Possible game outcome states.
 */
export type GameState =
  | "active"
  | "checkmate"
  | "stalemate"
  | "draw_fifty_moves"
  | "draw_threefold_repetition"
  | "draw_insufficient_material"
  | "draw_agreement"
  | "resigned"
  | "timeout";

export type DrawReason =
  | "fifty_moves"
  | "threefold_repetition"
  | "insufficient_material"
  | "stalemate"
  | "agreement";

/**
 * Authoritative game status.
 */
export interface GameStatus {
  readonly state: GameState;
  readonly isOver: boolean;
  readonly winner: Color | null;
  readonly isCheck: boolean;
  readonly inDraw: boolean;
  readonly drawReason: DrawReason | null;
  readonly description: string;
}

/**
 * Coordinate translation helpers.
 */
export function isValidSquare(value: unknown): value is Square {
  return (
    typeof value === "string" && (SQUARES as readonly string[]).includes(value)
  );
}

export function fileRankToSquare(
  fileIdx: number,
  rankIdx: number
): Square | null {
  if (fileIdx < 0 || fileIdx > 7 || rankIdx < 0 || rankIdx > 7) {
    return null;
  }
  const file = FILES[fileIdx];
  const rank = RANKS[rankIdx];
  const candidate = `${file}${rank}` as Square;
  return isValidSquare(candidate) ? candidate : null;
}

export function squareToFileRank(square: Square): {
  file: number;
  rank: number;
} {
  const fileChar = square[0] as FileSymbol;
  const rankChar = square[1] as RankSymbol;
  return {
    file: FILES.indexOf(fileChar),
    rank: RANKS.indexOf(rankChar),
  };
}
