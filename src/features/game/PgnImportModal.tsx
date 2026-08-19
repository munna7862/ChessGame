import React, { useState, useRef, useCallback, useMemo } from "react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import type { ChessDomainError } from "../../domain/chess/errors";
import { PgnFileService } from "../../domain/persistence/PgnFileService";
import type { PgnPreview } from "./types";
import "./PgnImportModal.css";

export interface PgnImportModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onImportPgn: (
    pgn: string,
    options?: { updatePlayerNames?: boolean }
  ) => void;
  readonly validatePgn: (
    pgn: string
  ) =>
    | { success: true; data: PgnPreview }
    | { success: false; error: ChessDomainError };
  readonly fileService?: PgnFileService | undefined;
}

export const PgnImportModal: React.FC<PgnImportModalProps> = ({
  isOpen,
  onClose,
  onImportPgn,
  validatePgn,
  fileService: injectedFileService,
}) => {
  const [defaultFileService] = useState(() => new PgnFileService());
  const fileService = injectedFileService ?? defaultFileService;

  const [pgnText, setPgnText] = useState<string>("");
  const [updatePlayerNames, setUpdatePlayerNames] = useState<boolean>(true);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isReadingFile, setIsReadingFile] = useState<boolean>(false);
  const [clipboardFeedback, setClipboardFeedback] = useState<string | null>(
    null
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute validationResult and validationError reactively from pgnText
  const { validationResult, validationError } = useMemo(() => {
    const trimmed = pgnText.trim();
    if (!trimmed) {
      return { validationResult: null, validationError: null };
    }

    const res = validatePgn(trimmed);
    if (res.success) {
      return { validationResult: res.data, validationError: null };
    } else {
      return {
        validationResult: null,
        validationError: res.error.message || "Invalid PGN data.",
      };
    }
  }, [pgnText, validatePgn]);

  const errorMessage = fileError ?? validationError;

  // Focus trap & Escape to close
  useFocusTrap({
    isOpen,
    containerRef: modalRef,
    initialFocusRef: textareaRef,
    onEscape: onClose,
  });

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const file = files[0]!;
      setIsReadingFile(true);
      setFileError(null);

      const readRes = await fileService.readPgnFile(file);
      setIsReadingFile(false);

      if (readRes.success) {
        setFileError(null);
        setPgnText(readRes.data);
      } else {
        setFileError(readRes.error.message);
      }

      // Reset file input so same file can be re-selected if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [fileService]
  );

  const handlePasteFromClipboard = useCallback(async () => {
    const clipboardText = await fileService.readFromClipboard();
    if (clipboardText) {
      setPgnText(clipboardText);
      setClipboardFeedback("Pasted from clipboard!");
      setTimeout(() => setClipboardFeedback(null), 2000);
    } else {
      setClipboardFeedback("Clipboard empty or access denied.");
      setTimeout(() => setClipboardFeedback(null), 2500);
    }
  }, [fileService]);

  const handleConfirmImport = () => {
    if (!validationResult) return;
    onImportPgn(pgnText.trim(), { updatePlayerNames });
    onClose();
  };

  if (!isOpen) return null;

  const resultLabel = (result: string) => {
    switch (result) {
      case "1-0":
        return "1-0 (White won)";
      case "0-1":
        return "0-1 (Black won)";
      case "1/2-1/2":
        return "1/2-1/2 (Draw)";
      case "*":
        return "* (Game in progress)";
      default:
        return result;
    }
  };

  return (
    <div
      className="pgn-modal-overlay"
      data-testid="pgn-import-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="pgn-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pgn-import-modal-title"
        aria-describedby="pgn-import-modal-desc"
        data-testid="pgn-import-modal"
        ref={modalRef}
      >
        <div className="pgn-modal-header">
          <div className="pgn-modal-title-group">
            <h2 id="pgn-import-modal-title" className="pgn-modal-title">
              Import PGN Game
            </h2>
            <p id="pgn-import-modal-desc" className="pgn-modal-subtitle">
              Paste standard Portable Game Notation or upload a .pgn file to
              load a match.
            </p>
          </div>
          <button
            type="button"
            className="pgn-modal-close-btn"
            data-testid="btn-close-pgn-import-modal"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <div className="pgn-modal-body">
          <div className="pgn-import-toolbar">
            <input
              type="file"
              ref={fileInputRef}
              accept=".pgn,text/plain"
              style={{ display: "none" }}
              onChange={handleFileUpload}
              data-testid="pgn-file-input"
            />
            <button
              type="button"
              className="pgn-action-btn"
              data-testid="btn-upload-pgn-file"
              onClick={() => fileInputRef.current?.click()}
              disabled={isReadingFile}
            >
              📁 Choose .pgn File
            </button>
            <button
              type="button"
              className="pgn-action-btn"
              data-testid="btn-paste-clipboard"
              onClick={handlePasteFromClipboard}
            >
              📋 Paste Clipboard
            </button>
            {pgnText && (
              <button
                type="button"
                className="pgn-action-btn pgn-action-btn--secondary"
                data-testid="btn-clear-pgn-text"
                onClick={() => setPgnText("")}
              >
                Clear Text
              </button>
            )}
            {clipboardFeedback && (
              <span
                className="pgn-clipboard-toast"
                data-testid="clipboard-toast"
              >
                {clipboardFeedback}
              </span>
            )}
          </div>

          <div className="pgn-input-group">
            <label htmlFor="pgn-textarea" className="pgn-label">
              PGN Text (Tags &amp; Moves):
            </label>
            <textarea
              id="pgn-textarea"
              ref={textareaRef}
              className="pgn-textarea"
              data-testid="pgn-import-textarea"
              rows={7}
              placeholder='[Event "World Championship"]\n[White "Carlsen, Magnus"]\n[Black "Nepomniachtchi, Ian"]\n[Result "1-0"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 1-0'
              value={pgnText}
              onChange={(e) => setPgnText(e.target.value)}
              spellCheck={false}
            />
          </div>

          {/* Validation Error Banner */}
          {errorMessage && (
            <div
              className="pgn-validation-banner pgn-validation-banner--error"
              role="alert"
              data-testid="pgn-import-error-banner"
            >
              <div className="pgn-banner-icon">⚠️</div>
              <div className="pgn-banner-content">
                <strong>Invalid PGN</strong>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Validation Success & Preview Card */}
          {validationResult && (
            <div
              className="pgn-preview-card"
              data-testid="pgn-import-preview-card"
            >
              <div className="pgn-preview-header">
                <span className="pgn-preview-badge">✓ Valid PGN Replay</span>
                <span className="pgn-preview-event">
                  {validationResult.event} · {validationResult.date}
                </span>
              </div>

              <div className="pgn-preview-grid">
                <div className="pgn-preview-item">
                  <span className="pgn-preview-label">White Player</span>
                  <span
                    className="pgn-preview-value"
                    data-testid="preview-white-player"
                  >
                    {validationResult.whiteName}
                  </span>
                </div>
                <div className="pgn-preview-item">
                  <span className="pgn-preview-label">Black Player</span>
                  <span
                    className="pgn-preview-value"
                    data-testid="preview-black-player"
                  >
                    {validationResult.blackName}
                  </span>
                </div>
                <div className="pgn-preview-item">
                  <span className="pgn-preview-label">Move Count</span>
                  <span
                    className="pgn-preview-value"
                    data-testid="preview-move-count"
                  >
                    {validationResult.moveCount} plies (
                    {Math.ceil(validationResult.moveCount / 2)} moves)
                  </span>
                </div>
                <div className="pgn-preview-item">
                  <span className="pgn-preview-label">Result</span>
                  <span
                    className="pgn-preview-value"
                    data-testid="preview-result"
                  >
                    {resultLabel(validationResult.result)}
                  </span>
                </div>
              </div>

              {validationResult.startingFen && (
                <div className="pgn-preview-fen">
                  <span className="pgn-preview-label">Custom Start FEN:</span>
                  <code>{validationResult.startingFen}</code>
                </div>
              )}
            </div>
          )}

          {/* Options */}
          <div className="pgn-options-group">
            <label className="pgn-checkbox-label">
              <input
                type="checkbox"
                data-testid="checkbox-update-players"
                checked={updatePlayerNames}
                onChange={(e) => setUpdatePlayerNames(e.target.checked)}
              />
              <span>Update player names from PGN header tags</span>
            </label>
          </div>

          <div className="pgn-notice">
            <span>
              ℹ️ Loading this PGN will replace the current active game session
              and move history.
            </span>
          </div>
        </div>

        <div className="pgn-modal-footer">
          <button
            type="button"
            className="pgn-btn pgn-btn--secondary"
            data-testid="btn-cancel-import-pgn"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="pgn-btn pgn-btn--primary"
            data-testid="btn-confirm-import-pgn"
            onClick={handleConfirmImport}
            disabled={!validationResult}
          >
            Load Game
          </button>
        </div>
      </div>
    </div>
  );
};
