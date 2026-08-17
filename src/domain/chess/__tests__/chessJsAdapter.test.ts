import { describe, expect, it } from "vitest";
import { ChessJsAdapter } from "../adapters/chessJsAdapter";
import { isErr, isOk } from "../errors";
import type { Square } from "../types";

describe("ChessJsAdapter: Domain Contract Implementation (TC-DOM-05 to TC-DOM-12)", () => {
  it("TC-DOM-05: initializes with standard starting position", () => {
    const adapter = new ChessJsAdapter();
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
    expect(pos.fen).toBe(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    );

    // Verify 8x8 matrix
    expect(pos.board).toHaveLength(8);
    for (const row of pos.board) {
      expect(row).toHaveLength(8);
    }
    // Rank 8 Black Pieces
    expect(pos.board[0]?.[0]).toEqual({ type: "r", color: "b" });
    expect(pos.board[0]?.[4]).toEqual({ type: "k", color: "b" });
    // Rank 1 White Pieces
    expect(pos.board[7]?.[0]).toEqual({ type: "r", color: "w" });
    expect(pos.board[7]?.[4]).toEqual({ type: "k", color: "w" });

    // Status is active
    const status = adapter.getStatus();
    expect(status.state).toBe("active");
    expect(status.isOver).toBe(false);
    expect(status.winner).toBeNull();
  });

  it("TC-DOM-06: generates exactly 20 legal moves in starting position", () => {
    const adapter = new ChessJsAdapter();
    const allMoves = adapter.getLegalMoves();
    expect(allMoves).toHaveLength(20);

    const e2Moves = adapter.getLegalMoves("e2");
    expect(e2Moves).toHaveLength(2);
    expect(e2Moves.map((m) => m.to).sort()).toEqual(["e3", "e4"]);

    const g1Moves = adapter.getLegalMoves("g1");
    expect(g1Moves).toHaveLength(2);
    expect(g1Moves.map((m) => m.to).sort()).toEqual(["f3", "h3"]);

    // Non-turn pieces return 0 moves
    const e7Moves = adapter.getLegalMoves("e7");
    expect(e7Moves).toHaveLength(0);
  });

  it("TC-DOM-07: executes legal moves and updates turn/state", () => {
    const adapter = new ChessJsAdapter();
    const result = adapter.makeMove({ from: "e2", to: "e4" });

    expect(result.success).toBe(true);
    if (isOk(result)) {
      expect(result.data.san).toBe("e4");
      expect(result.data.from).toBe("e2");
      expect(result.data.to).toBe("e4");
      expect(result.data.piece).toEqual({ type: "p", color: "w" });
    }

    const posAfter = adapter.getPosition();
    expect(posAfter.turn).toBe("b");
    // In FEN notation after 1. e4:
    // chess.js may set enPassant square to 'e3' or null depending on whether adjacent enemy pawns exist
    expect(posAfter.fen).toContain(
      "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq"
    );

    const history = adapter.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0]?.san).toBe("e4");
  });

  it("TC-DOM-08: rejects illegal moves without mutating state", () => {
    const adapter = new ChessJsAdapter();
    const startingFen = adapter.exportFen();

    // Illegal pawn leap
    const illegalResult = adapter.makeMove({ from: "e2", to: "e5" });
    expect(illegalResult.success).toBe(false);
    if (isErr(illegalResult)) {
      expect(illegalResult.error.code).toBe("ILLEGAL_MOVE");
    }
    expect(adapter.exportFen()).toBe(startingFen);

    // Empty square origin
    const emptyResult = adapter.makeMove({ from: "e4", to: "e5" });
    expect(emptyResult.success).toBe(false);
    if (isErr(emptyResult)) {
      expect(emptyResult.error.code).toBe("NO_PIECE_AT_SQUARE");
    }

    // Opponent piece origin
    const opponentResult = adapter.makeMove({ from: "e7", to: "e5" });
    expect(opponentResult.success).toBe(false);
    if (isErr(opponentResult)) {
      expect(opponentResult.error.code).toBe("NOT_YOUR_TURN");
    }

    // Invalid square notation
    const invalidSqResult = adapter.makeMove({
      from: "z9" as unknown as Square,
      to: "e4",
    });
    expect(invalidSqResult.success).toBe(false);
    if (isErr(invalidSqResult)) {
      expect(invalidSqResult.error.code).toBe("INVALID_SQUARE");
    }
  });

  it("TC-DOM-09: supports reversible move undo", () => {
    const adapter = new ChessJsAdapter();
    const startingFen = adapter.exportFen();

    // At start, undo returns NO_MOVE_TO_UNDO
    const undoAtStart = adapter.undo();
    expect(undoAtStart.success).toBe(false);
    if (isErr(undoAtStart)) {
      expect(undoAtStart.error.code).toBe("NO_MOVE_TO_UNDO");
    }

    // Play move and undo
    adapter.makeMove({ from: "e2", to: "e4" });
    expect(adapter.getHistory()).toHaveLength(1);

    const undoResult = adapter.undo();
    expect(undoResult.success).toBe(true);
    if (isOk(undoResult)) {
      expect(undoResult.data.san).toBe("e4");
    }
    expect(adapter.exportFen()).toBe(startingFen);
    expect(adapter.getHistory()).toHaveLength(0);
    expect(adapter.getPosition().turn).toBe("w");
  });

  it("TC-DOM-10: imports and exports FEN faithfully", () => {
    const adapter = new ChessJsAdapter();
    const customFen =
      "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3";

    const loadResult = adapter.loadFen(customFen);
    expect(loadResult.success).toBe(true);
    expect(adapter.exportFen()).toBe(customFen);

    const invalidFenResult = adapter.loadFen("invalid-fen-string");
    expect(invalidFenResult.success).toBe(false);
    if (isErr(invalidFenResult)) {
      expect(invalidFenResult.error.code).toBe("INVALID_FEN");
    }
  });

  it("TC-DOM-11: imports and exports PGN", () => {
    const adapter = new ChessJsAdapter();
    const pgn = "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 *";

    const loadResult = adapter.importPgn(pgn);
    expect(loadResult.success).toBe(true);
    expect(adapter.getHistory()).toHaveLength(6);
    expect(adapter.exportPgn()).toContain("1. e4 e5 2. Nf3 Nc6 3. Bb5 a6");

    const invalidPgnResult = adapter.importPgn("1. e4 invalid_move 99. ????");
    expect(invalidPgnResult.success).toBe(false);
    if (isErr(invalidPgnResult)) {
      expect(["INVALID_PGN", "ILLEGAL_MOVE"]).toContain(
        invalidPgnResult.error.code
      );
    }
  });

  it("TC-DOM-12: accurately identifies checkmate, stalemate, and draw conditions", () => {
    // Scholar's Mate Checkmate
    const scholarMateAdapter = new ChessJsAdapter(
      "r1bqkb1r/pppp1Qpp/2n5/4p3/2B1n3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4"
    );
    const scholarStatus = scholarMateAdapter.getStatus();
    expect(scholarStatus.state).toBe("checkmate");
    expect(scholarStatus.isOver).toBe(true);
    expect(scholarStatus.winner).toBe("w");
    expect(scholarStatus.isCheck).toBe(true);

    // Stalemate
    const stalemateAdapter = new ChessJsAdapter(
      "k7/8/1Q6/8/8/8/8/K7 b - - 0 1"
    );
    const stalemateStatus = stalemateAdapter.getStatus();
    expect(stalemateStatus.state).toBe("stalemate");
    expect(stalemateStatus.isOver).toBe(true);
    expect(stalemateStatus.winner).toBeNull();
    expect(stalemateStatus.inDraw).toBe(true);
    expect(stalemateStatus.drawReason).toBe("stalemate");

    // Insufficient Material (King vs King)
    const insuffAdapter = new ChessJsAdapter("8/8/8/4k3/8/8/4K3/8 w - - 0 1");
    const insuffStatus = insuffAdapter.getStatus();
    expect(insuffStatus.state).toBe("draw_insufficient_material");
    expect(insuffStatus.isOver).toBe(true);
    expect(insuffStatus.inDraw).toBe(true);
    expect(insuffStatus.drawReason).toBe("insufficient_material");
  });

  it("handles special chess moves: Castling, En Passant, Promotion", () => {
    // Kingside Castling
    const castlingAdapter = new ChessJsAdapter(
      "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1"
    );
    const castleMove = castlingAdapter.makeMove({ from: "e1", to: "g1" });
    expect(castleMove.success).toBe(true);
    if (isOk(castleMove)) {
      expect(castleMove.data.isCastling).toBe("kingside");
      expect(castleMove.data.san).toBe("O-O");
    }

    // En Passant Capture
    const epAdapter = new ChessJsAdapter("8/8/8/3Pp3/8/8/8/K6k w - e6 0 1");
    const epMove = epAdapter.makeMove({ from: "d5", to: "e6" });
    expect(epMove.success).toBe(true);
    if (isOk(epMove)) {
      expect(epMove.data.isEnPassant).toBe(true);
      expect(epMove.data.captured).toEqual({ type: "p", color: "b" });
    }

    // Pawn Promotion
    const promoAdapter = new ChessJsAdapter("8/4P3/8/8/8/8/8/K6k w - - 0 1");
    const promoMove = promoAdapter.makeMove({
      from: "e7",
      to: "e8",
      promotion: "q",
    });
    expect(promoMove.success).toBe(true);
    if (isOk(promoMove)) {
      expect(promoMove.data.promotion).toBe("q");
      expect(promoMove.data.san).toBe("e8=Q");
    }
  });

  it("provides getPiece and isLegalMove inspection methods", () => {
    const adapter = new ChessJsAdapter();
    expect(adapter.getPiece("e1")).toEqual({ type: "k", color: "w" });
    expect(adapter.getPiece("e8")).toEqual({ type: "k", color: "b" });
    expect(adapter.getPiece("e4")).toBeNull();

    expect(adapter.isLegalMove({ from: "e2", to: "e4" })).toBe(true);
    expect(adapter.isLegalMove({ from: "e2", to: "e5" })).toBe(false);
  });
});
