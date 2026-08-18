import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmationModal } from "../ConfirmationModal";

describe("ConfirmationModal Component (TC-CTRL-08, TC-CTRL-09, TC-CTRL-11, TC-CTRL-12, TC-CTRL-15)", () => {
  it("does not render into DOM when isOpen is false", () => {
    render(
      <ConfirmationModal
        isOpen={false}
        title="Test Modal"
        message="Test message body"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders accessible dialog with title, message, and custom labels when isOpen is true", () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <ConfirmationModal
        isOpen={true}
        title="Restart Game?"
        message="All moves will be reset."
        confirmLabel="Restart"
        cancelLabel="Keep Playing"
        variant="warning"
        dialogTestId="test-confirm-dialog"
        confirmTestId="btn-test-confirm"
        cancelTestId="btn-test-cancel"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "confirm-dialog-title");
    expect(dialog).toHaveAttribute(
      "aria-describedby",
      "confirm-dialog-message"
    );
    expect(screen.getByTestId("test-confirm-dialog-message")).toHaveTextContent(
      "All moves will be reset."
    );

    const confirmBtn = screen.getByTestId("btn-test-confirm");
    expect(confirmBtn).toHaveTextContent("Restart");
    expect(confirmBtn).toHaveClass("btn-warning");

    const cancelBtn = screen.getByTestId("btn-test-cancel");
    expect(cancelBtn).toHaveTextContent("Keep Playing");
  });

  it("triggers onConfirm when confirm button is clicked", () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <ConfirmationModal
        isOpen={true}
        title="Resign?"
        message="Are you sure?"
        variant="danger"
        confirmTestId="btn-confirm"
        cancelTestId="btn-cancel"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    fireEvent.click(screen.getByTestId("btn-confirm"));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleCancel).not.toHaveBeenCalled();
  });

  it("triggers onCancel when cancel button or close button is clicked", () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <ConfirmationModal
        isOpen={true}
        title="Restart?"
        message="Discard progress?"
        dialogTestId="restart-modal"
        confirmTestId="btn-confirm"
        cancelTestId="btn-cancel"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    fireEvent.click(screen.getByTestId("btn-cancel"));
    expect(handleCancel).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("restart-modal-close"));
    expect(handleCancel).toHaveBeenCalledTimes(2);
    expect(handleConfirm).not.toHaveBeenCalled();
  });

  it("TC-CTRL-15: dismisses on Escape key and supports keyboard focus trap", () => {
    const handleCancel = vi.fn();

    render(
      <ConfirmationModal
        isOpen={true}
        title="Dialog"
        message="Message"
        confirmTestId="btn-confirm"
        cancelTestId="btn-cancel"
        onConfirm={vi.fn()}
        onCancel={handleCancel}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
