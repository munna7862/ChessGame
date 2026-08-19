import React, { useState, useRef, useCallback, useMemo } from "react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import type { PgnTags } from "../../domain/chess/pgn";
import { PgnFileService } from "../../domain/persistence/PgnFileService";
import type { PlayerConfig } from "./types";
import "./PgnExportModal.css";

export interface PgnExportModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onExportPgn: (tags?: Partial<PgnTags>) => string;
  readonly players: {
    readonly w: PlayerConfig;
    readonly b: PlayerConfig;
  };
  readonly moveCount: number;
  readonly isGameOver: boolean;
  readonly fileService?: PgnFileService | undefined;
}

export const PgnExportModal: React.FC<PgnExportModalProps> = ({
  isOpen,
  onClose,
  onExportPgn,
  players,
  moveCount,
  isGameOver,
  fileService: injectedFileService,
}) => {
  const [defaultFileService] = useState(() => new PgnFileService());
  const fileService = injectedFileService ?? defaultFileService;

  const [eventName, setEventName] = useState<string>("ChessForge Match");
  const [siteName, setSiteName] = useState<string>("ChessForge Desktop");
  const [roundNumber, setRoundNumber] = useState<string>("1");
  const [copiedFeedback, setCopiedFeedback] = useState<boolean>(false);
  const [downloadFeedback, setDownloadFeedback] = useState<boolean>(false);
  const [showTagCustomizer, setShowTagCustomizer] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const formattedPgn = useMemo(() => {
    if (!isOpen) return "";
    const today = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const dateStr = `${today.getFullYear()}.${pad(today.getMonth() + 1)}.${pad(today.getDate())}`;

    const tags: Partial<PgnTags> = {
      Event: eventName.trim() || "ChessForge Match",
      Site: siteName.trim() || "ChessForge Desktop",
      Date: dateStr,
      Round: roundNumber.trim() || "1",
      White: players.w.name,
      Black: players.b.name,
    };

    return onExportPgn(tags);
  }, [isOpen, eventName, siteName, roundNumber, players, onExportPgn]);

  // Focus trap & Escape to close
  useFocusTrap({
    isOpen,
    containerRef: modalRef,
    initialFocusRef: textareaRef,
    onEscape: onClose,
  });

  const handleCopyClipboard = useCallback(async () => {
    const success = await fileService.copyToClipboard(formattedPgn);
    if (success) {
      setCopiedFeedback(true);
      setTimeout(() => setCopiedFeedback(false), 2000);
    }
  }, [fileService, formattedPgn]);

  const handleDownloadFile = useCallback(() => {
    const filename = fileService.generateDefaultFilename(
      players.w.name,
      players.b.name
    );
    const success = fileService.downloadPgnFile(filename, formattedPgn);
    if (success) {
      setDownloadFeedback(true);
      setTimeout(() => setDownloadFeedback(false), 2000);
    }
  }, [fileService, players, formattedPgn]);

  const handleSelectAll = useCallback(() => {
    textareaRef.current?.select();
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="pgn-modal-overlay"
      data-testid="pgn-export-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="pgn-modal pgn-modal--export"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pgn-export-modal-title"
        aria-describedby="pgn-export-modal-desc"
        data-testid="pgn-export-modal"
        ref={modalRef}
      >
        <div className="pgn-modal-header">
          <div className="pgn-modal-title-group">
            <h2 id="pgn-export-modal-title" className="pgn-modal-title">
              Export PGN
            </h2>
            <p id="pgn-export-modal-desc" className="pgn-modal-subtitle">
              Export active match to Portable Game Notation with standard Seven
              Tag Roster.
            </p>
          </div>
          <button
            type="button"
            className="pgn-modal-close-btn"
            data-testid="btn-close-pgn-export-modal"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <div className="pgn-modal-body">
          {/* Match summary header */}
          <div className="pgn-export-summary">
            <div className="pgn-summary-match">
              <span className="pgn-player-tag pgn-player-tag--white">
                ♔ {players.w.name}
              </span>
              <span className="pgn-vs-divider">vs</span>
              <span className="pgn-player-tag pgn-player-tag--black">
                ♚ {players.b.name}
              </span>
            </div>
            <div className="pgn-summary-meta">
              <span>
                {moveCount} plies ({Math.ceil(moveCount / 2)} moves)
              </span>
              <span>·</span>
              <span>{isGameOver ? "Concluded" : "In Progress"}</span>
            </div>
          </div>

          {/* Tag Customizer Accordion */}
          <div className="pgn-customizer-toggle-row">
            <button
              type="button"
              className="pgn-customizer-toggle-btn"
              data-testid="btn-toggle-tag-customizer"
              onClick={() => setShowTagCustomizer((prev) => !prev)}
              aria-expanded={showTagCustomizer}
            >
              ⚙️{" "}
              {showTagCustomizer ? "Hide Header Tags" : "Customize Header Tags"}
            </button>
          </div>

          {showTagCustomizer && (
            <div
              className="pgn-customizer-fields"
              data-testid="pgn-customizer-fields"
            >
              <div className="pgn-customizer-row">
                <div className="pgn-customizer-field">
                  <label htmlFor="pgn-event-input" className="pgn-label">
                    Event
                  </label>
                  <input
                    id="pgn-event-input"
                    type="text"
                    className="pgn-input"
                    data-testid="input-pgn-event"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                  />
                </div>
                <div className="pgn-customizer-field">
                  <label htmlFor="pgn-round-input" className="pgn-label">
                    Round
                  </label>
                  <input
                    id="pgn-round-input"
                    type="text"
                    className="pgn-input"
                    data-testid="input-pgn-round"
                    value={roundNumber}
                    onChange={(e) => setRoundNumber(e.target.value)}
                  />
                </div>
              </div>
              <div className="pgn-customizer-field">
                <label htmlFor="pgn-site-input" className="pgn-label">
                  Site
                </label>
                <input
                  id="pgn-site-input"
                  type="text"
                  className="pgn-input"
                  data-testid="input-pgn-site"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* PGN Text Viewer */}
          <div className="pgn-input-group">
            <div className="pgn-viewer-header">
              <label htmlFor="pgn-export-textarea" className="pgn-label">
                PGN Output:
              </label>
              <button
                type="button"
                className="pgn-text-action-btn"
                data-testid="btn-select-all-pgn"
                onClick={handleSelectAll}
              >
                Select All
              </button>
            </div>
            <textarea
              id="pgn-export-textarea"
              ref={textareaRef}
              className="pgn-textarea pgn-textarea--readonly"
              data-testid="pgn-export-textarea"
              rows={9}
              readOnly
              value={formattedPgn}
              spellCheck={false}
            />
          </div>
        </div>

        <div className="pgn-modal-footer pgn-modal-footer--export">
          <div className="pgn-export-actions-left">
            <button
              type="button"
              className="pgn-btn pgn-btn--secondary"
              data-testid="btn-copy-pgn"
              onClick={handleCopyClipboard}
            >
              {copiedFeedback ? "✓ Copied!" : "📋 Copy to Clipboard"}
            </button>
            <button
              type="button"
              className="pgn-btn pgn-btn--primary"
              data-testid="btn-download-pgn"
              onClick={handleDownloadFile}
            >
              {downloadFeedback ? "✓ Downloaded!" : "💾 Download .pgn File"}
            </button>
          </div>
          <button
            type="button"
            className="pgn-btn pgn-btn--secondary"
            data-testid="btn-close-export-modal"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
