import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Piece } from "../Piece";
import { Board } from "../Board";
import { PromotionDialog } from "../PromotionDialog";
import {
  PIECE_SET_SVG_MAP,
  STANDARD_PIECE_SVG_MAP,
  CLASSIC_PIECE_SVG_MAP,
  MODERN_PIECE_SVG_MAP,
  getPieceSvg,
} from "../assets/pieceSvgMap";
import type { PieceType, Color } from "../../../domain/chess/types";
import type { PieceSet, BoardTheme } from "../../../domain/persistence/schema";

describe("Piece Sets and Theme Invariants", () => {
  const ALL_PIECE_TYPES: readonly PieceType[] = ["p", "n", "b", "r", "q", "k"];
  const ALL_COLORS: readonly Color[] = ["w", "b"];
  const ALL_PIECE_SETS: readonly PieceSet[] = ["standard", "classic", "modern"];
  const ALL_BOARD_THEMES: readonly BoardTheme[] = [
    "classic",
    "wood",
    "slate",
    "ocean",
    "emerald",
    "midnight",
  ];

  describe("Piece SVG Registry Completeness (TC-THM-03)", () => {
    it("should define all 12 pieces for every piece set", () => {
      for (const pieceSet of ALL_PIECE_SETS) {
        const setMap = PIECE_SET_SVG_MAP[pieceSet];
        expect(setMap).toBeDefined();

        for (const color of ALL_COLORS) {
          for (const type of ALL_PIECE_TYPES) {
            const SvgComp = setMap[color][type];
            expect(SvgComp).toBeTypeOf("function");
          }
        }
      }
    });

    it("should resolve getPieceSvg accurately with fallback for invalid set", () => {
      const standardQueen = getPieceSvg("w", "q", "standard");
      expect(standardQueen).toBe(STANDARD_PIECE_SVG_MAP.w.q);

      const classicKnight = getPieceSvg("b", "n", "classic");
      expect(classicKnight).toBe(CLASSIC_PIECE_SVG_MAP.b.n);

      const modernRook = getPieceSvg("w", "r", "modern");
      expect(modernRook).toBe(MODERN_PIECE_SVG_MAP.w.r);

      // Fallback test
      const fallback = getPieceSvg(
        "w",
        "k",
        "unknown_set" as unknown as PieceSet
      );
      expect(fallback).toBe(STANDARD_PIECE_SVG_MAP.w.k);
    });
  });

  describe("Piece Component Dynamic PieceSet Rendering (TC-THM-04)", () => {
    it.each(ALL_PIECE_SETS)(
      "renders %s piece set with correct data attributes and svg elements",
      (pieceSet) => {
        const { unmount } = render(
          <Piece
            piece={{ color: "w", type: "n" }}
            pieceSet={pieceSet}
            dataTestId={`knight-${pieceSet}`}
          />
        );

        const pieceEl = screen.getByTestId(`knight-${pieceSet}`);
        expect(pieceEl).toBeInTheDocument();
        expect(pieceEl).toHaveAttribute("data-piece-color", "w");
        expect(pieceEl).toHaveAttribute("data-piece-type", "n");

        const svgEl = pieceEl.querySelector("svg");
        expect(svgEl).toBeInTheDocument();
        expect(svgEl).toHaveAttribute("viewBox", "0 0 45 45");

        unmount();
      }
    );

    it("handles invalid piece gracefully with fallback symbol", () => {
      render(
        <Piece
          piece={null as unknown as { color: "w"; type: "p" }}
          dataTestId="null-piece"
        />
      );

      const fallbackEl = screen.getByTestId("null-piece");
      expect(fallbackEl).toHaveAttribute("data-fallback", "true");
      expect(fallbackEl.textContent).toBe("?");
    });
  });

  describe("Board Component Theme and PieceSet Integration (TC-THM-05, TC-THM-06)", () => {
    it.each(ALL_BOARD_THEMES)(
      "applies board theme class and data attribute for %s",
      (theme) => {
        const { unmount } = render(
          <Board
            theme={theme}
            pieces={{ e4: { color: "w", type: "p" } }}
            ariaLabel="Theme test board"
          />
        );

        const wrapper = screen.getByTestId("chess-board-wrapper");
        expect(wrapper).toHaveAttribute("data-board-theme", theme);
        expect(wrapper).toHaveClass(`board-theme-${theme}`);

        const grid = screen.getByTestId("chess-board");
        expect(grid).toHaveAttribute("data-board-theme", theme);
        expect(grid).toHaveClass(`board-theme-${theme}`);

        unmount();
      }
    );

    it.each(ALL_PIECE_SETS)(
      "propagates pieceSet %s to square pieces",
      (pieceSet) => {
        const { unmount } = render(
          <Board
            pieceSet={pieceSet}
            pieces={{ e4: { color: "w", type: "n" } }}
          />
        );

        const wrapper = screen.getByTestId("chess-board-wrapper");
        expect(wrapper).toHaveAttribute("data-piece-set", pieceSet);
        expect(wrapper).toHaveClass(`piece-set-${pieceSet}`);

        const square = screen.getByTestId("board-square-e4");
        const pieceEl = square.querySelector(".chess-piece");
        expect(pieceEl).toBeInTheDocument();
        expect(pieceEl?.querySelector("svg")).toBeInTheDocument();

        unmount();
      }
    );
  });

  describe("Promotion Dialog Piece Set Integration (TC-THM-11)", () => {
    it.each(ALL_PIECE_SETS)(
      "renders promotion choices in %s piece set",
      (pieceSet) => {
        const handleSelect = vi.fn();
        const handleCancel = vi.fn();

        const { unmount } = render(
          <PromotionDialog
            color="w"
            pieceSet={pieceSet}
            targetSquare="e8"
            onSelect={handleSelect}
            onCancel={handleCancel}
          />
        );

        const queenBtn = screen.getByTestId("promotion-choice-q");
        expect(queenBtn).toBeInTheDocument();
        expect(queenBtn.querySelector("svg")).toBeInTheDocument();

        unmount();
      }
    );
  });
});
