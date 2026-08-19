import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Board } from "../Board";
import type { Square, Piece } from "../../../domain/chess/types";
import type { BoardThemeId, PieceSetId } from "../../../theme/types";

/**
 * Visual Regression & Layout Verification Suite
 * Reference: docs/architecture/visual_regression_and_ux_review_specification.md
 * Reference: docs/testing/test_cases_catalog_P09_S06.md (TC-VIS-01 to TC-VIS-08)
 */
describe("Visual Regression & UX Layout Suite (TC-VIS-01 to TC-VIS-08)", () => {
  const samplePieces: Record<Square, Piece> = {
    e1: { color: "w", type: "k" },
    e8: { color: "b", type: "k" },
    e2: { color: "w", type: "p" },
    d7: { color: "b", type: "p" },
    a1: { color: "w", type: "r" },
    h1: { color: "w", type: "r" },
  } as Record<Square, Piece>;

  it("TC-VIS-01: renders Board in starting layout with correct grid layout, coordinates, and piece placements", () => {
    render(
      <Board
        pieces={samplePieces}
        orientation="w"
        showCoordinates={true}
        theme="classic"
        pieceSet="standard"
      />
    );

    const boardWrapper = screen.getByTestId("chess-board-wrapper");
    expect(boardWrapper).toBeInTheDocument();
    expect(boardWrapper).toHaveAttribute("data-board-theme", "classic");
    expect(boardWrapper).toHaveClass("board-theme-classic");

    const boardGrid = screen.getByTestId("chess-board");
    expect(boardGrid).toBeInTheDocument();
    expect(boardGrid).toHaveAttribute("data-orientation", "w");

    // Verify 64 squares rendered
    const squares = screen.getAllByRole("gridcell");
    expect(squares).toHaveLength(64);

    // Verify rank and file coordinate labels
    expect(screen.getByTestId("board-coordinates-ranks")).toBeInTheDocument();
    expect(screen.getByTestId("board-coordinates-files")).toBeInTheDocument();

    // Check specific squares
    const a1 = screen.getByTestId("board-square-a1");
    expect(a1).toHaveAttribute("data-square-color", "dark");

    const e1 = screen.getByTestId("board-square-e1");
    expect(e1).toHaveAttribute("data-square", "e1");
    expect(e1.querySelector("svg, img, [data-piece-type]")).toBeTruthy();
  });

  it("TC-VIS-02: renders Piece Selection and Legal Destination Indicators accurately", () => {
    const selectedSquare: Square = "e2";
    const legalDestinations = [
      { square: "e3" as Square, targetType: "move" as const },
      { square: "e4" as Square, targetType: "move" as const },
    ];

    render(
      <Board
        pieces={samplePieces}
        selectedSquare={selectedSquare}
        legalDestinations={legalDestinations}
        showLegalMoves={true}
        theme="classic"
      />
    );

    const e2Square = screen.getByTestId("board-square-e2");
    expect(e2Square).toHaveAttribute("data-is-selected", "true");

    const e3Square = screen.getByTestId("board-square-e3");
    expect(e3Square).toHaveAttribute("data-is-legal-target", "true");

    const e4Square = screen.getByTestId("board-square-e4");
    expect(e4Square).toHaveAttribute("data-is-legal-target", "true");
  });

  it("TC-VIS-03: renders In-Check visual warning cue on the King square", () => {
    render(
      <Board
        pieces={samplePieces}
        checkSquare="e1"
        theme="classic"
        pieceSet="standard"
      />
    );

    const e1Square = screen.getByTestId("board-square-e1");
    expect(e1Square).toHaveAttribute("data-is-check", "true");
  });

  it("TC-VIS-04: applies all 6 board visual themes correctly across the board container", () => {
    const themes: BoardThemeId[] = [
      "classic",
      "wood",
      "slate",
      "ocean",
      "emerald",
      "midnight",
    ];

    for (const theme of themes) {
      const { unmount } = render(<Board pieces={samplePieces} theme={theme} />);

      const wrapper = screen.getByTestId("chess-board-wrapper");
      expect(wrapper).toHaveAttribute("data-board-theme", theme);
      expect(wrapper).toHaveClass(`board-theme-${theme}`);
      unmount();
    }
  });

  it("TC-VIS-05: renders pieces across supported piece sets without rendering exceptions", () => {
    const pieceSets: PieceSetId[] = ["standard", "classic", "modern"];

    for (const pieceSet of pieceSets) {
      const { unmount } = render(
        <Board pieces={samplePieces} pieceSet={pieceSet} />
      );

      const pieces = screen.getAllByTestId(/^piece-/);
      expect(pieces.length).toBeGreaterThan(0);
      unmount();
    }
  });

  it("TC-VIS-06: renders Promotion Dialog overlay cleanly when pending promotion is active", () => {
    const handleSelect = vi.fn();
    const handleCancel = vi.fn();

    render(
      <Board
        pieces={samplePieces}
        pendingPromotion={{ from: "e7", to: "e8", color: "w" }}
        onPromotionSelect={handleSelect}
        onPromotionCancel={handleCancel}
      />
    );

    const promotionDialog = screen.getByRole("dialog", {
      name: /pawn promotion/i,
    });
    expect(promotionDialog).toBeInTheDocument();

    const queenBtn = screen.getByRole("button", { name: /queen/i });
    expect(queenBtn).toBeInTheDocument();
    fireEvent.click(queenBtn);
    expect(handleSelect).toHaveBeenCalledWith("q");
  });

  it("TC-VIS-07: hides coordinates cleanly when showCoordinates is set to false", () => {
    render(<Board pieces={samplePieces} showCoordinates={false} />);

    expect(
      screen.queryByTestId("board-coordinates-ranks")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("board-coordinates-files")
    ).not.toBeInTheDocument();
  });

  it("TC-VIS-08: respects reducedMotion setting by applying data-reduced-motion attribute", () => {
    render(<Board pieces={samplePieces} reducedMotion={true} />);

    const wrapper = screen.getByTestId("chess-board-wrapper");
    expect(wrapper).toHaveAttribute("data-reduced-motion", "true");
  });
});
