import { describe, it, expect } from "vitest";
import {
  PersistedStateV1Schema,
  PersistedSettingsSchema,
  PersistedActiveGameSchema,
  createDefaultPersistedState,
  DEFAULT_PERSISTED_SETTINGS,
  type PersistedStateV1,
} from "../schema";

describe("Persistence Schema & Validation (TC-PERSIST-04 & TC-PERSIST-05)", () => {
  it("validates default state factory output cleanly (TC-PERSIST-04)", () => {
    const defaultState = createDefaultPersistedState(() => 1700000000000);

    expect(defaultState.version).toBe(1);
    expect(defaultState.updatedAt).toBe(1700000000000);
    expect(defaultState.settings).toEqual(DEFAULT_PERSISTED_SETTINGS);
    expect(defaultState.activeGame).toBeNull();

    const parseResult = PersistedStateV1Schema.safeParse(defaultState);
    expect(parseResult.success).toBe(true);
  });

  it("validates full state containing an active game snapshot (TC-PERSIST-04)", () => {
    const stateWithGame: PersistedStateV1 = {
      version: 1,
      updatedAt: 1700000000000,
      settings: {
        boardTheme: "wood",
        pieceSet: "modern",
        showCoordinates: false,
        showLegalMoves: true,
        showLastMove: true,
        soundEnabled: false,
        autoQueen: true,
        engineDifficulty: 6,
        reducedMotion: true,
        volume: 50,
      },
      activeGame: {
        id: "game-12345",
        mode: "human_vs_engine",
        fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
        moveHistorySan: ["e4"],
        players: {
          w: {
            id: "p1",
            name: "Alice",
            color: "w",
            type: "human",
            rating: 1500,
          },
          b: {
            id: "p2",
            name: "Stockfish",
            color: "b",
            type: "engine",
            difficulty: 6,
          },
        },
        clock: {
          whiteMs: 295000,
          blackMs: 300000,
          timeControl: {
            type: "blitz",
            initialMs: 300000,
            incrementMs: 2000,
            label: "3+2 Blitz",
          },
        },
        userOrientation: "w",
        startedAt: 1699999000000,
        updatedAt: 1700000000000,
      },
      metadata: {
        source: "desktop_app",
      },
    };

    const parseResult = PersistedStateV1Schema.safeParse(stateWithGame);
    expect(parseResult.success).toBe(true);
    if (parseResult.success) {
      expect(parseResult.data.settings.engineDifficulty).toBe(6);
      expect(parseResult.data.activeGame?.players.b.type).toBe("engine");
    }
  });

  it("rejects schemas with invalid or missing fields (TC-PERSIST-05)", () => {
    // Missing version
    const missingVersion = {
      updatedAt: 1700000000000,
      settings: { ...DEFAULT_PERSISTED_SETTINGS },
    };
    expect(PersistedStateV1Schema.safeParse(missingVersion).success).toBe(
      false
    );

    // Wrong version number
    const wrongVersion = {
      version: 2,
      updatedAt: 1700000000000,
      settings: { ...DEFAULT_PERSISTED_SETTINGS },
    };
    expect(PersistedStateV1Schema.safeParse(wrongVersion).success).toBe(false);

    // Negative timestamp
    const negativeTimestamp = {
      version: 1,
      updatedAt: -500,
      settings: { ...DEFAULT_PERSISTED_SETTINGS },
    };
    expect(PersistedStateV1Schema.safeParse(negativeTimestamp).success).toBe(
      false
    );

    // Invalid difficulty (outside 1..8)
    const invalidDifficulty = {
      ...DEFAULT_PERSISTED_SETTINGS,
      engineDifficulty: 10,
    };
    expect(PersistedSettingsSchema.safeParse(invalidDifficulty).success).toBe(
      false
    );

    // Invalid player color in active game
    const invalidPlayerColor = {
      id: "game-1",
      mode: "human_vs_human",
      fen: "startpos",
      moveHistorySan: [],
      players: {
        w: { id: "1", name: "P1", color: "invalid", type: "human" },
        b: { id: "2", name: "P2", color: "b", type: "human" },
      },
      userOrientation: "w",
      startedAt: 1000,
      updatedAt: 2000,
    };
    expect(
      PersistedActiveGameSchema.safeParse(invalidPlayerColor).success
    ).toBe(false);
  });
});
