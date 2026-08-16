import { describe, expect, it } from "vitest";
import { ChessJsAdapter } from "../adapters/chessJsAdapter";
import { isErr, isOk } from "../errors";
import type { Color } from "../types";

describe("Authoritative Manual Hooks: Resignation, Timeout & Draw Agreement (TC-STATUS-23 to TC-STATUS-27, TC-STATUS-30)", () => {
  it("TC-STATUS-23: White resigns gives victory to Black", () => {
    const game = new ChessJsAdapter();
    const result = game.resign("w");

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.state).toBe("resigned");
      expect(result.data.isOver).toBe(true);
      expect(result.data.winner).toBe("b");
      expect(result.data.inDraw).toBe(false);
      expect(result.data.drawReason).toBeNull();
      expect(result.data.description).toBe("White resigned. Black wins.");
    }

    expect(game.getStatus().state).toBe("resigned");
    expect(game.getStatus().winner).toBe("b");
    expect(game.getLegalMoves()).toEqual([]);
  });

  it("TC-STATUS-24: Black resigns gives victory to White", () => {
    const game = new ChessJsAdapter();
    game.makeMove({ from: "e2", to: "e4" });

    const result = game.resign("b");
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.state).toBe("resigned");
      expect(result.data.isOver).toBe(true);
      expect(result.data.winner).toBe("w");
      expect(result.data.description).toBe("Black resigned. White wins.");
    }
  });

  it("TC-STATUS-25: White timeout gives victory to Black", () => {
    const game = new ChessJsAdapter();
    const result = game.timeout("w");

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.state).toBe("timeout");
      expect(result.data.isOver).toBe(true);
      expect(result.data.winner).toBe("b");
      expect(result.data.description).toBe(
        "White ran out of time. Black wins."
      );
    }
  });

  it("TC-STATUS-26: Black timeout gives victory to White", () => {
    const game = new ChessJsAdapter();
    const result = game.timeout("b");

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.state).toBe("timeout");
      expect(result.data.isOver).toBe(true);
      expect(result.data.winner).toBe("w");
      expect(result.data.description).toBe(
        "Black ran out of time. White wins."
      );
    }
  });

  it("TC-STATUS-27: cannot resign or timeout an already completed game", () => {
    const game = new ChessJsAdapter();
    // Finish game via checkmate (Fool's mate)
    game.makeMove({ from: "f2", to: "f3" });
    game.makeMove({ from: "e7", to: "e5" });
    game.makeMove({ from: "g2", to: "g4" });
    game.makeMove({ from: "d8", to: "h4" }); // checkmate
    expect(game.getStatus().isOver).toBe(true);

    const resignRes = game.resign("w");
    expect(isErr(resignRes)).toBe(true);
    if (isErr(resignRes)) {
      expect(resignRes.error.code).toBe("GAME_ALREADY_OVER");
    }

    const timeoutRes = game.timeout("b");
    expect(isErr(timeoutRes)).toBe(true);
    if (isErr(timeoutRes)) {
      expect(timeoutRes.error.code).toBe("GAME_ALREADY_OVER");
    }

    const agreeRes = game.agreeDraw();
    expect(isErr(agreeRes)).toBe(true);
    if (isErr(agreeRes)) {
      expect(agreeRes.error.code).toBe("GAME_ALREADY_OVER");
    }
  });

  it("TC-STATUS-30: mutual draw agreement hook concludes game as draw_agreement", () => {
    const game = new ChessJsAdapter();
    const result = game.agreeDraw();

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.state).toBe("draw_agreement");
      expect(result.data.isOver).toBe(true);
      expect(result.data.winner).toBeNull();
      expect(result.data.inDraw).toBe(true);
      expect(result.data.drawReason).toBe("agreement");
      expect(result.data.description).toBe("Draw agreed by mutual consent.");
    }

    // Subsequent move rejected
    const moveRes = game.makeMove({ from: "e2", to: "e4" });
    expect(isErr(moveRes)).toBe(true);
    if (isErr(moveRes)) {
      expect(moveRes.error.code).toBe("GAME_ALREADY_OVER");
    }
  });

  it("rejects invalid player color input for resign and timeout", () => {
    const game = new ChessJsAdapter();
    const badResign = game.resign("x" as unknown as Color);
    expect(isErr(badResign)).toBe(true);
    if (isErr(badResign)) {
      expect(badResign.error.code).toBe("INVALID_COLOR");
    }

    const badTimeout = game.timeout("invalid" as unknown as Color);
    expect(isErr(badTimeout)).toBe(true);
    if (isErr(badTimeout)) {
      expect(badTimeout.error.code).toBe("INVALID_COLOR");
    }
  });
});
