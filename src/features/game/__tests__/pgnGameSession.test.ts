import { describe, it, expect, beforeEach } from "vitest";
import {
  createGameSession,
  type GameSessionController,
} from "../GameSessionController";

describe("GameSessionController PGN Workflows (TC-PGN-UI-01 to TC-PGN-UI-14)", () => {
  let controller: GameSessionController;

  beforeEach(() => {
    controller = createGameSession({
      players: {
        w: { id: "p1", name: "Alice", color: "w", type: "human" },
        b: { id: "p2", name: "Bob", color: "b", type: "human" },
      },
    });
  });

  describe("exportPgn (TC-PGN-UI-01, TC-PGN-UI-02)", () => {
    it("TC-PGN-UI-01: exports standard Seven Tag Roster with current player names and moves", () => {
      controller.makeMove({ from: "e2", to: "e4" });
      controller.makeMove({ from: "e7", to: "e5" });
      controller.makeMove({ from: "g1", to: "f3" });

      const pgn = controller.exportPgn();
      expect(pgn).toContain('[White "Alice"]');
      expect(pgn).toContain('[Black "Bob"]');
      expect(pgn).toContain('[Result "*"]');
      expect(pgn).toContain("1. e4 e5 2. Nf3 *");
    });

    it("TC-PGN-UI-02: allows custom tag overrides", () => {
      controller.makeMove({ from: "d2", to: "d4" });
      const pgn = controller.exportPgn({
        Event: "FIDE Candidates 2026",
        Site: "Toronto, Canada",
        Round: "5",
      });

      expect(pgn).toContain('[Event "FIDE Candidates 2026"]');
      expect(pgn).toContain('[Site "Toronto, Canada"]');
      expect(pgn).toContain('[Round "5"]');
      expect(pgn).toContain("1. d4 *");
    });
  });

  describe("validatePgn (TC-PGN-UI-08, TC-PGN-UI-09, TC-PGN-UI-11)", () => {
    it("TC-PGN-UI-08: returns INVALID_PGN error for empty or malformed syntax", () => {
      const res = controller.validatePgn("   ");
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("INVALID_PGN");
      }
    });

    it("TC-PGN-UI-09: returns ILLEGAL_MOVE error with exact ply for illegal move tokens", () => {
      const pgn = `[Event "Test"]
[White "Alice"]
[Black "Bob"]

1. e4 e5 2. Qh5 Ke7 3. Qxe5# 4. Nf3`; // move after checkmate is impossible/illegal

      const res = controller.validatePgn(pgn);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("ILLEGAL_MOVE");
        expect(res.error.message).toContain("ply");
      }
    });

    it("TC-PGN-UI-11: produces rich preview structure for valid PGN", () => {
      const pgn = `[Event "Casual Match"]
[Site "Online"]
[Date "2026.08.19"]
[White "Kasparov, Garry"]
[Black "Deep Blue"]
[Result "1-0"]

1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 1-0`;

      const res = controller.validatePgn(pgn);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.whiteName).toBe("Kasparov, Garry");
        expect(res.data.blackName).toBe("Deep Blue");
        expect(res.data.event).toBe("Casual Match");
        expect(res.data.result).toBe("1-0");
        expect(res.data.moveCount).toBe(10);
        expect(res.data.isGameOver).toBe(true);
      }
    });
  });

  describe("importPgnGame (TC-PGN-UI-05, TC-PGN-UI-06, TC-PGN-UI-07, TC-PGN-UI-12, TC-PGN-UI-13)", () => {
    it("TC-PGN-UI-05 & TC-PGN-UI-13: loads valid PGN, updates player names and reconstructs board", () => {
      const pgn = `[Event "Blitz"]
[White "Magnus Carlsen"]
[Black "Hikaru Nakamura"]
[Result "*"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 *`;

      const res = controller.importPgnGame(pgn, { updatePlayerNames: true });
      expect(res.success).toBe(true);

      const state = controller.getState();
      expect(state.players.w.name).toBe("Magnus Carlsen");
      expect(state.players.b.name).toBe("Hikaru Nakamura");
      expect(state.moveHistory.length).toBe(6);
      expect(state.turn).toBe("w");
      expect(controller.getPiece("c5")?.type).toBe("b");
    });

    it("TC-PGN-UI-06: loads PGN with custom starting FEN", () => {
      const customFen =
        "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3";
      const pgn = `[SetUp "1"]
[FEN "${customFen}"]
[White "Player1"]
[Black "Player2"]

3. d4 exd4 4. Nxd4 *`;

      const res = controller.importPgnGame(pgn);
      expect(res.success).toBe(true);

      const state = controller.getState();
      expect(state.moveHistory.length).toBe(3);
    });

    it("TC-PGN-UI-07: sets terminal status when result token is 1-0 or 0-1 or 1/2-1/2", () => {
      const pgn = `[White "Winner"]
[Black "Resigner"]
[Result "1-0"]

1. e4 e5 1-0`;

      const res = controller.importPgnGame(pgn);
      expect(res.success).toBe(true);

      const state = controller.getState();
      expect(state.isGameOver).toBe(true);
      expect(state.status.winner).toBe("w");
      expect(state.status.state).toBe("resigned");
    });

    it("TC-PGN-UI-12: invalid PGN import fails safely without altering active game state", () => {
      // Play 2 initial moves
      controller.makeMove({ from: "e2", to: "e4" });
      controller.makeMove({ from: "e7", to: "e5" });
      const initialSnapshot = controller.getState();

      const invalidPgn = "1. e4 e5 2. InvalidMoveToken *";
      const res = controller.importPgnGame(invalidPgn);
      expect(res.success).toBe(false);

      const stateAfterFailedImport = controller.getState();
      expect(stateAfterFailedImport.moveHistory.length).toBe(2);
      expect(stateAfterFailedImport.position.fen).toBe(
        initialSnapshot.position.fen
      );
      expect(stateAfterFailedImport.players.w.name).toBe("Alice");
      expect(stateAfterFailedImport.players.b.name).toBe("Bob");
    });
  });
});
