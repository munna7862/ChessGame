import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PgnImportModal } from "../PgnImportModal";
import { FenModal } from "../FenModal";
import { Piece } from "../../board/Piece";
import { EngineErrorBanner } from "../../engine/EngineErrorBanner";
import type { Piece as PieceModel } from "../../../domain/chess/types";
import type { PieceSet } from "../../../domain/persistence/schema";

describe("Error, Loading and Empty States Suite (Phase 09 · Sprint 05)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Invalid PGN State Resilience (TC-ERR-05)", () => {
    it("TC-ERR-05: displays prominent error banner for illegal move or malformed PGN and disables import", () => {
      const mockValidatePgn = vi.fn().mockReturnValue({
        success: false,
        error: { message: "Illegal move 'e5' at move 1 for White" },
      });
      const mockImport = vi.fn();
      const mockClose = vi.fn();

      render(
        <PgnImportModal
          isOpen={true}
          onClose={mockClose}
          onImportPgn={mockImport}
          validatePgn={mockValidatePgn}
        />
      );

      const textarea = screen.getByTestId("pgn-import-textarea");
      fireEvent.change(textarea, { target: { value: "1. e5" } });

      expect(screen.getByTestId("pgn-import-error-banner")).toBeInTheDocument();
      expect(screen.getByText(/Illegal move 'e5'/)).toBeInTheDocument();
      expect(screen.getByTestId("btn-confirm-import-pgn")).toBeDisabled();
      expect(mockImport).not.toHaveBeenCalled();
    });
  });

  describe("Invalid FEN State Resilience (TC-ERR-06)", () => {
    it("TC-ERR-06: shows invalid FEN feedback card and disables loading buttons when FEN is malformed", () => {
      const mockLoadFen = vi.fn();
      const mockStartGame = vi.fn();
      const mockClose = vi.fn();

      render(
        <FenModal
          isOpen={true}
          onClose={mockClose}
          currentFen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
          onLoadFen={mockLoadFen}
          onStartGameFromFen={mockStartGame}
        />
      );

      const input = screen.getByTestId("fen-input-textarea");
      fireEvent.change(input, { target: { value: "invalid_fen_string_here" } });

      expect(screen.getByTestId("fen-validation-card")).toHaveClass(
        "fen-status-card--invalid"
      );
      expect(screen.getByTestId("fen-error-message")).toBeInTheDocument();
      expect(screen.getByTestId("btn-load-fen")).toBeDisabled();
      expect(screen.getByTestId("btn-start-game-fen")).toBeDisabled();
      expect(mockLoadFen).not.toHaveBeenCalled();
      expect(mockStartGame).not.toHaveBeenCalled();
    });
  });

  describe("Missing Asset & Fallback Resilience (TC-ERR-08)", () => {
    it("TC-ERR-08: safely renders fallback for unknown or corrupted piece data without crashing", () => {
      const corruptedPiece = { type: "z", color: "x" } as unknown as PieceModel;

      render(<Piece piece={corruptedPiece} dataTestId="piece-corrupted" />);

      const pieceEl = screen.getByTestId("piece-corrupted");
      expect(pieceEl).toBeInTheDocument();
      expect(pieceEl).toHaveAttribute("data-fallback", "true");
      expect(pieceEl).toHaveTextContent("?");
    });

    it("TC-ERR-08: safely renders fallback Unicode for non-existent piece set", () => {
      const validPiece: PieceModel = { type: "k", color: "w" };

      render(
        <Piece
          piece={validPiece}
          pieceSet={"non_existent_set" as unknown as PieceSet}
          dataTestId="piece-custom-fallback"
        />
      );

      const pieceEl = screen.getByTestId("piece-custom-fallback");
      expect(pieceEl).toBeInTheDocument();
      // Should fall back to standard SVG map or unicode symbol
      expect(pieceEl).toHaveAttribute("data-piece-color", "w");
      expect(pieceEl).toHaveAttribute("data-piece-type", "k");
    });
  });

  describe("Engine Error State Banner (TC-ERR-04)", () => {
    it("TC-ERR-04: renders engine error banner with retry and fallback actions", () => {
      const handleRestart = vi.fn();
      const handleFallback2P = vi.fn();
      const handleDismiss = vi.fn();
      const testError = new Error("Stockfish WebWorker failed initialization");

      render(
        <EngineErrorBanner
          error={testError}
          onRestart={handleRestart}
          onFallback2P={handleFallback2P}
          onDismiss={handleDismiss}
        />
      );

      expect(screen.getByTestId("engine-error-banner")).toBeInTheDocument();
      expect(screen.getByTestId("engine-error-details")).toHaveTextContent(
        "Stockfish WebWorker failed initialization"
      );

      fireEvent.click(screen.getByTestId("btn-engine-restart"));
      expect(handleRestart).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByTestId("btn-engine-fallback-2p"));
      expect(handleFallback2P).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByTestId("btn-engine-dismiss-error"));
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });
  });
});
