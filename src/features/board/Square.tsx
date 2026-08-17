import React from "react";
import clsx from "clsx";
import { squareToFileRank, FILES, RANKS } from "../../domain/chess/types";
import { getSquareColor } from "./coordinates";
import type { SquareProps } from "./types";

export const Square: React.FC<SquareProps> = ({
  square,
  color,
  isSelected = false,
  isLastMove = false,
  isLegalTarget = false,
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

  const defaultAriaLabel = `Square ${square}, ${resolvedColor}`;

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
      className={clsx(
        "chess-square",
        `square-${resolvedColor}`,
        {
          "is-selected": isSelected,
          "is-last-move": isLastMove,
          "is-legal-target": isLegalTarget,
          "is-check": isCheck,
          "is-disabled": disabled,
        },
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
};

export default Square;
