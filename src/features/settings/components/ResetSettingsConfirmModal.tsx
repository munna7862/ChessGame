import React from "react";
import { ConfirmationModal } from "../../../components/ConfirmationModal";

export interface ResetSettingsConfirmModalProps {
  readonly isOpen: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

export const ResetSettingsConfirmModal: React.FC<
  ResetSettingsConfirmModalProps
> = ({ isOpen, onConfirm, onCancel }) => {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      title="Reset All Settings?"
      message="Are you sure you want to restore all settings to default values? This will reset your board theme, piece styling, audio, motion preferences, and engine difficulty."
      confirmLabel="Reset to Defaults"
      cancelLabel="Cancel"
      variant="warning"
      dialogTestId="reset-settings-confirm-modal"
      confirmTestId="btn-confirm-reset-settings"
      cancelTestId="btn-cancel-reset-settings"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
};
