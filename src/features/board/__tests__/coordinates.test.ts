import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { SQUARES, isValidSquare } from "../../../domain/chess/types";
import {
  getSquareColor,
  getSquareAtRowCol,
  getRowColForSquare,
  getRanksForOrientation,
  getFilesForOrientation,
  getGridSquares,
  getNextSquare,
} from "../coordinates";

import type { BoardOrientation } from "../types";

describe("Board Coordinates & Geometry (Phase 04 · Sprint 01)", () => {
  describe("Square Parity and Identification (TC-BOARD-01, TC-BOARD-02, TC-BOARD-03)", () => {
    it("TC-BOARD-01: accurately generates all 64 unique algebraic squares", () => {
      const allSquares = SQUARES;
      expect(allSquares).toHaveLength(64);
      expect(new Set(allSquares).size).toBe(64);
      for (const sq of allSquares) {
        expect(isValidSquare(sq)).toBe(true);
      }
    });

    it("TC-BOARD-02: accurately calculates square color parity across all 64 squares", () => {
      // Dark squares where (f + r) % 2 === 0
      expect(getSquareColor("a1")).toBe("dark"); // 0+0 = 0
      expect(getSquareColor("c1")).toBe("dark"); // 2+0 = 2
      expect(getSquareColor("e1")).toBe("dark"); // 4+0 = 4
      expect(getSquareColor("g1")).toBe("dark"); // 6+0 = 6
      expect(getSquareColor("b2")).toBe("dark"); // 1+1 = 2
      expect(getSquareColor("d4")).toBe("dark"); // 3+3 = 6
      expect(getSquareColor("e5")).toBe("dark"); // 4+4 = 8
      expect(getSquareColor("h8")).toBe("dark"); // 7+7 = 14

      // Light squares where (f + r) % 2 === 1
      expect(getSquareColor("b1")).toBe("light"); // 1+0 = 1
      expect(getSquareColor("d1")).toBe("light"); // 3+0 = 3
      expect(getSquareColor("f1")).toBe("light"); // 5+0 = 5
      expect(getSquareColor("h1")).toBe("light"); // 7+0 = 7
      expect(getSquareColor("a2")).toBe("light"); // 0+1 = 1
      expect(getSquareColor("e4")).toBe("light"); // 4+3 = 7
      expect(getSquareColor("d5")).toBe("light"); // 3+4 = 7
      expect(getSquareColor("a8")).toBe("light"); // 0+7 = 7
    });

    it("TC-BOARD-03: enforces FIDE corner parity invariant ('white on right')", () => {
      expect(getSquareColor("a1")).toBe("dark");
      expect(getSquareColor("h1")).toBe("light");
      expect(getSquareColor("a8")).toBe("light");
      expect(getSquareColor("h8")).toBe("dark");
    });

    it("TC-BOARD-04: safely handles out of bounds coordinates without throw", () => {
      expect(getSquareAtRowCol(-1, 0, "w")).toBeNull();
      expect(getSquareAtRowCol(8, 0, "w")).toBeNull();
      expect(getSquareAtRowCol(0, -1, "w")).toBeNull();
      expect(getSquareAtRowCol(0, 8, "w")).toBeNull();
      expect(getSquareAtRowCol(99, 99, "b")).toBeNull();
    });
  });

  describe("Board Orientation Mapping (TC-BOARD-05, TC-BOARD-06)", () => {
    it("TC-BOARD-05: White perspective correctly maps rows/cols to squares", () => {
      // Top-Left is a8 (row 0, col 0)
      expect(getSquareAtRowCol(0, 0, "w")).toBe("a8");
      // Top-Right is h8 (row 0, col 7)
      expect(getSquareAtRowCol(0, 7, "w")).toBe("h8");
      // Bottom-Left is a1 (row 7, col 0)
      expect(getSquareAtRowCol(7, 0, "w")).toBe("a1");
      // Bottom-Right is h1 (row 7, col 7)
      expect(getSquareAtRowCol(7, 7, "w")).toBe("h1");
      // Center e4 (row 4, col 4: row = 7 - 3 = 4, col = 4)
      expect(getSquareAtRowCol(4, 4, "w")).toBe("e4");
      // Center d5 (row 3, col 3: row = 7 - 4 = 3, col = 3)
      expect(getSquareAtRowCol(3, 3, "w")).toBe("d5");
    });

    it("TC-BOARD-06: Black perspective correctly maps rows/cols to squares", () => {
      // Top-Left is h1 (row 0, col 0)
      expect(getSquareAtRowCol(0, 0, "b")).toBe("h1");
      // Top-Right is a1 (row 0, col 7)
      expect(getSquareAtRowCol(0, 7, "b")).toBe("a1");
      // Bottom-Left is h8 (row 7, col 0)
      expect(getSquareAtRowCol(7, 0, "b")).toBe("h8");
      // Bottom-Right is a8 (row 7, col 7)
      expect(getSquareAtRowCol(7, 7, "b")).toBe("a8");
      // Center e4 (row 3, col 3: row = 3, col = 7 - 4 = 3)
      expect(getSquareAtRowCol(3, 3, "b")).toBe("e4");
      // Center d5 (row 4, col 4: row = 4, col = 7 - 3 = 4)
      expect(getSquareAtRowCol(4, 4, "b")).toBe("d5");
    });
  });

  describe("Coordinate Bijectivity & Invariant Fuzzing (TC-BOARD-07, TC-BOARD-08)", () => {
    it("TC-BOARD-07: round-trip square -> (row, col) -> square is an identity function for all 64 squares", () => {
      const orientations: BoardOrientation[] = ["w", "b"];

      for (const orientation of orientations) {
        for (const sq of SQUARES) {
          const { row, col } = getRowColForSquare(sq, orientation);
          expect(row).toBeGreaterThanOrEqual(0);
          expect(row).toBeLessThanOrEqual(7);
          expect(col).toBeGreaterThanOrEqual(0);
          expect(col).toBeLessThanOrEqual(7);

          const mappedSquare = getSquareAtRowCol(row, col, orientation);
          expect(mappedSquare).toBe(sq);
        }
      }
    });

    it("TC-BOARD-08: seeded fast-check property test verifies bijective invariance", () => {
      const validSquaresArbitrary = fc.constantFrom(...SQUARES);
      const orientationArbitrary = fc.constantFrom<BoardOrientation>("w", "b");

      fc.assert(
        fc.property(
          validSquaresArbitrary,
          orientationArbitrary,
          (square, orientation) => {
            const { row, col } = getRowColForSquare(square, orientation);
            const recovered = getSquareAtRowCol(row, col, orientation);
            return recovered === square;
          }
        ),
        { numRuns: 1000, seed: 42 }
      );
    });

    it("TC-BOARD-08b: grid squares generator returns 64 fully qualified squares with correct metadata", () => {
      const whiteGrid = getGridSquares("w");
      expect(whiteGrid).toHaveLength(64);
      expect(whiteGrid[0]?.square).toBe("a8");
      expect(whiteGrid[0]?.row).toBe(0);
      expect(whiteGrid[0]?.col).toBe(0);
      expect(whiteGrid[63]?.square).toBe("h1");
      expect(whiteGrid[63]?.row).toBe(7);
      expect(whiteGrid[63]?.col).toBe(7);

      const blackGrid = getGridSquares("b");
      expect(blackGrid).toHaveLength(64);
      expect(blackGrid[0]?.square).toBe("h1");
      expect(blackGrid[0]?.row).toBe(0);
      expect(blackGrid[0]?.col).toBe(0);
      expect(blackGrid[63]?.square).toBe("a8");
      expect(blackGrid[63]?.row).toBe(7);
      expect(blackGrid[63]?.col).toBe(7);
    });
  });

  describe("Rank and File Sequences", () => {
    it("returns correct ranks sequence for both orientations", () => {
      expect(getRanksForOrientation("w")).toEqual([
        "8",
        "7",
        "6",
        "5",
        "4",
        "3",
        "2",
        "1",
      ]);
      expect(getRanksForOrientation("b")).toEqual([
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
      ]);
    });

    it("returns correct files sequence for both orientations", () => {
      expect(getFilesForOrientation("w")).toEqual([
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
      ]);
      expect(getFilesForOrientation("b")).toEqual([
        "h",
        "g",
        "f",
        "e",
        "d",
        "c",
        "b",
        "a",
      ]);
    });
  });

  describe("Spatial Keyboard Navigation (getNextSquare)", () => {
    it("moves in cardinal directions accurately for White orientation", () => {
      expect(getNextSquare("e2", "ArrowUp", "w")).toBe("e3");
      expect(getNextSquare("e2", "ArrowDown", "w")).toBe("e1");
      expect(getNextSquare("e2", "ArrowLeft", "w")).toBe("d2");
      expect(getNextSquare("e2", "ArrowRight", "w")).toBe("f2");
    });

    it("inverts spatial direction for Black orientation", () => {
      expect(getNextSquare("e7", "ArrowUp", "b")).toBe("e6");
      expect(getNextSquare("e7", "ArrowDown", "b")).toBe("e8");
      expect(getNextSquare("e7", "ArrowLeft", "b")).toBe("f7");
      expect(getNextSquare("e7", "ArrowRight", "b")).toBe("d7");
    });

    it("handles Home, End, PageUp, PageDown correctly", () => {
      // White orientation
      expect(getNextSquare("e4", "Home", "w")).toBe("a4");
      expect(getNextSquare("e4", "End", "w")).toBe("h4");
      expect(getNextSquare("e4", "PageUp", "w")).toBe("e8");
      expect(getNextSquare("e4", "PageDown", "w")).toBe("e1");

      // Black orientation
      expect(getNextSquare("e4", "Home", "b")).toBe("h4");
      expect(getNextSquare("e4", "End", "b")).toBe("a4");
      expect(getNextSquare("e4", "PageUp", "b")).toBe("e1");
      expect(getNextSquare("e4", "PageDown", "b")).toBe("e8");
    });

    it("clamps at boundaries without going out of bounds", () => {
      expect(getNextSquare("a1", "ArrowLeft", "w")).toBe("a1");
      expect(getNextSquare("a1", "ArrowDown", "w")).toBe("a1");
      expect(getNextSquare("h8", "ArrowRight", "w")).toBe("h8");
      expect(getNextSquare("h8", "ArrowUp", "w")).toBe("h8");

      expect(getNextSquare("h1", "ArrowLeft", "b")).toBe("h1");
      expect(getNextSquare("h1", "ArrowUp", "b")).toBe("h1");
      expect(getNextSquare("a8", "ArrowRight", "b")).toBe("a8");
      expect(getNextSquare("a8", "ArrowDown", "b")).toBe("a8");
    });

    it("returns unmodified square on unhandled key", () => {
      expect(getNextSquare("e4", "KeyA", "w")).toBe("e4");
      expect(getNextSquare("e4", "Enter", "w")).toBe("e4");
    });

    it("fast-check property test: always produces a valid 8x8 algebraic square", () => {
      const squaresArb = fc.constantFrom(...SQUARES);
      const keysArb = fc.constantFrom(
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
        "PageUp",
        "PageDown",
        "InvalidKey"
      );
      const orientationArb = fc.constantFrom<BoardOrientation>("w", "b");

      fc.assert(
        fc.property(squaresArb, keysArb, orientationArb, (sq, key, orient) => {
          const res = getNextSquare(sq, key, orient);
          return isValidSquare(res);
        }),
        { numRuns: 500, seed: 101 }
      );
    });
  });
});
