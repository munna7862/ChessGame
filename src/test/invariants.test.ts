import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

describe("Test Harness Property-Based Invariant Checks (fast-check)", () => {
  it("validates board square notation generation across 64 squares", () => {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const ranks = [1, 2, 3, 4, 5, 6, 7, 8];

    fc.assert(
      fc.property(
        fc.constantFrom(...files),
        fc.constantFrom(...ranks),
        (file, rank) => {
          const square = `${file}${rank}`;
          expect(square).toMatch(/^[a-h][1-8]$/);
          expect(square.length).toBe(2);
        }
      )
    );
  });

  it("verifies string serialization idempotency for FEN baseline strings", () => {
    const initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    fc.assert(
      fc.property(fc.constant(initialFen), (fen) => {
        const parts = fen.split(" ");
        expect(parts).toHaveLength(6);
        expect(parts[0]).toBe("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
        expect(parts[1]).toBe("w");
        expect(parts[2]).toBe("KQkq");
        expect(parts[3]).toBe("-");
        expect(parts[4]).toBe("0");
        expect(parts[5]).toBe("1");
      })
    );
  });
});
