import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PgnImportModal } from "../PgnImportModal";
import { createGameSession } from "../GameSessionController";

describe("PgnImportModal Component (TC-PGN-UI-10, TC-PGN-UI-11, TC-PGN-UI-15)", () => {
  const session = createGameSession();
  const mockOnClose = vi.fn();
  const mockOnImportPgn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <PgnImportModal
        isOpen={false}
        onClose={mockOnClose}
        onImportPgn={mockOnImportPgn}
        validatePgn={(pgn) => session.validatePgn(pgn)}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders textarea, buttons, and closes on close button click or Escape key", async () => {
    render(
      <PgnImportModal
        isOpen={true}
        onClose={mockOnClose}
        onImportPgn={mockOnImportPgn}
        validatePgn={(pgn) => session.validatePgn(pgn)}
      />
    );

    expect(screen.getByTestId("pgn-import-modal")).toBeInTheDocument();
    expect(screen.getByTestId("pgn-import-textarea")).toBeInTheDocument();
    expect(screen.getByTestId("btn-confirm-import-pgn")).toBeDisabled();

    // Click close button
    fireEvent.click(screen.getByTestId("btn-close-pgn-import-modal"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    // Escape key
    fireEvent.keyDown(window, { key: "Escape" });
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });

  it("shows validation error banner when invalid PGN is typed", async () => {
    render(
      <PgnImportModal
        isOpen={true}
        onClose={mockOnClose}
        onImportPgn={mockOnImportPgn}
        validatePgn={(pgn) => session.validatePgn(pgn)}
      />
    );

    const textarea = screen.getByTestId("pgn-import-textarea");
    fireEvent.change(textarea, {
      target: { value: "1. e4 e5 2. InvalidSanMove" },
    });

    await waitFor(() => {
      expect(screen.getByTestId("pgn-import-error-banner")).toBeInTheDocument();
      expect(screen.getByTestId("btn-confirm-import-pgn")).toBeDisabled();
    });
  });

  it("shows preview card and enables Load button when valid PGN is entered", async () => {
    render(
      <PgnImportModal
        isOpen={true}
        onClose={mockOnClose}
        onImportPgn={mockOnImportPgn}
        validatePgn={(pgn) => session.validatePgn(pgn)}
      />
    );

    const validPgn = `[Event "Candidates 2026"]
[White "Fabiano Caruana"]
[Black "Ian Nepomniachtchi"]
[Result "1/2-1/2"]

1. e4 e5 2. Nf3 Nc6 1/2-1/2`;

    const textarea = screen.getByTestId("pgn-import-textarea");
    fireEvent.change(textarea, { target: { value: validPgn } });

    await waitFor(() => {
      expect(screen.getByTestId("pgn-import-preview-card")).toBeInTheDocument();
      expect(screen.getByTestId("preview-white-player")).toHaveTextContent(
        "Fabiano Caruana"
      );
      expect(screen.getByTestId("preview-black-player")).toHaveTextContent(
        "Ian Nepomniachtchi"
      );
      expect(screen.getByTestId("btn-confirm-import-pgn")).not.toBeDisabled();
    });

    // Click confirm
    fireEvent.click(screen.getByTestId("btn-confirm-import-pgn"));
    expect(mockOnImportPgn).toHaveBeenCalledWith(validPgn, {
      updatePlayerNames: true,
    });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
