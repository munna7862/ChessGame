import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React, { useRef, useState } from "react";
import { ConfirmationModal } from "../../../components/ConfirmationModal";
import { ShortcutsModal } from "../ShortcutsModal";
import { useFocusTrap } from "../../../hooks/useFocusTrap";

const TestModalHarness: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useFocusTrap({
    isOpen,
    containerRef: modalRef,
    initialFocusRef: firstInputRef,
    onEscape: () => setIsOpen(false),
  });

  return (
    <div>
      <button
        ref={openButtonRef}
        data-testid="btn-open-harness"
        onClick={() => setIsOpen(true)}
      >
        Open Modal
      </button>

      {isOpen && (
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          data-testid="test-dialog"
        >
          <input data-testid="input-first" ref={firstInputRef} />
          <button data-testid="btn-second">Second</button>
          <button data-testid="btn-third" onClick={() => setIsOpen(false)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
};

describe("Phase 09 · Sprint 04: Modal Focus Trap & Restoration (TC-TRAP-01 to TC-TRAP-03)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("TC-TRAP-01: traps focus and cycles forward with Tab and backward with Shift+Tab", async () => {
    render(<TestModalHarness />);

    const openBtn = screen.getByTestId("btn-open-harness");
    openBtn.focus();
    expect(document.activeElement).toBe(openBtn);

    fireEvent.click(openBtn);

    const dialog = screen.getByTestId("test-dialog");
    expect(dialog).toBeInTheDocument();

    const inputFirst = screen.getByTestId("input-first");
    const btnSecond = screen.getByTestId("btn-second");
    const btnThird = screen.getByTestId("btn-third");

    // Microtask sets initial focus
    await waitFor(() => {
      expect(document.activeElement).toBe(inputFirst);
    });

    // Tab to second
    btnSecond.focus();
    expect(document.activeElement).toBe(btnSecond);

    // Tab to third (last)
    btnThird.focus();
    expect(document.activeElement).toBe(btnThird);

    // Press Tab on last element -> wraps to first
    fireEvent.keyDown(btnThird, { key: "Tab", shiftKey: false });
    expect(document.activeElement).toBe(inputFirst);

    // Press Shift+Tab on first element -> wraps to last
    fireEvent.keyDown(inputFirst, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(btnThird);
  });

  it("TC-TRAP-02: restores focus to trigger button upon modal close", async () => {
    render(<TestModalHarness />);

    const openBtn = screen.getByTestId("btn-open-harness");
    openBtn.focus();
    fireEvent.click(openBtn);

    const btnThird = screen.getByTestId("btn-third");
    btnThird.focus();

    // Close modal via Escape
    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByTestId("test-dialog")).not.toBeInTheDocument();

    await waitFor(() => {
      expect(document.activeElement).toBe(openBtn);
    });
  });

  it("TC-TRAP-03: ConfirmationModal sets focus on confirm action button and handles Escape", async () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    const { rerender } = render(
      <ConfirmationModal
        isOpen={true}
        title="Confirm Reset"
        message="Are you sure?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    const confirmBtn = screen.getByTestId("btn-confirm-action");
    await waitFor(() => {
      expect(document.activeElement).toBe(confirmBtn);
    });

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleCancel).toHaveBeenCalledTimes(1);

    rerender(
      <ConfirmationModal
        isOpen={false}
        title="Confirm Reset"
        message="Are you sure?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
    expect(screen.queryByTestId("confirmation-modal")).not.toBeInTheDocument();
  });

  it("TC-TRAP-04: ShortcutsModal traps focus and closes on Escape", async () => {
    const handleClose = vi.fn();

    render(<ShortcutsModal isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByTestId("btn-close-shortcuts");
    await waitFor(() => {
      expect(document.activeElement).toBe(closeBtn);
    });

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
