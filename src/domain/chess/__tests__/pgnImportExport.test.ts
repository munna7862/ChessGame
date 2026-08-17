import { describe, expect, it } from "vitest";
import { ChessJsAdapter } from "../adapters/chessJsAdapter";
import { formatPgn, parsePgn, stripPgnCommentsAndVariations } from "../pgn";

describe("PGN Import & Export - Pure Domain & Adapter Tests", () => {
  // Golden Fixture 1: Scholar's Mate
  const SCHOLARS_MATE_PGN = `[Event "Casual Game"]
[Site "ChessForge Desktop"]
[Date "2026.08.17"]
[Round "1"]
[White "Scholar"]
[Black "Novice"]
[Result "1-0"]

1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7# 1-0`;

  // Golden Fixture 2: Opera Game (Morphy, 1858)
  const OPERA_GAME_PGN = `[Event "Paris Opera"]
[Site "Paris FRA"]
[Date "1858.??.??"]
[Round "?"]
[White "Paul Morphy"]
[Black "Duke of Brunswick / Count Isouard"]
[Result "1-0"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`;

  // Golden Fixture 4: Custom Endgame Study with SetUp & FEN
  const CUSTOM_SETUP_PGN = `[Event "Custom Endgame Study"]
[Site "ChessForge"]
[Date "2026.08.17"]
[Round "1"]
[White "Composer"]
[Black "Solver"]
[Result "1-0"]
[SetUp "1"]
[FEN "8/8/8/8/8/4k3/4p3/4K1R1 w - - 0 1"]

1. Rg3+ Kf4 2. Ra3 Ke4 3. Kxe2 1-0`;

  describe("Positive Test Scenarios", () => {
    it("TC-PGN-01: should import and replay Scholar's Mate to checkmate", () => {
      const adapter = new ChessJsAdapter();
      const result = adapter.importPgn(SCHOLARS_MATE_PGN);

      expect(result.success).toBe(true);
      const status = adapter.getStatus();
      expect(status.state).toBe("checkmate");
      expect(status.isOver).toBe(true);
      expect(status.winner).toBe("w");
      expect(status.isCheck).toBe(true);

      const history = adapter.getHistory();
      expect(history).toHaveLength(7);
      expect(history[6]!.san).toBe("Qxf7#");
      expect(history[6]!.isCheckmate).toBe(true);

      const pos = adapter.getPosition();
      expect(pos.turn).toBe("b");
      expect(pos.fen).toBe(
        "r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4"
      );
    });

    it("TC-PGN-02: should import and replay Morphy Opera Game", () => {
      const adapter = new ChessJsAdapter();
      const result = adapter.importPgn(OPERA_GAME_PGN);

      expect(result.success).toBe(true);
      const status = adapter.getStatus();
      expect(status.state).toBe("checkmate");
      expect(status.winner).toBe("w");
      expect(adapter.getHistory()).toHaveLength(33);

      const exported = adapter.exportPgn();
      expect(exported).toContain('[Event "Paris Opera"]');
      expect(exported).toContain('[White "Paul Morphy"]');
      expect(exported).toContain("17. Rd8# 1-0");
    });

    it("TC-PGN-03: should parse and preserve Seven Tag Roster metadata", () => {
      const pgn = `[Event "World Championship 2026"]
[Site "London ENG"]
[Date "2026.11.01"]
[Round "12"]
[White "Player A"]
[Black "Player B"]
[Result "1/2-1/2"]

1. e4 e5 2. Nf3 Nc6 1/2-1/2`;

      const adapter = new ChessJsAdapter();
      const result = adapter.importPgn(pgn);
      expect(result.success).toBe(true);

      const exported = adapter.exportPgn();
      expect(exported).toContain('[Event "World Championship 2026"]');
      expect(exported).toContain('[Site "London ENG"]');
      expect(exported).toContain('[Date "2026.11.01"]');
      expect(exported).toContain('[Round "12"]');
      expect(exported).toContain('[White "Player A"]');
      expect(exported).toContain('[Black "Player B"]');
      expect(exported).toContain('[Result "1/2-1/2"]');
    });

    it("TC-PGN-04: should generate default Seven Tag Roster when exporting played game", () => {
      const adapter = new ChessJsAdapter();
      adapter.makeMove({ from: "e2", to: "e4" });
      adapter.makeMove({ from: "e7", to: "e5" });

      const exported = adapter.exportPgn();
      expect(exported).toContain('[Event "Casual Game"]');
      expect(exported).toContain('[Site "ChessForge Desktop"]');
      expect(exported).toContain('[White "White"]');
      expect(exported).toContain('[Black "Black"]');
      expect(exported).toContain('[Result "*"]');
      expect(exported).toContain("1. e4 e5 *");
    });

    it("TC-PGN-05: should replay kingside castling for both White and Black", () => {
      const pgn = `1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. O-O Nf6 5. d3 O-O *`;
      const adapter = new ChessJsAdapter();
      const result = adapter.importPgn(pgn);
      expect(result.success).toBe(true);

      const history = adapter.getHistory();
      expect(history[6]!.san).toBe("O-O");
      expect(history[6]!.isCastling).toBe("kingside");
      expect(history[9]!.san).toBe("O-O");
      expect(history[9]!.isCastling).toBe("kingside");

      // Check king positions
      expect(adapter.getPiece("g1")?.type).toBe("k");
      expect(adapter.getPiece("f1")?.type).toBe("r");
      expect(adapter.getPiece("g8")?.type).toBe("k");
      expect(adapter.getPiece("f8")?.type).toBe("r");
    });

    it("TC-PGN-06: should replay queenside castling for both White and Black", () => {
      const pgn = `1. d4 d5 2. Nc3 Nc6 3. Bf4 Bf5 4. Qd2 Qd7 5. O-O-O O-O-O *`;
      const adapter = new ChessJsAdapter();
      const result = adapter.importPgn(pgn);
      expect(result.success).toBe(true);

      const history = adapter.getHistory();
      expect(history[8]!.san).toBe("O-O-O");
      expect(history[8]!.isCastling).toBe("queenside");
      expect(history[9]!.san).toBe("O-O-O");
      expect(history[9]!.isCastling).toBe("queenside");

      expect(adapter.getPiece("c1")?.type).toBe("k");
      expect(adapter.getPiece("d1")?.type).toBe("r");
      expect(adapter.getPiece("c8")?.type).toBe("k");
      expect(adapter.getPiece("d8")?.type).toBe("r");
    });

    it("TC-PGN-07: should replay legal en passant pawn capture", () => {
      const pgn = `1. e4 Nf6 2. e5 d5 3. exd6 *`;
      const adapter = new ChessJsAdapter();
      const result = adapter.importPgn(pgn);
      expect(result.success).toBe(true);

      const history = adapter.getHistory();
      const epMove = history[4]!;
      expect(epMove.san).toBe("exd6");
      expect(epMove.isEnPassant).toBe(true);
      expect(epMove.captured?.type).toBe("p");

      // Verify d5 square is empty and pawn is on d6
      expect(adapter.getPiece("d5")).toBeNull();
      expect(adapter.getPiece("d6")?.type).toBe("p");
      expect(adapter.getPiece("d6")?.color).toBe("w");
    });

    it("TC-PGN-08: should replay pawn promotion to Queen", () => {
      const pgn = `[SetUp "1"]
[FEN "7k/4P3/8/8/8/8/8/K7 w - - 0 1"]

1. e8=Q+ Kh7 *`;

      const adapter = new ChessJsAdapter();
      const result = adapter.importPgn(pgn);
      expect(result.success).toBe(true);

      expect(adapter.getPiece("e8")?.type).toBe("q");
      expect(adapter.getPiece("e8")?.color).toBe("w");
      expect(adapter.getPosition().isCheck).toBe(false);
    });

    it("TC-PGN-09: should replay underpromotion to Knight", () => {
      const pgn = `[SetUp "1"]
[FEN "7k/4P3/8/8/8/8/8/K7 w - - 0 1"]

1. e8=N Kh7 *`;

      const adapter = new ChessJsAdapter();
      const result = adapter.importPgn(pgn);
      expect(result.success).toBe(true);

      expect(adapter.getPiece("e8")?.type).toBe("n");
      expect(adapter.getPiece("e8")?.color).toBe("w");
    });

    it("TC-PGN-10: should replay moves with file disambiguation (Nbd2)", () => {
      const pgn = `1. d4 d5 2. Nf3 Nf6 3. Nbd2 *`;
      const adapter = new ChessJsAdapter();
      const result = adapter.importPgn(pgn);
      expect(result.success).toBe(true);

      expect(adapter.getPiece("d2")?.type).toBe("n");
      expect(adapter.getPiece("b1")).toBeNull();
      expect(adapter.getPiece("f3")?.type).toBe("n");
    });

    it("TC-PGN-11: should replay moves with rank disambiguation (R1e2)", () => {
      const pgn = `[SetUp "1"]
[FEN "4k3/8/8/8/8/4R3/8/4R1K1 w - - 0 1"]

1. R1e2 Kf8 *`;

      const adapter = new ChessJsAdapter();
      const result = adapter.importPgn(pgn);
      expect(result.success).toBe(true);

      expect(adapter.getPiece("e2")?.type).toBe("r");
      expect(adapter.getPiece("e1")).toBeNull();
      expect(adapter.getPiece("e3")?.type).toBe("r");
    });

    it("TC-PGN-12: should replay moves with full coordinate disambiguation", () => {
      const pgn = `[SetUp "1"]
[FEN "4k3/8/8/8/7Q/8/4K2Q/7Q w - - 0 1"]

1. Qh4e1+ *`;

      const adapter = new ChessJsAdapter();
      const result = adapter.importPgn(pgn);
      expect(result.success).toBe(true);

      expect(adapter.getPiece("e1")?.type).toBe("q");
      expect(adapter.getPiece("h4")).toBeNull();
    });

    it("TC-PGN-13: should import custom setup endgame position", () => {
      const adapter = new ChessJsAdapter();
      const result = adapter.importPgn(CUSTOM_SETUP_PGN);
      expect(result.success).toBe(true);

      expect(adapter.getPosition().fen).toBe("8/8/8/8/4k3/R7/4K3/8 b - - 0 3");
      expect(adapter.getHistory()).toHaveLength(5);
    });

    it("TC-PGN-14: should safely ignore block comments and line comments", () => {
      const pgn = `[Event "Comment Test"]
[Result "*"]

; Line comment before move text
1. e4 {Opening move with king's pawn} 1... e5 ; Classical response
2. Nf3 {Developing knight} Nc6 {Defending e5} *`;

      const adapter = new ChessJsAdapter();
      const result = adapter.importPgn(pgn);
      expect(result.success).toBe(true);
      expect(adapter.getHistory()).toHaveLength(4);
    });

    it("TC-PGN-15: should safely ignore Numeric Annotation Glyphs (NAGs) and punctuation", () => {
      const pgn = `1. e4! e5? 2. Nf3 $1 Nc6 $14 3. Bb5 $2 *`;
      const adapter = new ChessJsAdapter();
      const result = adapter.importPgn(pgn);
      expect(result.success).toBe(true);
      expect(adapter.getHistory()).toHaveLength(5);
    });

    it("TC-PGN-16: should safely skip Recursive Annotation Variations (RAV)", () => {
      const pgn = `1. e4 e5 (1... c5 2. Nf3 d6 3. d4) 2. Nf3 Nc6 *`;
      const adapter = new ChessJsAdapter();
      const result = adapter.importPgn(pgn);
      expect(result.success).toBe(true);

      const history = adapter.getHistory();
      expect(history).toHaveLength(4);
      expect(history.map((m) => m.san)).toEqual(["e4", "e5", "Nf3", "Nc6"]);
    });

    it("TC-PGN-17: should synchronize draw result (1/2-1/2)", () => {
      const pgn = `1. e4 e5 2. Nf3 Nc6 1/2-1/2`;
      const adapter = new ChessJsAdapter();
      const result = adapter.importPgn(pgn);
      expect(result.success).toBe(true);

      const status = adapter.getStatus();
      expect(status.isOver).toBe(true);
      expect(status.inDraw).toBe(true);
      expect(status.drawReason).toBe("agreement");
    });

    it("TC-PGN-18: should synchronize Black win result (0-1)", () => {
      const pgn = `1. f3 e5 2. g4 Qh4# 0-1`;
      const adapter = new ChessJsAdapter();
      const result = adapter.importPgn(pgn);
      expect(result.success).toBe(true);

      const status = adapter.getStatus();
      expect(status.isOver).toBe(true);
      expect(status.winner).toBe("b");
      expect(status.state).toBe("checkmate");
    });

    it("TC-PGN-19: should maintain active status for in-progress game (*)", () => {
      const pgn = `1. e4 e5 2. Nf3 *`;
      const adapter = new ChessJsAdapter();
      const result = adapter.importPgn(pgn);
      expect(result.success).toBe(true);

      const status = adapter.getStatus();
      expect(status.isOver).toBe(false);
      expect(status.state).toBe("active");
    });
  });

  describe("Negative Test Scenarios & Error Guardrails", () => {
    it("TC-PGN-20: should reject empty string PGN", () => {
      const adapter = new ChessJsAdapter();
      const result = adapter.importPgn("");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("INVALID_PGN");
      }
    });

    it("TC-PGN-21: should reject PGN containing an illegal move", () => {
      const pgn = `1. e4 e5 2. Ke2 Ke7 3. Ke8`;
      const adapter = new ChessJsAdapter();
      const result = adapter.importPgn(pgn);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("ILLEGAL_MOVE");
      }
    });

    it("TC-PGN-22: should reject PGN containing invalid SAN syntax", () => {
      const pgn = `1. e4 e5 2. Z99#`;
      const adapter = new ChessJsAdapter();
      const result = adapter.importPgn(pgn);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("ILLEGAL_MOVE");
      }
    });

    it("TC-PGN-23: should reject PGN attempting to move piece when not player's turn", () => {
      const pgn = `1. e5`; // White cannot jump Black pawn from e7 to e5
      const adapter = new ChessJsAdapter();
      const result = adapter.importPgn(pgn);
      expect(result.success).toBe(false);
    });

    it("TC-PGN-24: should reject move exposing king to check", () => {
      const pgn = `[SetUp "1"]
[FEN "4k3/8/8/8/8/8/4r3/4K1N1 w - - 0 1"]

1. Nh3`; // Knight move does not parry check from rook
      const adapter = new ChessJsAdapter();
      const result = adapter.importPgn(pgn);
      expect(result.success).toBe(false);
    });

    it("TC-PGN-25: should reject illegal pawn promotion to King", () => {
      const pgn = `[SetUp "1"]
[FEN "8/4P3/8/8/8/8/4k3/4K3 w - - 0 1"]

1. e8=K`;
      const adapter = new ChessJsAdapter();
      const result = adapter.importPgn(pgn);
      expect(result.success).toBe(false);
    });

    it("TC-PGN-26: should reject castling through check", () => {
      const pgn = `[SetUp "1"]
[FEN "4k3/8/8/8/8/4r3/8/R3K2R w KQ - 0 1"]

1. O-O`; // Castling while in check is illegal
      const adapter = new ChessJsAdapter();
      const result = adapter.importPgn(pgn);
      expect(result.success).toBe(false);
    });

    it("TC-PGN-27: should reject PGN with SetUp '1' and malformed FEN", () => {
      const pgn = `[SetUp "1"]
[FEN "malformed/fen/string"]

1. e4 e5`;
      const adapter = new ChessJsAdapter();
      const result = adapter.importPgn(pgn);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("INVALID_FEN");
      }
    });

    it("TC-PGN-28: should reject SetUp '1' when missing FEN tag", () => {
      const pgn = `[SetUp "1"]

1. e4 e5`;
      const adapter = new ChessJsAdapter();
      const result = adapter.importPgn(pgn);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("INVALID_PGN");
      }
    });

    it("TC-PGN-29: should guarantee state immutability when PGN import fails", () => {
      const adapter = new ChessJsAdapter();
      // Play 2 legal moves
      adapter.makeMove({ from: "e2", to: "e4" });
      adapter.makeMove({ from: "e7", to: "e5" });
      const fenBefore = adapter.exportFen();
      const historyBefore = adapter.getHistory();

      // Attempt to load corrupted PGN
      const invalidPgn = `1. d4 d5 2. Nf3 Nf6 3. INVALID_MOVE`;
      const result = adapter.importPgn(invalidPgn);
      expect(result.success).toBe(false);

      // Verify active state remains 100% untouched
      expect(adapter.exportFen()).toBe(fenBefore);
      expect(adapter.getHistory()).toEqual(historyBefore);
      expect(adapter.getPosition().turn).toBe("w");
    });
  });

  describe("Deterministic Round-Trip Tests", () => {
    it("TC-PGN-30: should export and re-import played game deterministically", () => {
      const game1 = new ChessJsAdapter();
      game1.makeMove({ from: "e2", to: "e4" });
      game1.makeMove({ from: "c7", to: "c5" });
      game1.makeMove({ from: "g1", to: "f3" });
      game1.makeMove({ from: "d7", to: "d6" });
      game1.makeMove({ from: "d2", to: "d4" });
      game1.makeMove({ from: "c5", to: "d4" });
      game1.makeMove({ from: "f3", to: "d4" });

      const exportedPgn = game1.exportPgn({
        Event: "Sicilian Defense Match",
        White: "Grandmaster A",
        Black: "Grandmaster B",
      });

      const game2 = new ChessJsAdapter();
      const importResult = game2.importPgn(exportedPgn);
      expect(importResult.success).toBe(true);

      expect(game2.exportFen()).toBe(game1.exportFen());
      expect(game2.getHistory().map((m) => m.san)).toEqual(
        game1.getHistory().map((m) => m.san)
      );
      expect(game2.getStatus()).toEqual(game1.getStatus());

      const reExported = game2.exportPgn();
      expect(reExported).toBe(exportedPgn);
    });
  });

  describe("Pure Domain Parser & Serializer Unit Tests", () => {
    it("should strip block comments, line comments, and variations accurately", () => {
      const raw = `1. e4 {king pawn} ; rest of line comment\n1... e5 (1... c5 2. Nf3) 2. Nf3 $1`;
      const cleaned = stripPgnCommentsAndVariations(raw);
      expect(cleaned).not.toContain("king pawn");
      expect(cleaned).not.toContain("rest of line comment");
      expect(cleaned).not.toContain("c5");
      expect(cleaned).toContain("1. e4");
      expect(cleaned).toContain("1... e5");
    });

    it("should parse PGN structure with parsePgn pure function", () => {
      const parsed = parsePgn(SCHOLARS_MATE_PGN);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.tags.Event).toBe("Casual Game");
        expect(parsed.data.tags.White).toBe("Scholar");
        expect(parsed.data.tags.Black).toBe("Novice");
        expect(parsed.data.result).toBe("1-0");
        expect(parsed.data.moves).toEqual([
          "e4",
          "e5",
          "Qh5",
          "Nc6",
          "Bc4",
          "Nf6",
          "Qxf7#",
        ]);
      }
    });

    it("should format PGN string with formatPgn pure function", () => {
      const formatted = formatPgn({
        historySan: ["e4", "e5", "Nf3", "Nc6"],
        tags: { Event: "Test Event", White: "Alice", Black: "Bob" },
        result: "1/2-1/2",
      });

      expect(formatted).toContain('[Event "Test Event"]');
      expect(formatted).toContain('[White "Alice"]');
      expect(formatted).toContain('[Black "Bob"]');
      expect(formatted).toContain('[Result "1/2-1/2"]');
      expect(formatted).toContain("1. e4 e5 2. Nf3 Nc6 1/2-1/2");
    });
  });
});
