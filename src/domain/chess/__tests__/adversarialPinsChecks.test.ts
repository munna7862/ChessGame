import { describe, expect, it } from "vitest";
import { ChessJsAdapter } from "../adapters/chessJsAdapter";
import { ADVERSARIAL_RULE_FIXTURES } from "./fixtures/regressionCorpus";

describe("Adversarial Pins, Discovered Checks & Double Checks (TC-REG-PIN-01 to TC-REG-PIN-08)", () => {
  describe("Absolute Pins & Ray Defense", () => {
    it("TC-REG-PIN-01: Absolute orthogonal pin restricts rook to moving only along the pin file", () => {
      // White King on e1, White Rook on e4, Black Rook on e8
      const adapter = new ChessJsAdapter("4r1k1/8/8/8/4R3/8/8/4K3 w - - 0 1");
      const rookMoves = adapter.getLegalMoves("e4");

      // Pinned rook can only move along the e-file (e2, e3, e5, e6, e7, e8)
      expect(rookMoves.length).toBe(6);
      for (const move of rookMoves) {
        expect(move.to[0]).toBe("e");
      }

      // Lateral moves like e4-a4 or e4-h4 must be illegal
      expect(adapter.isLegalMove({ from: "e4", to: "a4" })).toBe(false);
      expect(adapter.isLegalMove({ from: "e4", to: "h4" })).toBe(false);
      const illegalLateral = adapter.makeMove({ from: "e4", to: "d4" });
      expect(illegalLateral.success).toBe(false);
    });

    it("TC-REG-PIN-02: Absolute diagonal pin prevents knight from jumping away", () => {
      // White King on g1, White Knight on f2, Black Bishop on c5
      const adapter = new ChessJsAdapter("6k1/8/8/2b5/8/8/5N2/6K1 w - - 0 1");
      const knightMoves = adapter.getLegalMoves("f2");

      // Knights cannot move along diagonals, so the pinned knight has exactly 0 legal moves
      expect(knightMoves).toHaveLength(0);
      expect(adapter.isLegalMove({ from: "f2", to: "e4" })).toBe(false);
      expect(adapter.isLegalMove({ from: "f2", to: "g4" })).toBe(false);
      expect(adapter.isLegalMove({ from: "f2", to: "d3" })).toBe(false);

      const illegalKnightMove = adapter.makeMove({ from: "f2", to: "e4" });
      expect(illegalKnightMove.success).toBe(false);
      if (!illegalKnightMove.success) {
        expect(illegalKnightMove.error.code).toBe("ILLEGAL_MOVE");
      }
    });

    it("TC-REG-PIN-03: Absolute diagonal pin allows bishop or queen to capture or move along pin ray", () => {
      // White King on g1, White Bishop on e3, Black Queen on a7
      const adapter = new ChessJsAdapter("6k1/q7/8/8/8/4B3/8/6K1 w - - 0 1");
      const bishopMoves = adapter.getLegalMoves("e3");

      // Bishop can only move along the a7-g1 diagonal (f2, d4, c5, b6, a7)
      expect(bishopMoves.length).toBe(5);
      for (const m of bishopMoves) {
        expect(["f2", "d4", "c5", "b6", "a7"]).toContain(m.to);
      }

      // Diagonal off-ray moves like e3-d2 or e3-f4 are illegal
      expect(adapter.isLegalMove({ from: "e3", to: "d2" })).toBe(false);
      expect(adapter.isLegalMove({ from: "e3", to: "f4" })).toBe(false);
    });
  });

  describe("Pinned Pieces Delivering Check or Defending Squares", () => {
    it("TC-REG-PIN-04: Absolutely pinned piece still exerts check on opponent King", () => {
      // Black King f7, Black Bishop on e6, White Rook on a6 pinning Bishop e6 along rank 6
      // White King on d4: square d5 is attacked by Bishop e6 (diagonal e6-d5-c4).
      // White King cannot move to d5 or c4 into the pinned Bishop's line of fire.
      const adapter2 = new ChessJsAdapter("8/5k2/R3b3/8/3K4/8/8/8 w - - 0 1");
      // White King d4: squares d5 and c4 are attacked by Black Bishop on e6.
      expect(adapter2.isLegalMove({ from: "d4", to: "d5" })).toBe(false);
      expect(adapter2.isLegalMove({ from: "d4", to: "c4" })).toBe(false);
      // Square c5 is NOT on the diagonal ray of e6, so d4-c5 is legal
      expect(adapter2.isLegalMove({ from: "d4", to: "c5" })).toBe(true);
      // Valid king moves away from bishop's attack ray
      expect(adapter2.isLegalMove({ from: "d4", to: "d3" })).toBe(true);
      expect(adapter2.isLegalMove({ from: "d4", to: "c3" })).toBe(true);
    });

    it("TC-REG-PIN-05: Pinned piece defends a friendly piece from enemy King capture", () => {
      // Black King on e6, Black Knight on d5, Black Pawn on c6.
      // White Rook on a6 pins Black Pawn on c6 to Black King on e6 (rank 6 pin).
      // Black Knight is on d5 (defended by c6 pawn).
      // White King is on e4. White King CANNOT capture Knight on d5 because c6 pawn defends d5 (even though c6 is pinned)!
      const adapter = new ChessJsAdapter("8/8/R1p1k3/3n4/4K3/8/8/8 w - - 0 1");
      // White King on e4 cannot capture d5 because c6 pawn defends d5
      expect(adapter.isLegalMove({ from: "e4", to: "d5" })).toBe(false);
      const illegalCapture = adapter.makeMove({ from: "e4", to: "d5" });
      expect(illegalCapture.success).toBe(false);
    });
  });

  describe("Double Checks & King Evasions", () => {
    it("TC-REG-PIN-06: In double check, King MUST move (blocking and capturing are illegal)", () => {
      // White plays 1. Nc7+ (double check from c7 knight and e1 rook)
      const adapter = new ChessJsAdapter(
        "r2qk2r/8/8/1B1N4/8/8/8/4R1K1 w - - 0 1"
      );
      const moveRes = adapter.makeMove({ from: "d5", to: "c7" });
      expect(moveRes.success).toBe(true);

      const status = adapter.getStatus();
      expect(status.isCheck).toBe(true);

      const blackMoves = adapter.getLegalMoves();
      expect(blackMoves.length).toBeGreaterThan(0);
      // All legal moves for black MUST be made by the King on e8
      for (const m of blackMoves) {
        expect(m.from).toBe("e8");
      }

      // Black Queen cannot capture knight on c7 because King remains in check from Rook e1
      expect(adapter.isLegalMove({ from: "d8", to: "c7" })).toBe(false);
      // Black Bishop or Knight cannot interpose on e7 to block Rook e1 because King remains in check from Knight c7
      expect(adapter.isLegalMove({ from: "d8", to: "e7" })).toBe(false);
    });
  });

  describe("Cross-Pins & Mutual Interference", () => {
    it("TC-REG-PIN-07: Cross-pinned pieces cannot move off their respective lines of defense", () => {
      // White King on e1, White Queen on e4, Black Queen on e7, Black King on e8
      // White Rook on a4, Black Rook on h4
      // Queen e4 is pinned to King e1; Queen e7 is pinned to King e8.
      const adapter = new ChessJsAdapter("4k3/4q3/8/8/R3Q2r/8/8/4K3 w - - 0 1");
      const whiteQueenMoves = adapter.getLegalMoves("e4");

      // White Queen on e4 can only move along the e-file (capturing e7 or moving e2, e3, e5, e6)
      for (const m of whiteQueenMoves) {
        expect(m.to[0]).toBe("e");
      }

      // White Queen cannot capture Black Rook on h4
      expect(adapter.isLegalMove({ from: "e4", to: "h4" })).toBe(false);
    });

    it("TC-REG-PIN-08: King cannot move adjacent to opposing king under any circumstances", () => {
      // White King on e4, Black King on e6, Rooks present so game is active
      const adapter = new ChessJsAdapter("r7/8/4k3/8/4K3/8/8/R7 w - - 0 1");
      expect(adapter.isLegalMove({ from: "e4", to: "e5" })).toBe(false);
      expect(adapter.isLegalMove({ from: "e4", to: "d5" })).toBe(false);
      expect(adapter.isLegalMove({ from: "e4", to: "f5" })).toBe(false);

      const illegalApproach = adapter.makeMove({ from: "e4", to: "e5" });
      expect(illegalApproach.success).toBe(false);
      if (!illegalApproach.success) {
        expect(illegalApproach.error.code).toBe("ILLEGAL_MOVE");
      }
    });
  });

  describe("Regression Corpus Fixture Verification", () => {
    it("TC-REG-PIN-09: Validates all rule fixtures in ADVERSARIAL_RULE_FIXTURES", () => {
      for (const fixture of ADVERSARIAL_RULE_FIXTURES) {
        const adapter = new ChessJsAdapter(fixture.fen);
        expect(adapter.getPosition().turn).toBe(fixture.activeColor);

        for (const legalMove of fixture.legalMovesSubset) {
          expect(adapter.isLegalMove(legalMove)).toBe(true);
        }

        for (const illegalMove of fixture.illegalMovesSubset) {
          const res = adapter.makeMove(illegalMove);
          expect(res.success).toBe(false);
        }
      }
    });
  });
});
