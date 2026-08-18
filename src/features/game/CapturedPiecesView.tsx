import React from "react";
import type { PieceType } from "../../domain/chess/types";
import { sortCapturedPieces } from "./moveHistoryUtils";
import "./CapturedPiecesView.css";

export interface CapturedPiecesViewProps {
  readonly capturedPieces: readonly PieceType[];
  readonly capturingColor: "w" | "b";
  readonly materialAdvantage?: number | undefined;
  readonly className?: string | undefined;
  readonly testId?: string | undefined;
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

export const CapturedPiecesView: React.FC<CapturedPiecesViewProps> = ({
  capturedPieces,
  capturingColor,
  materialAdvantage,
  className = "",
  testId,
}) => {
  if (capturedPieces.length === 0 && !materialAdvantage) {
    return null;
  }

  const sortedPieces = sortCapturedPieces(capturedPieces);
  // The captured pieces belong to the opponent's color
  const pieceColor = capturingColor === "w" ? "b" : "w";
  const defaultTestId = testId ?? `captured-tray-${capturingColor}`;

  return (
    <div
      className={`captured-pieces-tray ${className}`}
      data-testid={defaultTestId}
      aria-label={`${
        capturingColor === "w" ? "White" : "Black"
      } captured pieces`}
    >
      <div className="captured-pieces-tray__list">
        {sortedPieces.map((piece, idx) => (
          <span
            key={`${piece}-${idx}`}
            className={`captured-pieces-tray__glyph captured-pieces-tray__glyph--${pieceColor}`}
            data-testid={`captured-piece-${piece}`}
            title={`Captured ${piece.toUpperCase()}`}
          >
            {PIECE_UNICODE[pieceColor][piece]}
          </span>
        ))}
      </div>

      {materialAdvantage !== undefined && materialAdvantage > 0 && (
        <span
          className="captured-pieces-tray__advantage"
          data-testid={
            testId
              ? `${testId}-advantage`
              : `material-advantage-${capturingColor}`
          }
          title={`${
            capturingColor === "w" ? "White" : "Black"
          } has +${materialAdvantage} material advantage`}
        >
          +{materialAdvantage}
        </span>
      )}
    </div>
  );
};
