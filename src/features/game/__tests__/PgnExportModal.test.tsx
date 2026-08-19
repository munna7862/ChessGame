import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PgnExportModal } from "../PgnExportModal";
import { PgnFileService } from "../../../domain/persistence/PgnFileService";

describe("PgnExportModal Component (TC-PGN-UI-01 to TC-PGN-UI-04, TC-PGN-UI-15)", () => {
  const mockOnClose = vi.fn();
  const mockOnExportPgn = vi
    .fn()
    .mockReturnValue(
      '[Event "ChessForge Match"]\n[White "Alice"]\n[Black "Bob"]\n\n1. e4 e5 *'
    );
  const mockFileService = new PgnFileService();

  const defaultPlayers = {
    w: { id: "p1", name: "Alice", color: "w" as const, type: "human" as const },
    b: { id: "p2", name: "Bob", color: "b" as const, type: "human" as const },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <PgnExportModal
        isOpen={false}
        onClose={mockOnClose}
        onExportPgn={mockOnExportPgn}
        players={defaultPlayers}
        moveCount={2}
        isGameOver={false}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders match summary, PGN textarea, and closes on close button or Escape", () => {
    render(
      <PgnExportModal
        isOpen={true}
        onClose={mockOnClose}
        onExportPgn={mockOnExportPgn}
        players={defaultPlayers}
        moveCount={2}
        isGameOver={false}
      />
    );

    expect(screen.getByTestId("pgn-export-modal")).toBeInTheDocument();
    expect(screen.getByTestId("pgn-export-textarea")).toHaveValue(
      '[Event "ChessForge Match"]\n[White "Alice"]\n[Black "Bob"]\n\n1. e4 e5 *'
    );

    fireEvent.click(screen.getByTestId("btn-close-pgn-export-modal"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });

  it("copies PGN to clipboard when Copy button is clicked", async () => {
    const copySpy = vi
      .spyOn(mockFileService, "copyToClipboard")
      .mockResolvedValue(true);

    render(
      <PgnExportModal
        isOpen={true}
        onClose={mockOnClose}
        onExportPgn={mockOnExportPgn}
        players={defaultPlayers}
        moveCount={2}
        isGameOver={false}
        fileService={mockFileService}
      />
    );

    fireEvent.click(screen.getByTestId("btn-copy-pgn"));
    await waitFor(() => {
      expect(copySpy).toHaveBeenCalledTimes(1);
    });
  });

  it("downloads PGN file when Download button is clicked", () => {
    const downloadSpy = vi
      .spyOn(mockFileService, "downloadPgnFile")
      .mockReturnValue(true);

    render(
      <PgnExportModal
        isOpen={true}
        onClose={mockOnClose}
        onExportPgn={mockOnExportPgn}
        players={defaultPlayers}
        moveCount={2}
        isGameOver={false}
        fileService={mockFileService}
      />
    );

    fireEvent.click(screen.getByTestId("btn-download-pgn"));
    expect(downloadSpy).toHaveBeenCalledTimes(1);
  });

  it("toggles custom tag fields and re-exports with updated tags", () => {
    render(
      <PgnExportModal
        isOpen={true}
        onClose={mockOnClose}
        onExportPgn={mockOnExportPgn}
        players={defaultPlayers}
        moveCount={2}
        isGameOver={false}
      />
    );

    expect(
      screen.queryByTestId("pgn-customizer-fields")
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("btn-toggle-tag-customizer"));
    expect(screen.getByTestId("pgn-customizer-fields")).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("input-pgn-event"), {
      target: { value: "Speed Chess Championship" },
    });

    expect(mockOnExportPgn).toHaveBeenCalled();
  });
});
