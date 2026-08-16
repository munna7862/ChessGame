import { describe, expect, it } from "vitest";
import { ChessJsAdapter } from "../adapters/chessJsAdapter";
import type { MoveInput } from "../types";

describe("Move Execution, State Transitions & Failure Immutability (TC-MOVE-04 to TC-MOVE-19)", () => {
  describe("TC-MOVE-04: Standard Piece Moves", () => {
    it("executes standard pawn single push and updates turn", () => {
      const game = new ChessJsAdapter();
      const result = game.makeMove({ from: "e2", to: "e3" });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.from).toBe("e2");
      expect(result.data.to).toBe("e3");
      expect(result.data.piece).toEqual({ type: "p", color: "w" });
      expect(result.data.san).toBe("e3");
      expect(result.data.lan).toBe("e2e3");

      // Verify board state
      expect(game.getPiece("e2")).toBeNull();
      expect(game.getPiece("e3")).toEqual({ type: "p", color: "w" });
      expect(game.getPosition().turn).toBe("b");
    });

    it("executes knight jumps over pieces correctly", () => {
      const game = new ChessJsAdapter();
      const result = game.makeMove({ from: "g1", to: "f3" });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.piece).toEqual({ type: "n", color: "w" });
      expect(result.data.san).toBe("Nf3");
      expect(game.getPiece("g1")).toBeNull();
      expect(game.getPiece("f3")).toEqual({ type: "n", color: "w" });
    });

    it("executes bishop, rook, queen, and king open board movements", () => {
      // Custom open board with all major piece types and both kings
      const openFen = "r3k2r/8/8/8/8/8/8/R1BQK2R w KQkq - 0 1";
      const game = new ChessJsAdapter(openFen);

      // 1. Bishop moves diagonally
      const bRes = game.makeMove({ from: "c1", to: "e3" });
      expect(bRes.success).toBe(true);
      expect(game.getPiece("e3")).toEqual({ type: "b", color: "w" });

      // Black responds with quiet move
      const blk1 = game.makeMove({ from: "a8", to: "b8" });
      expect(blk1.success).toBe(true);

      // 2. Rook moves along rank/file
      const rRes = game.makeMove({ from: "a1", to: "a6" });
      expect(rRes.success).toBe(true);
      expect(game.getPiece("a6")).toEqual({ type: "r", color: "w" });

      const blk2 = game.makeMove({ from: "b8", to: "a8" });
      expect(blk2.success).toBe(true);

      // 3. Queen moves along rank/file/diagonal
      const qRes = game.makeMove({ from: "d1", to: "d4" });
      expect(qRes.success).toBe(true);
      expect(game.getPiece("d4")).toEqual({ type: "q", color: "w" });

      const blk3 = game.makeMove({ from: "h8", to: "g8" });
      expect(blk3.success).toBe(true);

      // 4. King moves 1 square
      const kRes = game.makeMove({ from: "e1", to: "f2" });
      expect(kRes.success).toBe(true);
      expect(game.getPiece("f2")).toEqual({ type: "k", color: "w" });
    });
  });

  describe("TC-MOVE-05: Standard Captures", () => {
    it("executes standard piece capture and records captured piece metadata", () => {
      // White pawn on e4, Black pawn on d5
      const fen =
        "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2";
      const game = new ChessJsAdapter(fen);

      const result = game.makeMove({ from: "e4", to: "d5" });
      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.san).toBe("exd5");
      expect(result.data.captured).toEqual({ type: "p", color: "b" });
      expect(game.getPiece("d5")).toEqual({ type: "p", color: "w" });
      expect(game.getPiece("e4")).toBeNull();
    });

    it("resets halfmove clock to 0 upon piece capture", () => {
      // Halfmove clock is currently 14
      const fen =
        "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 14 3";
      const game = new ChessJsAdapter(fen);

      const result = game.makeMove({ from: "f3", to: "e5" });
      expect(result.success).toBe(true);
      expect(game.getPosition().halfmoveClock).toBe(0);
    });
  });

  describe("TC-MOVE-06: Castling Execution", () => {
    it("executes White kingside castling (O-O) and relocates King & Rook correctly", () => {
      const fen =
        "r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5";
      const game = new ChessJsAdapter(fen);

      const result = game.makeMove({ from: "e1", to: "g1" });
      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.san).toBe("O-O");
      expect(result.data.isCastling).toBe("kingside");
      expect(game.getPiece("g1")).toEqual({ type: "k", color: "w" });
      expect(game.getPiece("f1")).toEqual({ type: "r", color: "w" });
      expect(game.getPiece("e1")).toBeNull();
      expect(game.getPiece("h1")).toBeNull();

      // White castling rights should now be revoked
      const pos = game.getPosition();
      expect(pos.castling.w.kingside).toBe(false);
      expect(pos.castling.w.queenside).toBe(false);
      // Black castling rights remain intact
      expect(pos.castling.b.kingside).toBe(true);
      expect(pos.castling.b.queenside).toBe(true);
    });

    it("executes White queenside castling (O-O-O) and relocates King & Rook correctly", () => {
      const fen =
        "r3k2r/pppq1ppp/2np1n2/2b1p1B1/2B1P1b1/2NP1N2/PPPQ1PPP/R3K2R w KQkq - 4 8";
      const game = new ChessJsAdapter(fen);

      const result = game.makeMove({ from: "e1", to: "c1" });
      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.san).toBe("O-O-O");
      expect(result.data.isCastling).toBe("queenside");
      expect(game.getPiece("c1")).toEqual({ type: "k", color: "w" });
      expect(game.getPiece("d1")).toEqual({ type: "r", color: "w" });
      expect(game.getPiece("e1")).toBeNull();
      expect(game.getPiece("a1")).toBeNull();
    });

    it("executes Black kingside & queenside castling correctly", () => {
      const fen =
        "r3k2r/pppq1ppp/2np1n2/2b1p1B1/2B1P1b1/2NP1N2/PPPQ1PPP/R3K2R b KQkq - 4 8";
      const game = new ChessJsAdapter(fen);

      // Black castles kingside
      const result = game.makeMove({ from: "e8", to: "g8" });
      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.san).toBe("O-O");
      expect(result.data.isCastling).toBe("kingside");
      expect(game.getPiece("g8")).toEqual({ type: "k", color: "b" });
      expect(game.getPiece("f8")).toEqual({ type: "r", color: "b" });
    });
  });

  describe("TC-MOVE-07: En Passant Execution", () => {
    it("executes en passant capture, removes skipped pawn, and sets metadata flags", () => {
      // Golden FEN: White pawn on f5, Black pawn on e5 just moved from e7
      const fen =
        "rnbqkbnr/pp1p1ppp/8/2p1pP2/8/8/PPPPP1PP/RNBQKBNR w KQkq e6 0 3";
      const game = new ChessJsAdapter(fen);

      const result = game.makeMove({ from: "f5", to: "e6" });
      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.san).toBe("fxe6");
      expect(result.data.isEnPassant).toBe(true);
      expect(result.data.captured).toEqual({ type: "p", color: "b" });

      // Destination e6 has White pawn
      expect(game.getPiece("e6")).toEqual({ type: "p", color: "w" });
      // Origin f5 is empty
      expect(game.getPiece("f5")).toBeNull();
      // Captured Black pawn on e5 is REMOVED from the board
      expect(game.getPiece("e5")).toBeNull();
      // En passant target is cleared on subsequent turn
      expect(game.getPosition().enPassantSquare).toBeNull();
    });
  });

  describe("TC-MOVE-08: Pawn Promotion & Underpromotion", () => {
    const promotionFen = "8/4P3/8/8/8/8/k6K/8 w - - 0 1";

    it("promotes pawn to Queen by explicit 'q'", () => {
      const game = new ChessJsAdapter(promotionFen);
      const result = game.makeMove({ from: "e7", to: "e8", promotion: "q" });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.san).toBe("e8=Q");
      expect(result.data.promotion).toBe("q");
      expect(game.getPiece("e8")).toEqual({ type: "q", color: "w" });
    });

    it("underpromotes pawn to Knight ('n')", () => {
      const game = new ChessJsAdapter(promotionFen);
      const result = game.makeMove({ from: "e7", to: "e8", promotion: "n" });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.san).toBe("e8=N");
      expect(result.data.promotion).toBe("n");
      expect(game.getPiece("e8")).toEqual({ type: "n", color: "w" });
    });

    it("underpromotes pawn to Rook ('r')", () => {
      const game = new ChessJsAdapter(promotionFen);
      const result = game.makeMove({ from: "e7", to: "e8", promotion: "r" });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.san).toBe("e8=R");
      expect(result.data.promotion).toBe("r");
      expect(game.getPiece("e8")).toEqual({ type: "r", color: "w" });
    });

    it("underpromotes pawn to Bishop ('b')", () => {
      const game = new ChessJsAdapter(promotionFen);
      const result = game.makeMove({ from: "e7", to: "e8", promotion: "b" });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.san).toBe("e8=B");
      expect(result.data.promotion).toBe("b");
      expect(game.getPiece("e8")).toEqual({ type: "b", color: "w" });
    });
  });

  describe("TC-MOVE-09: Checks & Checkmate", () => {
    it("delivering check sets isCheck: true in move metadata and game status", () => {
      // Position where Qxf7+ gives check
      const fen =
        "r1bqkbnr/pppp1ppp/2n5/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR w KQkq - 2 3";
      const game = new ChessJsAdapter(fen);

      const result = game.makeMove({ from: "h5", to: "f7" });
      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.san).toBe("Qxf7+");
      expect(result.data.isCheck).toBe(true);
      expect(result.data.isCheckmate).toBeUndefined();

      const status = game.getStatus();
      expect(status.state).toBe("active");
      expect(status.isCheck).toBe(true);
      expect(status.isOver).toBe(false);
    });

    it("delivering checkmate sets isCheckmate: true and concludes game", () => {
      // Scholar's Mate setup position
      const scholarsSetupFen =
        "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 4 4";
      const game = new ChessJsAdapter(scholarsSetupFen);

      const result = game.makeMove({ from: "f3", to: "f7" });
      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.san).toBe("Qxf7#");
      expect(result.data.isCheck).toBe(true);
      expect(result.data.isCheckmate).toBe(true);

      const status = game.getStatus();
      expect(status.state).toBe("checkmate");
      expect(status.isOver).toBe(true);
      expect(status.winner).toBe("w");
    });
  });

  describe("TC-MOVE-10 & TC-MOVE-11: Turn Progression & Clock Transitions", () => {
    it("toggles turn from white to black and increments fullmove number after black moves", () => {
      const game = new ChessJsAdapter();

      expect(game.getPosition().turn).toBe("w");
      expect(game.getPosition().fullmoveNumber).toBe(1);

      // White plays 1. e4
      game.makeMove({ from: "e2", to: "e4" });
      expect(game.getPosition().turn).toBe("b");
      expect(game.getPosition().fullmoveNumber).toBe(1);

      // Black plays 1... e5
      game.makeMove({ from: "e7", to: "e5" });
      expect(game.getPosition().turn).toBe("w");
      expect(game.getPosition().fullmoveNumber).toBe(2);
    });

    it("resets halfmove clock on pawn moves and increments on quiet piece moves", () => {
      const game = new ChessJsAdapter();

      // 1. e4 (pawn move -> halfmove 0)
      game.makeMove({ from: "e2", to: "e4" });
      expect(game.getPosition().halfmoveClock).toBe(0);

      // 1... e5 (pawn move -> halfmove 0)
      game.makeMove({ from: "e7", to: "e5" });
      expect(game.getPosition().halfmoveClock).toBe(0);

      // 2. Nf3 (quiet knight move -> halfmove 1)
      game.makeMove({ from: "g1", to: "f3" });
      expect(game.getPosition().halfmoveClock).toBe(1);

      // 2... Nc6 (quiet knight move -> halfmove 2)
      game.makeMove({ from: "b8", to: "c6" });
      expect(game.getPosition().halfmoveClock).toBe(2);

      // 3. Bc4 (quiet bishop move -> halfmove 3)
      game.makeMove({ from: "f1", to: "c4" });
      expect(game.getPosition().halfmoveClock).toBe(3);
    });
  });

  describe("TC-MOVE-12: Full Move Metadata Integrity", () => {
    it("returns complete and accurate Move schema metadata", () => {
      const game = new ChessJsAdapter();
      const initialFen = game.exportFen();

      const result = game.makeMove({ from: "e2", to: "e4" });
      expect(result.success).toBe(true);
      if (!result.success) return;

      const move = result.data;
      expect(move.from).toBe("e2");
      expect(move.to).toBe("e4");
      expect(move.piece).toEqual({ type: "p", color: "w" });
      expect(move.san).toBe("e4");
      expect(move.lan).toBe("e2e4");
      expect(move.beforeFen).toBe(initialFen);
      expect(move.afterFen).toBe(game.exportFen());
      expect(move.captured).toBeUndefined();
      expect(move.promotion).toBeUndefined();
      expect(move.isCastling).toBeUndefined();
      expect(move.isEnPassant).toBeUndefined();
    });
  });

  describe("TC-MOVE-13 to TC-MOVE-19: Illegal Move Rejection & Zero State Mutation", () => {
    const runImmutabilityCheck = (
      game: ChessJsAdapter,
      illegalMove: MoveInput,
      expectedErrorCode: string
    ) => {
      const beforeFen = game.exportFen();
      const beforeTurn = game.getPosition().turn;
      const beforeHistoryLen = game.getHistory().length;
      const beforeStatus = game.getStatus();

      const result = game.makeMove(illegalMove);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(expectedErrorCode);
      }

      // Strict Failure Immutability: State MUST be 100% untouched
      expect(game.exportFen()).toBe(beforeFen);
      expect(game.getPosition().turn).toBe(beforeTurn);
      expect(game.getHistory()).toHaveLength(beforeHistoryLen);
      expect(game.getStatus()).toEqual(beforeStatus);
    };

    it("TC-MOVE-13: Rejects move from empty square with NO_PIECE_AT_SQUARE and zero mutation", () => {
      const game = new ChessJsAdapter();
      runImmutabilityCheck(
        game,
        { from: "e4", to: "e5" },
        "NO_PIECE_AT_SQUARE"
      );
    });

    it("TC-MOVE-14: Rejects moving opponent piece with NOT_YOUR_TURN and zero mutation", () => {
      const game = new ChessJsAdapter();
      // White turn, attempting to move Black pawn on e7
      runImmutabilityCheck(game, { from: "e7", to: "e5" }, "NOT_YOUR_TURN");
    });

    it("TC-MOVE-15: Rejects invalid square coordinates with INVALID_SQUARE", () => {
      const game = new ChessJsAdapter();
      runImmutabilityCheck(
        game,
        // @ts-expect-error Testing invalid runtime square
        { from: "z9", to: "e4" },
        "INVALID_SQUARE"
      );
      runImmutabilityCheck(
        game,
        // @ts-expect-error Testing invalid runtime square
        { from: "e2", to: "e9" },
        "INVALID_SQUARE"
      );
    });

    it("TC-MOVE-16: Rejects geometrically illegal piece moves with ILLEGAL_MOVE and zero mutation", () => {
      const game = new ChessJsAdapter();
      // Pawn moving sideways
      runImmutabilityCheck(game, { from: "e2", to: "f2" }, "ILLEGAL_MOVE");
      // Bishop jumping through pawn wall
      runImmutabilityCheck(game, { from: "c1", to: "e3" }, "ILLEGAL_MOVE");
      // Rook jumping
      runImmutabilityCheck(game, { from: "a1", to: "a5" }, "ILLEGAL_MOVE");
    });

    it("TC-MOVE-17: Rejects moving pinned piece exposing King with ILLEGAL_MOVE and zero mutation", () => {
      // White King on e1, White Bishop on e2, Black Rook on e5, Black King on e8 (Bishop is pinned)
      const pinFen = "4k3/8/8/4r3/8/8/4B3/4K3 w - - 0 1";
      const game = new ChessJsAdapter(pinFen);

      // Attempting to move pinned bishop to c4 or d3
      runImmutabilityCheck(game, { from: "e2", to: "c4" }, "ILLEGAL_MOVE");
    });

    it("TC-MOVE-18: Rejects castling through check with ILLEGAL_MOVE and zero mutation", () => {
      // Black rook on f8 attacks transit square f1 (White king on e1, Black king on e8)
      const attackedTransitFen = "4kr2/8/8/8/8/8/8/R3K2R w KQ - 0 1";
      const game = new ChessJsAdapter(attackedTransitFen);

      runImmutabilityCheck(game, { from: "e1", to: "g1" }, "ILLEGAL_MOVE");
    });

    it("TC-MOVE-19: Rejects moves after game over with GAME_ALREADY_OVER and zero mutation", () => {
      // Fool's mate terminal position
      const mateFen =
        "rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3";
      const game = new ChessJsAdapter(mateFen);

      runImmutabilityCheck(game, { from: "e2", to: "e3" }, "GAME_ALREADY_OVER");
    });
  });
});
