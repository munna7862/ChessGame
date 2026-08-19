import React, { useRef } from "react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import "./ShortcutsModal.css";

export interface ShortcutsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

interface ShortcutEntry {
  readonly keys: string[];
  readonly description: string;
}

const BOARD_SHORTCUTS: ShortcutEntry[] = [
  { keys: ["↑", "↓", "←", "→"], description: "Navigate chessboard squares" },
  { keys: ["Home", "End"], description: "Jump to start / end of rank" },
  { keys: ["PageUp", "PageDown"], description: "Jump to top / bottom of file" },
  { keys: ["Enter", "Space"], description: "Select square / execute move" },
  { keys: ["Escape"], description: "Clear selection / cancel promotion" },
];

const GAME_SHORTCUTS: ShortcutEntry[] = [
  { keys: ["Ctrl + N"], description: "Start new game" },
  { keys: ["Ctrl + Z", "u"], description: "Undo last move" },
  { keys: ["Ctrl + F", "f"], description: "Flip board perspective" },
  { keys: ["Escape"], description: "Dismiss open dialog or menu" },
];

const TOOLS_SHORTCUTS: ShortcutEntry[] = [
  { keys: ["Ctrl + ,"], description: "Open Settings" },
  { keys: ["Ctrl + E"], description: "Export PGN" },
  { keys: ["Ctrl + I"], description: "Import PGN" },
  { keys: ["Ctrl + Shift + F"], description: "Open FEN position editor" },
  { keys: ["?", "F1"], description: "Show this Keyboard Shortcuts help" },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useFocusTrap({
    isOpen,
    containerRef,
    initialFocusRef: closeButtonRef,
    onEscape: onClose,
  });

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      data-testid="shortcuts-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="modal-dialog shortcuts-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-modal-title"
        ref={containerRef}
        data-testid="shortcuts-modal"
      >
        <header className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span aria-hidden="true" style={{ fontSize: "1.2rem" }}>
              ⌨️
            </span>
            <h2 id="shortcuts-modal-title" className="modal-title">
              Keyboard Shortcuts &amp; Accessibility
            </h2>
          </div>
          <button
            type="button"
            ref={closeButtonRef}
            className="btn-close"
            data-testid="btn-close-shortcuts"
            onClick={onClose}
            aria-label="Close shortcuts dialog"
          >
            ×
          </button>
        </header>

        <div className="shortcuts-body">
          <section
            className="shortcuts-group"
            aria-labelledby="group-board-nav"
          >
            <h3 id="group-board-nav" className="shortcuts-group-title">
              Chessboard Navigation
            </h3>
            <ul className="shortcuts-list">
              {BOARD_SHORTCUTS.map((item) => (
                <li key={item.description} className="shortcut-item">
                  <span className="shortcut-desc">{item.description}</span>
                  <div className="shortcut-keys">
                    {item.keys.map((k, idx) => (
                      <React.Fragment key={k}>
                        {idx > 0 && <span className="kbd-separator">or</span>}
                        <kbd className="kbd-badge">{k}</kbd>
                      </React.Fragment>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section
            className="shortcuts-group"
            aria-labelledby="group-game-actions"
          >
            <h3 id="group-game-actions" className="shortcuts-group-title">
              Game Actions
            </h3>
            <ul className="shortcuts-list">
              {GAME_SHORTCUTS.map((item) => (
                <li key={item.description} className="shortcut-item">
                  <span className="shortcut-desc">{item.description}</span>
                  <div className="shortcut-keys">
                    {item.keys.map((k, idx) => (
                      <React.Fragment key={k}>
                        {idx > 0 && <span className="kbd-separator">or</span>}
                        <kbd className="kbd-badge">{k}</kbd>
                      </React.Fragment>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="shortcuts-group" aria-labelledby="group-tools">
            <h3 id="group-tools" className="shortcuts-group-title">
              Application &amp; Modals
            </h3>
            <ul className="shortcuts-list">
              {TOOLS_SHORTCUTS.map((item) => (
                <li key={item.description} className="shortcut-item">
                  <span className="shortcut-desc">{item.description}</span>
                  <div className="shortcut-keys">
                    {item.keys.map((k, idx) => (
                      <React.Fragment key={k}>
                        {idx > 0 && <span className="kbd-separator">or</span>}
                        <kbd className="kbd-badge">{k}</kbd>
                      </React.Fragment>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <footer className="modal-footer">
          <button
            type="button"
            className="btn-primary"
            data-testid="btn-shortcuts-ok"
            onClick={onClose}
          >
            Got it
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ShortcutsModal;
