import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Square } from "../Square";

describe("Square Component (Phase 04 · Sprint 01)", () => {
  it("TC-BOARD-09: renders single square with required test IDs and dataset attributes", () => {
    render(<Square square="e4" color="light" />);

    const squareEl = screen.getByTestId("board-square-e4");
    expect(squareEl).toBeInTheDocument();
    expect(squareEl).toHaveAttribute("data-square", "e4");
    expect(squareEl).toHaveAttribute("data-file", "e");
    expect(squareEl).toHaveAttribute("data-rank", "4");
    expect(squareEl).toHaveAttribute("data-square-color", "light");
  });

  it("TC-BOARD-10: applies correct CSS color class for light and dark squares", () => {
    const { rerender } = render(<Square square="e4" color="light" />);
    let squareEl = screen.getByTestId("board-square-e4");
    expect(squareEl).toHaveClass("chess-square");
    expect(squareEl).toHaveClass("square-light");
    expect(squareEl).not.toHaveClass("square-dark");

    rerender(<Square square="d4" color="dark" />);
    squareEl = screen.getByTestId("board-square-d4");
    expect(squareEl).toHaveClass("chess-square");
    expect(squareEl).toHaveClass("square-dark");
    expect(squareEl).not.toHaveClass("square-light");
  });

  it("TC-BOARD-11: renders accessible gridcell attributes and aria labels", () => {
    render(<Square square="a1" />);
    const squareEl = screen.getByTestId("board-square-a1");

    expect(squareEl).toHaveAttribute("role", "gridcell");
    expect(squareEl).toHaveAttribute("aria-label", "Square a1, dark");
    expect(squareEl).toHaveAttribute("tabIndex", "0");
  });

  it("TC-BOARD-12: renders child elements pass-through correctly", () => {
    render(
      <Square square="e2">
        <span data-testid="test-child">Pawn</span>
      </Square>
    );

    const child = screen.getByTestId("test-child");
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent("Pawn");
  });

  it("TC-BOARD-13: handles click and keyboard interactions correctly", () => {
    const handleClick = vi.fn();
    render(<Square square="e4" onClick={handleClick} />);

    const squareEl = screen.getByTestId("board-square-e4");

    // Click event
    fireEvent.click(squareEl);
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith("e4");

    // Keyboard Enter event
    fireEvent.keyDown(squareEl, { key: "Enter" });
    expect(handleClick).toHaveBeenCalledTimes(2);

    // Keyboard Space event
    fireEvent.keyDown(squareEl, { key: " " });
    expect(handleClick).toHaveBeenCalledTimes(3);
  });

  it("TC-BOARD-13b: supports visual state modifiers (selected, last-move, legal-target, check, disabled)", () => {
    const handleClick = vi.fn();
    render(
      <Square
        square="e4"
        isSelected={true}
        isLastMove={true}
        isLegalTarget={true}
        isCheck={true}
        disabled={true}
        onClick={handleClick}
      />
    );

    const squareEl = screen.getByTestId("board-square-e4");
    expect(squareEl).toHaveClass("is-selected");
    expect(squareEl).toHaveClass("is-last-move");
    expect(squareEl).toHaveClass("is-legal-target");
    expect(squareEl).toHaveClass("is-check");
    expect(squareEl).toHaveClass("is-disabled");
    expect(squareEl).toHaveAttribute("aria-selected", "true");
    expect(squareEl).toHaveAttribute("aria-disabled", "true");
    expect(squareEl).toHaveAttribute("tabIndex", "-1");

    // Disabled squares should not trigger click
    fireEvent.click(squareEl);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
