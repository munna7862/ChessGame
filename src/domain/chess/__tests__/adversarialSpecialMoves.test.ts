import { describe, expect, it } from "vitest";
import { ChessJsAdapter } from "../adapters/chessJsAdapter";
import { ENDGAME_STUDIES } from "./fixtures/regressionCorpus";

describe("Adversarial Special Moves: Castling, En Passant & Promotion (TC-REG-SPEC-01 to TC-REG-SPEC-08)", () => {
  describe("Castling Invariants & Attacked Square Nuances", () => {
    it("TC-REG-SPEC-01: Queenside castling is LEGAL when b1 is attacked because b1 is not a king transit square", () => {
      // White King on e1, Rook on a1, Black Bishop on a2 attacking b1
      // King moves e1 -> c1, transit squares are e1, d1, c1. Square b1 is only traversed by the Rook!
      const adapter = new ChessJsAdapter("4k3/8/8/8/8/8/b7/R3K2R w KQ - 0 1");
      const legalMoves = adapter.getLegalMoves();

      const queensideCastle = legalMoves.find(
        (m) => m.from === "e1" && m.to === "c1"
      );
      expect(queensideCastle).toBeDefined();

      const res = adapter.makeMove({ from: "e1", to: "c1" });
      expect(res.success).toBe(true);
      expect(adapter.getPiece("c1")?.type).toBe("k");
      expect(adapter.getPiece("d1")?.type).toBe("r");
      expect(adapter.getPosition().castling.w.kingside).toBe(false);
      expect(adapter.getPosition().castling.w.queenside).toBe(false);
    });

    it("TC-REG-SPEC-02: Queenside castling is ILLEGAL when d1 or c1 is attacked by enemy piece", () => {
      // White King on e1, Rook on a1, Black Rook on d8 controlling d1
      const adapter = new ChessJsAdapter("3r4/4k3/8/8/8/8/8/R3K2R w KQ - 0 1");
      const legalMoves = adapter.getLegalMoves();

      const queensideCastle = legalMoves.find(
        (m) => m.from === "e1" && m.to === "c1"
      );
      expect(queensideCastle).toBeUndefined();
      expect(adapter.isLegalMove({ from: "e1", to: "c1" })).toBe(false);

      const illegalCastle = adapter.makeMove({ from: "e1", to: "c1" });
      expect(illegalCastle.success).toBe(false);
    });

    it("TC-REG-SPEC-03: Castling out of check is strictly forbidden", () => {
      // White King on e1 in check from Black Queen on e8 (Black King on a7 so e-file is clear)
      const adapter = new ChessJsAdapter("4q3/k7/8/8/8/8/8/R3K2R w KQ - 0 1");
      expect(adapter.getPosition().isCheck).toBe(true);

      // Both kingside (e1-g1) and queenside (e1-c1) must be excluded
      expect(adapter.isLegalMove({ from: "e1", to: "g1" })).toBe(false);
      expect(adapter.isLegalMove({ from: "e1", to: "c1" })).toBe(false);
    });

    it("TC-REG-SPEC-04: Rook attacked on starting square does NOT prevent castling if king path is clear", () => {
      // White King on e1, Rook on h1 attacked by Black Bishop on c6 (controlling h1)
      const adapter = new ChessJsAdapter("4k3/8/2b5/8/8/8/8/R3K2R w KQ - 0 1");
      // f1 and g1 are not attacked, so Kingside castling is legal
      expect(adapter.isLegalMove({ from: "e1", to: "g1" })).toBe(true);
      const res = adapter.makeMove({ from: "e1", to: "g1" });
      expect(res.success).toBe(true);
    });
  });

  describe("En Passant Edge Cases & King Safety", () => {
    it("TC-REG-SPEC-05: En passant rank pin - capture is illegal if removing both pawns exposes king horizontally", () => {
      // Black Rook on a5, Black Pawn on g7, White Pawn on f5, White King on h5.
      // Black plays 1... g5.
      // If White plays 2. fxg6 e.p., both f5 and g5 are cleared from rank 5, exposing Kh5 to Ra5.
      // Therefore fxg6 e.p. MUST BE ILLEGAL.
      const pinFen = "8/6p1/8/r4P1K/8/8/8/4k3 b - - 0 1";
      const pinAdapter = new ChessJsAdapter(pinFen);
      // Black plays g7-g5
      const g5Move = pinAdapter.makeMove({ from: "g7", to: "g5" });
      expect(g5Move.success).toBe(true);

      // White playing fxg6 e.p. would expose King on h5 to Rook on a5
      expect(pinAdapter.isLegalMove({ from: "f5", to: "g6" })).toBe(false);
      const illegalEp = pinAdapter.makeMove({ from: "f5", to: "g6" });
      expect(illegalEp.success).toBe(false);
      if (!illegalEp.success) {
        expect(illegalEp.error.code).toBe("ILLEGAL_MOVE");
      }
    });

    it("TC-REG-SPEC-06: En passant capture delivering discovered check", () => {
      // Position: Black King on e7, Black Pawn on d7; White Queen on a3, White Pawn on c5
      // 1... d5 -> 2. cxd6 e.p. discovers Queen on a3 to e7 King (double check with d6 pawn)
      const adapter = new ChessJsAdapter("8/3pk3/8/2P5/8/Q7/8/7K b - - 0 1");
      // Black plays d7-d5
      const d5Res = adapter.makeMove({ from: "d7", to: "d5" });
      expect(d5Res.success).toBe(true);
      expect(adapter.getPosition().enPassantSquare).toBe("d6");

      // White plays cxd6 e.p.
      const epRes = adapter.makeMove({ from: "c5", to: "d6" });
      expect(epRes.success).toBe(true);
      expect(adapter.getPiece("d5")).toBeNull();
      expect(adapter.getPiece("d6")?.type).toBe("p");
      expect(adapter.getPosition().isCheck).toBe(true);
    });

    it("TC-REG-SPEC-07: En passant right expires immediately after 1 ply if not exercised", () => {
      const adapter = new ChessJsAdapter(
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"
      );
      // Black makes another move instead of capturing e.p.
      adapter.makeMove({ from: "b8", to: "c6" });
      expect(adapter.getPosition().enPassantSquare).toBeNull();
    });
  });

  describe("Adversarial Pawn Underpromotion Studies", () => {
    it("TC-REG-SPEC-08: Saavedra Position - Underpromotion to Rook avoids stalemate and wins", () => {
      // FEN: 8/8/1P6/8/8/1r6/p7/k6K w - - 0 1
      const saavedraStudy = ENDGAME_STUDIES.find(
        (s) => s.id === "STUDY-SAAVEDRA-1895"
      )!;
      expect(saavedraStudy).toBeDefined();

      const adapter = new ChessJsAdapter(saavedraStudy.fen);
      // 1. b7
      const b7 = adapter.makeMove({ from: "b6", to: "b7" });
      expect(b7.success).toBe(true);

      // Verify promotion moves require specifying a promotion piece
      // Position before promotion: White pawn on c7, White King on c2, Black Rook on d4
      const promoFen = "8/2P5/8/8/3r4/8/2K5/k7 w - - 0 1";

      // 1. Promoting to Queen c8=Q:
      const queenPromoAdapter = new ChessJsAdapter(promoFen);
      const qRes = queenPromoAdapter.makeMove({
        from: "c7",
        to: "c8",
        promotion: "q",
      });
      expect(qRes.success).toBe(true);
      // In this position Black would play 1... Rc4+! 2. Qxc4 stalemate
      const blackCheck = queenPromoAdapter.makeMove({ from: "d4", to: "c4" });
      expect(blackCheck.success).toBe(true);
      const whiteCaptures = queenPromoAdapter.makeMove({
        from: "c8",
        to: "c4",
      });
      expect(whiteCaptures.success).toBe(true);
      expect(queenPromoAdapter.getStatus().state).toBe("stalemate");

      // 2. Promoting to Rook c8=R avoids stalemate!
      const rookPromoAdapter = new ChessJsAdapter(promoFen);
      const rRes = rookPromoAdapter.makeMove({
        from: "c7",
        to: "c8",
        promotion: "r",
      });
      expect(rRes.success).toBe(true);
      expect(rookPromoAdapter.getPiece("c8")?.type).toBe("r");
      // Black playing Rc4+ is now met by White King capturing c4 or moving without stalemate
      const blackCheck2 = rookPromoAdapter.makeMove({ from: "d4", to: "a4" });
      expect(blackCheck2.success).toBe(true);
      // White plays Kb3 attacking both Rook and threatening mate
      const whiteKb3 = rookPromoAdapter.makeMove({ from: "c2", to: "b3" });
      expect(whiteKb3.success).toBe(true);
      expect(rookPromoAdapter.getStatus().state).toBe("active");
    });

    it("TC-REG-SPEC-09: Underpromotion to Knight delivers check", () => {
      // White King on f6, White Pawn on g7; Black King on h6, Black Rook on a8
      const adapter = new ChessJsAdapter("r7/6P1/5K1k/8/8/8/8/8 w - - 0 1");

      // Promoting to Knight g8=N+ delivers check (Knight on g8 attacks h6)
      const promoKnight = adapter.makeMove({
        from: "g7",
        to: "g8",
        promotion: "n",
      });
      expect(promoKnight.success).toBe(true);
      expect(adapter.getPiece("g8")?.type).toBe("n");
      expect(adapter.getPiece("g8")?.color).toBe("w");
      expect(adapter.getStatus().isCheck).toBe(true);
    });
  });
});
