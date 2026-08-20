import { describe, expect, it } from "vitest";
import { ChessJsAdapter } from "../adapters/chessJsAdapter";

describe("Adversarial Draw Rules, Repetition & Terminal Boundaries (TC-REG-DRAW-01 to TC-REG-DRAW-08)", () => {
  describe("Threefold Repetition & State Nuances", () => {
    it("TC-REG-DRAW-01: Threefold repetition requires identical castling rights", () => {
      // Position with castling rights available
      const adapter = new ChessJsAdapter(
        "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1"
      );

      // 1. Ke2 Kd7 2. Ke1 Ke8 (King moves back to e1, but castling rights are permanently lost)
      adapter.makeMove({ from: "e1", to: "e2" });
      adapter.makeMove({ from: "e8", to: "d7" });
      adapter.makeMove({ from: "e2", to: "e1" });
      adapter.makeMove({ from: "d7", to: "e8" });

      // Board piece positions are identical to starting position, but castling rights were lost
      expect(adapter.getPosition().castling.w.kingside).toBe(false);
      expect(adapter.getPosition().castling.w.queenside).toBe(false);
      // Status must NOT be threefold repetition after 1 round trip
      expect(adapter.getStatus().state).toBe("active");

      // 2. Ke2 Kd7 3. Ke1 Ke8 (Now moves repeat from the state without castling rights)
      adapter.makeMove({ from: "e1", to: "e2" });
      adapter.makeMove({ from: "e8", to: "d7" });
      adapter.makeMove({ from: "e2", to: "e1" });
      adapter.makeMove({ from: "d7", to: "e8" });

      // 3. Ke2 Kd7 4. Ke1 Ke8 (3rd occurrence of the state without castling rights)
      adapter.makeMove({ from: "e1", to: "e2" });
      adapter.makeMove({ from: "e8", to: "d7" });
      adapter.makeMove({ from: "e2", to: "e1" });
      adapter.makeMove({ from: "d7", to: "e8" });

      const status = adapter.getStatus();
      expect(status.state).toBe("draw_threefold_repetition");
      expect(status.isOver).toBe(true);
      expect(status.inDraw).toBe(true);
    });

    it("TC-REG-DRAW-02: Threefold repetition distinguishes active en passant availability", () => {
      const adapter = new ChessJsAdapter(
        "rnbqkbnr/1ppppppp/8/8/pP6/8/P1PPPPPP/RNBQKBNR b KQkq b3 0 1"
      );
      // Starting position has enPassantSquare: 'b3'
      expect(adapter.getPosition().enPassantSquare).toBe("b3");

      // Black plays Nf6, White plays Nf3, Black plays Ng8, White plays Ng1
      adapter.makeMove({ from: "g8", to: "f6" });
      adapter.makeMove({ from: "g1", to: "f3" });
      adapter.makeMove({ from: "f6", to: "g8" });
      adapter.makeMove({ from: "f3", to: "g1" });

      // Piece positions are same, but enPassantSquare is now null (expired)
      expect(adapter.getPosition().enPassantSquare).toBeNull();
      // Therefore this is NOT a repeated state from ply 0
      expect(adapter.getStatus().state).toBe("active");
    });
  });

  describe("50-Move Rule Precision & Resets", () => {
    it("TC-REG-DRAW-03: Halfmove clock reaches 100 plies -> draw_fifty_moves", () => {
      // FEN with sufficient material (Rooks) and halfmove clock at 99
      const fen99 = "r3k3/8/8/8/8/8/4K3/R7 w - - 99 50";
      const adapter = new ChessJsAdapter(fen99);
      expect(adapter.getStatus().state).toBe("active");

      // White plays a quiet king move (Ke2-e3) -> halfmove clock becomes 100
      const res = adapter.makeMove({ from: "e2", to: "e3" });
      expect(res.success).toBe(true);
      expect(adapter.getPosition().halfmoveClock).toBe(100);

      const status = adapter.getStatus();
      expect(status.state).toBe("draw_fifty_moves");
      expect(status.isOver).toBe(true);
      expect(status.inDraw).toBe(true);
      expect(status.drawReason).toBe("fifty_moves");
    });

    it("TC-REG-DRAW-04: Pawn push at halfmove 99 resets halfmove clock to 0", () => {
      const fen99Pawn = "r3k3/8/8/8/4P3/8/4K3/R7 w - - 99 50";
      const adapter = new ChessJsAdapter(fen99Pawn);

      const res = adapter.makeMove({ from: "e4", to: "e5" });
      expect(res.success).toBe(true);
      expect(adapter.getPosition().halfmoveClock).toBe(0);
      expect(adapter.getStatus().state).toBe("active");
    });

    it("TC-REG-DRAW-05: Piece capture at halfmove 99 resets halfmove clock to 0", () => {
      const fen99Capture = "r3k3/8/8/8/8/4n3/4K3/R7 w - - 99 50";
      const adapter = new ChessJsAdapter(fen99Capture);

      // White King captures Black Knight on e3
      const res = adapter.makeMove({ from: "e2", to: "e3" });
      expect(res.success).toBe(true);
      expect(adapter.getPosition().halfmoveClock).toBe(0);
      expect(adapter.getStatus().state).toBe("active");
    });
  });

  describe("Insufficient Material Matrix", () => {
    it("TC-REG-DRAW-06: Evaluates canonical insufficient material configurations", () => {
      // 1. King vs King
      const kvk = new ChessJsAdapter("8/8/4k3/8/8/4K3/8/8 w - - 0 1");
      expect(kvk.getStatus().state).toBe("draw_insufficient_material");
      expect(kvk.getStatus().isOver).toBe(true);

      // 2. King + Bishop vs King
      const kbvk = new ChessJsAdapter("8/8/4k3/8/8/4KB2/8/8 w - - 0 1");
      expect(kbvk.getStatus().state).toBe("draw_insufficient_material");
      expect(kbvk.getStatus().isOver).toBe(true);

      // 3. King + Knight vs King
      const knvk = new ChessJsAdapter("8/8/4k3/8/8/4KN2/8/8 w - - 0 1");
      expect(knvk.getStatus().state).toBe("draw_insufficient_material");
      expect(knvk.getStatus().isOver).toBe(true);

      // 4. King + Bishop vs King + Bishop (same colored squares: e3 is dark (3+5=8? e3 is dark: e=5, 3=3, 5+3=8 even=dark; c7 is dark: c=3, 7=7, 3+7=10 even=dark))
      const kbvkbSame = new ChessJsAdapter("8/2b5/4k3/8/8/4B3/4K3/8 w - - 0 1");
      expect(kbvkbSame.getStatus().state).toBe("draw_insufficient_material");
      expect(kbvkbSame.getStatus().isOver).toBe(true);
    });
  });

  describe("Status Precedence & Terminal State Immutability", () => {
    it("TC-REG-DRAW-07: Checkmate strictly supersedes 50-move draw threshold", () => {
      // FEN with halfmove clock at 99 where White can deliver mate in 1
      // White King on f6, Queen on g6; Black King on h8
      // 1. Qh7# delivers checkmate on move 100
      const fenMateAt100 = "7k/8/5KQ1/8/8/8/8/8 w - - 99 50";
      const adapter = new ChessJsAdapter(fenMateAt100);

      const mateMove = adapter.makeMove({ from: "g6", to: "g7" });
      expect(mateMove.success).toBe(true);

      const status = adapter.getStatus();
      expect(status.state).toBe("checkmate");
      expect(status.isOver).toBe(true);
      expect(status.winner).toBe("w");
      expect(status.inDraw).toBe(false);
    });

    it("TC-REG-DRAW-08: Completed game sessions reject subsequent moves, resignations, and draws", () => {
      const adapter = new ChessJsAdapter("7k/6Q1/5K2/8/8/8/8/8 b - - 0 1");
      expect(adapter.getStatus().state).toBe("checkmate");
      expect(adapter.getStatus().isOver).toBe(true);

      // 1. Move attempt
      const moveRes = adapter.makeMove({ from: "h8", to: "g7" });
      expect(moveRes.success).toBe(false);
      if (!moveRes.success) {
        expect(moveRes.error.code).toBe("GAME_ALREADY_OVER");
      }

      // 2. Resign attempt
      const resignRes = adapter.resign("b");
      expect(resignRes.success).toBe(false);
      if (!resignRes.success) {
        expect(resignRes.error.code).toBe("GAME_ALREADY_OVER");
      }

      // 3. Draw agreement attempt
      const drawRes = adapter.agreeDraw();
      expect(drawRes.success).toBe(false);
      if (!drawRes.success) {
        expect(drawRes.error.code).toBe("GAME_ALREADY_OVER");
      }

      // 4. Timeout attempt
      const timeoutRes = adapter.timeout("b");
      expect(timeoutRes.success).toBe(false);
      if (!timeoutRes.success) {
        expect(timeoutRes.error.code).toBe("GAME_ALREADY_OVER");
      }
    });
  });
});
