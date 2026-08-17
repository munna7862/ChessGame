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
  isCheckmate = false,
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

  const effectiveCheck = isCheck || isCheckmate;
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
  const checkLabel = isCheckmate
    ? ", in checkmate"
    : effectiveCheck
      ? ", in check"
      : "";
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
      data-is-check={effectiveCheck ? "true" : undefined}
      data-is-checkmate={isCheckmate ? "true" : undefined}
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
          "is-check": effectiveCheck,
          "is-checkmate": isCheckmate,
          "is-disabled": disabled,
          "has-piece": Boolean(piece),
        },
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {effectiveCheck && (
        <span
          className={clsx("check-indicator-badge", {
            "is-checkmate-badge": isCheckmate,
          })}
          data-testid={
            isCheckmate
              ? `checkmate-indicator-${square}`
              : `check-indicator-${square}`
          }
          aria-hidden="true"
        >
          <svg
            className="check-indicator-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isCheckmate ? (
              <>
                <circle cx="12" cy="12" r="9" strokeWidth="2" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </>
            ) : (
              <>
                <circle cx="12" cy="12" r="9" strokeWidth="2" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="3" />
              </>
            )}
          </svg>
        </span>
      )}
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
