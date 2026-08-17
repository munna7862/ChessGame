import React from "react";
import clsx from "clsx";
import type { Piece as PieceModel } from "../../domain/chess/types";
import { PIECE_SVG_MAP } from "./assets/pieceSvgMap";
import {
  getPieceAriaLabel,
  getPieceCode,
  getPieceUnicode,
  isValidPiece,
} from "./pieceUtils";
import "./Piece.css";

export interface PieceProps {
  readonly piece: PieceModel;
  readonly ariaLabel?: string | undefined;
  readonly className?: string | undefined;
  readonly style?: React.CSSProperties | undefined;
  readonly draggable?: boolean | undefined;
  readonly dataTestId?: string | undefined;
  readonly onDragStart?: ((e: React.DragEvent) => void) | undefined;
}

export const Piece: React.FC<PieceProps> = ({
  piece,
  ariaLabel,
  className,
  style,
  draggable = false,
  dataTestId,
  onDragStart,
}) => {
  if (!isValidPiece(piece)) {
    const rawType = (piece as Record<string, unknown>)?.["type"] ?? "?";
    const rawColor = (piece as Record<string, unknown>)?.["color"] ?? "?";
    const fallbackLabel =
      ariaLabel ?? `Unknown piece (${String(rawColor)} ${String(rawType)})`;

    return (
      <div
        role="img"
        aria-label={fallbackLabel}
        data-testid={dataTestId ?? "piece-unknown"}
        data-fallback="true"
        className={clsx("chess-piece", "chess-piece-fallback", className)}
        style={style}
      >
        <span className="fallback-symbol">?</span>
      </div>
    );
  }

  const SvgComponent = PIECE_SVG_MAP[piece.color]?.[piece.type];
  const pieceCode = getPieceCode(piece);
  const resolvedAriaLabel = ariaLabel ?? getPieceAriaLabel(piece);
  const testId = dataTestId ?? `piece-${pieceCode}`;

  if (!SvgComponent) {
    const unicode = getPieceUnicode(piece);
    return (
      <div
        role="img"
        aria-label={resolvedAriaLabel}
        data-testid={testId}
        data-piece-color={piece.color}
        data-piece-type={piece.type}
        data-fallback="true"
        className={clsx(
          "chess-piece",
          "chess-piece-fallback",
          `piece-color-${piece.color}`,
          `piece-type-${piece.type}`,
          className
        )}
        style={style}
      >
        <span className="fallback-symbol">{unicode}</span>
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={resolvedAriaLabel}
      data-testid={testId}
      data-piece-color={piece.color}
      data-piece-type={piece.type}
      data-piece-code={pieceCode}
      draggable={draggable}
      onDragStart={onDragStart}
      className={clsx(
        "chess-piece",
        `piece-${pieceCode}`,
        `piece-color-${piece.color}`,
        `piece-type-${piece.type}`,
        {
          "is-draggable": draggable,
        },
        className
      )}
      style={style}
    >
      <SvgComponent className="chess-piece-svg" />
    </div>
  );
};

export default Piece;
