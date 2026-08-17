import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Square } from "../Square";

describe("Square Component (Phase 04 · Sprint 01 - Sprint 04)", () => {
  it("TC-BOARD-09: renders single square with required test IDs and dataset attributes", () => {
    render(<Square square="e4" color="light" />);

    const squareEl = screen.getByTestId("board-square-e4");
    expect(squareEl).toBeInTheDocument();
    expect(squareEl).toHaveAttribute("data-square", "e4");
    expect(squareEl).toHaveAttribute("data-file", "e");
    expect(squareEl).toHaveAttribute("data-rank", "4");
    expect(squareEl).toHaveAttribute("data-square-color", "light");
    expect(squareEl).toHaveAttribute("data-has-piece", "false");
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

  it("TC-PIECE-13: renders empty square without piece child element and updates when piece is passed", () => {
    const { rerender } = render(<Square square="e4" color="light" />);
    let squareEl = screen.getByTestId("board-square-e4");
    expect(squareEl).toHaveAttribute("data-has-piece", "false");
    expect(squareEl.querySelector(".chess-piece")).toBeNull();
    expect(squareEl).toHaveAttribute("aria-label", "Square e4, light");

    // Pass piece to square
    rerender(
      <Square square="e4" color="light" piece={{ color: "w", type: "p" }} />
    );
    squareEl = screen.getByTestId("board-square-e4");
    expect(squareEl).toHaveAttribute("data-has-piece", "true");
    expect(squareEl).toHaveClass("has-piece");
    expect(squareEl).toHaveAttribute(
      "aria-label",
      "Square e4, light, White Pawn"
    );
    expect(screen.getByTestId("piece-wp")).toBeInTheDocument();
  });

  it("TC-BOARD-12: renders child elements pass-through correctly", () => {
    render(
      <Square square="e2">
        <span data-testid="test-child">Custom Overlay</span>
      </Square>
    );

    const child = screen.getByTestId("test-child");
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent("Custom Overlay");
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

  it("TC-SEL-01: renders selected square state with is-selected class and aria-selected='true'", () => {
    render(
      <Square
        square="e2"
        color="light"
        piece={{ color: "w", type: "p" }}
        isSelected={true}
      />
    );

    const squareEl = screen.getByTestId("board-square-e2");
    expect(squareEl).toHaveClass("is-selected");
    expect(squareEl).toHaveAttribute("aria-selected", "true");
    expect(squareEl).toHaveAttribute("data-is-selected", "true");
    expect(squareEl).toHaveAttribute(
      "aria-label",
      "Square e2, light, White Pawn, selected"
    );
  });

  it("TC-SEL-02: renders quiet move legal target indicator dot", () => {
    render(
      <Square
        square="e4"
        color="light"
        isLegalTarget={true}
        legalTargetType="move"
      />
    );

    const squareEl = screen.getByTestId("board-square-e4");
    expect(squareEl).toHaveClass("is-legal-target");
    expect(squareEl).not.toHaveClass("is-capture-target");
    expect(squareEl).toHaveAttribute("data-is-legal-target", "true");
    expect(squareEl).toHaveAttribute("data-target-type", "move");
    expect(squareEl).toHaveAttribute(
      "aria-label",
      "Square e4, light, legal move target"
    );

    const indicator = screen.getByTestId("legal-target-e4");
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass("legal-target-dot");
    expect(indicator).toHaveAttribute("data-target-type", "move");
  });

  it("TC-SEL-03: renders capture legal target indicator ring", () => {
    render(
      <Square
        square="d5"
        color="dark"
        piece={{ color: "b", type: "p" }}
        isLegalTarget={true}
        legalTargetType="capture"
      />
    );

    const squareEl = screen.getByTestId("board-square-d5");
    expect(squareEl).toHaveClass("is-legal-target");
    expect(squareEl).toHaveClass("is-capture-target");
    expect(squareEl).toHaveAttribute("data-target-type", "capture");
    expect(squareEl).toHaveAttribute(
      "aria-label",
      "Square d5, dark, Black Pawn, legal capture target"
    );

    const indicator = screen.getByTestId("legal-target-d5");
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass("legal-target-capture-ring");
    expect(indicator).toHaveAttribute("data-target-type", "capture");
  });

  it("TC-ANIM-02: renders last-move origin square with is-last-move-from and data-is-last-move='from'", () => {
    render(
      <Square
        square="e2"
        color="light"
        isLastMove={true}
        isLastMoveFrom={true}
      />
    );

    const squareEl = screen.getByTestId("board-square-e2");
    expect(squareEl).toHaveClass("is-last-move");
    expect(squareEl).toHaveClass("is-last-move-from");
    expect(squareEl).toHaveAttribute("data-is-last-move", "from");
    expect(squareEl).toHaveAttribute("data-is-last-move-from", "true");
    expect(squareEl).toHaveAttribute(
      "aria-label",
      "Square e2, light, last move origin"
    );
  });

  it("TC-ANIM-03: renders last-move destination square with is-last-move-to and data-is-last-move='to'", () => {
    render(
      <Square
        square="e4"
        color="light"
        piece={{ color: "w", type: "p" }}
        isLastMove={true}
        isLastMoveTo={true}
      />
    );

    const squareEl = screen.getByTestId("board-square-e4");
    expect(squareEl).toHaveClass("is-last-move");
    expect(squareEl).toHaveClass("is-last-move-to");
    expect(squareEl).toHaveAttribute("data-is-last-move", "to");
    expect(squareEl).toHaveAttribute("data-is-last-move-to", "true");
    expect(squareEl).toHaveAttribute(
      "aria-label",
      "Square e4, light, White Pawn, last move destination"
    );
  });

  it("TC-ANIM-07: renders capture effect styling on square when isCaptureEffect is true", () => {
    render(
      <Square
        square="d5"
        color="dark"
        piece={{ color: "w", type: "q" }}
        isLastMove={true}
        isLastMoveTo={true}
        isCaptureEffect={true}
      />
    );

    const squareEl = screen.getByTestId("board-square-d5");
    expect(squareEl).toHaveClass("is-capture-effect");
    expect(squareEl).toHaveAttribute("data-is-capture-effect", "true");
  });

  it("TC-PROM-01 / TC-PROM-02: renders check indicator badge and accessible ARIA label when in check", () => {
    render(
      <Square
        square="e1"
        color="dark"
        piece={{ color: "w", type: "k" }}
        isCheck={true}
      />
    );

    const squareEl = screen.getByTestId("board-square-e1");
    expect(squareEl).toHaveClass("is-check");
    expect(squareEl).toHaveAttribute("data-is-check", "true");
    expect(squareEl).toHaveAttribute(
      "aria-label",
      "Square e1, dark, White King, in check"
    );

    const badge = screen.getByTestId("check-indicator-e1");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("check-indicator-badge");
    expect(badge).not.toHaveClass("is-checkmate-badge");
  });

  it("TC-PROM-03: renders checkmate indicator badge and distinct styling when in checkmate", () => {
    render(
      <Square
        square="e8"
        color="dark"
        piece={{ color: "b", type: "k" }}
        isCheckmate={true}
      />
    );

    const squareEl = screen.getByTestId("board-square-e8");
    expect(squareEl).toHaveClass("is-check");
    expect(squareEl).toHaveClass("is-checkmate");
    expect(squareEl).toHaveAttribute("data-is-check", "true");
    expect(squareEl).toHaveAttribute("data-is-checkmate", "true");
    expect(squareEl).toHaveAttribute(
      "aria-label",
      "Square e8, dark, Black King, in checkmate"
    );

    const badge = screen.getByTestId("checkmate-indicator-e8");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("check-indicator-badge");
    expect(badge).toHaveClass("is-checkmate-badge");
  });

  it("TC-SEL-13: disables square when disabled=true and suppresses click events", () => {
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

    fireEvent.click(squareEl);
    expect(handleClick).not.toHaveBeenCalled();

    fireEvent.keyDown(squareEl, { key: "Enter" });
    expect(handleClick).not.toHaveBeenCalled();
  });
});
