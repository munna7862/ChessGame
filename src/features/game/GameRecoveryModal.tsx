import React, { useRef } from "react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import type { PersistedActiveGame } from "../../domain/persistence/schema";
import "./GameRecoveryModal.css";

export interface GameRecoveryModalProps {
  readonly isOpen: boolean;
  readonly activeGame: PersistedActiveGame | null;
  readonly onContinue: () => void;
  readonly onDiscard: () => void;
  readonly onClose?: (() => void) | undefined;
}

/**
 * Formats epoch millisecond timestamp into readable date & time.
 */
function formatTimestamp(epochMs: number): string {
  try {
    const d = new Date(epochMs);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Earlier session";
  }
}

/**
 * Modal presenting the user with options to resume or discard an interrupted game session.
 */
export const GameRecoveryModal: React.FC<GameRecoveryModalProps> = ({
  isOpen,
  activeGame,
  onContinue,
  onDiscard,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);

  useFocusTrap({
    isOpen,
    containerRef: dialogRef,
    initialFocusRef: primaryButtonRef,
    onEscape: () => {
      if (onClose) {
        onClose();
      } else {
        onDiscard();
      }
    },
  });

  if (!isOpen || !activeGame) {
    return null;
  }

  const modeLabel =
    activeGame.mode === "human_vs_engine"
      ? "Human vs Computer"
      : "Pass & Play (2 Players)";

  const turnColor = activeGame.fen.split(" ")[1] === "b" ? "Black" : "White";
  const moveCount = activeGame.moveHistorySan?.length ?? 0;
  const timeControlLabel = activeGame.clock?.timeControl?.label ?? "Unlimited";

  return (
    <div
      className="game-recovery-backdrop"
      data-testid="game-recovery-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="game-recovery-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-recovery-title"
        aria-describedby="game-recovery-description"
        data-testid="game-recovery-modal"
      >
        {onClose && (
          <button
            type="button"
            className="game-recovery-close-btn"
            data-testid="btn-close-recovery"
            onClick={onClose}
            aria-label="Close recovery dialog"
          >
            ×
          </button>
        )}

        <div className="game-recovery-header">
          <div className="game-recovery-icon" aria-hidden="true">
            🔄
          </div>
          <h2
            id="game-recovery-title"
            className="game-recovery-title"
            data-testid="recovery-modal-title"
          >
            Resume Previous Game?
          </h2>
          <p id="game-recovery-description" className="game-recovery-subtitle">
            An interrupted match from your previous session was found.
          </p>
        </div>

        <div className="game-recovery-summary-card">
          <div className="game-recovery-row">
            <span className="game-recovery-label">Mode:</span>
            <span
              className="game-recovery-value"
              data-testid="recovery-game-mode"
            >
              {modeLabel}
            </span>
          </div>

          <div className="game-recovery-row">
            <span className="game-recovery-label">Players:</span>
            <span
              className="game-recovery-value"
              data-testid="recovery-players"
            >
              {activeGame.players.w.name} (White) vs {activeGame.players.b.name}{" "}
              (Black)
            </span>
          </div>

          <div className="game-recovery-row">
            <span className="game-recovery-label">Turn:</span>
            <span className="game-recovery-value" data-testid="recovery-turn">
              {turnColor} to move
            </span>
          </div>

          <div className="game-recovery-row">
            <span className="game-recovery-label">Progress:</span>
            <span
              className="game-recovery-value"
              data-testid="recovery-move-count"
            >
              {moveCount} {moveCount === 1 ? "move" : "moves"} played
            </span>
          </div>

          <div className="game-recovery-row">
            <span className="game-recovery-label">Clock:</span>
            <span
              className="game-recovery-value"
              data-testid="recovery-time-control"
            >
              {timeControlLabel}
            </span>
          </div>

          <div className="game-recovery-row">
            <span className="game-recovery-label">Saved:</span>
            <span
              className="game-recovery-value game-recovery-value--time"
              data-testid="recovery-timestamp"
            >
              {formatTimestamp(activeGame.updatedAt)}
            </span>
          </div>
        </div>

        <div className="game-recovery-actions">
          <button
            ref={primaryButtonRef}
            type="button"
            className="btn-recovery btn-recovery--primary"
            data-testid="btn-continue-game"
            onClick={onContinue}
          >
            Continue Game
          </button>
          <button
            type="button"
            className="btn-recovery btn-recovery--discard"
            data-testid="btn-discard-game"
            onClick={onDiscard}
          >
            Discard / Start Fresh
          </button>
        </div>
      </div>
    </div>
  );
};
