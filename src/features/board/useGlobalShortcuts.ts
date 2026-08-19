import { useEffect } from "react";

export interface GlobalShortcutsHandlers {
  readonly onNewGame?: () => void;
  readonly onUndo?: () => void;
  readonly onFlipBoard?: () => void;
  readonly onOpenSettings?: () => void;
  readonly onExportPgn?: () => void;
  readonly onImportPgn?: () => void;
  readonly onOpenFen?: () => void;
  readonly onOpenShortcuts?: () => void;
  readonly onEscape?: () => void;
}

export interface UseGlobalShortcutsOptions extends GlobalShortcutsHandlers {
  readonly enabled?: boolean | undefined;
}

function isTextInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toUpperCase();
  if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
    return true;
  }
  return target.isContentEditable;
}

/**
 * Custom hook to register accessible global keyboard shortcuts.
 */
export function useGlobalShortcuts({
  enabled = true,
  onNewGame,
  onUndo,
  onFlipBoard,
  onOpenSettings,
  onExportPgn,
  onImportPgn,
  onOpenFen,
  onOpenShortcuts,
  onEscape,
}: UseGlobalShortcutsOptions): void {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = isTextInputElement(e.target);
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // Escape always handles dismissal
      if (e.key === "Escape") {
        if (onEscape) {
          e.preventDefault();
          onEscape();
        }
        return;
      }

      // If user is currently typing in an input/textarea, suppress game shortcuts
      if (isInput) {
        return;
      }

      // Help shortcuts: ? or F1
      if (e.key === "?" || e.key === "F1") {
        if (onOpenShortcuts) {
          e.preventDefault();
          onOpenShortcuts();
        }
        return;
      }

      // Ctrl/Cmd + Shift + F: FEN dialog
      if (isCtrlOrMeta && e.shiftKey && (e.key === "F" || e.key === "f")) {
        if (onOpenFen) {
          e.preventDefault();
          onOpenFen();
        }
        return;
      }

      // Ctrl/Cmd + N: New Game
      if (isCtrlOrMeta && (e.key === "n" || e.key === "N")) {
        if (onNewGame) {
          e.preventDefault();
          onNewGame();
        }
        return;
      }

      // Ctrl/Cmd + Z or 'u' / 'U': Undo Move
      if (
        (isCtrlOrMeta && (e.key === "z" || e.key === "Z")) ||
        (!isCtrlOrMeta && (e.key === "u" || e.key === "U"))
      ) {
        if (onUndo) {
          e.preventDefault();
          onUndo();
        }
        return;
      }

      // Ctrl/Cmd + F or 'f' / 'F': Flip Board
      if (
        (isCtrlOrMeta && !e.shiftKey && (e.key === "f" || e.key === "F")) ||
        (!isCtrlOrMeta && (e.key === "f" || e.key === "F"))
      ) {
        if (onFlipBoard) {
          e.preventDefault();
          onFlipBoard();
        }
        return;
      }

      // Ctrl/Cmd + , : Settings
      if (isCtrlOrMeta && e.key === ",") {
        if (onOpenSettings) {
          e.preventDefault();
          onOpenSettings();
        }
        return;
      }

      // Ctrl/Cmd + E: Export PGN
      if (isCtrlOrMeta && (e.key === "e" || e.key === "E")) {
        if (onExportPgn) {
          e.preventDefault();
          onExportPgn();
        }
        return;
      }

      // Ctrl/Cmd + I: Import PGN
      if (isCtrlOrMeta && (e.key === "i" || e.key === "I")) {
        if (onImportPgn) {
          e.preventDefault();
          onImportPgn();
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [
    enabled,
    onNewGame,
    onUndo,
    onFlipBoard,
    onOpenSettings,
    onExportPgn,
    onImportPgn,
    onOpenFen,
    onOpenShortcuts,
    onEscape,
  ]);
}

export default useGlobalShortcuts;
