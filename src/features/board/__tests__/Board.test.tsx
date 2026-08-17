import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SQUARES } from "../../../domain/chess/types";
import { Board } from "../Board";

describe("Board Component (Phase 04 · Sprint 01)", () => {
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
});
