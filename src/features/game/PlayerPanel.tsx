import React from "react";
import type { PieceType } from "../../domain/chess/types";
import type { PlayerConfig } from "./types";
import "./PlayerPanel.css";

export interface PlayerPanelProps {
  readonly player: PlayerConfig;
  readonly isTurn: boolean;
  readonly isCheck?: boolean | undefined;
  readonly capturedPieces?: readonly PieceType[] | undefined;
  readonly position?: "top" | "bottom" | undefined;
  readonly className?: string | undefined;
}

const PIECE_UNICODE: Record<"w" | "b", Record<PieceType, string>> = {
  w: {
    p: "♙",
    n: "♘",
    b: "♗",
    r: "♖",
    q: "♕",
    k: "♔",
  },
  b: {
    p: "♟",
    n: "♞",
    b: "♝",
    r: "♜",
    q: "♛",
    k: "♚",
  },
};

export const PlayerPanel: React.FC<PlayerPanelProps> = ({
  player,
  isTurn,
  isCheck = false,
  capturedPieces = [],
  position = "bottom",
  className = "",
}) => {
  const isWhite = player.color === "w";
  const avatarClass = isWhite
    ? "player-panel__avatar--white"
    : "player-panel__avatar--black";
  const capturedColor = isWhite ? "b" : "w";

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
            {capturedPieces.map((piece, idx) => (
              <span
                key={`${piece}-${idx}`}
                className="player-panel__captured-piece"
                title={`Captured ${piece.toUpperCase()}`}
              >
                {PIECE_UNICODE[capturedColor][piece]}
              </span>
            ))}
          </div>
        )}

        {isCheck && (
          <span
            className="player-panel__check-indicator"
            data-testid={`player-check-${player.color}`}
          >
            Check
          </span>
        )}

        {isTurn && (
          <span
            className="player-panel__turn-indicator"
            data-testid={`player-turn-${player.color}`}
          >
            Turn
          </span>
        )}
      </div>
    </section>
  );
};
