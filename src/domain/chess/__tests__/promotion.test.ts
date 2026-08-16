import { describe, expect, it } from "vitest";
import { ChessJsAdapter } from "../adapters/chessJsAdapter";
import type { PromotionPieceType } from "../types";

describe("Pawn Promotion & Underpromotion Semantics (TC-SPEC-19 to TC-SPEC-25)", () => {
  // Golden FENs
  const FEN_PROMO_WHITE = "8/4P3/8/8/8/8/8/4K2k w - - 0 1";
  const FEN_PROMO_WHITE_CAPTURE = "3r4/4P3/8/8/8/8/8/4K2k w - - 0 1";
  const FEN_PROMO_BLACK_QUIET = "4k3/7K/8/8/8/8/4p3/8 b - - 0 1";
  const FEN_PROMO_CHECKMATE = "6k1/4P1P1/6K1/8/8/8/8/8 w - - 0 1";

  it("TC-SPEC-19: promotes White and Black pawn to Queen ('q') for quiet and capture moves", () => {
    // Quiet promotion White
    const adapterW = new ChessJsAdapter(FEN_PROMO_WHITE);
    const resW = adapterW.makeMove({ from: "e7", to: "e8", promotion: "q" });
    expect(resW.success).toBe(true);
    if (!resW.success) return;
    const moveW = resW.data;
    expect(moveW.san).toBe("e8=Q");
    expect(moveW.lan).toBe("e7e8q");
    expect(moveW.promotion).toBe("q");
    expect(adapterW.getPiece("e8")).toEqual({ type: "q", color: "w" });
    expect(adapterW.getPiece("e7")).toBeNull();

    // Capture promotion White
    const adapterCap = new ChessJsAdapter(FEN_PROMO_WHITE_CAPTURE);
    const resCap = adapterCap.makeMove({
      from: "e7",
      to: "d8",
      promotion: "q",
    });
    expect(resCap.success).toBe(true);
    if (!resCap.success) return;
    const moveCap = resCap.data;
    expect(moveCap.san).toBe("exd8=Q");
    expect(moveCap.lan).toBe("e7d8q");
    expect(moveCap.captured).toEqual({ type: "r", color: "b" });
    expect(adapterCap.getPiece("d8")).toEqual({ type: "q", color: "w" });

    // Quiet promotion Black
    const adapterB = new ChessJsAdapter(FEN_PROMO_BLACK_QUIET);
    const resB = adapterB.makeMove({ from: "e2", to: "e1", promotion: "q" });
    expect(resB.success).toBe(true);
    if (!resB.success) return;
    const moveB = resB.data;
    expect(moveB.san).toBe("e1=Q");
    expect(moveB.lan).toBe("e2e1q");
    expect(adapterB.getPiece("e1")).toEqual({ type: "q", color: "b" });
  });

  it("TC-SPEC-20: underpromotes pawn to Rook ('r')", () => {
    const adapter = new ChessJsAdapter(FEN_PROMO_WHITE);
    const res = adapter.makeMove({ from: "e7", to: "e8", promotion: "r" });
    expect(res.success).toBe(true);
    if (!res.success) return;
    const move = res.data;
    expect(move.san).toBe("e8=R");
    expect(move.lan).toBe("e7e8r");
    expect(move.promotion).toBe("r");
    expect(adapter.getPiece("e8")).toEqual({ type: "r", color: "w" });
  });

  it("TC-SPEC-21: underpromotes pawn to Bishop ('b')", () => {
    const adapter = new ChessJsAdapter(FEN_PROMO_WHITE);
    const res = adapter.makeMove({ from: "e7", to: "e8", promotion: "b" });
    expect(res.success).toBe(true);
    if (!res.success) return;
    const move = res.data;
    expect(move.san).toBe("e8=B");
    expect(move.lan).toBe("e7e8b");
    expect(move.promotion).toBe("b");
    expect(adapter.getPiece("e8")).toEqual({ type: "b", color: "w" });
  });

  it("TC-SPEC-22: underpromotes pawn to Knight ('n')", () => {
    const adapter = new ChessJsAdapter(FEN_PROMO_WHITE);
    const res = adapter.makeMove({ from: "e7", to: "e8", promotion: "n" });
    expect(res.success).toBe(true);
    if (!res.success) return;
    const move = res.data;
    expect(move.san).toBe("e8=N");
    expect(move.lan).toBe("e7e8n");
    expect(move.promotion).toBe("n");
    expect(adapter.getPiece("e8")).toEqual({ type: "n", color: "w" });
  });

  it("TC-SPEC-23: correctly detects check (+) and checkmate (#) on promotion", () => {
    // Checkmate on e8=Q#
    const adapter = new ChessJsAdapter(FEN_PROMO_CHECKMATE);
    const res = adapter.makeMove({ from: "e7", to: "e8", promotion: "q" });
    expect(res.success).toBe(true);
    if (!res.success) return;
    const move = res.data;
    expect(move.san).toBe("e8=Q#");
    expect(move.isCheck).toBe(true);
    expect(move.isCheckmate).toBe(true);
    expect(adapter.getStatus().state).toBe("checkmate");
    expect(adapter.getStatus().winner).toBe("w");
  });

  it("TC-SPEC-24 & TC-SPEC-25: rejects invalid promotion piece or illegal promotion with 0 mutation", () => {
    const adapter = new ChessJsAdapter(FEN_PROMO_WHITE);

    // Invalid piece 'k' (King)
    const resKing = adapter.makeMove({
      from: "e7",
      to: "e8",
      promotion: "k" as unknown as PromotionPieceType,
    });
    expect(resKing.success).toBe(false);
    if (!resKing.success) {
      expect(resKing.error.code).toBe("ILLEGAL_MOVE");
    }

    // Invalid piece 'p' (Pawn)
    const resPawn = adapter.makeMove({
      from: "e7",
      to: "e8",
      promotion: "p" as unknown as PromotionPieceType,
    });
    expect(resPawn.success).toBe(false);
    if (!resPawn.success) {
      expect(resPawn.error.code).toBe("ILLEGAL_MOVE");
    }

    // Missing promotion piece when reaching 8th rank
    const resMissingPromo = adapter.makeMove({
      from: "e7",
      to: "e8",
    });
    expect(resMissingPromo.success).toBe(false);
    if (!resMissingPromo.success) {
      expect(resMissingPromo.error.code).toBe("PROMOTION_REQUIRED");
    }

    // Non-promotion move with promotion flag attached
    const adapterInitial = new ChessJsAdapter();
    const resNonPromo = adapterInitial.makeMove({
      from: "e2",
      to: "e4",
      promotion: "q",
    });
    expect(resNonPromo.success).toBe(false);
    if (!resNonPromo.success) {
      expect(resNonPromo.error.code).toBe("ILLEGAL_MOVE");
    }

    // Verify 0 mutation
    expect(adapter.exportFen()).toBe(FEN_PROMO_WHITE);
    expect(adapter.getPiece("e7")).toEqual({ type: "p", color: "w" });
    expect(adapter.getPiece("e8")).toBeNull();
  });

  it("TC-SPEC-26: perfectly reverses promotion upon undo()", () => {
    const adapter = new ChessJsAdapter(FEN_PROMO_WHITE_CAPTURE);

    adapter.makeMove({ from: "e7", to: "d8", promotion: "n" });
    expect(adapter.getPiece("d8")).toEqual({ type: "n", color: "w" });
    expect(adapter.getPiece("e7")).toBeNull();

    const undoRes = adapter.undo();
    expect(undoRes.success).toBe(true);

    // White pawn back on e7
    expect(adapter.getPiece("e7")).toEqual({ type: "p", color: "w" });
    // Captured Black rook back on d8
    expect(adapter.getPiece("d8")).toEqual({ type: "r", color: "b" });
    expect(adapter.exportFen()).toBe(FEN_PROMO_WHITE_CAPTURE);
  });
});
