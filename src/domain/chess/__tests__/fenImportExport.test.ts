import { describe, expect, it } from "vitest";
import { ChessJsAdapter } from "../adapters/chessJsAdapter";
import { FEN_START_POSITION, validateFen } from "../fen";

describe("FEN Import and Export - Unit & Invariant Tests", () => {
  describe("Positive Test Cases (TC-FEN-01 to TC-FEN-08)", () => {
    it("TC-FEN-01: loads standard initial starting position FEN and exports matching string", () => {
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen(FEN_START_POSITION);

      expect(res.success).toBe(true);
      const pos = adapter.getPosition();
      expect(pos.turn).toBe("w");
      expect(pos.isCheck).toBe(false);
      expect(pos.castling).toEqual({
        w: { kingside: true, queenside: true },
        b: { kingside: true, queenside: true },
      });
      expect(pos.enPassantSquare).toBeNull();
      expect(pos.halfmoveClock).toBe(0);
      expect(pos.fullmoveNumber).toBe(1);
      expect(adapter.exportFen()).toBe(FEN_START_POSITION);
    });

    it("TC-FEN-02: preserves active side to move (Black)", () => {
      const blackToMoveFen =
        "rnbqkbnr/pppp1ppp/8/8/3Pp3/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 2";
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen(blackToMoveFen);

      expect(res.success).toBe(true);
      const pos = adapter.getPosition();
      expect(pos.turn).toBe("b");
      expect(pos.enPassantSquare).toBe("d3");
      const legalMoves = adapter.getLegalMoves();
      expect(legalMoves.length).toBeGreaterThan(0);
      // All legal moves should belong to black
      for (const move of legalMoves) {
        expect(move.piece.color).toBe("b");
      }
    });

    it("TC-FEN-03: preserves partial castling rights (Kq)", () => {
      const partialCastlingFen = "r3k2r/8/8/8/8/8/8/R3K2R w Kq - 0 1";
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen(partialCastlingFen);

      expect(res.success).toBe(true);
      const pos = adapter.getPosition();
      expect(pos.castling).toEqual({
        w: { kingside: true, queenside: false },
        b: { kingside: false, queenside: true },
      });
      expect(adapter.exportFen()).toBe(partialCastlingFen);
    });

    it("TC-FEN-04: preserves empty castling rights (-)", () => {
      const noCastlingFen = "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1";
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen(noCastlingFen);

      expect(res.success).toBe(true);
      const pos = adapter.getPosition();
      expect(pos.castling).toEqual({
        w: { kingside: false, queenside: false },
        b: { kingside: false, queenside: false },
      });
      expect(adapter.exportFen()).toBe(noCastlingFen);
    });

    it("TC-FEN-05: preserves active en passant target square and enables en passant capture", () => {
      const epFen =
        "rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2";
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen(epFen);

      expect(res.success).toBe(true);
      const pos = adapter.getPosition();
      expect(pos.enPassantSquare).toBe("d6");
      expect(pos.turn).toBe("w");

      // Verify that exd6 en passant capture is legal
      const isLegal = adapter.isLegalMove({ from: "e5", to: "d6" });
      expect(isLegal).toBe(true);

      const moveRes = adapter.makeMove({ from: "e5", to: "d6" });
      expect(moveRes.success).toBe(true);
      if (moveRes.success) {
        expect(moveRes.data.isEnPassant).toBe(true);
        expect(moveRes.data.captured?.type).toBe("p");
      }
    });

    it("TC-FEN-06: preserves halfmove clock and fullmove number", () => {
      const counterFen = "4k3/8/8/8/8/8/8/4K2R w K - 15 42";
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen(counterFen);

      expect(res.success).toBe(true);
      const pos = adapter.getPosition();
      expect(pos.halfmoveClock).toBe(15);
      expect(pos.fullmoveNumber).toBe(42);
      expect(adapter.exportFen()).toBe(counterFen);
    });

    it("TC-FEN-07: preserves high halfmove (99) and high fullmove (150)", () => {
      const highCounterFen = "8/8/8/8/8/8/8/4K2k w - - 99 150";
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen(highCounterFen);

      expect(res.success).toBe(true);
      const pos = adapter.getPosition();
      expect(pos.halfmoveClock).toBe(99);
      expect(pos.fullmoveNumber).toBe(150);
      expect(adapter.exportFen()).toBe(highCounterFen);
    });

    it("TC-FEN-08: loads position with multiple promoted Queens", () => {
      const multiQueenFen = "QQQQkQQQ/8/8/8/8/8/8/4K3 w - - 0 1";
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen(multiQueenFen);

      expect(res.success).toBe(true);
      const q1 = adapter.getPiece("a8");
      const q2 = adapter.getPiece("b8");
      const k = adapter.getPiece("e8");
      expect(q1).toEqual({ type: "q", color: "w" });
      expect(q2).toEqual({ type: "q", color: "w" });
      expect(k).toEqual({ type: "k", color: "b" });
      expect(adapter.exportFen()).toBe(multiQueenFen);
    });
  });

  describe("Negative & Malformed Test Cases (TC-FEN-09 to TC-FEN-29)", () => {
    it("TC-FEN-09: rejects empty string FEN", () => {
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen("");
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("INVALID_FEN");
      }
    });

    it("TC-FEN-10: rejects FEN with 5 fields (missing fullmove)", () => {
      const incompleteFen =
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0";
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen(incompleteFen);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("INVALID_FEN");
      }
    });

    it("TC-FEN-11: rejects FEN with 7 fields (excess tokens)", () => {
      const excessFen =
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 extra";
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen(excessFen);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("INVALID_FEN");
      }
    });

    it("TC-FEN-12: rejects FEN with 7 ranks in piece placement", () => {
      const sevenRanksFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP w KQkq - 0 1";
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen(sevenRanksFen);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("INVALID_FEN");
      }
    });

    it("TC-FEN-13: rejects FEN with 9 ranks in piece placement", () => {
      const nineRanksFen =
        "rnbqkbnr/pppppppp/8/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen(nineRanksFen);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("INVALID_FEN");
      }
    });

    it("TC-FEN-14: rejects rank exceeding 8 squares (sum = 9)", () => {
      const rankSum9Fen =
        "rnbqkbnr/ppppppp2/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen(rankSum9Fen);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("INVALID_FEN");
      }
    });

    it("TC-FEN-15: rejects rank with fewer than 8 squares (sum = 6)", () => {
      const rankSum6Fen =
        "rnbqkbnr/pppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen(rankSum6Fen);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("INVALID_FEN");
      }
    });

    it("TC-FEN-16: rejects invalid piece character 'X'", () => {
      const invalidPieceFen =
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNX w KQkq - 0 1";
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen(invalidPieceFen);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("INVALID_FEN");
      }
    });

    it("TC-FEN-17: rejects invalid active color 'x'", () => {
      const invalidColorFen =
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR x KQkq - 0 1";
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen(invalidColorFen);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("INVALID_FEN");
      }
    });

    it("TC-FEN-18: rejects invalid castling token 'ABCD'", () => {
      const invalidCastlingFen =
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w ABCD - 0 1";
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen(invalidCastlingFen);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("INVALID_FEN");
      }
    });

    it("TC-FEN-19: rejects invalid en passant square on rank 4 (e4)", () => {
      const invalidEpFen =
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq e4 0 1";
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen(invalidEpFen);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("INVALID_FEN");
      }
    });

    it("TC-FEN-20: rejects invalid en passant coordinate syntax 'z9'", () => {
      const invalidEpCoordFen =
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq z9 0 1";
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen(invalidEpCoordFen);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("INVALID_FEN");
      }
    });

    it("TC-FEN-21: rejects negative halfmove clock '-1'", () => {
      const negativeHalfmoveFen =
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - -1 1";
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen(negativeHalfmoveFen);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("INVALID_FEN");
      }
    });

    it("TC-FEN-22: rejects fullmove number '0'", () => {
      const zeroFullmoveFen =
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0";
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen(zeroFullmoveFen);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("INVALID_FEN");
      }
    });

    it("TC-FEN-23: rejects position with 0 White Kings", () => {
      const noWhiteKingFen = "8/8/8/8/8/8/8/4k3 w - - 0 1";
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen(noWhiteKingFen);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("INVALID_FEN");
      }
    });

    it("TC-FEN-24: rejects position with 0 Black Kings", () => {
      const noBlackKingFen = "8/8/8/8/8/8/8/4K3 w - - 0 1";
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen(noBlackKingFen);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("INVALID_FEN");
      }
    });

    it("TC-FEN-25: rejects position with 2 White Kings", () => {
      const twoWhiteKingsFen = "4K2K/8/8/8/8/8/8/4k3 w - - 0 1";
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen(twoWhiteKingsFen);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("INVALID_FEN");
      }
    });

    it("TC-FEN-26: rejects position with 2 Black Kings", () => {
      const twoBlackKingsFen = "4k3/8/8/8/8/8/8/4K2k w - - 0 1";
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen(twoBlackKingsFen);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("INVALID_FEN");
      }
    });

    it("TC-FEN-27: rejects White Pawn on rank 8", () => {
      const pawnOnRank8Fen = "P3k3/8/8/8/8/8/8/4K3 w - - 0 1";
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen(pawnOnRank8Fen);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("INVALID_FEN");
      }
    });

    it("TC-FEN-28: rejects Black Pawn on rank 1", () => {
      const pawnOnRank1Fen = "4k3/8/8/8/8/8/8/p3K3 w - - 0 1";
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen(pawnOnRank1Fen);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("INVALID_FEN");
      }
    });

    it("TC-FEN-29: rejects en passant square on rank 3 when White is to move", () => {
      const epRank3WhiteFen =
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq e3 0 1";
      const adapter = new ChessJsAdapter();
      const res = adapter.loadFen(epRank3WhiteFen);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("INVALID_FEN");
      }
    });
  });

  describe("State Immutability & Safety (TC-FEN-30)", () => {
    it("TC-FEN-30: ensures board state is untouched after rejected FEN load", () => {
      const adapter = new ChessJsAdapter();
      const initialPos = adapter.getPosition();

      // Attempt to load an invalid FEN
      const invalidFen = "invalid-fen-string-123";
      const res = adapter.loadFen(invalidFen);
      expect(res.success).toBe(false);

      // Verify that board position is still exactly the starting position
      const postAttemptPos = adapter.getPosition();
      expect(postAttemptPos.fen).toBe(initialPos.fen);
      expect(postAttemptPos.turn).toBe("w");
      expect(adapter.getPiece("e1")?.type).toBe("k");
      expect(adapter.getPiece("e8")?.type).toBe("k");
      expect(adapter.getLegalMoves().length).toBe(20);
    });

    it("throws when constructor is given an invalid FEN", () => {
      expect(() => new ChessJsAdapter("invalid fen string")).toThrow();
    });

    it("validateFen directly returns detailed validation error", () => {
      const result = validateFen("8/8/8/8/8/8/8/8 w - - 0 1");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("White King");
    });
  });
});
