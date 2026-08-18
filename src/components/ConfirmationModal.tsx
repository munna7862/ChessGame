import React, { useEffect, useRef } from "react";
import "./ConfirmationModal.css";

export interface ConfirmationModalProps {
  readonly isOpen: boolean;
  readonly title: string;
  readonly message: string;
  readonly confirmLabel?: string | undefined;
  readonly cancelLabel?: string | undefined;
  readonly variant?: "warning" | "danger" | "info" | undefined;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  readonly dialogTestId?: string | undefined;
  readonly confirmTestId?: string | undefined;
  readonly cancelTestId?: string | undefined;
}

/**
 * Accessible confirmation dialog for destructive or terminal game actions
 * such as Restarting or Resigning.
 */
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "warning",
  onConfirm,
  onCancel,
  dialogTestId = "confirmation-modal",
  confirmTestId = "btn-confirm-action",
  cancelTestId = "btn-cancel-action",
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElementRef.current =
      document.activeElement as HTMLElement | null;

    const timer = setTimeout(() => {
      confirmButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
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
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      data-testid={`${dialogTestId}-overlay`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        className={`modal-dialog confirm-dialog confirm-dialog--${variant}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        ref={dialogRef}
        data-testid={dialogTestId}
      >
        <header className="modal-header confirm-header">
          <div className="confirm-icon-wrapper" aria-hidden="true">
            {variant === "danger" ? "⚠️" : variant === "warning" ? "⚡" : "ℹ️"}
          </div>
          <h2 id="confirm-dialog-title" className="modal-title">
            {title}
          </h2>
          <button
            type="button"
            className="btn-close"
            data-testid={`${dialogTestId}-close`}
            onClick={onCancel}
            aria-label="Close dialog"
          >
            ×
          </button>
        </header>

        <div className="modal-body confirm-body">
          <p
            id="confirm-dialog-message"
            className="confirm-message"
            data-testid={`${dialogTestId}-message`}
          >
            {message}
          </p>
        </div>

        <footer className="modal-footer confirm-footer">
          <button
            type="button"
            className="btn-secondary"
            data-testid={cancelTestId}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            ref={confirmButtonRef}
            className={`btn-primary ${
              variant === "danger"
                ? "btn-danger"
                : variant === "warning"
                  ? "btn-warning"
                  : ""
            }`}
            data-testid={confirmTestId}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </footer>
      </div>
    </div>
  );
};
