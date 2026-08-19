import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { validateFen } from "../../domain/chess/fen";
import { FenFileService } from "../../domain/persistence/FenFileService";
import { STANDARD_FEN_PRESETS } from "./fenPresets";
import "./FenModal.css";

export interface FenModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly currentFen: string;
  readonly onLoadFen: (fen: string) => void;
  readonly onStartGameFromFen: (fen: string) => void;
  readonly fileService?: FenFileService | undefined;
}

interface FenModalContentProps {
  readonly onClose: () => void;
  readonly currentFen: string;
  readonly onLoadFen: (fen: string) => void;
  readonly onStartGameFromFen: (fen: string) => void;
  readonly fileService?: FenFileService | undefined;
}

const FenModalContent: React.FC<FenModalContentProps> = ({
  onClose,
  currentFen,
  onLoadFen,
  onStartGameFromFen,
  fileService: injectedFileService,
}) => {
  const [defaultFileService] = useState(() => new FenFileService());
  const fileService = injectedFileService ?? defaultFileService;

  const [inputFen, setInputFen] = useState<string>(currentFen);
  const [copyCurrentFeedback, setCopyCurrentFeedback] =
    useState<boolean>(false);
  const [copyInputFeedback, setCopyInputFeedback] = useState<boolean>(false);
  const [downloadFeedback, setDownloadFeedback] = useState<boolean>(false);
  const [clipboardStatus, setClipboardStatus] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Keyboard accessibility: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Live validation
  const validation = useMemo(() => {
    const trimmed = inputFen.trim();
    if (!trimmed) {
      return { isValid: false, error: "FEN position cannot be empty." };
    }
    return validateFen(trimmed);
  }, [inputFen]);

  // Parse FEN metadata for display if valid
  const fenMetadata = useMemo(() => {
    if (!validation.isValid) return null;
    const tokens = inputFen.trim().split(/\s+/);
    if (tokens.length !== 6) return null;
    const activeColor = tokens[1] === "w" ? "White to move" : "Black to move";
    const castling = tokens[2] === "-" ? "None" : tokens[2] || "None";
    const enPassant = tokens[3] === "-" ? "None" : tokens[3];
    const halfmove = tokens[4];
    const fullmove = tokens[5];

    return {
      activeColor,
      castling,
      enPassant,
      halfmove,
      fullmove,
    };
  }, [validation.isValid, inputFen]);

  const handleCopyCurrentFen = useCallback(async () => {
    const success = await fileService.copyToClipboard(currentFen);
    if (success) {
      setCopyCurrentFeedback(true);
      setTimeout(() => setCopyCurrentFeedback(false), 2000);
    }
  }, [fileService, currentFen]);

  const handleCopyInputFen = useCallback(async () => {
    if (!inputFen.trim()) return;
    const success = await fileService.copyToClipboard(inputFen.trim());
    if (success) {
      setCopyInputFeedback(true);
      setTimeout(() => setCopyInputFeedback(false), 2000);
    }
  }, [fileService, inputFen]);

  const handlePasteFromClipboard = useCallback(async () => {
    const text = await fileService.readFromClipboard();
    if (text) {
      setInputFen(text);
      setClipboardStatus("Pasted from clipboard!");
      setTimeout(() => setClipboardStatus(null), 2000);
    } else {
      setClipboardStatus("Clipboard empty or access denied.");
      setTimeout(() => setClipboardStatus(null), 2500);
    }
  }, [fileService]);

  const handleDownloadFen = useCallback(() => {
    if (!validation.isValid) return;
    const filename = fileService.generateDefaultFilename();
    const success = fileService.downloadFenFile(filename, inputFen.trim());
    if (success) {
      setDownloadFeedback(true);
      setTimeout(() => setDownloadFeedback(false), 2000);
    }
  }, [fileService, validation.isValid, inputFen]);

  const handleSelectPreset = (fen: string) => {
    setInputFen(fen);
  };

  const handleLoadIntoGame = () => {
    if (!validation.isValid) return;
    onLoadFen(inputFen.trim());
    onClose();
  };

  const handleStartGame = () => {
    if (!validation.isValid) return;
    onStartGameFromFen(inputFen.trim());
    onClose();
  };

  return (
    <div
      className="fen-modal-overlay"
      data-testid="fen-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="fen-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fen-modal-title"
        aria-describedby="fen-modal-desc"
        data-testid="fen-modal"
        ref={modalRef}
      >
        <header className="fen-modal-header">
          <div className="fen-modal-title-group">
            <h2 id="fen-modal-title" className="fen-modal-title">
              FEN Position Setup & Export
            </h2>
            <p id="fen-modal-desc" className="fen-modal-subtitle">
              Inspect, copy, or set up arbitrary chess positions using
              Forsyth-Edwards Notation.
            </p>
          </div>
          <button
            type="button"
            className="fen-modal-close-btn"
            data-testid="btn-close-fen-modal"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </header>

        <div className="fen-modal-body">
          {/* Current Board Position Box */}
          <div className="fen-current-box" data-testid="fen-current-box">
            <div className="fen-box-header">
              <span className="fen-box-label">Current Board FEN</span>
              <button
                type="button"
                className="btn-fen btn-fen--secondary"
                data-testid="btn-copy-current-fen"
                onClick={handleCopyCurrentFen}
                title="Copy current active board FEN to clipboard"
              >
                {copyCurrentFeedback ? "✓ Copied!" : "📋 Copy Current FEN"}
              </button>
            </div>
            <code className="fen-box-code" data-testid="current-fen-display">
              {currentFen}
            </code>
          </div>

          {/* FEN Input & Paste Section */}
          <div className="fen-input-group">
            <div className="fen-input-header">
              <label htmlFor="fen-input-textarea" className="fen-box-label">
                Position FEN String
              </label>
              <div className="fen-input-actions">
                {clipboardStatus && (
                  <span
                    className="fen-toast-pill"
                    data-testid="fen-clipboard-toast"
                  >
                    {clipboardStatus}
                  </span>
                )}
                <button
                  type="button"
                  className="btn-fen btn-fen--secondary"
                  data-testid="btn-paste-fen"
                  onClick={handlePasteFromClipboard}
                  title="Paste FEN string from clipboard"
                >
                  📥 Paste
                </button>
                <button
                  type="button"
                  className="btn-fen btn-fen--secondary"
                  data-testid="btn-copy-input-fen"
                  onClick={handleCopyInputFen}
                  disabled={!inputFen.trim()}
                  title="Copy entered FEN string to clipboard"
                >
                  {copyInputFeedback ? "✓ Copied!" : "📋 Copy"}
                </button>
                <button
                  type="button"
                  className="btn-fen btn-fen--secondary"
                  data-testid="btn-clear-fen"
                  onClick={() => setInputFen("")}
                  disabled={!inputFen}
                  title="Clear input"
                >
                  ✕ Clear
                </button>
              </div>
            </div>
            <textarea
              id="fen-input-textarea"
              ref={textareaRef}
              className={`fen-textarea ${
                !validation.isValid ? "fen-textarea--invalid" : ""
              }`}
              data-testid="fen-input-textarea"
              value={inputFen}
              onChange={(e) => setInputFen(e.target.value)}
              placeholder="Paste or enter a 6-token FEN string..."
              rows={3}
              spellCheck={false}
              aria-invalid={!validation.isValid}
              aria-describedby="fen-validation-feedback"
            />
          </div>

          {/* Validation Feedback */}
          <div
            id="fen-validation-feedback"
            className={`fen-status-card ${
              validation.isValid
                ? "fen-status-card--valid"
                : "fen-status-card--invalid"
            }`}
            data-testid="fen-validation-card"
          >
            <div className="fen-status-details">
              <strong>
                {validation.isValid ? "✓ Valid FEN Position" : "⚠️ Invalid FEN"}
              </strong>
              {validation.isValid && fenMetadata && (
                <span className="fen-status-meta" data-testid="fen-meta-info">
                  {fenMetadata.activeColor} · Castling: {fenMetadata.castling} ·
                  EP: {fenMetadata.enPassant} · Move: {fenMetadata.fullmove}
                </span>
              )}
              {!validation.isValid && (
                <span data-testid="fen-error-message">{validation.error}</span>
              )}
            </div>
          </div>

          {/* Presets Grid */}
          <div className="fen-presets-section">
            <span className="fen-presets-title">Standard FEN Presets</span>
            <div className="fen-presets-grid" data-testid="fen-presets-grid">
              {STANDARD_FEN_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="btn-preset"
                  data-testid={`btn-preset-${preset.id}`}
                  onClick={() => handleSelectPreset(preset.fen)}
                  title={`${preset.name}: ${preset.description}`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <footer className="fen-modal-footer">
          <div className="fen-footer-actions-left">
            <button
              type="button"
              className="btn-fen btn-fen--secondary"
              data-testid="btn-download-fen"
              onClick={handleDownloadFen}
              disabled={!validation.isValid}
              title="Download position as a .fen file"
            >
              {downloadFeedback ? "✓ Saved!" : "💾 Save .FEN"}
            </button>
          </div>

          <div className="fen-footer-actions-right">
            <button
              type="button"
              className="btn-fen btn-fen--secondary"
              data-testid="btn-cancel-fen-modal"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-fen btn-fen--accent"
              data-testid="btn-start-game-fen"
              onClick={handleStartGame}
              disabled={!validation.isValid}
              title="Start a fresh game configured from this position"
            >
              Start Game with FEN
            </button>
            <button
              type="button"
              className="btn-fen btn-fen--primary"
              data-testid="btn-load-fen"
              onClick={handleLoadIntoGame}
              disabled={!validation.isValid}
              title="Load position immediately into current session"
            >
              Load into Game
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export const FenModal: React.FC<FenModalProps> = ({
  isOpen,
  onClose,
  currentFen,
  onLoadFen,
  onStartGameFromFen,
  fileService,
}) => {
  if (!isOpen) return null;

  return (
    <FenModalContent
      key={currentFen}
      onClose={onClose}
      currentFen={currentFen}
      onLoadFen={onLoadFen}
      onStartGameFromFen={onStartGameFromFen}
      fileService={fileService}
    />
  );
};
