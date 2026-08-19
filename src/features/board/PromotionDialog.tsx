import React, { useEffect, useRef, useCallback } from "react";
import clsx from "clsx";
import type { PromotionPieceType } from "../../domain/chess/types";
import { Piece } from "./Piece";
import type { PromotionDialogProps } from "./types";
import "./PromotionDialog.css";

interface PromotionOption {
  readonly type: PromotionPieceType;
  readonly name: string;
  readonly hotkey: string;
  readonly numKey: string;
}

const PROMOTION_OPTIONS: ReadonlyArray<PromotionOption> = [
  { type: "q", name: "Queen", hotkey: "Q", numKey: "1" },
  { type: "r", name: "Rook", hotkey: "R", numKey: "2" },
  { type: "b", name: "Bishop", hotkey: "B", numKey: "3" },
  { type: "n", name: "Knight", hotkey: "N", numKey: "4" },
];

export const PromotionDialog: React.FC<PromotionDialogProps> = ({
  color,
  pieceSet = "standard",
  targetSquare,
  onSelect,
  onCancel,
  disabled = false,
  className,
}) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Auto-focus first option (Queen) on mount
  useEffect(() => {
    const firstButton = buttonRefs.current[0];
    if (firstButton) {
      firstButton.focus();
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;

      const key = e.key.toLowerCase();

      // Escape key cancels promotion
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
        return;
      }

      // Hotkey selection
      for (const opt of PROMOTION_OPTIONS) {
        if (key === opt.hotkey.toLowerCase() || key === opt.numKey) {
          e.preventDefault();
          e.stopPropagation();
          onSelect(opt.type);
          return;
        }
      }

      // Arrow navigation
      const focusedIndex = buttonRefs.current.findIndex(
        (btn) => btn === document.activeElement
      );

      if (focusedIndex >= 0) {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          const nextIndex = (focusedIndex + 1) % PROMOTION_OPTIONS.length;
          buttonRefs.current[nextIndex]?.focus();
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          const prevIndex =
            (focusedIndex - 1 + PROMOTION_OPTIONS.length) %
            PROMOTION_OPTIONS.length;
          buttonRefs.current[prevIndex]?.focus();
        }
      }
    },
    [disabled, onCancel, onSelect]
  );

  return (
    <div
      className={clsx("promotion-dialog-backdrop", className)}
      data-testid="promotion-dialog-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !disabled) {
          onCancel();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Pawn promotion selection"
        data-testid="promotion-dialog"
        data-color={color}
        data-target-square={targetSquare}
        className="promotion-dialog-card"
        onKeyDown={handleKeyDown}
      >
        <div className="promotion-dialog-header">
          <h3 className="promotion-dialog-title">Choose Promotion</h3>
          <span className="promotion-dialog-subtitle">
            Pawn reached{" "}
            {targetSquare ? targetSquare.toUpperCase() : "8th rank"}
          </span>
        </div>

        <div
          className="promotion-choices-grid"
          role="radiogroup"
          aria-label="Promotion piece options"
        >
          {PROMOTION_OPTIONS.map((opt, index) => (
            <button
              key={opt.type}
              ref={(el) => {
                buttonRefs.current[index] = el;
              }}
              type="button"
              className="promotion-piece-btn"
              data-testid={`promotion-choice-${opt.type}`}
              data-piece-type={opt.type}
              aria-label={`Promote to ${opt.name} (${opt.hotkey})`}
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(opt.type);
              }}
            >
              <div className="promotion-piece-icon">
                <Piece piece={{ type: opt.type, color }} pieceSet={pieceSet} />
              </div>
              <span className="promotion-piece-name">{opt.name}</span>
              <kbd className="promotion-piece-hotkey" aria-hidden="true">
                {opt.hotkey}
              </kbd>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="promotion-cancel-btn"
          data-testid="promotion-cancel-btn"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
        >
          Cancel <span className="hotkey-badge">(Esc)</span>
        </button>
      </div>
    </div>
  );
};

export default PromotionDialog;
