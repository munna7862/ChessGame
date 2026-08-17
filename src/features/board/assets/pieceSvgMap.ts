import type React from "react";
import type { PieceType, Color } from "../../../domain/chess/types";
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

export const PIECE_SVG_MAP: Record<
  Color,
  Record<PieceType, React.FC<PieceSvgProps>>
> = {
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
