import React from "react";
import {
  DIFFICULTY_PRESETS,
  getEngineDifficultyConfig,
} from "../../engine/difficulty";
import { useSettings } from "../useSettings";

export const EngineSettingsSection: React.FC = () => {
  const { settings, setEngineDifficulty } = useSettings();
  const currentPreset = getEngineDifficultyConfig(settings.engineDifficulty);

  return (
    <div className="settings-section" data-testid="settings-section-engine">
      <div className="settings-group">
        <div className="settings-group-header">
          <label
            htmlFor="range-engine-difficulty"
            className="settings-group-title"
          >
            Default Computer Opponent Strength
          </label>
          <span className="settings-group-subtitle">
            Configure default search depth and thinking parameters for Stockfish
            WASM
          </span>
        </div>

        <div className="difficulty-slider-container">
          <div className="difficulty-slider-header">
            <span
              className="difficulty-level-indicator"
              data-testid="engine-difficulty-level-label"
            >
              Level {currentPreset.level} – {currentPreset.label}
            </span>
            <span
              className="difficulty-level-badge"
              data-testid="engine-difficulty-stats-badge"
            >
              Skill {currentPreset.skillLevel}/20 · Depth {currentPreset.depth}
            </span>
          </div>

          <input
            id="range-engine-difficulty"
            type="range"
            min="1"
            max="8"
            step="1"
            value={settings.engineDifficulty}
            className="range-slider range-slider--engine"
            data-testid="slider-engine-difficulty"
            aria-label="Engine difficulty level"
            aria-valuemin={1}
            aria-valuemax={8}
            aria-valuenow={settings.engineDifficulty}
            aria-valuetext={`Level ${currentPreset.level}, ${currentPreset.label}`}
            onChange={(e) => setEngineDifficulty(Number(e.target.value))}
          />

          <div className="difficulty-ticks" aria-hidden="true">
            {DIFFICULTY_PRESETS.map((p) => (
              <span
                key={p.level}
                className={`difficulty-tick ${
                  p.level === settings.engineDifficulty
                    ? "difficulty-tick--active"
                    : ""
                }`}
                onClick={() => setEngineDifficulty(p.level)}
              >
                {p.level}
              </span>
            ))}
          </div>
        </div>

        <div
          className="difficulty-details-card"
          data-testid="engine-difficulty-details-card"
        >
          <p
            className="difficulty-details-desc"
            data-testid="engine-difficulty-description"
          >
            {currentPreset.description}
          </p>
          <div className="difficulty-details-meta">
            <span className="meta-tag">
              Max Think: {currentPreset.movetimeMs}ms
            </span>
            <span className="meta-tag">Stockfish WASM Thread Bounded</span>
          </div>
        </div>
      </div>
    </div>
  );
};
