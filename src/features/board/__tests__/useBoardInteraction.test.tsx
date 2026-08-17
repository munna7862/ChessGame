import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import fc from "fast-check";
import { createChessAdapter } from "../../../domain/chess/adapters/chessJsAdapter";
import { SQUARES, type Square } from "../../../domain/chess/types";
import {
  useBoardInteraction,
  computeLegalDestinations,
  findCheckSquare,
} from "../useBoardInteraction";

describe("useBoardInteraction & Legal Moves (Phase 04 · Sprint 03 - Sprint 04)", () => {
  it("TC-SEL-01 & TC-SEL-02: selecting active White pawn (e2) computes quiet legal moves", () => {
    const game = createChessAdapter();
    const { result } = renderHook(() => useBoardInteraction({ game }));

    expect(result.current.selectedSquare).toBeNull();
    expect(result.current.legalDestinations.size).toBe(0);

    act(() => {
      result.current.handleSquareClick("e2");
    });

    expect(result.current.selectedSquare).toBe("e2");
    expect(result.current.legalDestinations.size).toBe(2);

    const e3Dest = result.current.legalDestinations.get("e3");
    expect(e3Dest).toBeDefined();
    expect(e3Dest?.targetType).toBe("move");

    const e4Dest = result.current.legalDestinations.get("e4");
    expect(e4Dest).toBeDefined();
    expect(e4Dest?.targetType).toBe("move");
  });

  it("TC-SEL-03: tactical position highlights capture destination correctly", () => {
    const game = createChessAdapter();
    // Position: Bishop on c4 can capture pawn on f7
    game.loadFen(
      "r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5"
    );

    const { result } = renderHook(() => useBoardInteraction({ game }));

    act(() => {
      result.current.handleSquareClick("c4");
    });

    expect(result.current.selectedSquare).toBe("c4");
    const f7Dest = result.current.legalDestinations.get("f7");
    expect(f7Dest).toBeDefined();
    expect(f7Dest?.targetType).toBe("capture");

    const b3Dest = result.current.legalDestinations.get("b3");
    expect(b3Dest).toBeDefined();
    expect(b3Dest?.targetType).toBe("move");
  });

  it("TC-SEL-04: en passant capture target is classified as capture", () => {
    const game = createChessAdapter();
    // White pawn on e5 with black just played f7-f5 (en passant target f6)
    game.loadFen(
      "rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 3"
    );

    const { result } = renderHook(() => useBoardInteraction({ game }));

    act(() => {
      result.current.handleSquareClick("e5");
    });

    expect(result.current.selectedSquare).toBe("e5");

    // e6 is quiet push
    const e6Dest = result.current.legalDestinations.get("e6");
    expect(e6Dest?.targetType).toBe("move");

    // f6 is en passant capture
    const f6Dest = result.current.legalDestinations.get("f6");
    expect(f6Dest).toBeDefined();
    expect(f6Dest?.targetType).toBe("capture");
  });

  it("TC-SEL-05: switching selection to another friendly piece updates selected square and moves", () => {
    const game = createChessAdapter();
    const { result } = renderHook(() => useBoardInteraction({ game }));

    act(() => {
      result.current.handleSquareClick("e2");
    });
    expect(result.current.selectedSquare).toBe("e2");
    expect(result.current.legalDestinations.has("e4")).toBe(true);

    // Click friendly knight on b1
    act(() => {
      result.current.handleSquareClick("b1");
    });
    expect(result.current.selectedSquare).toBe("b1");
    expect(result.current.legalDestinations.has("a3")).toBe(true);
    expect(result.current.legalDestinations.has("c3")).toBe(true);
    expect(result.current.legalDestinations.has("e4")).toBe(false);
  });

  it("TC-SEL-06: clicking already selected square deselects it", () => {
    const game = createChessAdapter();
    const { result } = renderHook(() => useBoardInteraction({ game }));

    act(() => {
      result.current.handleSquareClick("e2");
    });
    expect(result.current.selectedSquare).toBe("e2");

    act(() => {
      result.current.handleSquareClick("e2");
    });
    expect(result.current.selectedSquare).toBeNull();
    expect(result.current.legalDestinations.size).toBe(0);
  });

  it("TC-SEL-07 & TC-SEL-08: clicking non-legal square clears selection without mutating game", () => {
    const game = createChessAdapter();
    const initialFen = game.exportFen();
    const { result } = renderHook(() => useBoardInteraction({ game }));

    act(() => {
      result.current.handleSquareClick("e2");
    });
    expect(result.current.selectedSquare).toBe("e2");

    // Click non-legal empty square (e5)
    act(() => {
      result.current.handleSquareClick("e5");
    });
    expect(result.current.selectedSquare).toBeNull();
    expect(result.current.legalDestinations.size).toBe(0);
    expect(game.exportFen()).toBe(initialFen);

    // Select again and click non-legal opponent piece (e7)
    act(() => {
      result.current.handleSquareClick("e2");
    });
    expect(result.current.selectedSquare).toBe("e2");

    act(() => {
      result.current.handleSquareClick("e7");
    });
    expect(result.current.selectedSquare).toBeNull();
    expect(game.exportFen()).toBe(initialFen);
  });

  it("TC-SEL-09, TC-ANIM-01: executing legal move updates board, turns, clears selection, and records lastMove with san", () => {
    const game = createChessAdapter();
    const onMoveExecuted = vi.fn();
    const { result } = renderHook(() =>
      useBoardInteraction({ game, onMoveExecuted })
    );

    act(() => {
      result.current.handleSquareClick("e2");
    });
    act(() => {
      result.current.handleSquareClick("e4");
    });

    expect(result.current.selectedSquare).toBeNull();
    expect(result.current.lastMove).toEqual({
      from: "e2",
      to: "e4",
      isCapture: false,
      san: "e4",
    });
    expect(game.getPosition().turn).toBe("b");
    expect(onMoveExecuted).toHaveBeenCalledTimes(1);
    expect(onMoveExecuted.mock.calls[0]?.[0]?.san).toBe("e4");
  });

  it("TC-ANIM-01, TC-ANIM-07: records capture in lastMove state on capture move", () => {
    const game = createChessAdapter();
    game.loadFen(
      "r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5"
    );

    const { result } = renderHook(() => useBoardInteraction({ game }));

    act(() => {
      result.current.handleSquareClick("c4");
    });
    act(() => {
      result.current.handleSquareClick("f7");
    });

    expect(result.current.lastMove).toEqual({
      from: "c4",
      to: "f7",
      isCapture: true,
      san: "Bxf7+",
    });
  });

  it("TC-ANIM-04: allows clearing lastMove via resetLastMove or setLastMove", () => {
    const game = createChessAdapter();
    const { result } = renderHook(() => useBoardInteraction({ game }));

    act(() => {
      result.current.handleSquareClick("e2");
    });
    act(() => {
      result.current.handleSquareClick("e4");
    });
    expect(result.current.lastMove).toBeDefined();

    act(() => {
      result.current.resetLastMove();
    });
    expect(result.current.lastMove).toBeNull();

    act(() => {
      result.current.setLastMove({ from: "d2", to: "d4" });
    });
    expect(result.current.lastMove).toEqual({ from: "d2", to: "d4" });
  });

  it("TC-SEL-11 & TC-SEL-12: clicking empty square or opponent piece when idle does nothing", () => {
    const game = createChessAdapter();
    const { result } = renderHook(() => useBoardInteraction({ game }));

    // Click empty square e4
    act(() => {
      result.current.handleSquareClick("e4");
    });
    expect(result.current.selectedSquare).toBeNull();

    // Click black piece e7
    act(() => {
      result.current.handleSquareClick("e7");
    });
    expect(result.current.selectedSquare).toBeNull();
  });

  it("TC-SEL-13: game over state disables interaction and clears active selection", () => {
    const game = createChessAdapter();
    // Fool's mate checkmate position
    game.loadFen(
      "rnb1kbnr/pppp1ppp/4p3/8/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3"
    );

    const { result } = renderHook(() => useBoardInteraction({ game }));

    expect(result.current.isGameOver).toBe(true);

    act(() => {
      result.current.handleSquareClick("e2");
    });
    expect(result.current.selectedSquare).toBeNull();
  });

  it("TC-SEL-14: piece with 0 legal moves is selected but renders 0 destinations", () => {
    const game = createChessAdapter();
    const { result } = renderHook(() => useBoardInteraction({ game }));

    // King on e1 has 0 legal moves in starting position
    act(() => {
      result.current.handleSquareClick("e1");
    });

    expect(result.current.selectedSquare).toBe("e1");
    expect(result.current.legalDestinations.size).toBe(0);
  });

  it("TC-SEL-15: absolute pinned piece only yields legal moves along pin ray", () => {
    const game = createChessAdapter();
    // White knight on e2 is pinned to King on e1 by Black Rook on e8 (Black King on g8)
    game.loadFen("4r1k1/8/8/8/8/8/4N3/4K3 w - - 0 1");

    const { result } = renderHook(() => useBoardInteraction({ game }));

    act(() => {
      result.current.handleSquareClick("e2");
    });

    expect(result.current.selectedSquare).toBe("e2");
    // Pinned knight has 0 legal moves
    expect(result.current.legalDestinations.size).toBe(0);
  });

  it("TC-SEL-16: detects check square correctly for active side in check", () => {
    const game = createChessAdapter();
    game.loadFen(
      "rnb1kbnr/pppp1ppp/4p3/8/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3"
    );

    const checkSquare = findCheckSquare(game, "w");
    expect(checkSquare).toBe("e1");
  });

  it("TC-SEL-20: 1,000 invalid click combinations produce zero domain mutation", () => {
    const game = createChessAdapter();
    const initialFen = game.exportFen();
    const { result } = renderHook(() => useBoardInteraction({ game }));

    for (let i = 0; i < 1000; i += 1) {
      const randomSquare = SQUARES[i % SQUARES.length] as Square;
      act(() => {
        // Try clicking non-turn or invalid squares
        if (randomSquare.endsWith("7") || randomSquare.endsWith("8")) {
          result.current.handleSquareClick(randomSquare);
        }
      });
    }

    expect(game.exportFen()).toBe(initialFen);
  });

  it("TC-SEL-21: property test verifies legal destinations match domain getLegalMoves identically", () => {
    fc.assert(
      fc.property(fc.constantFrom(...SQUARES), (square) => {
        const game = createChessAdapter();

        const destinations = computeLegalDestinations(square, game);
        const domainLegalMoves = game.getLegalMoves(square);

        expect(destinations.size).toBe(domainLegalMoves.length);

        for (const move of domainLegalMoves) {
          expect(destinations.has(move.to)).toBe(true);
          const dest = destinations.get(move.to);
          expect(dest?.square).toBe(move.to);
          if (game.getPiece(move.to) || move.captured || move.isEnPassant) {
            expect(dest?.targetType).toBe("capture");
          } else {
            expect(dest?.targetType).toBe("move");
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  describe("Promotion Interaction & State Machine (TC-PROM-05 to TC-PROM-15)", () => {
    it("TC-PROM-05: White pawn moving to rank 8 sets pendingPromotion instead of immediate commit", () => {
      const game = createChessAdapter();
      // White pawn on e7 ready to promote on e8 (Kings at g1, g8)
      game.loadFen("6k1/4P3/8/8/8/8/8/6K1 w - - 0 1");

      const onMoveExecuted = vi.fn();
      const { result } = renderHook(() =>
        useBoardInteraction({ game, onMoveExecuted })
      );

      act(() => {
        result.current.handleSquareClick("e7");
      });
      expect(result.current.selectedSquare).toBe("e7");

      act(() => {
        result.current.handleSquareClick("e8");
      });

      // Promotion dialog is triggered
      expect(result.current.pendingPromotion).toEqual({
        from: "e7",
        to: "e8",
        color: "w",
      });
      // Move not executed yet
      expect(onMoveExecuted).not.toHaveBeenCalled();
      expect(game.getPosition().turn).toBe("w");
    });

    it("TC-PROM-06: Black pawn moving to rank 1 sets pendingPromotion for Black", () => {
      const game = createChessAdapter();
      // Black pawn on a2 ready to promote on a1 (Kings at g1, g8)
      game.loadFen("6k1/8/8/8/8/8/p7/6K1 b - - 0 1");

      const { result } = renderHook(() => useBoardInteraction({ game }));

      act(() => {
        result.current.handleSquareClick("a2");
      });
      act(() => {
        result.current.handleSquareClick("a1");
      });

      expect(result.current.pendingPromotion).toEqual({
        from: "a2",
        to: "a1",
        color: "b",
      });
    });

    it("TC-PROM-07: Pawn capture onto back rank triggers promotion dialog", () => {
      const game = createChessAdapter();
      // White pawn on e7, enemy knight on d8
      game.loadFen("3n2k1/4P3/8/8/8/8/8/6K1 w - - 0 1");

      const { result } = renderHook(() => useBoardInteraction({ game }));

      act(() => {
        result.current.handleSquareClick("e7");
      });
      act(() => {
        result.current.handleSquareClick("d8");
      });

      expect(result.current.pendingPromotion).toEqual({
        from: "e7",
        to: "d8",
        color: "w",
      });
    });

    it("TC-PROM-08: Non-pawn piece moving to 8th rank commits immediately without promotion dialog", () => {
      const game = createChessAdapter();
      // White Rook on a1 moving to a8
      game.loadFen("6k1/8/8/8/8/8/8/R5K1 w - - 0 1");

      const onMoveExecuted = vi.fn();
      const { result } = renderHook(() =>
        useBoardInteraction({ game, onMoveExecuted })
      );

      act(() => {
        result.current.handleSquareClick("a1");
      });
      act(() => {
        result.current.handleSquareClick("a8");
      });

      expect(result.current.pendingPromotion).toBeNull();
      expect(onMoveExecuted).toHaveBeenCalledTimes(1);
      expect(onMoveExecuted.mock.calls[0]?.[0]?.san).toBe("Ra8+");
    });

    it("TC-PROM-10 to TC-PROM-13: handlePromotionSelect executes chosen promotion (Q, R, B, N)", () => {
      const promotionChoices = [
        { type: "q" as const, expectedSan: "e8=Q+" },
        { type: "r" as const, expectedSan: "e8=R+" },
        { type: "b" as const, expectedSan: "e8=B" },
        { type: "n" as const, expectedSan: "e8=N" },
      ];

      for (const { type, expectedSan } of promotionChoices) {
        const game = createChessAdapter();
        game.loadFen("6k1/4P3/8/8/8/8/8/6K1 w - - 0 1");

        const onMoveExecuted = vi.fn();
        const { result } = renderHook(() =>
          useBoardInteraction({ game, onMoveExecuted })
        );

        act(() => {
          result.current.handleSquareClick("e7");
        });
        act(() => {
          result.current.handleSquareClick("e8");
        });

        expect(result.current.pendingPromotion).toBeDefined();

        act(() => {
          result.current.handlePromotionSelect(type);
        });

        expect(result.current.pendingPromotion).toBeNull();
        expect(result.current.selectedSquare).toBeNull();
        expect(onMoveExecuted).toHaveBeenCalledTimes(1);
        expect(onMoveExecuted.mock.calls[0]?.[0]?.san).toBe(expectedSan);
        expect(result.current.lastMove?.to).toBe("e8");
      }
    });

    it("TC-PROM-14 & TC-PROM-15: handlePromotionCancel cancels pending promotion without mutating game", () => {
      const game = createChessAdapter();
      const initialFen = "6k1/4P3/8/8/8/8/8/6K1 w - - 0 1";
      game.loadFen(initialFen);

      const onMoveExecuted = vi.fn();
      const { result } = renderHook(() =>
        useBoardInteraction({ game, onMoveExecuted })
      );

      act(() => {
        result.current.handleSquareClick("e7");
      });
      act(() => {
        result.current.handleSquareClick("e8");
      });
      expect(result.current.pendingPromotion).toBeDefined();

      act(() => {
        result.current.handlePromotionCancel();
      });

      expect(result.current.pendingPromotion).toBeNull();
      expect(result.current.selectedSquare).toBeNull();
      expect(game.exportFen()).toBe(initialFen);
      expect(onMoveExecuted).not.toHaveBeenCalled();
    });

    it("TC-PROM-03: identifies checkmate state correctly", () => {
      const game = createChessAdapter();
      // Scholar's Mate checkmate position
      game.loadFen(
        "r1bqkb1r/pppp1Qpp/2n5/4p3/2B1n3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4"
      );

      const { result } = renderHook(() => useBoardInteraction({ game }));

      expect(result.current.isCheckmate).toBe(true);
      expect(result.current.isGameOver).toBe(true);
      expect(result.current.checkSquare).toBe("e8");
    });
  });
});
