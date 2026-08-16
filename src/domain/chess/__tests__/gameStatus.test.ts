import { describe, expect, it } from "vitest";
import { ChessJsAdapter } from "../adapters/chessJsAdapter";
import { isErr, isOk } from "../errors";

describe("Authoritative Game Status: Active, Check & Checkmate (TC-STATUS-01 to TC-STATUS-10, TC-STATUS-31)", () => {
  it("TC-STATUS-01: initial game state is active, not in check, and not over", () => {
    const game = new ChessJsAdapter();
    const status = game.getStatus();

    expect(status.state).toBe("active");
    expect(status.isOver).toBe(false);
    expect(status.winner).toBeNull();
    expect(status.isCheck).toBe(false);
    expect(status.inDraw).toBe(false);
    expect(status.drawReason).toBeNull();
    expect(status.description).toBe("Game in progress.");
  });

  it("TC-STATUS-02: detects in-check state with legal evasion moves available", () => {
    const game = new ChessJsAdapter();
    // Black bishop on b4 giving check to White King on e1 (unobstructed diagonal b4-c3-d2-e1)
    const checkFen =
      "rnbqk1nr/pppp1ppp/8/8/1b1PP3/8/PPP2PPP/RNBQKBNR w KQkq - 1 3";
    const loadRes = game.loadFen(checkFen);
    expect(isOk(loadRes)).toBe(true);

    const status = game.getStatus();
    expect(status.state).toBe("active");
    expect(status.isOver).toBe(false);
    expect(status.winner).toBeNull();
    expect(status.isCheck).toBe(true);
    expect(status.inDraw).toBe(false);
    expect(status.drawReason).toBeNull();
    expect(status.description).toBe("White is in check.");

    // Legal evasion moves exist (e.g. c3, Bd2, Nc3, Nd2, Qd2, Ke2)
    const legalMoves = game.getLegalMoves();
    expect(legalMoves.length).toBeGreaterThan(0);
  });

  it("TC-STATUS-03: parrying check returns status to active without check", () => {
    const game = new ChessJsAdapter();
    const checkFen =
      "rnbqk1nr/pppp1ppp/8/8/1b1PP3/8/PPP2PPP/RNBQKBNR w KQkq - 1 3";
    game.loadFen(checkFen);

    // White plays c3 to block/attack the bishop
    const moveRes = game.makeMove({ from: "c2", to: "c3" });
    expect(isOk(moveRes)).toBe(true);

    const status = game.getStatus();
    expect(status.state).toBe("active");
    expect(status.isOver).toBe(false);
    expect(status.isCheck).toBe(false);
    expect(status.winner).toBeNull();
    expect(status.description).toBe("Game in progress.");
  });

  it("TC-STATUS-04: detects Fool's Mate checkmate and attributes win to Black", () => {
    const game = new ChessJsAdapter();

    // 1. f3 e5 2. g4 Qh4#
    expect(isOk(game.makeMove({ from: "f2", to: "f3" }))).toBe(true);
    expect(isOk(game.makeMove({ from: "e7", to: "e5" }))).toBe(true);
    expect(isOk(game.makeMove({ from: "g2", to: "g4" }))).toBe(true);
    const mateMove = game.makeMove({ from: "d8", to: "h4" });

    expect(isOk(mateMove)).toBe(true);
    if (isOk(mateMove)) {
      expect(mateMove.data.san).toBe("Qh4#");
      expect(mateMove.data.isCheckmate).toBe(true);
    }

    const status = game.getStatus();
    expect(status.state).toBe("checkmate");
    expect(status.isOver).toBe(true);
    expect(status.winner).toBe("b");
    expect(status.isCheck).toBe(true);
    expect(status.inDraw).toBe(false);
    expect(status.drawReason).toBeNull();
    expect(status.description).toBe("Checkmate! Black wins.");
  });

  it("TC-STATUS-05: detects Scholar's Mate checkmate and attributes win to White", () => {
    const game = new ChessJsAdapter();

    // 1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7#
    expect(isOk(game.makeMove({ from: "e2", to: "e4" }))).toBe(true);
    expect(isOk(game.makeMove({ from: "e7", to: "e5" }))).toBe(true);
    expect(isOk(game.makeMove({ from: "f1", to: "c4" }))).toBe(true);
    expect(isOk(game.makeMove({ from: "b8", to: "c6" }))).toBe(true);
    expect(isOk(game.makeMove({ from: "d1", to: "h5" }))).toBe(true);
    expect(isOk(game.makeMove({ from: "g8", to: "f6" }))).toBe(true);
    const mateMove = game.makeMove({ from: "h5", to: "f7" });

    expect(isOk(mateMove)).toBe(true);
    if (isOk(mateMove)) {
      expect(mateMove.data.san).toBe("Qxf7#");
      expect(mateMove.data.isCheckmate).toBe(true);
    }

    const status = game.getStatus();
    expect(status.state).toBe("checkmate");
    expect(status.isOver).toBe(true);
    expect(status.winner).toBe("w");
    expect(status.isCheck).toBe(true);
    expect(status.inDraw).toBe(false);
    expect(status.drawReason).toBeNull();
    expect(status.description).toBe("Checkmate! White wins.");
  });

  it("TC-STATUS-06: detects Back-Rank Mate checkmate from loaded position", () => {
    const game = new ChessJsAdapter();
    const backRankFen = "6k1/5ppp/4R3/8/8/8/8/6K1 w - - 0 1";
    game.loadFen(backRankFen);

    const mateMove = game.makeMove({ from: "e6", to: "e8" });
    expect(isOk(mateMove)).toBe(true);

    const status = game.getStatus();
    expect(status.state).toBe("checkmate");
    expect(status.isOver).toBe(true);
    expect(status.winner).toBe("w");
    expect(status.isCheck).toBe(true);
  });

  it("TC-STATUS-07: checkmate locks the game session, blocking subsequent moves", () => {
    const game = new ChessJsAdapter();
    // Play Fool's mate
    game.makeMove({ from: "f2", to: "f3" });
    game.makeMove({ from: "e7", to: "e5" });
    game.makeMove({ from: "g2", to: "g4" });
    game.makeMove({ from: "d8", to: "h4" });

    expect(game.getStatus().isOver).toBe(true);
    expect(game.getLegalMoves()).toEqual([]);
    expect(game.isLegalMove({ from: "e2", to: "e3" })).toBe(false);

    // Attempting a move returns GAME_ALREADY_OVER
    const postMateMove = game.makeMove({ from: "e2", to: "e3" });
    expect(isErr(postMateMove)).toBe(true);
    if (isErr(postMateMove)) {
      expect(postMateMove.error.code).toBe("GAME_ALREADY_OVER");
    }
  });

  it("TC-STATUS-08: detects classic corner Queen stalemate", () => {
    const game = new ChessJsAdapter();
    // Black King on a8, White Queen on c7, White King on h1. Black to move with 0 legal moves and not in check.
    const stalemateFen = "k7/2Q5/8/8/8/8/8/7K b - - 0 1";
    const loadRes = game.loadFen(stalemateFen);
    expect(isOk(loadRes)).toBe(true);

    const status = game.getStatus();
    expect(status.state).toBe("stalemate");
    expect(status.isOver).toBe(true);
    expect(status.winner).toBeNull();
    expect(status.isCheck).toBe(false);
    expect(status.inDraw).toBe(true);
    expect(status.drawReason).toBe("stalemate");
    expect(status.description).toBe("Draw by stalemate.");

    expect(game.getLegalMoves()).toEqual([]);
  });

  it("TC-STATUS-09: detects stalemate created as a result of a legal move", () => {
    const game = new ChessJsAdapter();
    // White King on b6, White Pawn on a6, Black King on a8. White plays a7 stalemate.
    const setupFen = "k7/8/PK6/8/8/8/8/8 w - - 0 1";
    game.loadFen(setupFen);

    const moveRes = game.makeMove({ from: "a6", to: "a7" });
    expect(isOk(moveRes)).toBe(true);

    const status = game.getStatus();
    expect(status.state).toBe("stalemate");
    expect(status.isOver).toBe(true);
    expect(status.winner).toBeNull();
    expect(status.isCheck).toBe(false);
    expect(status.inDraw).toBe(true);
    expect(status.drawReason).toBe("stalemate");
  });

  it("TC-STATUS-10: stalemate locks the game session, blocking subsequent moves", () => {
    const game = new ChessJsAdapter();
    game.loadFen("k7/2Q5/8/8/8/8/8/7K b - - 0 1");

    expect(game.getStatus().isOver).toBe(true);
    const postStalemateMove = game.makeMove({ from: "a8", to: "a7" });
    expect(isErr(postStalemateMove)).toBe(true);
    if (isErr(postStalemateMove)) {
      expect(postStalemateMove.error.code).toBe("GAME_ALREADY_OVER");
    }
  });

  it("TC-STATUS-31: undo restores active game status from checkmate and stalemate", () => {
    const game = new ChessJsAdapter();
    // 1. Checkmate undo
    game.makeMove({ from: "f2", to: "f3" });
    game.makeMove({ from: "e7", to: "e5" });
    game.makeMove({ from: "g2", to: "g4" });
    game.makeMove({ from: "d8", to: "h4" }); // checkmate
    expect(game.getStatus().state).toBe("checkmate");

    const undoMate = game.undo();
    expect(isOk(undoMate)).toBe(true);
    expect(game.getStatus().state).toBe("active");
    expect(game.getStatus().isOver).toBe(false);
    expect(game.getLegalMoves().length).toBeGreaterThan(0);

    // 2. Stalemate undo
    game.loadFen("k7/8/PK6/8/8/8/8/8 w - - 0 1");
    game.makeMove({ from: "a6", to: "a7" }); // stalemate
    expect(game.getStatus().state).toBe("stalemate");

    const undoStalemate = game.undo();
    expect(isOk(undoStalemate)).toBe(true);
    expect(game.getStatus().state).toBe("active");
    expect(game.getStatus().isOver).toBe(false);
  });
});
