import React, { useCallback } from "react";
import { useSettings } from "../useSettings";
import { soundService } from "../../../services/sound";

export const AudioMotionSettingsSection: React.FC = () => {
  const { settings, setSoundEnabled, setVolume, setReducedMotion } =
    useSettings();

  const handleTestSound = useCallback(
    (
      effect: "move" | "capture" | "check" | "castle" | "promotion" | "gameOver"
    ) => {
      soundService.play(effect);
    },
    []
  );

  return (
    <div
      className="settings-section"
      data-testid="settings-section-audio-motion"
    >
      <div className="settings-toggle-list">
        <div className="settings-toggle-item">
          <div className="settings-toggle-text">
            <label htmlFor="switch-sound" className="settings-toggle-label">
              Sound Effects
            </label>
            <span className="settings-toggle-desc">
              Play auditory feedback for moves, captures, checks, and game
              terminations
            </span>
          </div>
          <button
            id="switch-sound"
            type="button"
            role="switch"
            aria-checked={settings.soundEnabled}
            className={`toggle-switch ${settings.soundEnabled ? "toggle-switch--on" : ""}`}
            data-testid="switch-sound"
            onClick={() => setSoundEnabled(!settings.soundEnabled)}
          >
            <span className="toggle-handle" />
          </button>
        </div>

        <div className="settings-slider-item">
          <div className="settings-slider-header">
            <label htmlFor="range-volume" className="settings-toggle-label">
              Master Audio Volume
            </label>
            <span
              className="settings-value-badge"
              data-testid="volume-value-badge"
            >
              {settings.soundEnabled ? `${settings.volume}%` : "Muted"}
            </span>
          </div>
          <div className="settings-slider-control">
            <input
              id="range-volume"
              type="range"
              min="0"
              max="100"
              step="1"
              value={settings.volume}
              disabled={!settings.soundEnabled}
              className="range-slider"
              data-testid="slider-volume"
              aria-label="Master volume percentage"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={settings.volume}
              aria-valuetext={`${settings.volume} percent`}
              onChange={(e) => setVolume(Number(e.target.value))}
            />
          </div>
        </div>

        <div
          className="settings-audition-group"
          data-testid="settings-audition-group"
        >
          <div className="settings-group-header">
            <span className="settings-group-title">Audition Sound Cues</span>
            <span className="settings-group-subtitle">
              Test synthesized audio cues with current master volume
            </span>
          </div>
          <div className="sound-audition-buttons">
            <button
              type="button"
              className="sound-audition-btn"
              disabled={!settings.soundEnabled || settings.volume === 0}
              data-testid="btn-test-sound-move"
              onClick={() => handleTestSound("move")}
            >
              <span className="audition-icon" aria-hidden="true">
                ♟
              </span>{" "}
              Move
            </button>
            <button
              type="button"
              className="sound-audition-btn"
              disabled={!settings.soundEnabled || settings.volume === 0}
              data-testid="btn-test-sound-capture"
              onClick={() => handleTestSound("capture")}
            >
              <span className="audition-icon" aria-hidden="true">
                ⚔
              </span>{" "}
              Capture
            </button>
            <button
              type="button"
              className="sound-audition-btn"
              disabled={!settings.soundEnabled || settings.volume === 0}
              data-testid="btn-test-sound-check"
              onClick={() => handleTestSound("check")}
            >
              <span className="audition-icon" aria-hidden="true">
                ⚠
              </span>{" "}
              Check
            </button>
            <button
              type="button"
              className="sound-audition-btn"
              disabled={!settings.soundEnabled || settings.volume === 0}
              data-testid="btn-test-sound-castle"
              onClick={() => handleTestSound("castle")}
            >
              <span className="audition-icon" aria-hidden="true">
                ♜
              </span>{" "}
              Castle
            </button>
            <button
              type="button"
              className="sound-audition-btn"
              disabled={!settings.soundEnabled || settings.volume === 0}
              data-testid="btn-test-sound-promotion"
              onClick={() => handleTestSound("promotion")}
            >
              <span className="audition-icon" aria-hidden="true">
                ♛
              </span>{" "}
              Promotion
            </button>
            <button
              type="button"
              className="sound-audition-btn"
              disabled={!settings.soundEnabled || settings.volume === 0}
              data-testid="btn-test-sound-gameover"
              onClick={() => handleTestSound("gameOver")}
            >
              <span className="audition-icon" aria-hidden="true">
                🏆
              </span>{" "}
              Game Over
            </button>
          </div>
        </div>

        <div className="settings-toggle-item">
          <div className="settings-toggle-text">
            <label
              htmlFor="switch-reduced-motion"
              className="settings-toggle-label"
            >
              Reduced Motion
            </label>
            <span className="settings-toggle-desc">
              Disable piece sliding, capture bursts, check pulsing, and UI
              transitions
            </span>
          </div>
          <button
            id="switch-reduced-motion"
            type="button"
            role="switch"
            aria-checked={settings.reducedMotion}
            className={`toggle-switch ${settings.reducedMotion ? "toggle-switch--on" : ""}`}
            data-testid="switch-reduced-motion"
            onClick={() => setReducedMotion(!settings.reducedMotion)}
          >
            <span className="toggle-handle" />
          </button>
        </div>
      </div>
    </div>
  );
};
