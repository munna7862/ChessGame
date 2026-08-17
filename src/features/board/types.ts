import type React from "react";
import type {
  Square,
  FileSymbol,
  RankSymbol,
  Color,
  Piece,
  BoardMatrix,
  Position,
} from "../../domain/chess/types";

/**
 * Board orientation perspective ('w' for White at bottom, 'b' for Black at bottom).
 */
export type BoardOrientation = Color;

/**
 * Square color parity.
 */
export type SquareColor = "light" | "dark";

/**
 * Computed metadata for a board square on the screen grid.
 */
export interface BoardSquareData {
  readonly square: Square;
  readonly file: FileSymbol;
  readonly rank: RankSymbol;
  readonly fileIndex: number; // 0 (a) to 7 (h)
  readonly rankIndex: number; // 0 (1) to 7 (8)
  readonly row: number; // 0 (top) to 7 (bottom) in DOM grid
  readonly col: number; // 0 (left) to 7 (right) in DOM grid
  readonly color: SquareColor;
  readonly piece?: Piece | null | undefined;
}

/**
 * Props for an individual Square component.
 */
export interface SquareProps {
  readonly square: Square;
  readonly piece?: Piece | null | undefined;
  readonly color?: SquareColor | undefined;
  readonly orientation?: BoardOrientation | undefined;
  readonly isSelected?: boolean | undefined;
  readonly isLastMove?: boolean | undefined;
  readonly isLegalTarget?: boolean | undefined;
  readonly isCheck?: boolean | undefined;
  readonly disabled?: boolean | undefined;
  readonly children?: React.ReactNode | undefined;
  readonly onClick?: ((square: Square) => void) | undefined;
  readonly onKeyDown?:
    ((event: React.KeyboardEvent, square: Square) => void) | undefined;
  readonly className?: string | undefined;
  readonly ariaLabel?: string | undefined;
}

/**
 * Custom square render function signature.
 */
export type SquareRenderer = (data: BoardSquareData) => React.ReactNode;

/**
 * Custom piece render function signature.
 */
export type PieceRenderer = (piece: Piece, square: Square) => React.ReactNode;

/**
 * Props for the full Board component.
 */
export interface BoardProps {
  readonly orientation?: BoardOrientation | undefined;
  readonly board?: BoardMatrix | null | undefined;
  readonly position?: Position | null | undefined;
  readonly pieces?:
    Partial<Record<Square, Piece>> | Map<Square, Piece> | null | undefined;
  readonly showCoordinates?: boolean | undefined;
  readonly onSquareClick?: ((square: Square) => void) | undefined;
  readonly renderSquare?: SquareRenderer | undefined;
  readonly renderPiece?: PieceRenderer | undefined;
  readonly className?: string | undefined;
  readonly ariaLabel?: string | undefined;
}
