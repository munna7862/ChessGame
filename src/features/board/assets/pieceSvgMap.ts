import type React from "react";
import type { PieceType, Color } from "../../../domain/chess/types";
import type { PieceSet } from "../../../domain/persistence/schema";
import {
  WhitePawnSvg,
  WhiteKnightSvg,
  WhiteBishopSvg,
  WhiteRookSvg,
  WhiteQueenSvg,
  WhiteKingSvg,
  BlackPawnSvg,
  BlackKnightSvg,
  BlackBishopSvg,
  BlackRookSvg,
  BlackQueenSvg,
  BlackKingSvg,
  type PieceSvgProps,
} from "./pieceSvgs";
import {
  ClassicWhitePawnSvg,
  ClassicWhiteKnightSvg,
  ClassicWhiteBishopSvg,
  ClassicWhiteRookSvg,
  ClassicWhiteQueenSvg,
  ClassicWhiteKingSvg,
  ClassicBlackPawnSvg,
  ClassicBlackKnightSvg,
  ClassicBlackBishopSvg,
  ClassicBlackRookSvg,
  ClassicBlackQueenSvg,
  ClassicBlackKingSvg,
} from "./pieceSets/classicPieces";
import {
  ModernWhitePawnSvg,
  ModernWhiteKnightSvg,
  ModernWhiteBishopSvg,
  ModernWhiteRookSvg,
  ModernWhiteQueenSvg,
  ModernWhiteKingSvg,
  ModernBlackPawnSvg,
  ModernBlackKnightSvg,
  ModernBlackBishopSvg,
  ModernBlackRookSvg,
  ModernBlackQueenSvg,
  ModernBlackKingSvg,
} from "./pieceSets/modernPieces";

export type PieceSvgMap = Record<
  Color,
  Record<PieceType, React.FC<PieceSvgProps>>
>;

export const STANDARD_PIECE_SVG_MAP: PieceSvgMap = {
  w: {
    p: WhitePawnSvg,
    n: WhiteKnightSvg,
    b: WhiteBishopSvg,
    r: WhiteRookSvg,
    q: WhiteQueenSvg,
    k: WhiteKingSvg,
  },
  b: {
    p: BlackPawnSvg,
    n: BlackKnightSvg,
    b: BlackBishopSvg,
    r: BlackRookSvg,
    q: BlackQueenSvg,
    k: BlackKingSvg,
  },
};

export const CLASSIC_PIECE_SVG_MAP: PieceSvgMap = {
  w: {
    p: ClassicWhitePawnSvg,
    n: ClassicWhiteKnightSvg,
    b: ClassicWhiteBishopSvg,
    r: ClassicWhiteRookSvg,
    q: ClassicWhiteQueenSvg,
    k: ClassicWhiteKingSvg,
  },
  b: {
    p: ClassicBlackPawnSvg,
    n: ClassicBlackKnightSvg,
    b: ClassicBlackBishopSvg,
    r: ClassicBlackRookSvg,
    q: ClassicBlackQueenSvg,
    k: ClassicBlackKingSvg,
  },
};

export const MODERN_PIECE_SVG_MAP: PieceSvgMap = {
  w: {
    p: ModernWhitePawnSvg,
    n: ModernWhiteKnightSvg,
    b: ModernWhiteBishopSvg,
    r: ModernWhiteRookSvg,
    q: ModernWhiteQueenSvg,
    k: ModernWhiteKingSvg,
  },
  b: {
    p: ModernBlackPawnSvg,
    n: ModernBlackKnightSvg,
    b: ModernBlackBishopSvg,
    r: ModernBlackRookSvg,
    q: ModernBlackQueenSvg,
    k: ModernBlackKingSvg,
  },
};

export const PIECE_SET_SVG_MAP: Record<PieceSet, PieceSvgMap> = {
  standard: STANDARD_PIECE_SVG_MAP,
  classic: CLASSIC_PIECE_SVG_MAP,
  modern: MODERN_PIECE_SVG_MAP,
};

/**
 * Backward-compatible default PIECE_SVG_MAP referencing standard set.
 */
export const PIECE_SVG_MAP = STANDARD_PIECE_SVG_MAP;

/**
 * Helper to retrieve a piece SVG component given color, piece type, and piece set.
 */
export function getPieceSvg(
  color: Color,
  type: PieceType,
  pieceSet: PieceSet = "standard"
): React.FC<PieceSvgProps> {
  const setMap = PIECE_SET_SVG_MAP[pieceSet] ?? STANDARD_PIECE_SVG_MAP;
  return setMap[color]?.[type] ?? STANDARD_PIECE_SVG_MAP[color]?.[type];
}
