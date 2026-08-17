import type { Piece, PieceType, Color } from "../../domain/chess/types";

const COLOR_NAMES: Record<Color, string> = {
  w: "White",
  b: "Black",
};

const PIECE_NAMES: Record<PieceType, string> = {
  p: "Pawn",
  n: "Knight",
  b: "Bishop",
  r: "Rook",
  q: "Queen",
  k: "King",
};

const PIECE_UNICODE: Record<Color, Record<PieceType, string>> = {
  w: {
    p: "♙",
    n: "♘",
    b: "♗",
    r: "♖",
    q: "♕",
    k: "♔",
  },
  b: {
    p: "♟",
    n: "♞",
    b: "♝",
    r: "♜",
    q: "♛",
    k: "♚",
  },
};

/**
 * Return human-readable accessible label for a chess piece (e.g. "White King").
 */
export function getPieceAriaLabel(piece: Piece): string {
  const colorName = COLOR_NAMES[piece.color] ?? piece.color;
  const pieceName = PIECE_NAMES[piece.type] ?? piece.type;
  return `${colorName} ${pieceName}`;
}

/**
 * Return 2-character piece code (e.g. "wp", "bk").
 */
export function getPieceCode(piece: Piece): string {
  return `${piece.color}${piece.type}`;
}

/**
 * Return Unicode symbol for a chess piece.
 */
export function getPieceUnicode(piece: Piece): string {
  return PIECE_UNICODE[piece.color]?.[piece.type] ?? piece.type;
}

/**
 * Type guard to check if a value is a valid Piece object.
 */
export function isValidPiece(value: unknown): value is Piece {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const validColors: Color[] = ["w", "b"];
  const validTypes: PieceType[] = ["p", "n", "b", "r", "q", "k"];

  return (
    validColors.includes(candidate["color"] as Color) &&
    validTypes.includes(candidate["type"] as PieceType)
  );
}
