import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { FenModal } from "../FenModal";
import { STANDARD_FEN_PRESETS } from "../fenPresets";
import { FenFileService } from "../../../domain/persistence/FenFileService";

describe("FenModal UI Component Tests (Phase 08 · Sprint 04)", () => {
  const mockCurrentFen =
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const mockOnClose = vi.fn();
  const mockOnLoadFen = vi.fn();
  const mockOnStartGameFromFen = vi.fn();

  let mockFileService: FenFileService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFileService = new FenFileService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("TC-FEN-UI-04: does not render anything when isOpen is false", () => {
    const { container } = render(
      <FenModal
        isOpen={false}
        onClose={mockOnClose}
        currentFen={mockCurrentFen}
        onLoadFen={mockOnLoadFen}
        onStartGameFromFen={mockOnStartGameFromFen}
        fileService={mockFileService}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("TC-FEN-UI-04: opens and pre-populates with the active board FEN", () => {
    render(
      <FenModal
        isOpen={true}
        onClose={mockOnClose}
        currentFen={mockCurrentFen}
        onLoadFen={mockOnLoadFen}
        onStartGameFromFen={mockOnStartGameFromFen}
        fileService={mockFileService}
      />
    );

    expect(screen.getByTestId("fen-modal")).toBeInTheDocument();
    expect(screen.getByTestId("current-fen-display")).toHaveTextContent(
      mockCurrentFen
    );

    const textarea = screen.getByTestId(
      "fen-input-textarea"
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe(mockCurrentFen);
    expect(screen.getByTestId("fen-validation-card")).toHaveClass(
      "fen-status-card--valid"
    );
    expect(screen.getByTestId("fen-meta-info")).toHaveTextContent(
      "White to move · Castling: KQkq · EP: None · Move: 1"
    );
  });

  it("TC-FEN-UI-03: copies current active FEN with visual toast feedback", async () => {
    vi.useFakeTimers();
    vi.spyOn(mockFileService, "copyToClipboard").mockResolvedValue(true);

    render(
      <FenModal
        isOpen={true}
        onClose={mockOnClose}
        currentFen={mockCurrentFen}
        onLoadFen={mockOnLoadFen}
        onStartGameFromFen={mockOnStartGameFromFen}
        fileService={mockFileService}
      />
    );

    const copyCurrentBtn = screen.getByTestId("btn-copy-current-fen");
    await act(async () => {
      fireEvent.click(copyCurrentBtn);
    });

    expect(mockFileService.copyToClipboard).toHaveBeenCalledWith(
      mockCurrentFen
    );
    expect(screen.getByTestId("btn-copy-current-fen")).toHaveTextContent(
      "✓ Copied!"
    );

    // Fast-forward toast dismissal timer
    act(() => {
      vi.advanceTimersByTime(2100);
    });
    expect(screen.getByTestId("btn-copy-current-fen")).toHaveTextContent(
      "📋 Copy Current FEN"
    );

    vi.useRealTimers();
  });

  it("TC-FEN-UI-05: selects standard FEN presets and updates input & validation", () => {
    render(
      <FenModal
        isOpen={true}
        onClose={mockOnClose}
        currentFen={mockCurrentFen}
        onLoadFen={mockOnLoadFen}
        onStartGameFromFen={mockOnStartGameFromFen}
        fileService={mockFileService}
      />
    );

    const lucenaPreset = STANDARD_FEN_PRESETS.find((p) => p.id === "lucena")!;
    const lucenaBtn = screen.getByTestId("btn-preset-lucena");
    fireEvent.click(lucenaBtn);

    const textarea = screen.getByTestId(
      "fen-input-textarea"
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe(lucenaPreset.fen);
    expect(screen.getByTestId("fen-validation-card")).toHaveClass(
      "fen-status-card--valid"
    );
  });

  it("TC-FEN-UI-07: invalid token count shows descriptive error and disables load button", () => {
    render(
      <FenModal
        isOpen={true}
        onClose={mockOnClose}
        currentFen={mockCurrentFen}
        onLoadFen={mockOnLoadFen}
        onStartGameFromFen={mockOnStartGameFromFen}
        fileService={mockFileService}
      />
    );

    const textarea = screen.getByTestId("fen-input-textarea");
    fireEvent.change(textarea, {
      target: { value: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w" },
    });

    expect(screen.getByTestId("fen-validation-card")).toHaveClass(
      "fen-status-card--invalid"
    );
    expect(screen.getByTestId("fen-error-message")).toHaveTextContent(
      "must contain exactly 6 space-delimited fields"
    );
    expect(screen.getByTestId("btn-load-fen")).toBeDisabled();
    expect(screen.getByTestId("btn-start-game-fen")).toBeDisabled();
  });

  it("TC-FEN-UI-08: invalid piece characters & bad rank sum show error", () => {
    render(
      <FenModal
        isOpen={true}
        onClose={mockOnClose}
        currentFen={mockCurrentFen}
        onLoadFen={mockOnLoadFen}
        onStartGameFromFen={mockOnStartGameFromFen}
        fileService={mockFileService}
      />
    );

    const textarea = screen.getByTestId("fen-input-textarea");
    fireEvent.change(textarea, {
      target: {
        value: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNX w KQkq - 0 1",
      },
    });

    expect(screen.getByTestId("fen-error-message")).toHaveTextContent(
      "invalid piece character 'X'"
    );
  });

  it("TC-FEN-UI-09: pawns on 1st or 8th rank are rejected", () => {
    render(
      <FenModal
        isOpen={true}
        onClose={mockOnClose}
        currentFen={mockCurrentFen}
        onLoadFen={mockOnLoadFen}
        onStartGameFromFen={mockOnStartGameFromFen}
        fileService={mockFileService}
      />
    );

    const textarea = screen.getByTestId("fen-input-textarea");
    fireEvent.change(textarea, {
      target: {
        value: "Pnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      },
    });

    expect(screen.getByTestId("fen-error-message")).toHaveTextContent(
      "pawns cannot exist on the 8th rank"
    );
  });

  it("TC-FEN-UI-10: invalid king count is rejected", () => {
    render(
      <FenModal
        isOpen={true}
        onClose={mockOnClose}
        currentFen={mockCurrentFen}
        onLoadFen={mockOnLoadFen}
        onStartGameFromFen={mockOnStartGameFromFen}
        fileService={mockFileService}
      />
    );

    const textarea = screen.getByTestId("fen-input-textarea");
    fireEvent.change(textarea, {
      target: { value: "8/8/8/4k3/8/8/8/8 w - - 0 1" },
    });

    expect(screen.getByTestId("fen-error-message")).toHaveTextContent(
      "board must contain exactly one White King ('K')"
    );
  });

  it("TC-FEN-UI-11: en passant square mismatch with active color is rejected", () => {
    render(
      <FenModal
        isOpen={true}
        onClose={mockOnClose}
        currentFen={mockCurrentFen}
        onLoadFen={mockOnLoadFen}
        onStartGameFromFen={mockOnStartGameFromFen}
        fileService={mockFileService}
      />
    );

    const textarea = screen.getByTestId("fen-input-textarea");
    // White to move but en passant square on rank 3 (illegal)
    fireEvent.change(textarea, {
      target: {
        value: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq e3 0 1",
      },
    });

    expect(screen.getByTestId("fen-error-message")).toHaveTextContent(
      "en passant square 'e3' is illegal when White is to move"
    );
  });

  it("TC-FEN-UI-13: clicking Load into Game calls onLoadFen with valid FEN and closes modal", () => {
    render(
      <FenModal
        isOpen={true}
        onClose={mockOnClose}
        currentFen={mockCurrentFen}
        onLoadFen={mockOnLoadFen}
        onStartGameFromFen={mockOnStartGameFromFen}
        fileService={mockFileService}
      />
    );

    const loadBtn = screen.getByTestId("btn-load-fen");
    expect(loadBtn).not.toBeDisabled();
    fireEvent.click(loadBtn);

    expect(mockOnLoadFen).toHaveBeenCalledWith(mockCurrentFen);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("TC-FEN-UI-14: clicking Start Game with FEN calls onStartGameFromFen with valid FEN and closes modal", () => {
    render(
      <FenModal
        isOpen={true}
        onClose={mockOnClose}
        currentFen={mockCurrentFen}
        onLoadFen={mockOnLoadFen}
        onStartGameFromFen={mockOnStartGameFromFen}
        fileService={mockFileService}
      />
    );

    const startBtn = screen.getByTestId("btn-start-game-fen");
    expect(startBtn).not.toBeDisabled();
    fireEvent.click(startBtn);

    expect(mockOnStartGameFromFen).toHaveBeenCalledWith(mockCurrentFen);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("TC-FEN-UI-15: handles keyboard Escape key to close modal", () => {
    render(
      <FenModal
        isOpen={true}
        onClose={mockOnClose}
        currentFen={mockCurrentFen}
        onLoadFen={mockOnLoadFen}
        onStartGameFromFen={mockOnStartGameFromFen}
        fileService={mockFileService}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("handles paste from clipboard and clear buttons", async () => {
    const pastedFen = "8/8/8/4k3/8/8/4P3/4K3 w - - 0 1";
    vi.spyOn(mockFileService, "readFromClipboard").mockResolvedValue(pastedFen);

    render(
      <FenModal
        isOpen={true}
        onClose={mockOnClose}
        currentFen={mockCurrentFen}
        onLoadFen={mockOnLoadFen}
        onStartGameFromFen={mockOnStartGameFromFen}
        fileService={mockFileService}
      />
    );

    const pasteBtn = screen.getByTestId("btn-paste-fen");
    await act(async () => {
      fireEvent.click(pasteBtn);
    });

    const textarea = screen.getByTestId(
      "fen-input-textarea"
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe(pastedFen);

    const clearBtn = screen.getByTestId("btn-clear-fen");
    fireEvent.click(clearBtn);
    expect(textarea.value).toBe("");
  });

  it("handles download .fen button click", () => {
    const downloadSpy = vi
      .spyOn(mockFileService, "downloadFenFile")
      .mockReturnValue(true);

    render(
      <FenModal
        isOpen={true}
        onClose={mockOnClose}
        currentFen={mockCurrentFen}
        onLoadFen={mockOnLoadFen}
        onStartGameFromFen={mockOnStartGameFromFen}
        fileService={mockFileService}
      />
    );

    const downloadBtn = screen.getByTestId("btn-download-fen");
    fireEvent.click(downloadBtn);

    expect(downloadSpy).toHaveBeenCalled();
  });
});
