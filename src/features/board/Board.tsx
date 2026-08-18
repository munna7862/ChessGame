import React, { useMemo, useState, useCallback } from "react";
import clsx from "clsx";
import {
  isValidSquare,
  type Square,
  type Piece,
} from "../../domain/chess/types";
import {
  getGridSquares,
  getRanksForOrientation,
  getFilesForOrientation,
  getPieceFromMatrix,
  getNextSquare,
} from "./coordinates";
import { Square as SquareComponent } from "./Square";
import { PromotionDialog } from "./PromotionDialog";
import type {
  BoardProps,
  BoardSquareData,
  LegalDestination,
  LastMoveState,
} from "./types";
import "./Board.css";

export const Board: React.FC<BoardProps> = ({
  orientation = "w",
  board,
  position,
  pieces,
  selectedSquare = null,
  focusedSquare = null,
  legalDestinations = null,
  lastMove = null,
  checkSquare = null,
  isCheckmate = false,
  pendingPromotion = null,
  onPromotionSelect,
  onPromotionCancel,
  disabled = false,
  showCoordinates = true,
  reducedMotion = false,
  onSquareClick,
  onSquareFocus,
  onClearSelection,
  announcement = null,
  renderSquare,
  renderPiece,
  className,
  ariaLabel = "Chessboard",
}) => {
  const [internalFocusedSquare, setInternalFocusedSquare] =
    useState<Square | null>(null);

  const effectiveFocusedSquare: Square = useMemo(() => {
    if (focusedSquare && isValidSquare(focusedSquare)) {
      return focusedSquare;
    }
    if (internalFocusedSquare && isValidSquare(internalFocusedSquare)) {
      return internalFocusedSquare;
    }
    if (selectedSquare && isValidSquare(selectedSquare)) {
      return selectedSquare;
    }
    if (lastMove && "to" in lastMove && isValidSquare(lastMove.to)) {
      return lastMove.to;
    }
    return orientation === "w" ? "e2" : "e7";
  }, [
    focusedSquare,
    internalFocusedSquare,
    selectedSquare,
    lastMove,
    orientation,
  ]);

  const pieceResolver = useMemo(() => {
    if (position?.board) {
      return (sq: Square): Piece | null =>
        getPieceFromMatrix(sq, position.board);
    }
    if (board) {
      return (sq: Square): Piece | null => getPieceFromMatrix(sq, board);
    }
    if (pieces) {
      if (pieces instanceof Map) {
        return (sq: Square): Piece | null => pieces.get(sq) ?? null;
      }
      return (sq: Square): Piece | null =>
        (pieces as Partial<Record<Square, Piece>>)[sq] ?? null;
    }
    return null;
  }, [position, board, pieces]);

  const legalDestMap = useMemo(() => {
    if (!legalDestinations) {
      return new Map<Square, LegalDestination>();
    }
    if (legalDestinations instanceof Map) {
      return legalDestinations;
    }
    const map = new Map<Square, LegalDestination>();
    if (Array.isArray(legalDestinations)) {
      for (const item of legalDestinations) {
        if (typeof item === "string" && isValidSquare(item)) {
          map.set(item, { square: item, targetType: "move" });
        } else if (item && typeof item === "object" && "square" in item) {
          map.set(item.square, item);
        }
      }
    }
    return map;
  }, [legalDestinations]);

  const gridSquares = useMemo(
    () => getGridSquares(orientation, pieceResolver),
    [orientation, pieceResolver]
  );

  const ranks = useMemo(
    () => getRanksForOrientation(orientation),
    [orientation]
  );
  const files = useMemo(
    () => getFilesForOrientation(orientation),
    [orientation]
  );

  const handleSquareKeyDown = useCallback(
    (e: React.KeyboardEvent, sq: Square) => {
      if (disabled) return;

      const navKeys = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
        "PageUp",
        "PageDown",
      ];

      if (navKeys.includes(e.key)) {
        e.preventDefault();
        const nextSq = getNextSquare(sq, e.key, orientation);
        setInternalFocusedSquare(nextSq);
        onSquareFocus?.(nextSq);
        const el = document.querySelector<HTMLElement>(
          `[data-square="${nextSq}"]`
        );
        el?.focus();
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        if (pendingPromotion) {
          onPromotionCancel?.();
        } else if (selectedSquare) {
          if (onClearSelection) {
            onClearSelection();
          } else if (onSquareClick) {
            onSquareClick(selectedSquare);
          }
        }
        return;
      }

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSquareClick?.(sq);
      }
    },
    [
      disabled,
      orientation,
      pendingPromotion,
      selectedSquare,
      onSquareFocus,
      onPromotionCancel,
      onClearSelection,
      onSquareClick,
    ]
  );

  const handleSquareFocus = useCallback(
    (sq: Square) => {
      setInternalFocusedSquare(sq);
      onSquareFocus?.(sq);
    },
    [onSquareFocus]
  );

  return (
    <div
      className={clsx("chess-board-wrapper", className, {
        "reduced-motion": reducedMotion,
      })}
      data-testid="chess-board-wrapper"
      data-reduced-motion={reducedMotion ? "true" : undefined}
    >
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="board-live-announcer"
      >
        {announcement}
      </div>

      <div
        role="grid"
        aria-label={ariaLabel}
        aria-disabled={disabled ? "true" : "false"}
        data-testid="chess-board"
        data-orientation={orientation}
        data-reduced-motion={reducedMotion ? "true" : undefined}
        className={clsx("chess-board-grid", `orientation-${orientation}`, {
          "is-board-disabled": disabled,
          "reduced-motion": reducedMotion,
        })}
      >
        {gridSquares.map((squareData: BoardSquareData) => {
          const isSelected = selectedSquare === squareData.square;
          const isFocused = effectiveFocusedSquare === squareData.square;
          const legalDest = legalDestMap.get(squareData.square);
          const isLegalTarget = Boolean(legalDest);
          const legalTargetType = legalDest?.targetType ?? "move";
          const isLastMoveFrom = lastMove?.from === squareData.square;
          const isLastMoveTo = lastMove?.to === squareData.square;
          const isLastMove = isLastMoveFrom || isLastMoveTo;
          const isCaptureEffect = Boolean(
            isLastMoveTo &&
            lastMove &&
            "isCapture" in lastMove &&
            (lastMove as LastMoveState).isCapture
          );
          const isSquareCheck = checkSquare === squareData.square;
          const isSquareCheckmate = isSquareCheck && isCheckmate;

          const enhancedSquareData: BoardSquareData = {
            ...squareData,
            isSelected,
            isLegalTarget,
            legalTargetType,
            isLastMove,
            isLastMoveFrom,
            isLastMoveTo,
            isCaptureEffect,
            isCheck: isSquareCheck,
            isCheckmate: isSquareCheckmate,
          };

          if (renderSquare) {
            return (
              <React.Fragment key={squareData.square}>
                {renderSquare(enhancedSquareData)}
              </React.Fragment>
            );
          }

          const renderedPieceChild =
            renderPiece && squareData.piece
              ? renderPiece(squareData.piece, squareData.square)
              : undefined;

          return (
            <SquareComponent
              key={squareData.square}
              square={squareData.square}
              piece={renderedPieceChild ? undefined : squareData.piece}
              color={squareData.color}
              tabIndex={disabled ? -1 : isFocused ? 0 : -1}
              isSelected={isSelected}
              isLegalTarget={isLegalTarget}
              legalTargetType={legalTargetType}
              isLastMove={isLastMove}
              isLastMoveFrom={isLastMoveFrom}
              isLastMoveTo={isLastMoveTo}
              isCaptureEffect={isCaptureEffect}
              isCheck={isSquareCheck}
              isCheckmate={isSquareCheckmate}
              disabled={disabled}
              onClick={
                onSquareClick ? (sq: Square) => onSquareClick(sq) : undefined
              }
              onKeyDown={handleSquareKeyDown}
              onFocus={handleSquareFocus}
            >
              {renderedPieceChild}
            </SquareComponent>
          );
        })}

        {showCoordinates && (
          <>
            <div
              className="board-coordinates-ranks"
              data-testid="board-coordinates-ranks"
              aria-hidden="true"
            >
              {ranks.map((rank) => (
                <span
                  key={rank}
                  data-testid={`coordinate-rank-${rank}`}
                  className="coordinate-label coordinate-rank"
                >
                  {rank}
                </span>
              ))}
            </div>
            <div
              className="board-coordinates-files"
              data-testid="board-coordinates-files"
              aria-hidden="true"
            >
              {files.map((file) => (
                <span
                  key={file}
                  data-testid={`coordinate-file-${file}`}
                  className="coordinate-label coordinate-file"
                >
                  {file}
                </span>
              ))}
            </div>
          </>
        )}

        {pendingPromotion && (
          <PromotionDialog
            color={pendingPromotion.color}
            targetSquare={pendingPromotion.to}
            orientation={orientation}
            disabled={disabled}
            onSelect={(pieceType) => onPromotionSelect?.(pieceType)}
            onCancel={() => onPromotionCancel?.()}
          />
        )}
      </div>
    </div>
  );
};

export default Board;
