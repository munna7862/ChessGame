import React from "react";
import { useSettings } from "../useSettings";

export const GameplaySettingsSection: React.FC = () => {
  const {
    settings,
    setShowCoordinates,
    setShowLegalMoves,
    setShowLastMove,
    setAutoQueen,
  } = useSettings();

  return (
    <div className="settings-section" data-testid="settings-section-gameplay">
      <div className="settings-toggle-list">
        <div className="settings-toggle-item">
          <div className="settings-toggle-text">
            <label
              htmlFor="switch-coordinates"
              className="settings-toggle-label"
            >
              Board Coordinate Labels
            </label>
            <span className="settings-toggle-desc">
              Display rank (1–8) and file (a–h) algebraic coordinates along the
              board boundaries
            </span>
          </div>
          <button
            id="switch-coordinates"
            type="button"
            role="switch"
            aria-checked={settings.showCoordinates}
            className={`toggle-switch ${settings.showCoordinates ? "toggle-switch--on" : ""}`}
            data-testid="switch-coordinates"
            onClick={() => setShowCoordinates(!settings.showCoordinates)}
          >
            <span className="toggle-handle" />
          </button>
        </div>

        <div className="settings-toggle-item">
          <div className="settings-toggle-text">
            <label
              htmlFor="switch-legal-moves"
              className="settings-toggle-label"
            >
              Legal Move Target Markers
            </label>
            <span className="settings-toggle-desc">
              Show destination target dots and capture rings when selecting or
              focusing a piece
            </span>
          </div>
          <button
            id="switch-legal-moves"
            type="button"
            role="switch"
            aria-checked={settings.showLegalMoves}
            className={`toggle-switch ${settings.showLegalMoves ? "toggle-switch--on" : ""}`}
            data-testid="switch-legal-moves"
            onClick={() => setShowLegalMoves(!settings.showLegalMoves)}
          >
            <span className="toggle-handle" />
          </button>
        </div>

        <div className="settings-toggle-item">
          <div className="settings-toggle-text">
            <label htmlFor="switch-last-move" className="settings-toggle-label">
              Last Move Highlighting
            </label>
            <span className="settings-toggle-desc">
              Highlight the origin and destination squares of the most recently
              played move
            </span>
          </div>
          <button
            id="switch-last-move"
            type="button"
            role="switch"
            aria-checked={settings.showLastMove}
            className={`toggle-switch ${settings.showLastMove ? "toggle-switch--on" : ""}`}
            data-testid="switch-last-move"
            onClick={() => setShowLastMove(!settings.showLastMove)}
          >
            <span className="toggle-handle" />
          </button>
        </div>

        <div className="settings-toggle-item">
          <div className="settings-toggle-text">
            <label
              htmlFor="switch-auto-queen"
              className="settings-toggle-label"
            >
              Auto-Queen Pawn Promotion
            </label>
            <span className="settings-toggle-desc">
              Automatically promote 8th rank pawns to Queen without showing the
              promotion dialog
            </span>
          </div>
          <button
            id="switch-auto-queen"
            type="button"
            role="switch"
            aria-checked={settings.autoQueen}
            className={`toggle-switch ${settings.autoQueen ? "toggle-switch--on" : ""}`}
            data-testid="switch-auto-queen"
            onClick={() => setAutoQueen(!settings.autoQueen)}
          >
            <span className="toggle-handle" />
          </button>
        </div>
      </div>
    </div>
  );
};
