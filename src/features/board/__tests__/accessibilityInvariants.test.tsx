import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as fc from "fast-check";
import { Square } from "../Square";
import { Board } from "../Board";
import {
  SQUARES,
  type Square as ChessSquare,
} from "../../../domain/chess/types";
import { createChessAdapter } from "../../../domain/chess/adapters/chessJsAdapter";
import { getNextSquare } from "../coordinates";
import type { BoardOrientation } from "../types";

describe("Accessibility Invariants & Non-Color Indicators (TC-A11Y-17 to TC-A11Y-21)", () => {
  it("TC-A11Y-17: renders non-color SVG badge and aria-label for check and checkmate states", () => {
    const { rerender } = render(
      <Square
        square="e1"
        color="dark"
        isCheck={true}
        isCheckmate={false}
        piece={{ type: "k", color: "w" }}
      />
    );

    const checkSquare = screen.getByTestId("board-square-e1");
    expect(checkSquare).toHaveAttribute("data-is-check", "true");
    expect(checkSquare.getAttribute("aria-label")).toContain("in check");
    expect(screen.getByTestId("check-indicator-e1")).toBeInTheDocument();

    // Rerender as Checkmate
    rerender(
      <Square
        square="e1"
        color="dark"
        isCheck={false}
        isCheckmate={true}
        piece={{ type: "k", color: "w" }}
      />
    );

    expect(checkSquare).toHaveAttribute("data-is-checkmate", "true");
    expect(checkSquare.getAttribute("aria-label")).toContain("in checkmate");
    expect(screen.getByTestId("checkmate-indicator-e1")).toBeInTheDocument();
  });

  it("TC-A11Y-18: renders distinct non-color geometric indicator for quiet move vs capture target", () => {
    const { rerender } = render(
      <Square
        square="e4"
        color="light"
        isLegalTarget={true}
        legalTargetType="move"
      />
    );

    const quietTarget = screen.getByTestId("legal-target-e4");
    expect(quietTarget).toHaveClass("legal-target-dot");
    expect(
      screen.getByTestId("board-square-e4").getAttribute("aria-label")
    ).toContain("legal move target");

    // Rerender as Capture target
    rerender(
      <Square
        square="e4"
        color="light"
        isLegalTarget={true}
        legalTargetType="capture"
      />
    );

    const captureTarget = screen.getByTestId("legal-target-e4");
    expect(captureTarget).toHaveClass("legal-target-capture-ring");
    expect(
      screen.getByTestId("board-square-e4").getAttribute("aria-label")
    ).toContain("legal capture target");
  });

  it("TC-A11Y-19 & TC-A11Y-20: Reduced motion attributes propagate correctly to DOM elements", () => {
    const adapter = createChessAdapter();

    const { rerender } = render(
      <Board
        orientation="w"
        position={adapter.getPosition()}
        reducedMotion={false}
      />
    );

    const wrapper = screen.getByTestId("chess-board-wrapper");
    expect(wrapper).not.toHaveClass("reduced-motion");

    rerender(
      <Board
        orientation="w"
        position={adapter.getPosition()}
        reducedMotion={true}
      />
    );

    expect(wrapper).toHaveClass("reduced-motion");
    expect(wrapper).toHaveAttribute("data-reduced-motion", "true");
    expect(screen.getByTestId("chess-board")).toHaveClass("reduced-motion");
  });

  it("TC-A11Y-21: Generative Property Fuzzing: Roving tabindex invariant holds across all random board states", () => {
    const adapter = createChessAdapter();

    fc.assert(
      fc.property(
        fc.constantFrom(...SQUARES),
        fc.constantFrom<BoardOrientation>("w", "b"),
        fc.boolean(),
        (focusedSq, orient, disabled) => {
          const { unmount } = render(
            <Board
              orientation={orient}
              position={adapter.getPosition()}
              focusedSquare={focusedSq as ChessSquare}
              disabled={disabled}
            />
          );

          const squares = screen.getAllByRole("gridcell");
          expect(squares).toHaveLength(64);

          if (disabled) {
            const allDisabled = squares.every(
              (sq) => sq.getAttribute("tabIndex") === "-1"
            );
            expect(allDisabled).toBe(true);
          } else {
            const tabStops = squares.filter(
              (sq) => sq.getAttribute("tabIndex") === "0"
            );
            expect(tabStops).toHaveLength(1);
            expect(tabStops[0]).toHaveAttribute("data-square", focusedSq);
          }

          unmount();
          return true;
        }
      ),
      { numRuns: 20, seed: 786 }
    );
  });

  it("TC-A11Y-21b: Generative Property Fuzzing: Continuous spatial keystroke sequences never crash or leave 8x8 grid", () => {
    const keySequenceArb = fc.array(
      fc.constantFrom(
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
        "PageUp",
        "PageDown"
      ),
      { minLength: 10, maxLength: 50 }
    );
    const startSquareArb = fc.constantFrom(...SQUARES);
    const orientationArb = fc.constantFrom<BoardOrientation>("w", "b");

    fc.assert(
      fc.property(
        startSquareArb,
        orientationArb,
        keySequenceArb,
        (startSq, orient, keys) => {
          let curr = startSq;
          for (const key of keys) {
            curr = getNextSquare(curr, key, orient);
            expect(SQUARES).toContain(curr);
          }
          return true;
        }
      ),
      { numRuns: 200, seed: 999 }
    );
  });
});
