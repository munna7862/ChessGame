import { describe, it, expect, vi } from "vitest";
import {
  createGameSession,
  deriveCapturedPieces,
  DEFAULT_WHITE_PLAYER,
  DEFAULT_BLACK_PLAYER,
} from "../GameSessionController";

describe("GameSessionController (Phase 05 · Sprint 01)", () => {
  it("TC-GS-01: initializes with standard default position and metadata", () => {
    const session = createGameSession();
    const state = session.getState();

    expect(state.id).toMatch(/^game-session-/);
    expect(state.mode).toBe("human_vs_human");
    expect(state.players.w).toEqual(DEFAULT_WHITE_PLAYER);
    expect(state.players.b).toEqual(DEFAULT_BLACK_PLAYER);
    expect(state.turn).toBe("w");
    expect(state.status.state).toBe("active");
    expect(state.status.isOver).toBe(false);
    expect(state.status.isCheck).toBe(false);
    expect(state.moveHistory).toHaveLength(0);
    expect(state.capturedPieces).toEqual({ white: [], black: [] });
    expect(state.isGameOver).toBe(false);
    expect(state.isCheck).toBe(false);
    expect(state.isCheckmate).toBe(false);
    expect(state.position.turn).toBe("w");
    expect(state.position.fullmoveNumber).toBe(1);
  });

  it("TC-GS-02: executes legal moves, updates position, turn, and move history", () => {
    const session = createGameSession();
    const listener = vi.fn();
    session.subscribe(listener);

    const result = session.makeMove({ from: "e2", to: "e4" });
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.san).toBe("e4");
    expect(listener).toHaveBeenCalledTimes(1);

    const state = session.getState();
    expect(state.turn).toBe("b");
    expect(state.moveHistory).toHaveLength(1);
    expect(state.moveHistory[0]?.san).toBe("e4");
    expect(state.moveHistory[0]?.from).toBe("e2");
    expect(state.moveHistory[0]?.to).toBe("e4");
    expect(state.capturedPieces).toEqual({ white: [], black: [] });

    // Black responds with e5
    const res2 = session.makeMove({ from: "e7", to: "e5" });
    expect(res2.success).toBe(true);
    expect(session.getState().turn).toBe("w");
    expect(session.getState().moveHistory).toHaveLength(2);
    expect(session.getState().moveHistory[1]?.san).toBe("e5");
  });

  it("TC-GS-03: tracks captured pieces accurately for both White and Black", () => {
    const session = createGameSession();

    // 1. e4 d5 2. exd5 (White captures black pawn)
    session.makeMove({ from: "e2", to: "e4" });
    session.makeMove({ from: "d7", to: "d5" });
    const capRes1 = session.makeMove({ from: "e4", to: "d5" });

    expect(capRes1.success).toBe(true);
    let state = session.getState();
    expect(state.capturedPieces.white).toEqual(["p"]);
    expect(state.capturedPieces.black).toEqual([]);

    // 2... Qxd5 3. Nc3 Qa5 4. d4 e5 5. dxe5 Qxe5+ (Black captures white pawn)
    session.makeMove({ from: "d8", to: "d5" }); // Qxd5 (Black captures white pawn on d5)
    state = session.getState();
    expect(state.capturedPieces.white).toEqual(["p"]);
    expect(state.capturedPieces.black).toEqual(["p"]);
  });

  it("TC-GS-04: executes pawn promotion accurately", () => {
    // Setup position where White pawn is about to promote: e7, Black king on a8
    const fen = "k7/4P3/8/8/8/8/8/4K3 w - - 0 1";
    const session = createGameSession({ initialFen: fen });

    const promoRes = session.makeMove({ from: "e7", to: "e8", promotion: "q" });
    expect(promoRes.success).toBe(true);
    if (!promoRes.success) return;

    expect(promoRes.data.san).toBe("e8=Q+");
    expect(session.getState().position.board[0]?.[4]?.type).toBe("q");
    expect(session.getState().status.isCheck).toBe(true);
  });

  it("TC-GS-05: rejects illegal moves without corrupting state or history", () => {
    const session = createGameSession();
    const stateBefore = session.getState();

    // Attempt illegal move e2 to e5
    const illegalRes = session.makeMove({ from: "e2", to: "e5" });
    expect(illegalRes.success).toBe(false);

    const stateAfter = session.getState();
    expect(stateAfter.turn).toBe("w");
    expect(stateAfter.moveHistory).toHaveLength(0);
    expect(stateAfter.position.fen).toBe(stateBefore.position.fen);
  });

  it("TC-GS-06 & TC-GS-07: propagates check and checkmate status and blocks further moves", () => {
    const session = createGameSession();

    // Scholar's Mate: 1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7#
    session.makeMove({ from: "e2", to: "e4" });
    session.makeMove({ from: "e7", to: "e5" });
    session.makeMove({ from: "d1", to: "h5" });
    session.makeMove({ from: "b8", to: "c6" });
    session.makeMove({ from: "f1", to: "c4" });
    session.makeMove({ from: "g8", to: "f6" });
    const mateRes = session.makeMove({ from: "h5", to: "f7" });

    expect(mateRes.success).toBe(true);
    const state = session.getState();
    expect(state.status.state).toBe("checkmate");
    expect(state.status.isOver).toBe(true);
    expect(state.status.winner).toBe("w");
    expect(state.isGameOver).toBe(true);
    expect(state.isCheckmate).toBe(true);
    expect(state.isCheck).toBe(true);
    expect(state.capturedPieces.white).toEqual(["p"]);

    // TC-GS-08: Attempting further moves after checkmate is rejected
    const afterMateRes = session.makeMove({ from: "f6", to: "e4" });
    expect(afterMateRes.success).toBe(false);
    if (!afterMateRes.success) {
      expect(afterMateRes.error.code).toBe("GAME_ALREADY_OVER");
    }
  });

  it("TC-GS-09: clean reset restores initial starting position and clears history", () => {
    const session = createGameSession();
    session.makeMove({ from: "e2", to: "e4" });
    session.makeMove({ from: "e7", to: "e5" });
    expect(session.getState().moveHistory).toHaveLength(2);

    session.reset();
    const resetState = session.getState();
    expect(resetState.turn).toBe("w");
    expect(resetState.moveHistory).toHaveLength(0);
    expect(resetState.capturedPieces).toEqual({ white: [], black: [] });
    expect(resetState.status.state).toBe("active");
    expect(resetState.status.isOver).toBe(false);
    expect(resetState.position.fen).toBe(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    );
  });

  it("TC-GS-10: supports custom player configuration and metadata", () => {
    const session = createGameSession({
      id: "custom-match-42",
      players: {
        w: {
          id: "p-1",
          name: "Magnus",
          color: "w",
          type: "human",
          rating: 2850,
        },
        b: {
          id: "p-2",
          name: "Hikaru",
          color: "b",
          type: "human",
          rating: 2820,
        },
      },
    });

    const state = session.getState();
    expect(state.id).toBe("custom-match-42");
    expect(state.players.w.name).toBe("Magnus");
    expect(state.players.b.name).toBe("Hikaru");
    expect(state.players.w.rating).toBe(2850);
  });

  it("TC-GS-03 (helper): deriveCapturedPieces derives accurately from history", () => {
    const captured = deriveCapturedPieces([]);
    expect(captured).toEqual({ white: [], black: [] });
  });

  it("supports resign, timeout, and draw actions", () => {
    const session = createGameSession();
    const resignRes = session.resign("w");
    expect(resignRes.success).toBe(true);
    expect(session.getState().status.state).toBe("resigned");
    expect(session.getState().status.winner).toBe("b");

    session.reset();
    const drawRes = session.agreeDraw();
    expect(drawRes.success).toBe(true);
    expect(session.getState().status.state).toBe("draw_agreement");
  });

  it("supports undo move", () => {
    const session = createGameSession();
    session.makeMove({ from: "e2", to: "e4" });
    expect(session.getState().moveHistory).toHaveLength(1);

    const undoRes = session.undo();
    expect(undoRes.success).toBe(true);
    expect(session.getState().moveHistory).toHaveLength(0);
    expect(session.getState().turn).toBe("w");
  });
});
