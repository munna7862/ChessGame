import { describe, expect, it } from "vitest";
import { ChessJsAdapter } from "../adapters/chessJsAdapter";
import { perft, perftDivide } from "../perft";
import { PERFT_CORPUS } from "./fixtures/perftCorpus";

describe("Perft Move Generation Benchmark Suite (TC-REG-01 to TC-REG-11)", () => {
  // Position 1: Starting Position
  describe("Position 1: Initial Starting Position", () => {
    const fixture = PERFT_CORPUS[0]!;

    it("TC-REG-01: calculates exact node count at Depth 1 (20 nodes)", () => {
      const adapter = new ChessJsAdapter(fixture.fen);
      const nodes = perft(adapter, 1);
      expect(nodes).toBe(fixture.expectedNodes[1]);
    });

    it("TC-REG-02: calculates exact node count at Depth 2 (400 nodes)", () => {
      const adapter = new ChessJsAdapter(fixture.fen);
      const nodes = perft(adapter, 2);
      expect(nodes).toBe(fixture.expectedNodes[2]);
    });

    it("TC-REG-03: calculates exact node count at Depth 3 (8,902 nodes)", () => {
      const adapter = new ChessJsAdapter(fixture.fen);
      const nodes = perft(adapter, 3);
      expect(nodes).toBe(fixture.expectedNodes[3]);
    });

    it("verifies perftDivide consistency at Depth 1", () => {
      const adapter = new ChessJsAdapter(fixture.fen);
      const divide = perftDivide(adapter, 1);
      const totalFromDivide = Object.values(divide).reduce((a, b) => a + b, 0);
      expect(totalFromDivide).toBe(20);
      expect(divide["e2e4"]).toBe(1);
      expect(divide["g1f3"]).toBe(1);
    });
  });

  // Position 2: Kiwipete
  describe("Position 2: Kiwipete Position (Castling & En Passant)", () => {
    const fixture = PERFT_CORPUS[1]!;

    it("TC-REG-04: calculates exact node count at Depth 1 (48 nodes)", () => {
      const adapter = new ChessJsAdapter(fixture.fen);
      const nodes = perft(adapter, 1);
      expect(nodes).toBe(fixture.expectedNodes[1]);
    });

    it("TC-REG-05: calculates exact node count at Depth 2 (2,039 nodes)", () => {
      const adapter = new ChessJsAdapter(fixture.fen);
      const nodes = perft(adapter, 2);
      expect(nodes).toBe(fixture.expectedNodes[2]);
    });

    it("TC-REG-06: calculates exact node count at Depth 3 (97,862 nodes)", () => {
      const adapter = new ChessJsAdapter(fixture.fen);
      const nodes = perft(adapter, 3);
      expect(nodes).toBe(fixture.expectedNodes[3]);
    }, 25000);
  });

  // Position 3: Endgame Pins & Checks
  describe("Position 3: Endgame Pins & Discovered Checks", () => {
    const fixture = PERFT_CORPUS[2]!;

    it("TC-REG-07: calculates exact node count at Depths 1 and 2 (14 and 191 nodes)", () => {
      const adapter = new ChessJsAdapter(fixture.fen);
      expect(perft(adapter, 1)).toBe(fixture.expectedNodes[1]);
      expect(perft(adapter, 2)).toBe(fixture.expectedNodes[2]);
    });

    it("TC-REG-08: calculates exact node count at Depth 3 (2,812 nodes)", () => {
      const adapter = new ChessJsAdapter(fixture.fen);
      expect(perft(adapter, 3)).toBe(fixture.expectedNodes[3]);
    });
  });

  // Position 4: Dual Promotions & Checks
  describe("Position 4: Dual Promotions & Castling Denial", () => {
    const fixture = PERFT_CORPUS[3]!;

    it("TC-REG-09: calculates exact node count at Depths 1 and 2 (6 and 264 nodes)", () => {
      const adapter = new ChessJsAdapter(fixture.fen);
      expect(perft(adapter, 1)).toBe(fixture.expectedNodes[1]);
      expect(perft(adapter, 2)).toBe(fixture.expectedNodes[2]);
    });

    it("TC-REG-10: calculates exact node count at Depth 3 (9,467 nodes)", () => {
      const adapter = new ChessJsAdapter(fixture.fen);
      expect(perft(adapter, 3)).toBe(fixture.expectedNodes[3]);
    });
  });

  // Position 5: Promotions & Sharp Pins
  describe("Position 5: Promotions & Sharp Pins", () => {
    const fixture = PERFT_CORPUS[4]!;

    it("TC-REG-11: calculates exact node count at Depths 1, 2, and 3", () => {
      const adapter = new ChessJsAdapter(fixture.fen);
      expect(perft(adapter, 1)).toBe(fixture.expectedNodes[1]);
      expect(perft(adapter, 2)).toBe(fixture.expectedNodes[2]);
      expect(perft(adapter, 3)).toBe(fixture.expectedNodes[3]);
    }, 25000);
  });
});
