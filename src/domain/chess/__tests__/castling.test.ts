import { describe, expect, it } from "vitest";
import { ChessJsAdapter } from "../adapters/chessJsAdapter";

describe("Castling Semantics & Restrictions (TC-SPEC-01 to TC-SPEC-13)", () => {
  // Golden FENs
  const FEN_ALL_CASTLE_AVAILABLE = "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1";
  const FEN_BLACK_CASTLE_AVAILABLE = "r3k2r/8/8/8/8/8/8/R3K2R b KQkq - 0 1";
  const FEN_WHITE_IN_CHECK = "r3k2r/8/8/4r3/8/8/8/R3K2R w KQkq - 0 1";
  const FEN_TRANSIT_F1_ATTACKED = "r3k2r/8/8/8/2b5/8/8/R3K2R w KQkq - 0 1"; // c4 bishop attacks f1
  const FEN_TRANSIT_D1_ATTACKED = "r3k2r/8/8/8/8/5b2/8/R3K2R w KQkq - 0 1"; // f3 bishop attacks d1
  const FEN_LANDING_G1_ATTACKED = "r3k2r/8/8/2b5/8/8/8/R3K2R w KQkq - 0 1"; // c5 bishop attacks g1
  const FEN_LANDING_C1_ATTACKED = "r3k2r/8/8/8/8/b7/8/R3K2R w KQkq - 0 1"; // a3 bishop attacks c1
  const FEN_B1_ATTACKED_SAFE_KING = "1r2k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1"; // b8 rook attacks b1; d1/c1/e1 safe
  const FEN_ROOK_H1_ATTACKED_SAFE = "r3k2r/1b6/8/8/8/8/8/R3K2R w KQkq - 0 1"; // b7 bishop attacks h1 along a8-h1
  const FEN_OBSTRUCTED = "rn2k1nr/8/8/8/8/8/8/R1B1KB1R w KQkq - 0 1";

  it("TC-SPEC-01: executes White Kingside castling (O-O) accurately", () => {
    const adapter = new ChessJsAdapter(FEN_ALL_CASTLE_AVAILABLE);

    const result = adapter.makeMove({ from: "e1", to: "g1" });
    expect(result.success).toBe(true);
    if (!result.success) return;

    const move = result.data;
    expect(move.san).toBe("O-O");
    expect(move.lan).toBe("e1g1");
    expect(move.isCastling).toBe("kingside");

    const pos = adapter.getPosition();
    expect(adapter.getPiece("g1")).toEqual({ type: "k", color: "w" });
    expect(adapter.getPiece("f1")).toEqual({ type: "r", color: "w" });
    expect(adapter.getPiece("e1")).toBeNull();
    expect(adapter.getPiece("h1")).toBeNull();

    // White castling rights must be revoked
    expect(pos.castling.w.kingside).toBe(false);
    expect(pos.castling.w.queenside).toBe(false);
    // Black castling rights intact
    expect(pos.castling.b.kingside).toBe(true);
    expect(pos.castling.b.queenside).toBe(true);
  });

  it("TC-SPEC-02: executes White Queenside castling (O-O-O) accurately", () => {
    const adapter = new ChessJsAdapter(FEN_ALL_CASTLE_AVAILABLE);

    const result = adapter.makeMove({ from: "e1", to: "c1" });
    expect(result.success).toBe(true);
    if (!result.success) return;

    const move = result.data;
    expect(move.san).toBe("O-O-O");
    expect(move.lan).toBe("e1c1");
    expect(move.isCastling).toBe("queenside");

    expect(adapter.getPiece("c1")).toEqual({ type: "k", color: "w" });
    expect(adapter.getPiece("d1")).toEqual({ type: "r", color: "w" });
    expect(adapter.getPiece("e1")).toBeNull();
    expect(adapter.getPiece("a1")).toBeNull();
    expect(adapter.getPiece("b1")).toBeNull();

    const pos = adapter.getPosition();
    expect(pos.castling.w.kingside).toBe(false);
    expect(pos.castling.w.queenside).toBe(false);
  });

  it("TC-SPEC-03: executes Black Kingside castling (O-O) accurately", () => {
    const adapter = new ChessJsAdapter(FEN_BLACK_CASTLE_AVAILABLE);

    const result = adapter.makeMove({ from: "e8", to: "g8" });
    expect(result.success).toBe(true);
    if (!result.success) return;

    const move = result.data;
    expect(move.san).toBe("O-O");
    expect(move.lan).toBe("e8g8");
    expect(move.isCastling).toBe("kingside");

    expect(adapter.getPiece("g8")).toEqual({ type: "k", color: "b" });
    expect(adapter.getPiece("f8")).toEqual({ type: "r", color: "b" });
    expect(adapter.getPiece("e8")).toBeNull();
    expect(adapter.getPiece("h8")).toBeNull();

    const pos = adapter.getPosition();
    expect(pos.castling.b.kingside).toBe(false);
    expect(pos.castling.b.queenside).toBe(false);
  });

  it("TC-SPEC-04: executes Black Queenside castling (O-O-O) accurately", () => {
    const adapter = new ChessJsAdapter(FEN_BLACK_CASTLE_AVAILABLE);

    const result = adapter.makeMove({ from: "e8", to: "c8" });
    expect(result.success).toBe(true);
    if (!result.success) return;

    const move = result.data;
    expect(move.san).toBe("O-O-O");
    expect(move.lan).toBe("e8c8");
    expect(move.isCastling).toBe("queenside");

    expect(adapter.getPiece("c8")).toEqual({ type: "k", color: "b" });
    expect(adapter.getPiece("d8")).toEqual({ type: "r", color: "b" });
    expect(adapter.getPiece("e8")).toBeNull();
    expect(adapter.getPiece("a8")).toBeNull();

    const pos = adapter.getPosition();
    expect(pos.castling.b.kingside).toBe(false);
    expect(pos.castling.b.queenside).toBe(false);
  });

  it("TC-SPEC-05: rejects castling when King is currently in check", () => {
    const adapter = new ChessJsAdapter(FEN_WHITE_IN_CHECK);

    expect(adapter.getPosition().isCheck).toBe(true);
    expect(adapter.isLegalMove({ from: "e1", to: "g1" })).toBe(false);
    expect(adapter.isLegalMove({ from: "e1", to: "c1" })).toBe(false);

    const kingsideRes = adapter.makeMove({ from: "e1", to: "g1" });
    expect(kingsideRes.success).toBe(false);
    if (!kingsideRes.success) {
      expect(kingsideRes.error.code).toBe("ILLEGAL_MOVE");
    }

    const queensideRes = adapter.makeMove({ from: "e1", to: "c1" });
    expect(queensideRes.success).toBe(false);
    if (!queensideRes.success) {
      expect(queensideRes.error.code).toBe("ILLEGAL_MOVE");
    }

    // Zero mutation
    expect(adapter.exportFen()).toBe(FEN_WHITE_IN_CHECK);
  });

  it("TC-SPEC-06: rejects castling when transit square (f1 or d1) is attacked", () => {
    // f1 attacked: O-O illegal, O-O-O legal
    const adapterF1 = new ChessJsAdapter(FEN_TRANSIT_F1_ATTACKED);
    expect(adapterF1.isLegalMove({ from: "e1", to: "g1" })).toBe(false);
    expect(adapterF1.isLegalMove({ from: "e1", to: "c1" })).toBe(true);

    const f1Res = adapterF1.makeMove({ from: "e1", to: "g1" });
    expect(f1Res.success).toBe(false);
    if (!f1Res.success) {
      expect(f1Res.error.code).toBe("ILLEGAL_MOVE");
    }

    // d1 attacked: O-O-O illegal, O-O legal
    const adapterD1 = new ChessJsAdapter(FEN_TRANSIT_D1_ATTACKED);
    expect(adapterD1.isLegalMove({ from: "e1", to: "c1" })).toBe(false);
    expect(adapterD1.isLegalMove({ from: "e1", to: "g1" })).toBe(true);

    const d1Res = adapterD1.makeMove({ from: "e1", to: "c1" });
    expect(d1Res.success).toBe(false);
    if (!d1Res.success) {
      expect(d1Res.error.code).toBe("ILLEGAL_MOVE");
    }
  });

  it("TC-SPEC-07: rejects castling when landing square (g1 or c1) is attacked", () => {
    // g1 attacked: O-O illegal
    const adapterG1 = new ChessJsAdapter(FEN_LANDING_G1_ATTACKED);
    expect(adapterG1.isLegalMove({ from: "e1", to: "g1" })).toBe(false);
    const g1Res = adapterG1.makeMove({ from: "e1", to: "g1" });
    expect(g1Res.success).toBe(false);

    // c1 attacked: O-O-O illegal
    const adapterC1 = new ChessJsAdapter(FEN_LANDING_C1_ATTACKED);
    expect(adapterC1.isLegalMove({ from: "e1", to: "c1" })).toBe(false);
    const c1Res = adapterC1.makeMove({ from: "e1", to: "c1" });
    expect(c1Res.success).toBe(false);
  });

  it("TC-SPEC-08: allows Queenside castling when b1 is attacked or Rook is attacked", () => {
    // b1 attacked: King does not cross b1, so O-O-O is LEGAL
    const adapterB1 = new ChessJsAdapter(FEN_B1_ATTACKED_SAFE_KING);
    expect(adapterB1.isLegalMove({ from: "e1", to: "c1" })).toBe(true);
    const b1Res = adapterB1.makeMove({ from: "e1", to: "c1" });
    expect(b1Res.success).toBe(true);
    if (!b1Res.success) return;
    expect(b1Res.data.san).toBe("O-O-O");

    // h1 rook attacked by b7 bishop: King and transit squares are safe, so O-O is LEGAL
    const adapterRookAttacked = new ChessJsAdapter(FEN_ROOK_H1_ATTACKED_SAFE);
    expect(adapterRookAttacked.isLegalMove({ from: "e1", to: "g1" })).toBe(
      true
    );
    const oORes = adapterRookAttacked.makeMove({ from: "e1", to: "g1" });
    expect(oORes.success).toBe(true);
    if (!oORes.success) return;
    expect(oORes.data.san).toBe("O-O");
  });

  it("TC-SPEC-09: rejects castling when transit squares are obstructed", () => {
    const adapter = new ChessJsAdapter(FEN_OBSTRUCTED);
    expect(adapter.isLegalMove({ from: "e1", to: "g1" })).toBe(false);
    expect(adapter.isLegalMove({ from: "e1", to: "c1" })).toBe(false);

    const res = adapter.makeMove({ from: "e1", to: "g1" });
    expect(res.success).toBe(false);
  });

  it("TC-SPEC-10: permanently revokes castling rights once King moves", () => {
    const adapter = new ChessJsAdapter(FEN_ALL_CASTLE_AVAILABLE);

    // King moves e1 -> e2
    adapter.makeMove({ from: "e1", to: "e2" });
    expect(adapter.getPosition().castling.w.kingside).toBe(false);
    expect(adapter.getPosition().castling.w.queenside).toBe(false);

    // Black plays a quiet move
    adapter.makeMove({ from: "a8", to: "b8" });

    // King returns e2 -> e1
    adapter.makeMove({ from: "e2", to: "e1" });
    expect(adapter.getPosition().castling.w.kingside).toBe(false);
    expect(adapter.getPosition().castling.w.queenside).toBe(false);

    // Black plays another move
    adapter.makeMove({ from: "b8", to: "a8" });

    // Attempt castling after returning to e1 -> ILLEGAL
    expect(adapter.isLegalMove({ from: "e1", to: "g1" })).toBe(false);
    expect(adapter.isLegalMove({ from: "e1", to: "c1" })).toBe(false);
  });

  it("TC-SPEC-11: permanently revokes flank castling right when that Rook moves", () => {
    const adapter = new ChessJsAdapter(FEN_ALL_CASTLE_AVAILABLE);

    // White h1 rook moves h1 -> h2
    adapter.makeMove({ from: "h1", to: "h2" });
    expect(adapter.getPosition().castling.w.kingside).toBe(false);
    expect(adapter.getPosition().castling.w.queenside).toBe(true);

    // Black moves
    adapter.makeMove({ from: "a8", to: "b8" });

    // White returns rook h2 -> h1
    adapter.makeMove({ from: "h2", to: "h1" });
    expect(adapter.getPosition().castling.w.kingside).toBe(false);
    expect(adapter.getPosition().castling.w.queenside).toBe(true);

    // Black moves
    adapter.makeMove({ from: "b8", to: "a8" });

    // Kingside castling is illegal, but Queenside castling is still legal
    expect(adapter.isLegalMove({ from: "e1", to: "g1" })).toBe(false);
    expect(adapter.isLegalMove({ from: "e1", to: "c1" })).toBe(true);

    const qCastle = adapter.makeMove({ from: "e1", to: "c1" });
    expect(qCastle.success).toBe(true);
    if (!qCastle.success) return;
    expect(qCastle.data.san).toBe("O-O-O");
  });

  it("TC-SPEC-12: revokes castling right on flank when corner Rook is captured", () => {
    // Black Queen on a2 can capture White a1 Rook
    const FEN_CAPTURE_ROOK = "r3k2r/8/8/8/8/8/q7/R3K2R b KQkq - 0 1";
    const adapter = new ChessJsAdapter(FEN_CAPTURE_ROOK);

    // Black captures a1 rook: qxa1+
    const capRes = adapter.makeMove({ from: "a2", to: "a1" });
    expect(capRes.success).toBe(true);

    const pos = adapter.getPosition();
    expect(pos.castling.w.queenside).toBe(false);
    expect(pos.castling.w.kingside).toBe(true);
  });

  it("TC-SPEC-13: formats SAN with check (+) or mate (#) when castling delivers check/mate", () => {
    const FEN_CASTLE_GIVES_CHECK = "5k2/8/8/8/8/8/8/R3K2R w KQ - 0 1";
    const adapter = new ChessJsAdapter(FEN_CASTLE_GIVES_CHECK);

    const res = adapter.makeMove({ from: "e1", to: "g1" });
    expect(res.success).toBe(true);
    if (!res.success) return;

    const move = res.data;
    expect(move.san).toBe("O-O+");
    expect(move.isCheck).toBe(true);
  });

  it("TC-SPEC-26: perfectly reverses castling state upon undo()", () => {
    const adapter = new ChessJsAdapter(FEN_ALL_CASTLE_AVAILABLE);

    adapter.makeMove({ from: "e1", to: "g1" });
    expect(adapter.getPiece("g1")).toEqual({ type: "k", color: "w" });
    expect(adapter.getPiece("f1")).toEqual({ type: "r", color: "w" });

    const undoRes = adapter.undo();
    expect(undoRes.success).toBe(true);

    expect(adapter.getPiece("e1")).toEqual({ type: "k", color: "w" });
    expect(adapter.getPiece("h1")).toEqual({ type: "r", color: "w" });
    expect(adapter.getPiece("g1")).toBeNull();
    expect(adapter.getPiece("f1")).toBeNull();

    const pos = adapter.getPosition();
    expect(pos.castling.w.kingside).toBe(true);
    expect(pos.castling.w.queenside).toBe(true);
    expect(adapter.exportFen()).toBe(FEN_ALL_CASTLE_AVAILABLE);
  });
});
