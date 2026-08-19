import React, { useState, useEffect, useRef } from "react";
import { AppearanceSettingsSection } from "./AppearanceSettingsSection";
import { GameplaySettingsSection } from "./GameplaySettingsSection";
import { AudioMotionSettingsSection } from "./AudioMotionSettingsSection";
import { EngineSettingsSection } from "./EngineSettingsSection";
import { ResetSettingsConfirmModal } from "./ResetSettingsConfirmModal";
import { useSettings } from "../useSettings";
import "./SettingsModal.css";

export type SettingsTab = "appearance" | "gameplay" | "audio_motion" | "engine";

export interface SettingsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly defaultTab?: SettingsTab | undefined;
}

interface SettingsModalContentProps {
  readonly onClose: () => void;
  readonly defaultTab?: SettingsTab | undefined;
}

const SettingsModalContent: React.FC<SettingsModalContentProps> = ({
  onClose,
  defaultTab = "appearance",
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(defaultTab);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const { resetSettings } = useSettings();

  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Keyboard navigation & focus trap
  useEffect(() => {
    previouslyFocusedElementRef.current =
      document.activeElement as HTMLElement | null;

    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isResetConfirmOpen) {
          setIsResetConfirmOpen(false);
          return;
        }
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current && !isResetConfirmOpen) {
        const focusableElements =
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
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
  }, [onClose, isResetConfirmOpen]);

  const handleConfirmReset = () => {
    resetSettings();
    setIsResetConfirmOpen(false);
  };

  return (
    <>
      <div
        className="modal-overlay settings-modal-overlay"
        data-testid="settings-modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isResetConfirmOpen) {
            onClose();
          }
        }}
      >
        <div
          className="modal-dialog settings-modal-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-dialog-title"
          ref={dialogRef}
          data-testid="settings-modal"
        >
          <header className="modal-header settings-header">
            <div className="settings-header-title-group">
              <span className="settings-header-icon" aria-hidden="true">
                ⚙️
              </span>
              <h2 id="settings-dialog-title" className="modal-title">
                Preferences & Settings
              </h2>
            </div>
            <button
              type="button"
              ref={closeButtonRef}
              className="btn-close"
              data-testid="btn-close-settings"
              onClick={onClose}
              aria-label="Close settings dialog"
            >
              ×
            </button>
          </header>

          <nav
            className="settings-tabs-nav"
            role="tablist"
            aria-label="Settings Categories"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "appearance"}
              aria-controls="settings-tabpanel-appearance"
              id="settings-tab-appearance"
              className={`settings-tab-btn ${
                activeTab === "appearance" ? "settings-tab-btn--active" : ""
              }`}
              data-testid="tab-appearance"
              onClick={() => setActiveTab("appearance")}
            >
              🎨 Appearance
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "gameplay"}
              aria-controls="settings-tabpanel-gameplay"
              id="settings-tab-gameplay"
              className={`settings-tab-btn ${
                activeTab === "gameplay" ? "settings-tab-btn--active" : ""
              }`}
              data-testid="tab-gameplay"
              onClick={() => setActiveTab("gameplay")}
            >
              ♟️ Gameplay
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "audio_motion"}
              aria-controls="settings-tabpanel-audio-motion"
              id="settings-tab-audio-motion"
              className={`settings-tab-btn ${
                activeTab === "audio_motion" ? "settings-tab-btn--active" : ""
              }`}
              data-testid="tab-audio-motion"
              onClick={() => setActiveTab("audio_motion")}
            >
              🔊 Sound & Motion
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "engine"}
              aria-controls="settings-tabpanel-engine"
              id="settings-tab-engine"
              className={`settings-tab-btn ${
                activeTab === "engine" ? "settings-tab-btn--active" : ""
              }`}
              data-testid="tab-engine"
              onClick={() => setActiveTab("engine")}
            >
              🤖 AI Engine
            </button>
          </nav>

          <div
            className="modal-body settings-body"
            role="tabpanel"
            id={`settings-tabpanel-${activeTab}`}
            aria-labelledby={`settings-tab-${activeTab}`}
          >
            {activeTab === "appearance" && <AppearanceSettingsSection />}
            {activeTab === "gameplay" && <GameplaySettingsSection />}
            {activeTab === "audio_motion" && <AudioMotionSettingsSection />}
            {activeTab === "engine" && <EngineSettingsSection />}
          </div>

          <footer className="modal-footer settings-footer">
            <button
              type="button"
              className="btn-secondary btn-reset-settings"
              data-testid="btn-reset-settings"
              onClick={() => setIsResetConfirmOpen(true)}
            >
              Reset to Defaults
            </button>
            <button
              type="button"
              className="btn-primary"
              data-testid="btn-done-settings"
              onClick={onClose}
            >
              Done
            </button>
          </footer>
        </div>
      </div>

      <ResetSettingsConfirmModal
        isOpen={isResetConfirmOpen}
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </>
  );
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  defaultTab,
}) => {
  if (!isOpen) return null;

  return <SettingsModalContent onClose={onClose} defaultTab={defaultTab} />;
};

export default SettingsModal;
