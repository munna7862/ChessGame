import { describe, expect, it } from "vitest";
import { ChessJsAdapter } from "../adapters/chessJsAdapter";

describe("En Passant Semantics & Restrictions (TC-SPEC-14 to TC-SPEC-18)", () => {
  // Golden FENs
  const FEN_EP_WHITE =
    "rnbqkbnr/pp1p1ppp/8/2pPp3/8/8/PPP1PPPP/RNBQKBNR w KQkq c6 0 3";
  const FEN_EP_BLACK =
    "rnbqkbnr/ppp1pppp/8/8/3pP3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 2";
  const FEN_EP_PIN_SETUP = "7k/4p3/8/r2P3K/8/8/8/8 b - - 0 1";

  it("TC-SPEC-14: executes White En Passant capture accurately", () => {
    const adapter = new ChessJsAdapter(FEN_EP_WHITE);

    expect(adapter.getPosition().enPassantSquare).toBe("c6");
    expect(adapter.isLegalMove({ from: "d5", to: "c6" })).toBe(true);

    const result = adapter.makeMove({ from: "d5", to: "c6" });
    expect(result.success).toBe(true);
    if (!result.success) return;

    const move = result.data;
    expect(move.san).toBe("dxc6");
    expect(move.lan).toBe("d5c6");
    expect(move.isEnPassant).toBe(true);
    expect(move.captured).toEqual({ type: "p", color: "b" });

    // Moving pawn is on c6
    expect(adapter.getPiece("c6")).toEqual({ type: "p", color: "w" });
    // Origin d5 is empty
    expect(adapter.getPiece("d5")).toBeNull();
    // Captured Black pawn on c5 is removed!
    expect(adapter.getPiece("c5")).toBeNull();

    // En passant square resets to null
    expect(adapter.getPosition().enPassantSquare).toBeNull();
    // Halfmove clock resets to 0
    expect(adapter.getPosition().halfmoveClock).toBe(0);
  });

  it("TC-SPEC-15: executes Black En Passant capture accurately", () => {
    const adapter = new ChessJsAdapter(FEN_EP_BLACK);

    expect(adapter.getPosition().enPassantSquare).toBe("e3");
    expect(adapter.isLegalMove({ from: "d4", to: "e3" })).toBe(true);

    const result = adapter.makeMove({ from: "d4", to: "e3" });
    expect(result.success).toBe(true);
    if (!result.success) return;

    const move = result.data;
    expect(move.san).toBe("dxe3");
    expect(move.lan).toBe("d4e3");
    expect(move.isEnPassant).toBe(true);
    expect(move.captured).toEqual({ type: "p", color: "w" });

    // Moving pawn is on e3
    expect(adapter.getPiece("e3")).toEqual({ type: "p", color: "b" });
    // Origin d4 is empty
    expect(adapter.getPiece("d4")).toBeNull();
    // Captured White pawn on e4 is removed!
    expect(adapter.getPiece("e4")).toBeNull();

    expect(adapter.getPosition().enPassantSquare).toBeNull();
  });

  it("TC-SPEC-16: permanently expires En Passant right if not captured immediately on the next ply", () => {
    const adapter = new ChessJsAdapter(FEN_EP_WHITE);

    expect(adapter.getPosition().enPassantSquare).toBe("c6");

    // White plays an unrelated move instead of capturing e.p. (e.g. e2-e3)
    const quietMove = adapter.makeMove({ from: "e2", to: "e3" });
    expect(quietMove.success).toBe(true);

    // En passant target is now cleared in position FEN
    expect(adapter.getPosition().enPassantSquare).toBeNull();

    // Black plays a move (e.g. a7-a6)
    adapter.makeMove({ from: "a7", to: "a6" });

    // White can no longer play dxc6
    expect(adapter.isLegalMove({ from: "d5", to: "c6" })).toBe(false);
    const expiredRes = adapter.makeMove({ from: "d5", to: "c6" });
    expect(expiredRes.success).toBe(false);
    if (!expiredRes.success) {
      expect(expiredRes.error.code).toBe("ILLEGAL_MOVE");
    }
  });

  it("TC-SPEC-17: rejects En Passant when horizontal pin discovers check on own King", () => {
    // Setup: Black King on h8, Black pawn on e7, Black rook on a5, White pawn on d5, White King on h5.
    const adapter = new ChessJsAdapter(FEN_EP_PIN_SETUP);

    // Black plays e7-e5 (two-square push)
    const blackMove = adapter.makeMove({ from: "e7", to: "e5" });
    expect(blackMove.success).toBe(true);
    const fenAfterE5 = adapter.exportFen();

    // White attempting d5xe6 e.p. would vacate 5th rank, exposing h5 King to a5 Rook -> ILLEGAL!
    expect(adapter.isLegalMove({ from: "d5", to: "e6" })).toBe(false);

    const result = adapter.makeMove({ from: "d5", to: "e6" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("ILLEGAL_MOVE");
    }

    // Zero mutation
    expect(adapter.exportFen()).toBe(fenAfterE5);
    expect(adapter.getPiece("d5")).toEqual({ type: "p", color: "w" });
    expect(adapter.getPiece("e5")).toEqual({ type: "p", color: "b" });
  });

  it("TC-SPEC-18: formats SAN correctly when En Passant delivers check (+)", () => {
    const FEN_EP_DISCOVERED_CHECK = "3k4/8/8/4pP2/8/8/8/3RK3 w - e6 0 1";
    const adapter = new ChessJsAdapter(FEN_EP_DISCOVERED_CHECK);

    const result = adapter.makeMove({ from: "f5", to: "e6" });
    expect(result.success).toBe(true);
    if (!result.success) return;

    const move = result.data;
    expect(move.san).toBe("fxe6+");
    expect(move.isCheck).toBe(true);
    expect(move.isEnPassant).toBe(true);
    expect(adapter.getPosition().isCheck).toBe(true);
  });

  it("TC-SPEC-26: perfectly reverses En Passant state and restores captured pawn upon undo()", () => {
    const adapter = new ChessJsAdapter(FEN_EP_WHITE);

    adapter.makeMove({ from: "d5", to: "c6" });
    expect(adapter.getPiece("c6")).toEqual({ type: "p", color: "w" });
    expect(adapter.getPiece("c5")).toBeNull();

    const undoRes = adapter.undo();
    expect(undoRes.success).toBe(true);

    // White pawn back on d5
    expect(adapter.getPiece("d5")).toEqual({ type: "p", color: "w" });
    // Black pawn back on c5
    expect(adapter.getPiece("c5")).toEqual({ type: "p", color: "b" });
    // c6 is empty
    expect(adapter.getPiece("c6")).toBeNull();
    // En passant square restored
    expect(adapter.getPosition().enPassantSquare).toBe("c6");
    expect(adapter.exportFen()).toBe(FEN_EP_WHITE);
  });
});
