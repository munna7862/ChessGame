import { describe, it, expect } from "vitest";
import { PersistenceService } from "../PersistenceService";
import { InMemoryPersistenceAdapter } from "../adapters/InMemoryPersistenceAdapter";
import { createDefaultPersistedState, type PersistedStateV1 } from "../schema";
import { isErr, isOk } from "../errors";

describe("PersistenceService (TC-PERSIST-06 to TC-PERSIST-11)", () => {
  const fixedTime = 1700000000000;
  const timeProvider = () => fixedTime;

  it("saves and loads valid versioned state using in-memory adapter (TC-PERSIST-06 & TC-PERSIST-07)", () => {
    const adapter = new InMemoryPersistenceAdapter();
    const service = new PersistenceService({ adapter, timeProvider });

    const state = createDefaultPersistedState(timeProvider);
    state.settings.boardTheme = "ocean";
    state.settings.engineDifficulty = 5;

    const saveRes = service.save(state);
    expect(isOk(saveRes)).toBe(true);

    const loadRes = service.load();
    expect(isOk(loadRes)).toBe(true);
    if (isOk(loadRes)) {
      expect(loadRes.data).toEqual(state);
    }
  });

  it("returns ok(null) when storage has no data (TC-PERSIST-08)", () => {
    const adapter = new InMemoryPersistenceAdapter();
    const service = new PersistenceService({ adapter, timeProvider });

    const loadRes = service.load();
    expect(loadRes).toEqual({ success: true, data: null });
  });

  it("returns PARSE_ERROR when raw stored data is not valid JSON (TC-PERSIST-09)", () => {
    const adapter = new InMemoryPersistenceAdapter();
    adapter.setItem("chessforge_state_v1", "corrupt { json {{");
    const service = new PersistenceService({ adapter, timeProvider });

    const loadRes = service.load();
    expect(isErr(loadRes)).toBe(true);
    if (isErr(loadRes)) {
      expect(loadRes.error.code).toBe("PARSE_ERROR");
      expect(loadRes.error.message).toContain("Failed to parse persisted JSON");
    }
  });

  it("returns VALIDATION_FAILED when stored JSON does not match schema (TC-PERSIST-10)", () => {
    const adapter = new InMemoryPersistenceAdapter();
    adapter.setItem(
      "chessforge_state_v1",
      JSON.stringify({ version: 1, invalidField: true })
    );
    const service = new PersistenceService({ adapter, timeProvider });

    const loadRes = service.load();
    expect(isErr(loadRes)).toBe(true);
    if (isErr(loadRes)) {
      expect(loadRes.error.code).toBe("VALIDATION_FAILED");
    }
  });

  it("loadWithFallback gracefully returns fallback state on errors or missing data (TC-PERSIST-11)", () => {
    const adapter = new InMemoryPersistenceAdapter();
    const service = new PersistenceService({ adapter, timeProvider });

    // Missing data case
    const fallback1 = service.loadWithFallback();
    expect(fallback1.version).toBe(1);
    expect(fallback1.settings.boardTheme).toBe("classic");

    // Corrupt JSON case
    adapter.setItem("chessforge_state_v1", "corrupt_data");
    const fallback2 = service.loadWithFallback();
    expect(fallback2.version).toBe(1);
    expect(fallback2.settings.boardTheme).toBe("classic");

    // Custom fallback state
    const customFallback: PersistedStateV1 = {
      version: 1,
      updatedAt: fixedTime,
      settings: { ...fallback1.settings, boardTheme: "slate" },
      activeGame: null,
      metadata: {},
    };
    const fallbackCustom = service.loadWithFallback(customFallback);
    expect(fallbackCustom.settings.boardTheme).toBe("slate");
  });

  it("saveSettings incrementally updates only settings and updates timestamp", () => {
    const adapter = new InMemoryPersistenceAdapter();
    let currentTime = 1000;
    const service = new PersistenceService({
      adapter,
      timeProvider: () => currentTime,
    });

    const initial = createDefaultPersistedState(() => currentTime);
    service.save(initial);

    currentTime = 2000;
    const saveSettingsRes = service.saveSettings({
      ...initial.settings,
      boardTheme: "wood",
      soundEnabled: false,
    });
    expect(isOk(saveSettingsRes)).toBe(true);

    const loaded = service.loadWithFallback();
    expect(loaded.settings.boardTheme).toBe("wood");
    expect(loaded.settings.soundEnabled).toBe(false);
    expect(loaded.updatedAt).toBe(2000);
  });

  it("saveActiveGame updates and clears active game snapshot cleanly", () => {
    const adapter = new InMemoryPersistenceAdapter();
    const service = new PersistenceService({ adapter, timeProvider });

    const saveGameRes = service.saveActiveGame({
      id: "active-123",
      mode: "human_vs_human",
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      moveHistorySan: [],
      players: {
        w: { id: "p1", name: "White", color: "w", type: "human" },
        b: { id: "p2", name: "Black", color: "b", type: "human" },
      },
      userOrientation: "w",
      startedAt: fixedTime,
      updatedAt: fixedTime,
    });
    expect(isOk(saveGameRes)).toBe(true);

    let loaded = service.loadWithFallback();
    expect(loaded.activeGame?.id).toBe("active-123");

    // Clear active game
    service.saveActiveGame(null);
    loaded = service.loadWithFallback();
    expect(loaded.activeGame).toBeNull();
  });

  it("clear() removes the state from storage", () => {
    const adapter = new InMemoryPersistenceAdapter();
    const service = new PersistenceService({ adapter, timeProvider });

    service.save(createDefaultPersistedState(timeProvider));
    expect(service.loadWithFallback().version).toBe(1);

    const clearRes = service.clear();
    expect(isOk(clearRes)).toBe(true);
    expect(service.load()).toEqual({ success: true, data: null });
  });
});
