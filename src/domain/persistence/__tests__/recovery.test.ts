import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { GameSessionController } from "../../../features/game/GameSessionController";
import {
  isRecoverableSession,
  STARTING_FEN,
} from "../../../features/game/useGameRecovery";
import { InMemoryPersistenceAdapter } from "../adapters/InMemoryPersistenceAdapter";
import { PersistenceService } from "../PersistenceService";
import type { PersistedActiveGame } from "../schema";

describe("Domain & Controller Game Recovery Tests", () => {
  it("TC-RECOV-01: captures active game snapshot after moves are executed", () => {
    const controller = new GameSessionController({
      mode: "human_vs_human",
      players: {
        w: { id: "p1", name: "Alice", color: "w", type: "human" },
        b: { id: "p2", name: "Bob", color: "b", type: "human" },
      },
    });

    const moveRes = controller.makeMove({ from: "e2", to: "e4" });
    expect(moveRes.success).toBe(true);

    const snapshot = controller.toSnapshot("w", {
      whiteMs: 300000,
      blackMs: 300000,
      timeControl: {
        type: "blitz",
        initialMs: 300000,
        incrementMs: 0,
        label: "5 min",
      },
    });

    expect(snapshot.mode).toBe("human_vs_human");
    expect(snapshot.players.w.name).toBe("Alice");
    expect(snapshot.players.b.name).toBe("Bob");
    expect(snapshot.moveHistorySan).toEqual(["e4"]);
    expect(snapshot.fen).toContain(
      "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR"
    );
    expect(snapshot.userOrientation).toBe("w");
    expect(snapshot.clock?.whiteMs).toBe(300000);
  });

  it("TC-RECOV-02: updates snapshot correctly after undo", () => {
    const controller = new GameSessionController();
    controller.makeMove({ from: "e2", to: "e4" });
    controller.makeMove({ from: "e7", to: "e5" });
    expect(controller.getState().moveHistory.length).toBe(2);

    controller.undo();
    const snapshot = controller.toSnapshot("w");

    expect(snapshot.moveHistorySan).toEqual(["e4"]);
    expect(controller.getState().position.turn).toBe("b");
  });

  it("TC-RECOV-03: preserves board state when updating game mode and player info", () => {
    const controller = new GameSessionController({ mode: "human_vs_human" });
    controller.makeMove({ from: "d2", to: "d4" });

    controller.updateGameMode("human_vs_engine", {
      b: {
        id: "engine",
        name: "Stockfish 16",
        color: "b",
        type: "engine",
        difficulty: 5,
      },
    });

    const snapshot = controller.toSnapshot("w");
    expect(snapshot.mode).toBe("human_vs_engine");
    expect(snapshot.players.b.name).toBe("Stockfish 16");
    expect(snapshot.players.b.type).toBe("engine");
    expect(snapshot.players.b.difficulty).toBe(5);
    expect(snapshot.moveHistorySan).toEqual(["d4"]);
  });

  it("TC-RECOV-04 & 05: successfully restores active game from persistent snapshot", () => {
    const snapshot: PersistedActiveGame = {
      id: "session-123",
      mode: "human_vs_engine",
      fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
      moveHistorySan: ["e4", "e5", "Nf3"],
      players: {
        w: { id: "p-w", name: "Magnus", color: "w", type: "human" },
        b: {
          id: "p-b",
          name: "Stockfish",
          color: "b",
          type: "engine",
          difficulty: 6,
        },
      },
      clock: {
        whiteMs: 175000,
        blackMs: 180000,
        timeControl: {
          type: "blitz",
          initialMs: 180000,
          incrementMs: 2000,
          label: "3+2",
        },
      },
      userOrientation: "w",
      startedAt: 1000,
      updatedAt: 2000,
    };

    const newController = new GameSessionController();
    const restoreResult = newController.restoreSession(snapshot);
    expect(restoreResult.success).toBe(true);

    const restoredState = newController.getState();
    expect(restoredState.id).toBe("session-123");
    expect(restoredState.mode).toBe("human_vs_engine");
    expect(restoredState.players.w.name).toBe("Magnus");
    expect(restoredState.players.b.name).toBe("Stockfish");
    expect(restoredState.players.b.difficulty).toBe(6);
    expect(restoredState.turn).toBe("b");
    expect(restoredState.moveHistory.map((m) => m.san)).toEqual([
      "e4",
      "e5",
      "Nf3",
    ]);
    expect(restoredState.position.fen).toBe(
      "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2"
    );
  });

  it("TC-RECOV-06: restores custom FEN if move history replay is not available", () => {
    const customFen = "8/8/8/4k3/8/8/4K3/8 w - - 0 1";
    const snapshot: PersistedActiveGame = {
      id: "session-endgame",
      mode: "human_vs_human",
      fen: customFen,
      moveHistorySan: [],
      players: {
        w: { id: "p-w", name: "White", color: "w", type: "human" },
        b: { id: "p-b", name: "Black", color: "b", type: "human" },
      },
      userOrientation: "w",
      startedAt: 1000,
      updatedAt: 2000,
    };

    const controller = new GameSessionController();
    const result = controller.restoreSession(snapshot);
    expect(result.success).toBe(true);
    expect(controller.getState().position.fen).toBe(customFen);
  });

  describe("isRecoverableSession validator", () => {
    it("TC-RECOV-08: identifies recoverable vs non-recoverable payloads", () => {
      expect(isRecoverableSession(null)).toBe(false);
      expect(isRecoverableSession(undefined)).toBe(false);

      // Starting position with 0 moves is not considered an interrupted game
      const emptyStartingGame: PersistedActiveGame = {
        id: "s1",
        mode: "human_vs_human",
        fen: STARTING_FEN,
        moveHistorySan: [],
        players: {
          w: { id: "w", name: "W", color: "w", type: "human" },
          b: { id: "b", name: "B", color: "b", type: "human" },
        },
        userOrientation: "w",
        startedAt: 1000,
        updatedAt: 1000,
      };
      expect(isRecoverableSession(emptyStartingGame)).toBe(false);

      // Game with moves is recoverable
      const gameWithMoves: PersistedActiveGame = {
        ...emptyStartingGame,
        fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
        moveHistorySan: ["e4"],
      };
      expect(isRecoverableSession(gameWithMoves)).toBe(true);

      // Game with malformed FEN is NOT recoverable
      const corruptFenGame: PersistedActiveGame = {
        ...emptyStartingGame,
        fen: "not-a-valid-fen",
        moveHistorySan: ["e4"],
      };
      expect(isRecoverableSession(corruptFenGame)).toBe(false);

      // Scholar's Mate checkmate position is already game over -> NOT recoverable
      const checkmateGame: PersistedActiveGame = {
        ...emptyStartingGame,
        fen: "r1bqkb1r/pppp1Qpp/2n5/4p3/2B1n3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4",
        moveHistorySan: ["e4", "e5", "Bc4", "Nc6", "Qh5", "Nf6", "Qxf7#"],
      };
      expect(isRecoverableSession(checkmateGame)).toBe(false);
    });
  });

  it("TC-RECOV-17: Property-based round-trip restoration test (fast-check)", () => {
    // Generate valid random opening sequences (1 to 4 plies)
    const openingMoves = [
      ["e4", "e5", "Nf3", "Nc6"],
      ["d4", "d5", "c4", "e6"],
      ["e4", "c5", "Nf3", "d6"],
      ["c4", "e5", "Nc3", "Nf6"],
      ["Nf3", "d5", "g3", "Nf6"],
    ];

    fc.assert(
      fc.property(
        fc.constantFrom(...openingMoves),
        fc.integer({ min: 1, max: 4 }),
        fc.constantFrom<"human_vs_human" | "human_vs_engine">(
          "human_vs_human",
          "human_vs_engine"
        ),
        (moves, plies, mode) => {
          const selectedMoves = moves.slice(0, plies);
          const service = new PersistenceService({
            adapter: new InMemoryPersistenceAdapter(),
          });

          const ctrl1 = new GameSessionController({ mode });
          // Play moves via PGN import
          ctrl1.getChessGame().importPgn(selectedMoves.join(" "));

          const snapshot = ctrl1.toSnapshot("w");
          expect(isRecoverableSession(snapshot)).toBe(true);

          service.saveActiveGame(snapshot);
          const loaded = service.load();
          expect(loaded.success).toBe(true);
          if (!loaded.success || !loaded.data?.activeGame) {
            throw new Error("Failed to load activeGame");
          }

          const ctrl2 = new GameSessionController();
          const restoreRes = ctrl2.restoreSession(loaded.data.activeGame);
          expect(restoreRes.success).toBe(true);

          expect(ctrl2.getState().position.fen).toBe(
            ctrl1.getState().position.fen
          );
          expect(ctrl2.getState().turn).toBe(ctrl1.getState().turn);
          expect(ctrl2.getState().mode).toBe(mode);
        }
      ),
      { numRuns: 20 }
    );
  });
});
