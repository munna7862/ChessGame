import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as fc from "fast-check";
import { Piece } from "../Piece";
import {
  getPieceAriaLabel,
  getPieceCode,
  getPieceUnicode,
  isValidPiece,
} from "../pieceUtils";
import type {
  Piece as PieceModel,
  PieceType,
  Color,
} from "../../../domain/chess/types";

describe("Piece Component & Rendering (TC-PIECE-01 to TC-PIECE-22)", () => {
  const allPieces: PieceModel[] = [
    { color: "w", type: "p" },
    { color: "w", type: "n" },
    { color: "w", type: "b" },
    { color: "w", type: "r" },
    { color: "w", type: "q" },
    { color: "w", type: "k" },
    { color: "b", type: "p" },
    { color: "b", type: "n" },
    { color: "b", type: "b" },
    { color: "b", type: "r" },
    { color: "b", type: "q" },
    { color: "b", type: "k" },
  ];

  describe("TC-PIECE-01 to TC-PIECE-06: White Piece Rendering", () => {
    it("TC-PIECE-01: renders White Pawn correctly with SVG and accessible label", () => {
      render(<Piece piece={{ color: "w", type: "p" }} />);
      const pieceEl = screen.getByTestId("piece-wp");
      expect(pieceEl).toBeInTheDocument();
      expect(pieceEl).toHaveAttribute("role", "img");
      expect(pieceEl).toHaveAttribute("aria-label", "White Pawn");
      expect(pieceEl).toHaveAttribute("data-piece-color", "w");
      expect(pieceEl).toHaveAttribute("data-piece-type", "p");
      expect(pieceEl.querySelector("svg")).toBeInTheDocument();
    });

    it("TC-PIECE-02: renders White Knight correctly", () => {
      render(<Piece piece={{ color: "w", type: "n" }} />);
      const pieceEl = screen.getByTestId("piece-wn");
      expect(pieceEl).toBeInTheDocument();
      expect(pieceEl).toHaveAttribute("aria-label", "White Knight");
      expect(pieceEl.querySelector("svg")).toBeInTheDocument();
    });

    it("TC-PIECE-03: renders White Bishop correctly", () => {
      render(<Piece piece={{ color: "w", type: "b" }} />);
      const pieceEl = screen.getByTestId("piece-wb");
      expect(pieceEl).toBeInTheDocument();
      expect(pieceEl).toHaveAttribute("aria-label", "White Bishop");
      expect(pieceEl.querySelector("svg")).toBeInTheDocument();
    });

    it("TC-PIECE-04: renders White Rook correctly", () => {
      render(<Piece piece={{ color: "w", type: "r" }} />);
      const pieceEl = screen.getByTestId("piece-wr");
      expect(pieceEl).toBeInTheDocument();
      expect(pieceEl).toHaveAttribute("aria-label", "White Rook");
      expect(pieceEl.querySelector("svg")).toBeInTheDocument();
    });

    it("TC-PIECE-05: renders White Queen correctly", () => {
      render(<Piece piece={{ color: "w", type: "q" }} />);
      const pieceEl = screen.getByTestId("piece-wq");
      expect(pieceEl).toBeInTheDocument();
      expect(pieceEl).toHaveAttribute("aria-label", "White Queen");
      expect(pieceEl.querySelector("svg")).toBeInTheDocument();
    });

    it("TC-PIECE-06: renders White King correctly", () => {
      render(<Piece piece={{ color: "w", type: "k" }} />);
      const pieceEl = screen.getByTestId("piece-wk");
      expect(pieceEl).toBeInTheDocument();
      expect(pieceEl).toHaveAttribute("aria-label", "White King");
      expect(pieceEl.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("TC-PIECE-07 to TC-PIECE-12: Black Piece Rendering", () => {
    it("TC-PIECE-07: renders Black Pawn correctly", () => {
      render(<Piece piece={{ color: "b", type: "p" }} />);
      const pieceEl = screen.getByTestId("piece-bp");
      expect(pieceEl).toBeInTheDocument();
      expect(pieceEl).toHaveAttribute("aria-label", "Black Pawn");
      expect(pieceEl.querySelector("svg")).toBeInTheDocument();
    });

    it("TC-PIECE-08: renders Black Knight correctly", () => {
      render(<Piece piece={{ color: "b", type: "n" }} />);
      const pieceEl = screen.getByTestId("piece-bn");
      expect(pieceEl).toBeInTheDocument();
      expect(pieceEl).toHaveAttribute("aria-label", "Black Knight");
      expect(pieceEl.querySelector("svg")).toBeInTheDocument();
    });

    it("TC-PIECE-09: renders Black Bishop correctly", () => {
      render(<Piece piece={{ color: "b", type: "b" }} />);
      const pieceEl = screen.getByTestId("piece-bb");
      expect(pieceEl).toBeInTheDocument();
      expect(pieceEl).toHaveAttribute("aria-label", "Black Bishop");
      expect(pieceEl.querySelector("svg")).toBeInTheDocument();
    });

    it("TC-PIECE-10: renders Black Rook correctly", () => {
      render(<Piece piece={{ color: "b", type: "r" }} />);
      const pieceEl = screen.getByTestId("piece-br");
      expect(pieceEl).toBeInTheDocument();
      expect(pieceEl).toHaveAttribute("aria-label", "Black Rook");
      expect(pieceEl.querySelector("svg")).toBeInTheDocument();
    });

    it("TC-PIECE-11: renders Black Queen correctly", () => {
      render(<Piece piece={{ color: "b", type: "q" }} />);
      const pieceEl = screen.getByTestId("piece-bq");
      expect(pieceEl).toBeInTheDocument();
      expect(pieceEl).toHaveAttribute("aria-label", "Black Queen");
      expect(pieceEl.querySelector("svg")).toBeInTheDocument();
    });

    it("TC-PIECE-12: renders Black King correctly", () => {
      render(<Piece piece={{ color: "b", type: "k" }} />);
      const pieceEl = screen.getByTestId("piece-bk");
      expect(pieceEl).toBeInTheDocument();
      expect(pieceEl).toHaveAttribute("aria-label", "Black King");
      expect(pieceEl.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("TC-PIECE-17 & TC-PIECE-18: Piece Utilities & Custom Attributes", () => {
    it("TC-PIECE-17: returns exact accessible strings and unicode characters for all pieces", () => {
      const expectedAria: Record<string, string> = {
        wp: "White Pawn",
        wn: "White Knight",
        wb: "White Bishop",
        wr: "White Rook",
        wq: "White Queen",
        wk: "White King",
        bp: "Black Pawn",
        bn: "Black Knight",
        bb: "Black Bishop",
        br: "Black Rook",
        bq: "Black Queen",
        bk: "Black King",
      };

      for (const piece of allPieces) {
        const code = getPieceCode(piece);
        expect(getPieceAriaLabel(piece)).toBe(expectedAria[code]);
        expect(getPieceUnicode(piece)).toBeTruthy();
        expect(isValidPiece(piece)).toBe(true);
      }
    });

    it("TC-PIECE-18: applies custom className, style, custom ariaLabel, and draggable flag", () => {
      render(
        <Piece
          piece={{ color: "w", type: "q" }}
          className="custom-piece-class"
          style={{ opacity: 0.8 }}
          ariaLabel="Custom Queen Label"
          draggable={true}
        />
      );

      const pieceEl = screen.getByTestId("piece-wq");
      expect(pieceEl).toHaveClass("custom-piece-class");
      expect(pieceEl).toHaveClass("is-draggable");
      expect(pieceEl).toHaveAttribute("draggable", "true");
      expect(pieceEl).toHaveAttribute("aria-label", "Custom Queen Label");
      expect(pieceEl).toHaveStyle({ opacity: "0.8" });
    });
  });

  describe("TC-PIECE-19 & TC-PIECE-20: Negative & Fallback Rendering", () => {
    it("TC-PIECE-19: gracefully renders fallback element when piece is invalid", () => {
      const invalidPiece = { color: "x", type: "z" } as unknown as PieceModel;
      expect(isValidPiece(invalidPiece)).toBe(false);

      render(<Piece piece={invalidPiece} />);
      const fallbackEl = screen.getByTestId("piece-unknown");
      expect(fallbackEl).toBeInTheDocument();
      expect(fallbackEl).toHaveAttribute("data-fallback", "true");
      expect(fallbackEl.textContent).toBe("?");
    });

    it("TC-PIECE-20: handles completely corrupted piece objects without throwing", () => {
      const corrupt = null as unknown as PieceModel;
      render(<Piece piece={corrupt} />);
      const fallbackEl = screen.getByTestId("piece-unknown");
      expect(fallbackEl).toBeInTheDocument();
      expect(fallbackEl).toHaveAttribute("data-fallback", "true");
    });
  });

  describe("TC-PIECE-21 & TC-PIECE-22: Non-Mutation Invariant & Property Fuzzing", () => {
    it("TC-PIECE-21: preserves input Piece object immutability across 1,000 renders", () => {
      for (let i = 0; i < 1000; i += 1) {
        const original: PieceModel = Object.freeze({ color: "w", type: "k" });
        const { unmount } = render(<Piece piece={original} />);
        expect(original.color).toBe("w");
        expect(original.type).toBe("k");
        unmount();
      }
    });

    it("TC-PIECE-22: fast-check property fuzzing renders all arbitrary valid piece models faithfully", () => {
      fc.assert(
        fc.property(
          fc.constantFrom<Color>("w", "b"),
          fc.constantFrom<PieceType>("p", "n", "b", "r", "q", "k"),
          (color, type) => {
            const piece: PieceModel = { color, type };
            const { unmount } = render(<Piece piece={piece} />);
            const testId = `piece-${color}${type}`;
            const pieceEl = screen.getByTestId(testId);
            expect(pieceEl).toBeInTheDocument();
            expect(pieceEl).toHaveAttribute("data-piece-color", color);
            expect(pieceEl).toHaveAttribute("data-piece-type", type);
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
