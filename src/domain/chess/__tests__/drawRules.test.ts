import { describe, expect, it } from "vitest";
import { ChessJsAdapter } from "../adapters/chessJsAdapter";
import { isErr, isOk } from "../errors";

describe("Authoritative Draw Rules: Threefold, 50-Move & Insufficient Material (TC-STATUS-11 to TC-STATUS-22)", () => {
  it("TC-STATUS-11: detects automatic threefold repetition draw", () => {
    const game = new ChessJsAdapter();

    // 1. Nf3 Nf6
    expect(isOk(game.makeMove({ from: "g1", to: "f3" }))).toBe(true);
    expect(isOk(game.makeMove({ from: "g8", to: "f6" }))).toBe(true);
    // 2. Ng1 Ng8 (2nd appearance of start position)
    expect(isOk(game.makeMove({ from: "f3", to: "g1" }))).toBe(true);
    expect(isOk(game.makeMove({ from: "f6", to: "g8" }))).toBe(true);
    expect(game.getStatus().state).toBe("active");

    // 3. Nf3 Nf6
    expect(isOk(game.makeMove({ from: "g1", to: "f3" }))).toBe(true);
    expect(isOk(game.makeMove({ from: "g8", to: "f6" }))).toBe(true);
    // 4. Ng1 Ng8 (3rd appearance of start position)
    expect(isOk(game.makeMove({ from: "f3", to: "g1" }))).toBe(true);
    const lastMove = game.makeMove({ from: "f6", to: "g8" });
    expect(isOk(lastMove)).toBe(true);

    const status = game.getStatus();
    expect(status.state).toBe("draw_threefold_repetition");
    expect(status.isOver).toBe(true);
    expect(status.winner).toBeNull();
    expect(status.inDraw).toBe(true);
    expect(status.drawReason).toBe("threefold_repetition");
    expect(status.description).toBe("Draw by threefold repetition.");
  });

  it("TC-STATUS-12: twofold repetition remains active", () => {
    const game = new ChessJsAdapter();
    // 1. Nf3 Nf6 2. Ng1 Ng8 (2nd appearance)
    game.makeMove({ from: "g1", to: "f3" });
    game.makeMove({ from: "g8", to: "f6" });
    game.makeMove({ from: "f3", to: "g1" });
    game.makeMove({ from: "f6", to: "g8" });

    const status = game.getStatus();
    expect(status.state).toBe("active");
    expect(status.isOver).toBe(false);
    expect(status.inDraw).toBe(false);
  });

  it("TC-STATUS-13: threefold repetition draw locks session, blocking moves", () => {
    const game = new ChessJsAdapter();
    game.makeMove({ from: "g1", to: "f3" });
    game.makeMove({ from: "g8", to: "f6" });
    game.makeMove({ from: "f3", to: "g1" });
    game.makeMove({ from: "f6", to: "g8" });
    game.makeMove({ from: "g1", to: "f3" });
    game.makeMove({ from: "g8", to: "f6" });
    game.makeMove({ from: "f3", to: "g1" });
    game.makeMove({ from: "f6", to: "g8" });

    expect(game.getStatus().isOver).toBe(true);
    const postRepMove = game.makeMove({ from: "e2", to: "e4" });
    expect(isErr(postRepMove)).toBe(true);
    if (isErr(postRepMove)) {
      expect(postRepMove.error.code).toBe("GAME_ALREADY_OVER");
    }
  });

  it("TC-STATUS-14: halfmove clock at 99 plies remains active", () => {
    const game = new ChessJsAdapter();
    // Bare kings position with halfmove clock at 99 -> but bare kings would trigger insufficient material!
    // Let's use a position with sufficient material (e.g. rooks) and halfmove clock = 99
    const fen99 = "6k1/8/8/8/8/8/8/4R1K1 w - - 99 50";
    const loadRes = game.loadFen(fen99);
    expect(isOk(loadRes)).toBe(true);

    const status = game.getStatus();
    expect(status.state).toBe("active");
    expect(status.isOver).toBe(false);
    expect(status.inDraw).toBe(false);
  });

  it("TC-STATUS-15: halfmove clock at 100 plies triggers 50-move rule draw", () => {
    const game = new ChessJsAdapter();
    const fen100 = "6k1/8/8/8/8/8/8/4R1K1 w - - 100 50";
    game.loadFen(fen100);

    const status = game.getStatus();
    expect(status.state).toBe("draw_fifty_moves");
    expect(status.isOver).toBe(true);
    expect(status.winner).toBeNull();
    expect(status.inDraw).toBe(true);
    expect(status.drawReason).toBe("fifty_moves");
    expect(status.description).toBe("Draw by 50-move rule.");

    // Blocks moves
    const moveRes = game.makeMove({ from: "e1", to: "e8" });
    expect(isErr(moveRes)).toBe(true);
    if (isErr(moveRes)) {
      expect(moveRes.error.code).toBe("GAME_ALREADY_OVER");
    }
  });

  it("TC-STATUS-16: pawn move or piece capture resets halfmove clock", () => {
    const game = new ChessJsAdapter();
    // Position with halfmove = 40, white pawn on e2 can advance
    const fen40 =
      "rnbqkbnr/pppp1ppp/8/4p3/8/8/PPPPPPPP/RNBQKBNR w KQkq - 40 21";
    game.loadFen(fen40);
    expect(game.getPosition().halfmoveClock).toBe(40);

    // Play pawn push e2-e4
    const pawnMove = game.makeMove({ from: "e2", to: "e4" });
    expect(isOk(pawnMove)).toBe(true);
    expect(game.getPosition().halfmoveClock).toBe(0);
  });

  it("TC-STATUS-17: insufficient material: King vs King", () => {
    const game = new ChessJsAdapter();
    const bareKingsFen = "8/8/8/4k3/8/8/4K3/8 w - - 0 1";
    game.loadFen(bareKingsFen);

    const status = game.getStatus();
    expect(status.state).toBe("draw_insufficient_material");
    expect(status.isOver).toBe(true);
    expect(status.winner).toBeNull();
    expect(status.inDraw).toBe(true);
    expect(status.drawReason).toBe("insufficient_material");
    expect(status.description).toBe("Draw by insufficient material.");
  });

  it("TC-STATUS-18: insufficient material: King + Bishop vs King", () => {
    const game = new ChessJsAdapter();
    const kbFen = "8/8/8/4k3/8/5B2/4K3/8 w - - 0 1";
    game.loadFen(kbFen);

    const status = game.getStatus();
    expect(status.state).toBe("draw_insufficient_material");
    expect(status.isOver).toBe(true);
    expect(status.inDraw).toBe(true);
    expect(status.drawReason).toBe("insufficient_material");
  });

  it("TC-STATUS-19: insufficient material: King + Knight vs King", () => {
    const game = new ChessJsAdapter();
    const knFen = "8/8/8/4k3/8/5N2/4K3/8 b - - 0 1";
    game.loadFen(knFen);

    const status = game.getStatus();
    expect(status.state).toBe("draw_insufficient_material");
    expect(status.isOver).toBe(true);
    expect(status.inDraw).toBe(true);
    expect(status.drawReason).toBe("insufficient_material");
  });

  it("TC-STATUS-20: insufficient material: King + Bishop vs King + Bishop (same color squares)", () => {
    const game = new ChessJsAdapter();
    // c6 (dark: file index 2, rank index 5 -> sum 7: dark) & f3 (dark: file index 5, rank index 2 -> sum 7: dark)
    const sameColorBishops = "8/8/2b5/4k3/8/5B2/4K3/8 w - - 0 1";
    game.loadFen(sameColorBishops);

    const status = game.getStatus();
    expect(status.state).toBe("draw_insufficient_material");
    expect(status.isOver).toBe(true);
    expect(status.inDraw).toBe(true);
    expect(status.drawReason).toBe("insufficient_material");
  });

  it("TC-STATUS-21: sufficient material: King + Bishop vs King + Bishop (opposite color squares)", () => {
    const game = new ChessJsAdapter();
    // c6 (dark) & f4 (light: file index 5, rank index 3 -> sum 8: light)
    const oppositeColorBishops = "8/8/2b5/4k3/5B2/8/4K3/8 w - - 0 1";
    game.loadFen(oppositeColorBishops);

    const status = game.getStatus();
    expect(status.state).toBe("active");
    expect(status.isOver).toBe(false);
    expect(status.inDraw).toBe(false);
  });

  it("TC-STATUS-22: sufficient material: King + Pawn vs King is not drawn", () => {
    const game = new ChessJsAdapter();
    const pawnFen = "8/8/8/4k3/4P3/8/4K3/8 w - - 0 1";
    game.loadFen(pawnFen);

    const status = game.getStatus();
    expect(status.state).toBe("active");
    expect(status.isOver).toBe(false);
    expect(status.inDraw).toBe(false);
  });
});
