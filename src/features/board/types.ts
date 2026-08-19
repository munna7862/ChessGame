import type React from "react";
import type {
  Square,
  FileSymbol,
  RankSymbol,
  Color,
  Piece,
  BoardMatrix,
  Position,
  Move,
  PromotionPieceType,
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
 * Legal target indicator type (quiet move vs capture/en-passant).
 */
export type LegalTargetType = "move" | "capture";

/**
 * State representing the most recently committed move on the board.
 */
export interface LastMoveState {
  readonly from: Square;
  readonly to: Square;
  readonly isCapture?: boolean | undefined;
  readonly san?: string | undefined;
}

/**
 * Pending promotion state awaiting user piece selection.
 */
export interface PendingPromotion {
  readonly from: Square;
  readonly to: Square;
  readonly color: Color;
}

/**
 * Metadata for a legal destination square.
 */
export interface LegalDestination {
  readonly square: Square;
  readonly targetType: LegalTargetType;
  readonly move?: Move | undefined;
}

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
  readonly isSelected?: boolean | undefined;
  readonly isLegalTarget?: boolean | undefined;
  readonly legalTargetType?: LegalTargetType | undefined;
  readonly isLastMove?: boolean | undefined;
  readonly isLastMoveFrom?: boolean | undefined;
  readonly isLastMoveTo?: boolean | undefined;
  readonly isCaptureEffect?: boolean | undefined;
  readonly isCheck?: boolean | undefined;
  readonly isCheckmate?: boolean | undefined;
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
  readonly isLastMoveFrom?: boolean | undefined;
  readonly isLastMoveTo?: boolean | undefined;
  readonly isCaptureEffect?: boolean | undefined;
  readonly isLegalTarget?: boolean | undefined;
  readonly legalTargetType?: LegalTargetType | undefined;
  readonly isCheck?: boolean | undefined;
  readonly isCheckmate?: boolean | undefined;
  readonly disabled?: boolean | undefined;
  readonly tabIndex?: number | undefined;
  readonly children?: React.ReactNode | undefined;
  readonly onClick?: ((square: Square) => void) | undefined;
  readonly onKeyDown?:
    ((event: React.KeyboardEvent, square: Square) => void) | undefined;
  readonly onFocus?: ((square: Square) => void) | undefined;
  readonly onBlur?: ((square: Square) => void) | undefined;
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
 * Props for the interactive PromotionDialog component.
 */
export interface PromotionDialogProps {
  readonly color: Color;
  readonly targetSquare?: Square | undefined;
  readonly orientation?: BoardOrientation | undefined;
  readonly onSelect: (pieceType: PromotionPieceType) => void;
  readonly onCancel: () => void;
  readonly disabled?: boolean | undefined;
  readonly className?: string | undefined;
}

/**
 * Props for the full Board component.
 */
export interface BoardProps {
  readonly orientation?: BoardOrientation | undefined;
  readonly board?: BoardMatrix | null | undefined;
  readonly position?: Position | null | undefined;
  readonly pieces?:
    Partial<Record<Square, Piece>> | Map<Square, Piece> | null | undefined;
  readonly selectedSquare?: Square | null | undefined;
  readonly focusedSquare?: Square | null | undefined;
  readonly legalDestinations?:
    | ReadonlyArray<Square | LegalDestination>
    | ReadonlyMap<Square, LegalDestination>
    | null
    | undefined;
  readonly lastMove?:
    LastMoveState | { from: Square; to: Square } | null | undefined;
  readonly checkSquare?: Square | null | undefined;
  readonly isCheckmate?: boolean | undefined;
  readonly pendingPromotion?: PendingPromotion | null | undefined;
  readonly onPromotionSelect?:
    ((pieceType: PromotionPieceType) => void) | undefined;
  readonly onPromotionCancel?: (() => void) | undefined;
  readonly disabled?: boolean | undefined;
  readonly showCoordinates?: boolean | undefined;
  readonly showLegalMoves?: boolean | undefined;
  readonly showLastMove?: boolean | undefined;
  readonly theme?: "classic" | "wood" | "slate" | "ocean" | undefined;
  readonly pieceSet?: "standard" | "classic" | "modern" | undefined;
  readonly reducedMotion?: boolean | undefined;
  readonly animateMoves?: boolean | undefined;
  readonly onSquareClick?: ((square: Square) => void) | undefined;
  readonly onSquareFocus?: ((square: Square) => void) | undefined;
  readonly onClearSelection?: (() => void) | undefined;
  readonly announcement?: string | null | undefined;
  readonly renderSquare?: SquareRenderer | undefined;
  readonly renderPiece?: PieceRenderer | undefined;
  readonly className?: string | undefined;
  readonly ariaLabel?: string | undefined;
}
