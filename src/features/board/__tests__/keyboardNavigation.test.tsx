import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Board } from "../Board";
import { createChessAdapter } from "../../../domain/chess/adapters/chessJsAdapter";
import { useBoardInteraction } from "../useBoardInteraction";
import type { Square } from "../../../domain/chess/types";

describe("Keyboard Navigation & ARIA Roving Tabindex (TC-A11Y-01 to TC-A11Y-16)", () => {
  it("TC-A11Y-01: exactly 1 square has tabIndex={0} on the board (roving tabindex)", () => {
    const adapter = createChessAdapter();
    render(<Board orientation="w" position={adapter.getPosition()} />);

    const squares = screen.getAllByRole("gridcell");
    expect(squares).toHaveLength(64);

    const tabStopSquares = squares.filter(
      (sq) => sq.getAttribute("tabIndex") === "0"
    );
    const nonTabStopSquares = squares.filter(
      (sq) => sq.getAttribute("tabIndex") === "-1"
    );

    expect(tabStopSquares).toHaveLength(1);
    expect(nonTabStopSquares).toHaveLength(63);
    // In White orientation with no selection or moves, default focus target is e2
    expect(tabStopSquares[0]).toHaveAttribute("data-square", "e2");
  });

  it("TC-A11Y-02: ArrowUp / ArrowDown shifts focus vertically in White perspective", () => {
    const adapter = createChessAdapter();
    const onSquareFocus = vi.fn();

    render(
      <Board
        orientation="w"
        position={adapter.getPosition()}
        onSquareFocus={onSquareFocus}
      />
    );

    const e2Square = screen.getByTestId("board-square-e2");
    e2Square.focus();

    // Press ArrowUp on e2 -> navigates to e3
    fireEvent.keyDown(e2Square, { key: "ArrowUp" });
    expect(onSquareFocus).toHaveBeenCalledWith("e3");

    // Press ArrowDown on e3 -> navigates back to e2
    const e3Square = screen.getByTestId("board-square-e3");
    fireEvent.keyDown(e3Square, { key: "ArrowDown" });
    expect(onSquareFocus).toHaveBeenCalledWith("e2");
  });

  it("TC-A11Y-03: ArrowLeft / ArrowRight shifts focus horizontally in White perspective", () => {
    const adapter = createChessAdapter();
    const onSquareFocus = vi.fn();

    render(
      <Board
        orientation="w"
        position={adapter.getPosition()}
        onSquareFocus={onSquareFocus}
      />
    );

    const e2Square = screen.getByTestId("board-square-e2");
    fireEvent.keyDown(e2Square, { key: "ArrowLeft" });
    expect(onSquareFocus).toHaveBeenCalledWith("d2");

    const d2Square = screen.getByTestId("board-square-d2");
    fireEvent.keyDown(d2Square, { key: "ArrowRight" });
    expect(onSquareFocus).toHaveBeenCalledWith("e2");
  });

  it("TC-A11Y-04: Arrow navigation correctly inverts in Black orientation", () => {
    const adapter = createChessAdapter();
    const onSquareFocus = vi.fn();

    render(
      <Board
        orientation="b"
        position={adapter.getPosition()}
        onSquareFocus={onSquareFocus}
      />
    );

    // In Black orientation, default is e7
    const e7Square = screen.getByTestId("board-square-e7");
    expect(e7Square).toHaveAttribute("tabIndex", "0");

    // ArrowUp on e7 in Black perspective moves visually up (rank 6 -> e6)
    fireEvent.keyDown(e7Square, { key: "ArrowUp" });
    expect(onSquareFocus).toHaveBeenCalledWith("e6");

    // ArrowLeft on e7 in Black perspective moves visually left (file f -> f7)
    fireEvent.keyDown(e7Square, { key: "ArrowLeft" });
    expect(onSquareFocus).toHaveBeenCalledWith("f7");
  });

  it("TC-A11Y-05: clamps navigation at board boundaries without errors", () => {
    const adapter = createChessAdapter();
    const onSquareFocus = vi.fn();

    render(
      <Board
        orientation="w"
        position={adapter.getPosition()}
        onSquareFocus={onSquareFocus}
      />
    );

    // Navigating down from rank 1 (a1) stays at a1
    const a1Square = screen.getByTestId("board-square-a1");
    fireEvent.keyDown(a1Square, { key: "ArrowDown" });
    expect(onSquareFocus).toHaveBeenCalledWith("a1");

    fireEvent.keyDown(a1Square, { key: "ArrowLeft" });
    expect(onSquareFocus).toHaveBeenCalledWith("a1");

    // Navigating up from rank 8 (h8) stays at h8
    const h8Square = screen.getByTestId("board-square-h8");
    fireEvent.keyDown(h8Square, { key: "ArrowUp" });
    expect(onSquareFocus).toHaveBeenCalledWith("h8");

    fireEvent.keyDown(h8Square, { key: "ArrowRight" });
    expect(onSquareFocus).toHaveBeenCalledWith("h8");
  });

  it("TC-A11Y-06 & TC-A11Y-07: Home, End, PageUp, PageDown jump to rank/file extremes", () => {
    const adapter = createChessAdapter();
    const onSquareFocus = vi.fn();

    render(
      <Board
        orientation="w"
        position={adapter.getPosition()}
        onSquareFocus={onSquareFocus}
      />
    );

    const e4Square = screen.getByTestId("board-square-e4");

    // Home -> file 'a' of current rank (a4)
    fireEvent.keyDown(e4Square, { key: "Home" });
    expect(onSquareFocus).toHaveBeenCalledWith("a4");

    // End -> file 'h' of current rank (h4)
    fireEvent.keyDown(e4Square, { key: "End" });
    expect(onSquareFocus).toHaveBeenCalledWith("h4");

    // PageUp -> rank 8 of current file (e8)
    fireEvent.keyDown(e4Square, { key: "PageUp" });
    expect(onSquareFocus).toHaveBeenCalledWith("e8");

    // PageDown -> rank 1 of current file (e1)
    fireEvent.keyDown(e4Square, { key: "PageDown" });
    expect(onSquareFocus).toHaveBeenCalledWith("e1");
  });

  it("TC-A11Y-08: Home, End, PageUp, PageDown in Black orientation jump correctly", () => {
    const adapter = createChessAdapter();
    const onSquareFocus = vi.fn();

    render(
      <Board
        orientation="b"
        position={adapter.getPosition()}
        onSquareFocus={onSquareFocus}
      />
    );

    const e4Square = screen.getByTestId("board-square-e4");

    // Home in Black perspective -> file 'h' (h4)
    fireEvent.keyDown(e4Square, { key: "Home" });
    expect(onSquareFocus).toHaveBeenCalledWith("h4");

    // End in Black perspective -> file 'a' (a4)
    fireEvent.keyDown(e4Square, { key: "End" });
    expect(onSquareFocus).toHaveBeenCalledWith("a4");

    // PageUp in Black perspective -> rank 1 (e1)
    fireEvent.keyDown(e4Square, { key: "PageUp" });
    expect(onSquareFocus).toHaveBeenCalledWith("e1");

    // PageDown in Black perspective -> rank 8 (e8)
    fireEvent.keyDown(e4Square, { key: "PageDown" });
    expect(onSquareFocus).toHaveBeenCalledWith("e8");
  });

  it("TC-A11Y-09 & TC-A11Y-10: Enter and Space execute keyboard selection and move execution", () => {
    const TestComponent = () => {
      const [adapter] = React.useState(() => createChessAdapter());
      const [, setVersion] = React.useState(0);
      const interaction = useBoardInteraction({
        game: adapter,
        onMoveExecuted: () => setVersion((v) => v + 1),
      });

      return (
        <Board
          orientation="w"
          position={adapter.getPosition()}
          selectedSquare={interaction.selectedSquare}
          focusedSquare={interaction.focusedSquare}
          legalDestinations={interaction.legalDestinations}
          lastMove={interaction.lastMove}
          announcement={interaction.announcement}
          onSquareClick={interaction.handleSquareClick}
          onClearSelection={interaction.clearSelection}
        />
      );
    };

    render(<TestComponent />);

    const e2Square = screen.getByTestId("board-square-e2");

    // Press Enter on e2 -> selects e2
    fireEvent.keyDown(e2Square, { key: "Enter" });
    expect(e2Square).toHaveAttribute("data-is-selected", "true");
    expect(screen.getByTestId("legal-target-e3")).toBeInTheDocument();
    expect(screen.getByTestId("legal-target-e4")).toBeInTheDocument();

    // Check announcement for piece selection
    const announcer = screen.getByTestId("board-live-announcer");
    expect(announcer.textContent).toContain("Selected White Pawn on e2");
    expect(announcer.textContent).toContain("2 legal moves available");

    // Navigate to e4 and press Space -> executes move e2-e4
    const e4Square = screen.getByTestId("board-square-e4");
    fireEvent.keyDown(e4Square, { key: " " });

    // Move is executed
    expect(announcer.textContent).toContain("White Pawn moved from e2 to e4");
    expect(screen.getByTestId("board-square-e4")).toHaveAttribute(
      "data-is-last-move",
      "to"
    );
  });

  it("TC-A11Y-11: Escape key clears selection and announces cancellation", () => {
    const TestComponent = () => {
      const [adapter] = React.useState(() => createChessAdapter());
      const interaction = useBoardInteraction({ game: adapter });

      return (
        <Board
          orientation="w"
          position={adapter.getPosition()}
          selectedSquare={interaction.selectedSquare}
          legalDestinations={interaction.legalDestinations}
          announcement={interaction.announcement}
          onSquareClick={interaction.handleSquareClick}
          onClearSelection={interaction.clearSelection}
        />
      );
    };

    render(<TestComponent />);

    const e2Square = screen.getByTestId("board-square-e2");
    fireEvent.click(e2Square);
    expect(e2Square).toHaveAttribute("data-is-selected", "true");

    // Press Escape
    fireEvent.keyDown(e2Square, { key: "Escape" });
    expect(e2Square).not.toHaveAttribute("data-is-selected", "true");
  });

  it("TC-A11Y-12: Escape key cancels pending promotion dialog without committing move", () => {
    const adapter = createChessAdapter();
    const onPromotionCancel = vi.fn();

    render(
      <Board
        orientation="w"
        position={adapter.getPosition()}
        pendingPromotion={{
          from: "e7" as Square,
          to: "e8" as Square,
          color: "w",
        }}
        onPromotionCancel={onPromotionCancel}
      />
    );

    const board = screen.getByTestId("board-square-e8");
    fireEvent.keyDown(board, { key: "Escape" });
    expect(onPromotionCancel).toHaveBeenCalled();
  });

  it("TC-A11Y-13 to TC-A11Y-16: Live region properly renders polite live announcer", () => {
    render(
      <Board
        orientation="w"
        announcement="Board flipped to White perspective."
      />
    );

    const announcer = screen.getByTestId("board-live-announcer");
    expect(announcer).toHaveAttribute("aria-live", "polite");
    expect(announcer).toHaveAttribute("aria-atomic", "true");
    expect(announcer).toHaveAttribute("role", "status");
    expect(announcer.textContent).toBe("Board flipped to White perspective.");
  });
});
