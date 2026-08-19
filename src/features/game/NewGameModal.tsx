import React, { useState, useEffect, useRef } from "react";
import { validateFen } from "../../domain/chess/fen";
import type { TimeControl } from "../../domain/clock/types";
import { TIME_CONTROL_PRESETS } from "../../domain/clock/timeControl";
import { TimeControlSelector } from "../clock/TimeControlSelector";
import {
  useEngineDifficulty,
  DIFFICULTY_PRESETS,
  type EngineDifficultyLevel,
} from "../engine";
import type {
  GameMode,
  NewGameConfigOptions,
  PlayerColorChoice,
  ResolvedNewGameSession,
} from "./types";
import { resolveNewGameSession } from "./types";
import "./NewGameModal.css";

export interface NewGameModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onStartGame: (session: ResolvedNewGameSession) => void;
  readonly initialValues?: Partial<NewGameConfigOptions> | undefined;
}

export const NewGameModal: React.FC<NewGameModalProps> = ({
  isOpen,
  onClose,
  onStartGame,
  initialValues,
}) => {
  const [mode, setMode] = useState<GameMode>(
    initialValues?.mode ?? "human_vs_human"
  );
  const { difficulty, preset, setDifficulty } = useEngineDifficulty(
    (initialValues?.difficulty as EngineDifficultyLevel) || undefined
  );
  const [timeControl, setTimeControl] = useState<TimeControl>(
    initialValues?.timeControl ??
      TIME_CONTROL_PRESETS.find((p) => p.type === "none") ?? {
        type: "none",
        initialMs: 0,
        incrementMs: 0,
        label: "Unlimited (Untimed)",
      }
  );
  const [player1Name, setPlayer1Name] = useState<string>(
    initialValues?.player1Name ?? "White"
  );
  const [player2Name, setPlayer2Name] = useState<string>(
    initialValues?.player2Name ?? "Black"
  );
  const [player1Color, setPlayer1Color] = useState<PlayerColorChoice>(
    initialValues?.player1Color ?? "w"
  );
  const [showCustomFen, setShowCustomFen] = useState<boolean>(
    Boolean(initialValues?.initialFen)
  );
  const [customFen, setCustomFen] = useState<string>(
    initialValues?.initialFen ?? ""
  );
  const [fenError, setFenError] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Sync mode changes to default player 2 name if needed
  const handleModeChange = (newMode: GameMode) => {
    setMode(newMode);
    if (newMode === "human_vs_engine") {
      if (player2Name === "Black" || player2Name === "Player 2") {
        setPlayer2Name("Stockfish");
      }
    } else {
      if (player2Name === "Stockfish") {
        setPlayer2Name("Black");
      }
    }
  };

  // Keyboard navigation & focus trap
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElementRef.current =
      document.activeElement as HTMLElement | null;

    const timer = setTimeout(() => {
      firstInputRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusableElements =
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElementRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFenChange = (value: string) => {
    setCustomFen(value);
    if (!value.trim()) {
      setFenError(null);
      return;
    }
    const validation = validateFen(value);
    if (!validation.isValid) {
      setFenError(validation.error ?? "Invalid FEN position string.");
    } else {
      setFenError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (showCustomFen && customFen.trim()) {
      const validation = validateFen(customFen);
      if (!validation.isValid) {
        setFenError(validation.error ?? "Invalid FEN position string.");
        return;
      }
    }

    const options: NewGameConfigOptions = {
      mode,
      player1Name: player1Name.slice(0, 32),
      player2Name: player2Name.slice(0, 32),
      player1Color,
      difficulty: mode === "human_vs_engine" ? difficulty : undefined,
      initialFen:
        showCustomFen && customFen.trim() ? customFen.trim() : undefined,
      timeControl,
    };

    const resolved = resolveNewGameSession(options);
    onStartGame(resolved);
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      data-testid="new-game-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-game-title"
        ref={dialogRef}
        data-testid="new-game-modal"
      >
        <header className="modal-header">
          <h2 id="new-game-title" className="modal-title">
            New Game Setup
          </h2>
          <button
            type="button"
            className="btn-close"
            data-testid="btn-close-modal"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Game Mode</label>
              <div
                className="mode-selector"
                role="radiogroup"
                aria-label="Game Mode"
              >
                <button
                  type="button"
                  className={`mode-card ${
                    mode === "human_vs_human" ? "mode-card--active" : ""
                  }`}
                  data-testid="mode-human-vs-human"
                  role="radio"
                  aria-checked={mode === "human_vs_human"}
                  onClick={() => handleModeChange("human_vs_human")}
                >
                  <span>👥 Human vs Human</span>
                </button>
                <button
                  type="button"
                  className={`mode-card ${
                    mode === "human_vs_engine" ? "mode-card--active" : ""
                  }`}
                  data-testid="mode-human-vs-engine"
                  role="radio"
                  aria-checked={mode === "human_vs_engine"}
                  onClick={() => handleModeChange("human_vs_engine")}
                >
                  <span>🤖 vs Computer</span>
                </button>
              </div>
            </div>

            <div className="form-group" data-testid="time-control-form-group">
              <TimeControlSelector
                value={timeControl}
                onChange={setTimeControl}
              />
            </div>

            {mode === "human_vs_engine" && (
              <div
                className="form-group"
                data-testid="difficulty-selection-group"
              >
                <label
                  htmlFor="engine-difficulty-select"
                  className="form-label"
                >
                  Computer Difficulty
                </label>
                <select
                  id="engine-difficulty-select"
                  className="form-input form-select"
                  data-testid="select-engine-difficulty"
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(
                      Number(e.target.value) as EngineDifficultyLevel
                    )
                  }
                >
                  {DIFFICULTY_PRESETS.map((p) => (
                    <option key={p.level} value={p.level}>
                      Level {p.level} – {p.label} (Depth {p.depth}, Max{" "}
                      {p.movetimeMs}ms)
                    </option>
                  ))}
                </select>

                <div
                  className="difficulty-info-card"
                  data-testid="difficulty-info-card"
                >
                  <div className="difficulty-info-header">
                    <span
                      className="difficulty-badge"
                      data-testid="difficulty-badge"
                    >
                      Level {preset.level}: {preset.label}
                    </span>
                    <span
                      className="difficulty-stats"
                      data-testid="difficulty-stats"
                    >
                      Skill {preset.skillLevel}/20 · Depth {preset.depth} · Max{" "}
                      {preset.movetimeMs}ms
                    </span>
                  </div>
                  <p
                    className="difficulty-desc"
                    data-testid="difficulty-description"
                  >
                    {preset.description}
                  </p>
                  <p className="difficulty-disclaimer">
                    Calculation depth and search time are strictly bounded for
                    responsive desktop play.
                  </p>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="player1-name-input" className="form-label">
                {mode === "human_vs_engine" ? "Your Name" : "Player 1 Name"}
              </label>
              <input
                id="player1-name-input"
                ref={firstInputRef}
                type="text"
                className="form-input"
                data-testid="input-player1-name"
                value={player1Name}
                maxLength={32}
                onChange={(e) => setPlayer1Name(e.target.value)}
                placeholder="White"
              />
            </div>

            <div className="form-group">
              <label htmlFor="player2-name-input" className="form-label">
                {mode === "human_vs_engine" ? "Computer Name" : "Player 2 Name"}
              </label>
              <input
                id="player2-name-input"
                type="text"
                className="form-input"
                data-testid="input-player2-name"
                value={player2Name}
                maxLength={32}
                onChange={(e) => setPlayer2Name(e.target.value)}
                placeholder={mode === "human_vs_engine" ? "Stockfish" : "Black"}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Play As (Color)</label>
              <div
                className="color-options"
                role="radiogroup"
                aria-label="Color Choice"
              >
                <button
                  type="button"
                  className={`color-card ${
                    player1Color === "w" ? "color-card--active" : ""
                  }`}
                  data-testid="color-choice-white"
                  role="radio"
                  aria-checked={player1Color === "w"}
                  onClick={() => setPlayer1Color("w")}
                >
                  <span>⚪ White</span>
                </button>
                <button
                  type="button"
                  className={`color-card ${
                    player1Color === "b" ? "color-card--active" : ""
                  }`}
                  data-testid="color-choice-black"
                  role="radio"
                  aria-checked={player1Color === "b"}
                  onClick={() => setPlayer1Color("b")}
                >
                  <span>⚫ Black</span>
                </button>
                <button
                  type="button"
                  className={`color-card ${
                    player1Color === "random" ? "color-card--active" : ""
                  }`}
                  data-testid="color-choice-random"
                  role="radio"
                  aria-checked={player1Color === "random"}
                  onClick={() => setPlayer1Color("random")}
                >
                  <span>🎲 Random</span>
                </button>
              </div>
            </div>

            <div className="form-group">
              <button
                type="button"
                className="custom-fen-toggle"
                data-testid="toggle-custom-fen"
                onClick={() => setShowCustomFen((prev) => !prev)}
                aria-expanded={showCustomFen}
              >
                {showCustomFen
                  ? "− Hide Custom Position (FEN)"
                  : "+ Custom Starting Position (FEN)"}
              </button>

              {showCustomFen && (
                <div className="form-group" style={{ marginTop: "0.5rem" }}>
                  <input
                    type="text"
                    className={`form-input ${
                      fenError ? "form-input--error" : ""
                    }`}
                    data-testid="input-custom-fen"
                    value={customFen}
                    onChange={(e) => handleFenChange(e.target.value)}
                    placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                  />
                  {fenError && (
                    <span
                      className="form-error"
                      data-testid="fen-validation-error"
                    >
                      {fenError}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <footer className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              data-testid="btn-cancel-new-game"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              data-testid="btn-submit-new-game"
              disabled={Boolean(fenError)}
            >
              Start Game
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};
