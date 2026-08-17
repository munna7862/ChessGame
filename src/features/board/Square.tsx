import React from "react";
import clsx from "clsx";
import { squareToFileRank, FILES, RANKS } from "../../domain/chess/types";
import { getSquareColor } from "./coordinates";
import { Piece } from "./Piece";
import { getPieceAriaLabel } from "./pieceUtils";
import type { SquareProps } from "./types";

export const Square: React.FC<SquareProps> = ({
  square,
  piece,
  color,
  isSelected = false,
  isLastMove = false,
  isLastMoveFrom = false,
  isLastMoveTo = false,
  isCaptureEffect = false,
  isLegalTarget = false,
  legalTargetType = "move",
  isCheck = false,
  disabled = false,
  children,
  onClick,
  onKeyDown,
  className,
  ariaLabel,
}) => {
  const coords = squareToFileRank(square);
  const resolvedColor = color ?? getSquareColor(coords);
  const file = FILES[coords.file];
  const rank = RANKS[coords.rank];

  const effectiveLastMove = isLastMove || isLastMoveFrom || isLastMoveTo;
  const effectiveLastMoveFrom = isLastMoveFrom || (isLastMove && !isLastMoveTo);
  const effectiveLastMoveTo = isLastMoveTo || (isLastMove && !isLastMoveFrom);

  const lastMoveAttr = isLastMoveFrom
    ? "from"
    : isLastMoveTo
      ? "to"
      : effectiveLastMove
        ? "true"
        : undefined;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && onClick) {
      onClick(square);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    if (onKeyDown) {
      onKeyDown(e, square);
      return;
    }

    if ((e.key === "Enter" || e.key === " ") && onClick) {
      e.preventDefault();
      onClick(square);
    }
  };

  const pieceLabel = piece ? `, ${getPieceAriaLabel(piece)}` : "";
  const selectedLabel = isSelected ? ", selected" : "";
  const legalLabel = isLegalTarget
    ? legalTargetType === "capture"
      ? ", legal capture target"
      : ", legal move target"
    : "";
  const checkLabel = isCheck ? ", in check" : "";
  const lastMoveLabel = isLastMoveFrom
    ? ", last move origin"
    : isLastMoveTo
      ? ", last move destination"
      : effectiveLastMove
        ? ", last move"
        : "";
  const defaultAriaLabel = `Square ${square}, ${resolvedColor}${pieceLabel}${selectedLabel}${legalLabel}${checkLabel}${lastMoveLabel}`;

  return (
    <div
      role="gridcell"
      tabIndex={disabled ? -1 : 0}
      aria-label={ariaLabel ?? defaultAriaLabel}
      aria-selected={isSelected}
      aria-disabled={disabled}
      data-testid={`board-square-${square}`}
      data-square={square}
      data-file={file}
      data-rank={rank}
      data-square-color={resolvedColor}
      data-has-piece={Boolean(piece)}
      data-is-selected={isSelected ? "true" : undefined}
      data-is-legal-target={isLegalTarget ? "true" : undefined}
      data-target-type={isLegalTarget ? legalTargetType : undefined}
      data-is-check={isCheck ? "true" : undefined}
      data-is-last-move={lastMoveAttr}
      data-is-last-move-from={isLastMoveFrom ? "true" : undefined}
      data-is-last-move-to={isLastMoveTo ? "true" : undefined}
      data-is-capture-effect={isCaptureEffect ? "true" : undefined}
      className={clsx(
        "chess-square",
        `square-${resolvedColor}`,
        {
          "is-selected": isSelected,
          "is-last-move": effectiveLastMove,
          "is-last-move-from": effectiveLastMoveFrom,
          "is-last-move-to": effectiveLastMoveTo,
          "is-capture-effect": isCaptureEffect,
          "is-legal-target": isLegalTarget,
          "is-capture-target": isLegalTarget && legalTargetType === "capture",
          "is-check": isCheck,
          "is-disabled": disabled,
          "has-piece": Boolean(piece),
        },
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {isLegalTarget && (
        <span
          className={clsx(
            "legal-target-indicator",
            legalTargetType === "capture"
              ? "legal-target-capture-ring"
              : "legal-target-dot"
          )}
          data-testid={`legal-target-${square}`}
          data-target-type={legalTargetType}
          aria-hidden="true"
        />
      )}
      {piece ? <Piece piece={piece} /> : null}
      {children}
    </div>
  );
};

export default Square;
