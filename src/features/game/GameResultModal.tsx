import React, { useRef } from "react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import type { GameStatus } from "../../domain/chess/types";
import type { PlayerConfig } from "./types";
import { deriveGameResult } from "./gameResultUtils";
import "./GameResultModal.css";

export interface GameResultModalProps {
  readonly isOpen: boolean;
  readonly status: GameStatus;
  readonly players: {
    readonly w: PlayerConfig;
    readonly b: PlayerConfig;
  };
  readonly moveCount: number;
  readonly onRematch: () => void;
  readonly onNewGame: () => void;
  readonly onClose: () => void;
}

export const GameResultModal: React.FC<GameResultModalProps> = ({
  isOpen,
  status,
  players,
  moveCount,
  onRematch,
  onNewGame,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);

  useFocusTrap({
    isOpen,
    containerRef: dialogRef,
    initialFocusRef: primaryButtonRef,
    onEscape: onClose,
  });

  if (!isOpen) {
    return null;
  }

  const result = deriveGameResult(status, players);
  const fullMoves = Math.ceil(moveCount / 2);

  return (
    <div
      className="game-result-backdrop"
      data-testid="game-result-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className={`game-result-dialog game-result-dialog--${result.outcomeType}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-result-title"
        aria-describedby="game-result-description"
        data-testid="game-result-modal"
      >
        <button
          type="button"
          className="game-result-close-btn"
          data-testid="btn-close-result"
          onClick={onClose}
          aria-label="Close result dialog and review board"
        >
          ×
        </button>

        <div className="game-result-header">
          <div className="game-result-trophy" aria-hidden="true">
            {result.outcomeType === "win" ? "🏆" : "🤝"}
          </div>
          <h2
            id="game-result-title"
            className="game-result-title"
            data-testid="game-result-title"
          >
            {result.title}
          </h2>
          <div
            className="game-result-subtitle"
            data-testid="game-result-subtitle"
          >
            {result.subtitle}
          </div>
        </div>

        <div className="game-result-score-card">
          <div
            className="game-result-scoreline"
            data-testid="game-result-scoreline"
          >
            {result.score}
          </div>
          <p
            id="game-result-description"
            className="game-result-description"
            data-testid="game-result-description"
          >
            {result.description}
          </p>
        </div>

        <div className="game-result-summary" data-testid="game-result-summary">
          <div className="summary-player summary-player--white">
            <span
              className="player-indicator player-indicator--white"
              aria-hidden="true"
            />
            <span className="player-name">{players.w.name}</span>
            <span className="player-label">(White)</span>
          </div>
          <div className="summary-vs" aria-hidden="true">
            vs
          </div>
          <div className="summary-player summary-player--black">
            <span
              className="player-indicator player-indicator--black"
              aria-hidden="true"
            />
            <span className="player-name">{players.b.name}</span>
            <span className="player-label">(Black)</span>
          </div>
        </div>

        <div className="game-result-stats" data-testid="game-result-stats">
          <span className="stat-item">
            <strong>{moveCount}</strong> plies ({fullMoves}{" "}
            {fullMoves === 1 ? "move" : "moves"})
          </span>
        </div>

        <div className="game-result-actions" data-testid="game-result-actions">
          <button
            ref={primaryButtonRef}
            type="button"
            className="btn-modal-action btn-modal-action--primary"
            data-testid="btn-rematch"
            onClick={onRematch}
          >
            Rematch
          </button>
          <button
            type="button"
            className="btn-modal-action btn-modal-action--secondary"
            data-testid="btn-result-new-game"
            onClick={onNewGame}
          >
            New Game
          </button>
          <button
            type="button"
            className="btn-modal-action btn-modal-action--outline"
            data-testid="btn-review-board"
            onClick={onClose}
          >
            Review Board
          </button>
        </div>
      </div>
    </div>
  );
};
