import { describe, expect, it } from "vitest";
import { ChessJsAdapter } from "../adapters/chessJsAdapter";
import type { Square } from "../types";

describe("Legal Move Generation & Querying (TC-MOVE-01, TC-MOVE-02, TC-MOVE-03)", () => {
  describe("TC-MOVE-01: Query all legal moves in position", () => {
    it("returns exactly 20 legal moves from standard initial starting position", () => {
      const game = new ChessJsAdapter();
      const moves = game.getLegalMoves();

      expect(moves).toHaveLength(20);

      // Verify 16 pawn pushes (8 single + 8 double)
      const pawnMoves = moves.filter((m) => m.piece.type === "p");
      expect(pawnMoves).toHaveLength(16);

      // Verify 4 knight jumps
      const knightMoves = moves.filter((m) => m.piece.type === "n");
      expect(knightMoves).toHaveLength(4);

      // Verify every move has valid metadata
      for (const move of moves) {
        expect(move.piece.color).toBe("w");
        expect(move.san).toBeDefined();
        expect(move.lan).toBeDefined();
        expect(move.beforeFen).toBeDefined();
        expect(move.afterFen).toBeDefined();
        expect(move.captured).toBeUndefined();
      }
    });

    it("returns 0 legal moves when position is in checkmate", () => {
      // Fool's Mate final position: Black queen delivered mate on h4
      const foolsMateFen =
        "rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3";
      const game = new ChessJsAdapter(foolsMateFen);

      const moves = game.getLegalMoves();
      expect(moves).toHaveLength(0);
    });

    it("returns 0 legal moves when position is in stalemate", () => {
      // Stalemate: Black king on a8 cornered by White Queen on b6 and King on a1
      const stalemateFen = "k7/8/1Q6/8/8/8/8/K7 b - - 0 1";
      const game = new ChessJsAdapter(stalemateFen);

      const moves = game.getLegalMoves();
      expect(moves).toHaveLength(0);
    });

    it("returns only moves that resolve check when king is in check", () => {
      // White king on e1 in check by Black rook on e4, Black king on a8
      const checkFen = "k7/8/8/8/4r3/8/4B3/4K3 w - - 0 1";
      const game = new ChessJsAdapter(checkFen);

      const moves = game.getLegalMoves();
      // King can move to d1, f1, d2, f2; Bishop is pinned on e2 so it cannot move!
      expect(moves.every((m) => m.piece.type === "k")).toBe(true);
      const destinations = moves.map((m) => m.to).sort();
      expect(destinations).toEqual(["d1", "d2", "f1", "f2"]);
    });
  });

  describe("TC-MOVE-02: Query legal moves filtered by square", () => {
    it("returns only moves originating from specified square", () => {
      const game = new ChessJsAdapter();

      // Square e2 has 2 legal moves: e3 and e4
      const e2Moves = game.getLegalMoves("e2");
      expect(e2Moves).toHaveLength(2);
      expect(e2Moves.map((m) => m.to).sort()).toEqual(["e3", "e4"]);
      expect(e2Moves.every((m) => m.from === "e2")).toBe(true);

      // Square g1 (Knight) has 2 legal moves: f3 and h3
      const g1Moves = game.getLegalMoves("g1");
      expect(g1Moves).toHaveLength(2);
      expect(g1Moves.map((m) => m.to).sort()).toEqual(["f3", "h3"]);
    });

    it("returns empty array when querying empty square", () => {
      const game = new ChessJsAdapter();
      const e4Moves = game.getLegalMoves("e4");
      expect(e4Moves).toEqual([]);
    });

    it("returns empty array when querying square containing opponent piece", () => {
      const game = new ChessJsAdapter();
      // White turn, querying Black pawn on e7
      const e7Moves = game.getLegalMoves("e7");
      expect(e7Moves).toEqual([]);
    });

    it("returns empty array when querying piece with no legal moves (e.g. boxed-in rook)", () => {
      const game = new ChessJsAdapter();
      // a1 rook is completely surrounded
      const a1Moves = game.getLegalMoves("a1");
      expect(a1Moves).toEqual([]);
    });

    it("returns empty array for invalid square parameter safely", () => {
      const game = new ChessJsAdapter();
      const invalidMoves = game.getLegalMoves("z9" as unknown as Square);
      expect(invalidMoves).toEqual([]);
    });
  });

  describe("TC-MOVE-03: Move legality predicate (isLegalMove)", () => {
    it("returns true for valid legal moves without mutating state", () => {
      const game = new ChessJsAdapter();
      const beforeFen = game.exportFen();

      expect(game.isLegalMove({ from: "e2", to: "e4" })).toBe(true);
      expect(game.isLegalMove({ from: "g1", to: "f3" })).toBe(true);
      expect(game.isLegalMove({ from: "d2", to: "d3" })).toBe(true);

      // Verify zero state mutation
      expect(game.exportFen()).toBe(beforeFen);
      expect(game.getPosition().turn).toBe("w");
    });

    it("returns false for illegal piece movements", () => {
      const game = new ChessJsAdapter();

      // Pawn moving 3 squares forward
      expect(game.isLegalMove({ from: "e2", to: "e5" })).toBe(false);
      // Pawn moving sideways
      expect(game.isLegalMove({ from: "e2", to: "f2" })).toBe(false);
      // Bishop jumping through pawns
      expect(game.isLegalMove({ from: "c1", to: "e3" })).toBe(false);
      // Knight moving straight
      expect(game.isLegalMove({ from: "g1", to: "g3" })).toBe(false);
    });

    it("returns false when moving opponent piece or from empty square", () => {
      const game = new ChessJsAdapter();

      // Black pawn on White turn
      expect(game.isLegalMove({ from: "e7", to: "e5" })).toBe(false);
      // Empty square
      expect(game.isLegalMove({ from: "d4", to: "d5" })).toBe(false);
    });

    it("returns false for invalid square coordinates", () => {
      const game = new ChessJsAdapter();

      // @ts-expect-error Testing invalid runtime input
      expect(game.isLegalMove({ from: "e9", to: "e4" })).toBe(false);
      // @ts-expect-error Testing invalid runtime input
      expect(game.isLegalMove({ from: "e2", to: "x5" })).toBe(false);
    });

    it("validates promotion move correctly", () => {
      // Pawn on 7th rank ready to promote
      const promotionFen = "8/4P3/8/8/8/8/k6K/8 w - - 0 1";
      const game = new ChessJsAdapter(promotionFen);

      expect(game.isLegalMove({ from: "e7", to: "e8", promotion: "q" })).toBe(
        true
      );
      expect(game.isLegalMove({ from: "e7", to: "e8", promotion: "r" })).toBe(
        true
      );
      expect(game.isLegalMove({ from: "e7", to: "e8", promotion: "b" })).toBe(
        true
      );
      expect(game.isLegalMove({ from: "e7", to: "e8", promotion: "n" })).toBe(
        true
      );

      // Promotion on non-promotion move should fail
      expect(game.isLegalMove({ from: "h2", to: "h3", promotion: "q" })).toBe(
        false
      );
    });
  });
});
