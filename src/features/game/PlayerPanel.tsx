import React from "react";
import type { PieceType } from "../../domain/chess/types";
import type { TimeControl } from "../../domain/clock/types";
import type { PlayerConfig } from "./types";
import { CapturedPiecesView } from "./CapturedPiecesView";
import { ClockDisplay } from "../clock/ClockDisplay";
import "./PlayerPanel.css";

export interface PlayerPanelProps {
  readonly player: PlayerConfig;
  readonly isTurn: boolean;
  readonly isThinking?: boolean | undefined;
  readonly isCheck?: boolean | undefined;
  readonly capturedPieces?: readonly PieceType[] | undefined;
  readonly materialAdvantage?: number | undefined;
  readonly position?: "top" | "bottom" | undefined;
  readonly timeRemainingMs?: number | undefined;
  readonly isClockActive?: boolean | undefined;
  readonly timeControl?: TimeControl | undefined;
  readonly isGameOver?: boolean | undefined;
  readonly className?: string | undefined;
}

export const PlayerPanel: React.FC<PlayerPanelProps> = ({
  player,
  isTurn,
  isThinking = false,
  isCheck = false,
  capturedPieces = [],
  materialAdvantage,
  position = "bottom",
  timeRemainingMs,
  isClockActive,
  timeControl,
  isGameOver = false,
  className = "",
}) => {
  const isWhite = player.color === "w";
  const avatarClass = isWhite
    ? "player-panel__avatar--white"
    : "player-panel__avatar--black";

  const showClock = timeRemainingMs !== undefined || timeControl !== undefined;

  return (
    <section
      className={`player-panel ${
        isTurn ? "player-panel--active-turn" : ""
      } ${isCheck ? "player-panel--in-check" : ""} ${className}`}
      data-testid={`player-panel-${player.color}`}
      data-position={position}
      aria-label={`${isWhite ? "White" : "Black"} Player: ${player.name}`}
    >
      <div className="player-panel__main">
        <div
          className={`player-panel__avatar ${avatarClass}`}
          aria-hidden="true"
          title={`${isWhite ? "White" : "Black"} Pieces`}
        >
          {isWhite ? "W" : "B"}
        </div>
        <div className="player-panel__info">
          <div className="player-panel__name-row">
            <span
              className="player-panel__name"
              data-testid={`player-name-${player.color}`}
              title={player.name}
            >
              {player.name}
            </span>
            {player.rating !== undefined && (
              <span
                className="player-panel__rating"
                data-testid={`player-rating-${player.color}`}
              >
                {player.rating}
              </span>
            )}
            <span
              className={`player-panel__type-badge player-panel__type-badge--${player.type}`}
              data-testid={`player-type-${player.color}`}
            >
              {player.type === "engine" ? "AI" : "Human"}
            </span>
          </div>
        </div>
      </div>

      <div className="player-panel__meta">
        {capturedPieces.length > 0 && (
          <div
            className="player-panel__captured"
            data-testid={`captured-pieces-${player.color}`}
            aria-label={`Captured pieces: ${capturedPieces.join(", ")}`}
          >
            <CapturedPiecesView
              capturedPieces={capturedPieces}
              capturingColor={player.color}
              materialAdvantage={materialAdvantage}
              testId={`captured-tray-${player.color}`}
            />
          </div>
        )}

        {isThinking && (
          <span
            className="player-panel__thinking-indicator"
            data-testid={`player-thinking-${player.color}`}
          >
            Thinking...
          </span>
        )}

        {isCheck && (
          <span
            className="player-panel__check-indicator"
            data-testid={`player-check-${player.color}`}
          >
            Check
          </span>
        )}

        {isTurn && !isThinking && (
          <span
            className="player-panel__turn-indicator"
            data-testid={`player-turn-${player.color}`}
          >
            Turn
          </span>
        )}

        {showClock && (
          <div className="player-panel__clock-container">
            <ClockDisplay
              color={player.color}
              timeRemainingMs={timeRemainingMs ?? 0}
              isActive={isClockActive ?? false}
              timeControl={timeControl}
              isGameOver={isGameOver}
            />
          </div>
        )}
      </div>
    </section>
  );
};
