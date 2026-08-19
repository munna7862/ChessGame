import React from "react";
import type { BoardTheme, PieceSet } from "../../../domain/persistence/schema";
import { useSettings } from "../useSettings";

interface ThemeOption {
  id: BoardTheme;
  name: string;
  lightColor: string;
  darkColor: string;
  description: string;
}

const THEME_OPTIONS: readonly ThemeOption[] = [
  {
    id: "classic",
    name: "Classic",
    lightColor: "#e2e8f0",
    darkColor: "#64748b",
    description: "Clean modern slate and off-white high-contrast theme",
  },
  {
    id: "wood",
    name: "Wood",
    lightColor: "#f0d9b5",
    darkColor: "#b58863",
    description: "Traditional natural wood grain and warm oak hues",
  },
  {
    id: "slate",
    name: "Slate",
    lightColor: "#cbd5e1",
    darkColor: "#475569",
    description: "Deep neutral matte palette for focused low-glare play",
  },
  {
    id: "ocean",
    name: "Ocean",
    lightColor: "#cbe4f9",
    darkColor: "#2e5b88",
    description: "Crisp nautical blue tones with high board legibility",
  },
];

interface PieceSetOption {
  id: PieceSet;
  name: string;
  sample: string;
  description: string;
}

const PIECE_SET_OPTIONS: readonly PieceSetOption[] = [
  {
    id: "standard",
    name: "Standard",
    sample: "♞ ♛ ♚",
    description: "FIDE tournament vector silhouette piece styling",
  },
  {
    id: "classic",
    name: "Staunton Classic",
    sample: "♘ ♕ ♔",
    description: "Traditional European woodcraft Staunton aesthetic",
  },
  {
    id: "modern",
    name: "Modern Neo",
    sample: "▲ ● ◼",
    description: "Streamlined geometric high-definition silhouettes",
  },
];

export const AppearanceSettingsSection: React.FC = () => {
  const { settings, setBoardTheme, setPieceSet } = useSettings();

  return (
    <div className="settings-section" data-testid="settings-section-appearance">
      <div className="settings-group">
        <div className="settings-group-header">
          <label className="settings-group-title">Board Visual Theme</label>
          <span className="settings-group-subtitle">
            Choose the color scheme and contrast styling for the 64 squares
          </span>
        </div>

        <div
          className="theme-grid"
          role="radiogroup"
          aria-label="Board Theme"
          data-testid="theme-selector-grid"
        >
          {THEME_OPTIONS.map((theme) => {
            const isSelected = settings.boardTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`theme-card ${isSelected ? "theme-card--selected" : ""}`}
                data-testid={`theme-option-${theme.id}`}
                onClick={() => setBoardTheme(theme.id)}
              >
                <div className="theme-preview-box" aria-hidden="true">
                  <div
                    className="theme-preview-square"
                    style={{ backgroundColor: theme.lightColor }}
                  />
                  <div
                    className="theme-preview-square"
                    style={{ backgroundColor: theme.darkColor }}
                  />
                  <div
                    className="theme-preview-square"
                    style={{ backgroundColor: theme.darkColor }}
                  />
                  <div
                    className="theme-preview-square"
                    style={{ backgroundColor: theme.lightColor }}
                  />
                </div>
                <div className="theme-card-info">
                  <span className="theme-card-name">{theme.name}</span>
                  <span className="theme-card-desc">{theme.description}</span>
                </div>
                {isSelected && (
                  <span
                    className="theme-card-badge"
                    data-testid={`theme-badge-selected-${theme.id}`}
                  >
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-group-header">
          <label className="settings-group-title">Piece Set Art Style</label>
          <span className="settings-group-subtitle">
            Select the vector rendering style for chessmen on the board
          </span>
        </div>

        <div
          className="piece-set-grid"
          role="radiogroup"
          aria-label="Piece Set"
          data-testid="piece-set-selector-grid"
        >
          {PIECE_SET_OPTIONS.map((set) => {
            const isSelected = settings.pieceSet === set.id;
            return (
              <button
                key={set.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`piece-set-card ${isSelected ? "piece-set-card--selected" : ""}`}
                data-testid={`piece-set-option-${set.id}`}
                onClick={() => setPieceSet(set.id)}
              >
                <div className="piece-set-preview" aria-hidden="true">
                  <span className="piece-set-glyph">{set.sample}</span>
                </div>
                <div className="piece-set-card-info">
                  <span className="piece-set-card-name">{set.name}</span>
                  <span className="piece-set-card-desc">{set.description}</span>
                </div>
                {isSelected && (
                  <span
                    className="piece-set-card-badge"
                    data-testid={`piece-set-badge-selected-${set.id}`}
                  >
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
