import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SQUARES, type Piece, type Square } from "../../../domain/chess/types";
import { createChessAdapter } from "../../../domain/chess/adapters/chessJsAdapter";
import { Board } from "../Board";
import type { LegalDestination } from "../types";

describe("Board Component (Phase 04 · Sprint 01 - Sprint 04)", () => {
  it("TC-BOARD-14: renders all 64 squares within the board container", () => {
    render(<Board />);

    for (const square of SQUARES) {
      expect(screen.getByTestId(`board-square-${square}`)).toBeInTheDocument();
    }
  });

  it("TC-BOARD-15: renders board container with standard test ID, accessibility role, and orientation", () => {
    render(<Board orientation="w" ariaLabel="Main Game Board" />);

    const board = screen.getByTestId("chess-board");
    expect(board).toBeInTheDocument();
    expect(board).toHaveAttribute("role", "grid");
    expect(board).toHaveAttribute("aria-label", "Main Game Board");
    expect(board).toHaveAttribute("data-orientation", "w");
  });

  it("TC-BOARD-16: White orientation orders DOM squares starting at a8 down to h1", () => {
    render(<Board orientation="w" />);

    const squares = screen.getAllByRole("gridcell");
    expect(squares).toHaveLength(64);

    expect(squares[0]).toHaveAttribute("data-square", "a8");
    expect(squares[7]).toHaveAttribute("data-square", "h8");
    expect(squares[56]).toHaveAttribute("data-square", "a1");
    expect(squares[63]).toHaveAttribute("data-square", "h1");
  });

  it("TC-BOARD-17: Black orientation orders DOM squares starting at h1 down to a8", () => {
    render(<Board orientation="b" />);

    const board = screen.getByTestId("chess-board");
    expect(board).toHaveAttribute("data-orientation", "b");

    const squares = screen.getAllByRole("gridcell");
    expect(squares).toHaveLength(64);

    expect(squares[0]).toHaveAttribute("data-square", "h1");
    expect(squares[7]).toHaveAttribute("data-square", "a1");
    expect(squares[56]).toHaveAttribute("data-square", "h8");
    expect(squares[63]).toHaveAttribute("data-square", "a8");
  });

  it("TC-BOARD-18, TC-BOARD-20: renders rank and file coordinates for White orientation", () => {
    render(<Board orientation="w" showCoordinates={true} />);

    expect(screen.getByTestId("board-coordinates-ranks")).toBeInTheDocument();
    expect(screen.getByTestId("board-coordinates-files")).toBeInTheDocument();

    for (let r = 1; r <= 8; r += 1) {
      expect(screen.getByTestId(`coordinate-rank-${r}`)).toBeInTheDocument();
    }

    for (const f of ["a", "b", "c", "d", "e", "f", "g", "h"]) {
      expect(screen.getByTestId(`coordinate-file-${f}`)).toBeInTheDocument();
    }
  });

  it("TC-BOARD-19, TC-BOARD-21: renders rank and file coordinates for Black orientation", () => {
    render(<Board orientation="b" showCoordinates={true} />);

    const ranksContainer = screen.getByTestId("board-coordinates-ranks");
    const rankLabels = ranksContainer.querySelectorAll(".coordinate-rank");
    expect(rankLabels[0]).toHaveTextContent("1");
    expect(rankLabels[7]).toHaveTextContent("8");

    const filesContainer = screen.getByTestId("board-coordinates-files");
    const fileLabels = filesContainer.querySelectorAll(".coordinate-file");
    expect(fileLabels[0]).toHaveTextContent("h");
    expect(fileLabels[7]).toHaveTextContent("a");
  });

  it("TC-BOARD-22: hides coordinates when showCoordinates is false", () => {
    render(<Board showCoordinates={false} />);

    expect(
      screen.queryByTestId("board-coordinates-ranks")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("board-coordinates-files")
    ).not.toBeInTheDocument();
  });

  it("TC-BOARD-24: supports custom square renderer prop", () => {
    render(
      <Board
        renderSquare={(data) => (
          <div key={data.square} data-testid={`custom-sq-${data.square}`}>
            {data.square} ({data.color})
          </div>
        )}
      />
    );

    expect(screen.getByTestId("custom-sq-e4")).toHaveTextContent("e4 (light)");
    expect(screen.getByTestId("custom-sq-d4")).toHaveTextContent("d4 (dark)");
  });

  it("propagates square click events to onSquareClick handler", () => {
    const handleSquareClick = vi.fn();
    render(<Board onSquareClick={handleSquareClick} />);

    const e4Square = screen.getByTestId("board-square-e4");
    fireEvent.click(e4Square);

    expect(handleSquareClick).toHaveBeenCalledTimes(1);
    expect(handleSquareClick).toHaveBeenCalledWith("e4");
  });

  describe("Selection & Legal Move Indicators Integration (TC-SEL-01 to TC-SEL-04)", () => {
    it("renders selected square and legal destinations from Map", () => {
      const destinations = new Map<Square, LegalDestination>([
        ["e3", { square: "e3", targetType: "move" }],
        ["e4", { square: "e4", targetType: "move" }],
        ["d5", { square: "d5", targetType: "capture" }],
      ]);

      render(
        <Board
          selectedSquare="e2"
          legalDestinations={destinations}
          lastMove={{ from: "e7", to: "e5" }}
          checkSquare="e1"
        />
      );

      // Selected square
      const e2Square = screen.getByTestId("board-square-e2");
      expect(e2Square).toHaveClass("is-selected");

      // Quiet targets
      const e3Square = screen.getByTestId("board-square-e3");
      expect(e3Square).toHaveClass("is-legal-target");
      expect(screen.getByTestId("legal-target-e3")).toHaveAttribute(
        "data-target-type",
        "move"
      );

      const e4Square = screen.getByTestId("board-square-e4");
      expect(e4Square).toHaveClass("is-legal-target");
      expect(screen.getByTestId("legal-target-e4")).toHaveAttribute(
        "data-target-type",
        "move"
      );

      // Capture target
      const d5Square = screen.getByTestId("board-square-d5");
      expect(d5Square).toHaveClass("is-legal-target");
      expect(d5Square).toHaveClass("is-capture-target");
      expect(screen.getByTestId("legal-target-d5")).toHaveAttribute(
        "data-target-type",
        "capture"
      );

      // Last move
      const e7Square = screen.getByTestId("board-square-e7");
      const e5Square = screen.getByTestId("board-square-e5");
      expect(e7Square).toHaveClass("is-last-move");
      expect(e7Square).toHaveClass("is-last-move-from");
      expect(e7Square).toHaveAttribute("data-is-last-move", "from");

      expect(e5Square).toHaveClass("is-last-move");
      expect(e5Square).toHaveClass("is-last-move-to");
      expect(e5Square).toHaveAttribute("data-is-last-move", "to");

      // King in check
      expect(screen.getByTestId("board-square-e1")).toHaveClass("is-check");
    });

    it("renders legal destinations passed as string array", () => {
      render(<Board selectedSquare="b1" legalDestinations={["a3", "c3"]} />);

      expect(screen.getByTestId("board-square-b1")).toHaveClass("is-selected");
      expect(screen.getByTestId("board-square-a3")).toHaveClass(
        "is-legal-target"
      );
      expect(screen.getByTestId("board-square-c3")).toHaveClass(
        "is-legal-target"
      );
    });
  });

  describe("Move Animation & Last-Move State (TC-ANIM-01 to TC-ANIM-13)", () => {
    it("TC-ANIM-02, TC-ANIM-03: applies origin and destination highlights with capture effect", () => {
      render(
        <Board
          lastMove={{
            from: "e4",
            to: "d5",
            isCapture: true,
            san: "exd5",
          }}
        />
      );

      const e4Square = screen.getByTestId("board-square-e4");
      expect(e4Square).toHaveClass("is-last-move-from");
      expect(e4Square).toHaveAttribute("data-is-last-move", "from");

      const d5Square = screen.getByTestId("board-square-d5");
      expect(d5Square).toHaveClass("is-last-move-to");
      expect(d5Square).toHaveClass("is-capture-effect");
      expect(d5Square).toHaveAttribute("data-is-last-move", "to");
      expect(d5Square).toHaveAttribute("data-is-capture-effect", "true");
    });

    it("TC-ANIM-13: applies reduced-motion class on wrapper and grid when reducedMotion is true", () => {
      render(
        <Board reducedMotion={true} lastMove={{ from: "e2", to: "e4" }} />
      );

      const wrapper = screen.getByTestId("chess-board-wrapper");
      expect(wrapper).toHaveClass("reduced-motion");
      expect(wrapper).toHaveAttribute("data-reduced-motion", "true");

      const grid = screen.getByTestId("chess-board");
      expect(grid).toHaveClass("reduced-motion");
      expect(grid).toHaveAttribute("data-reduced-motion", "true");

      // Last move highlights remain active under reduced motion
      expect(screen.getByTestId("board-square-e2")).toHaveClass(
        "is-last-move-from"
      );
      expect(screen.getByTestId("board-square-e4")).toHaveClass(
        "is-last-move-to"
      );
    });
  });

  describe("Piece Rendering Integration (TC-PIECE-14 to TC-PIECE-16)", () => {
    it("TC-PIECE-14: renders all 32 pieces in the standard initial chess position", () => {
      const adapter = createChessAdapter();
      const position = adapter.getPosition();

      render(<Board position={position} orientation="w" />);

      // Verify 16 white pieces
      expect(
        screen
          .getByTestId("board-square-e1")
          .querySelector("[data-testid='piece-wk']")
      ).toBeInTheDocument();
      expect(
        screen
          .getByTestId("board-square-d1")
          .querySelector("[data-testid='piece-wq']")
      ).toBeInTheDocument();
      expect(
        screen
          .getByTestId("board-square-a1")
          .querySelector("[data-testid='piece-wr']")
      ).toBeInTheDocument();
      expect(
        screen
          .getByTestId("board-square-h1")
          .querySelector("[data-testid='piece-wr']")
      ).toBeInTheDocument();
      expect(
        screen
          .getByTestId("board-square-b1")
          .querySelector("[data-testid='piece-wn']")
      ).toBeInTheDocument();
      expect(
        screen
          .getByTestId("board-square-g1")
          .querySelector("[data-testid='piece-wn']")
      ).toBeInTheDocument();
      expect(
        screen
          .getByTestId("board-square-c1")
          .querySelector("[data-testid='piece-wb']")
      ).toBeInTheDocument();
      expect(
        screen
          .getByTestId("board-square-f1")
          .querySelector("[data-testid='piece-wb']")
      ).toBeInTheDocument();

      for (const file of ["a", "b", "c", "d", "e", "f", "g", "h"]) {
        expect(
          screen
            .getByTestId(`board-square-${file}2`)
            .querySelector("[data-testid='piece-wp']")
        ).toBeInTheDocument();
      }

      // Verify 16 black pieces
      expect(
        screen
          .getByTestId("board-square-e8")
          .querySelector("[data-testid='piece-bk']")
      ).toBeInTheDocument();
      expect(
        screen
          .getByTestId("board-square-d8")
          .querySelector("[data-testid='piece-bq']")
      ).toBeInTheDocument();
      expect(
        screen
          .getByTestId("board-square-a8")
          .querySelector("[data-testid='piece-br']")
      ).toBeInTheDocument();
      expect(
        screen
          .getByTestId("board-square-h8")
          .querySelector("[data-testid='piece-br']")
      ).toBeInTheDocument();
      expect(
        screen
          .getByTestId("board-square-b8")
          .querySelector("[data-testid='piece-bn']")
      ).toBeInTheDocument();
      expect(
        screen
          .getByTestId("board-square-g8")
          .querySelector("[data-testid='piece-bn']")
      ).toBeInTheDocument();
      expect(
        screen
          .getByTestId("board-square-c8")
          .querySelector("[data-testid='piece-bb']")
      ).toBeInTheDocument();
      expect(
        screen
          .getByTestId("board-square-f8")
          .querySelector("[data-testid='piece-bb']")
      ).toBeInTheDocument();

      for (const file of ["a", "b", "c", "d", "e", "f", "g", "h"]) {
        expect(
          screen
            .getByTestId(`board-square-${file}7`)
            .querySelector("[data-testid='piece-bp']")
        ).toBeInTheDocument();
      }

      // Verify empty center squares
      expect(
        screen.getByTestId("board-square-e4").querySelector(".chess-piece")
      ).toBeNull();
      expect(
        screen.getByTestId("board-square-d5").querySelector(".chess-piece")
      ).toBeNull();
    });

    it("TC-PIECE-15: renders custom position containing all 12 piece types via pieces Map/Record prop", () => {
      const customPieces: Record<string, Piece> = {
        e4: { color: "w", type: "k" },
        b2: { color: "w", type: "q" },
        d2: { color: "w", type: "r" },
        f2: { color: "w", type: "b" },
        h2: { color: "w", type: "n" },
        h1: { color: "w", type: "p" },
        d5: { color: "b", type: "k" },
        b3: { color: "b", type: "q" },
        d3: { color: "b", type: "r" },
        f3: { color: "b", type: "b" },
        h3: { color: "b", type: "n" },
        c1: { color: "b", type: "p" },
      };

      render(<Board pieces={customPieces} />);

      expect(screen.getByTestId("piece-wk")).toBeInTheDocument();
      expect(screen.getByTestId("piece-wq")).toBeInTheDocument();
      expect(screen.getByTestId("piece-wr")).toBeInTheDocument();
      expect(screen.getByTestId("piece-wb")).toBeInTheDocument();
      expect(screen.getByTestId("piece-wn")).toBeInTheDocument();
      expect(screen.getByTestId("piece-wp")).toBeInTheDocument();

      expect(screen.getByTestId("piece-bk")).toBeInTheDocument();
      expect(screen.getByTestId("piece-bq")).toBeInTheDocument();
      expect(screen.getByTestId("piece-br")).toBeInTheDocument();
      expect(screen.getByTestId("piece-bb")).toBeInTheDocument();
      expect(screen.getByTestId("piece-bn")).toBeInTheDocument();
      expect(screen.getByTestId("piece-bp")).toBeInTheDocument();
    });

    it("TC-PIECE-16: board orientation flip preserves piece-to-square binding", () => {
      const customPieces: Record<string, Piece> = {
        e4: { color: "w", type: "q" },
      };

      const { rerender } = render(
        <Board pieces={customPieces} orientation="w" />
      );

      let e4Square = screen.getByTestId("board-square-e4");
      expect(
        e4Square.querySelector("[data-testid='piece-wq']")
      ).toBeInTheDocument();

      // Flip orientation to Black
      rerender(<Board pieces={customPieces} orientation="b" />);

      e4Square = screen.getByTestId("board-square-e4");
      expect(
        e4Square.querySelector("[data-testid='piece-wq']")
      ).toBeInTheDocument();
    });

    it("supports custom renderPiece prop", () => {
      const customPieces: Record<string, Piece> = {
        e4: { color: "w", type: "k" },
      };

      render(
        <Board
          pieces={customPieces}
          renderPiece={(piece, square) => (
            <div data-testid={`custom-piece-${square}`}>
              Custom {piece.color}-{piece.type}
            </div>
          )}
        />
      );

      const customPieceEl = screen.getByTestId("custom-piece-e4");
      expect(customPieceEl).toBeInTheDocument();
      expect(customPieceEl).toHaveTextContent("Custom w-k");
    });
  });
});
