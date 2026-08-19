import { describe, it, expect, beforeEach, vi } from "vitest";
import { SettingsService } from "../settings/SettingsService";
import { PersistenceService } from "../PersistenceService";
import { InMemoryPersistenceAdapter } from "../adapters/InMemoryPersistenceAdapter";
import {
  DEFAULT_PERSISTED_SETTINGS,
  createDefaultPersistedState,
  type PersistedStateV1,
} from "../schema";
import { isErr, isOk } from "../errors";

describe("Phase 08 · Sprint 05: SettingsService (TC-SET-08 to TC-SET-15)", () => {
  let adapter: InMemoryPersistenceAdapter;
  let persistenceService: PersistenceService;

  beforeEach(() => {
    adapter = new InMemoryPersistenceAdapter();
    persistenceService = new PersistenceService({ adapter });
  });

  it("TC-SET-08: initializes with deterministic defaults when storage is empty", () => {
    const service = new SettingsService({ persistenceService });
    expect(service.getSettings()).toEqual(DEFAULT_PERSISTED_SETTINGS);
  });

  it("TC-SET-09: loads existing persisted preferences from storage upon startup", () => {
    const customState: PersistedStateV1 = {
      ...createDefaultPersistedState(),
      settings: {
        ...DEFAULT_PERSISTED_SETTINGS,
        boardTheme: "wood",
        engineDifficulty: 6,
        soundEnabled: false,
      },
    };
    persistenceService.save(customState);

    const service = new SettingsService({ persistenceService });
    const loaded = service.getSettings();
    expect(loaded.boardTheme).toBe("wood");
    expect(loaded.engineDifficulty).toBe(6);
    expect(loaded.soundEnabled).toBe(false);
    expect(loaded.pieceSet).toBe("standard"); // untouched defaults preserved
  });

  it("TC-SET-10: updateSettings applies partial patch, persists to storage, and notifies listeners", () => {
    const service = new SettingsService({ persistenceService });
    const listener = vi.fn();
    service.subscribe(listener);

    const result = service.updateSettings({
      boardTheme: "ocean",
      volume: 40,
      autoQueen: true,
    });

    expect(isOk(result)).toBe(true);
    expect(service.getSettings().boardTheme).toBe("ocean");
    expect(service.getSettings().volume).toBe(40);
    expect(service.getSettings().autoQueen).toBe(true);

    // Verify listener was called with new settings
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(service.getSettings());

    // Verify storage has persisted changes
    const storedState = persistenceService.loadWithFallback();
    expect(storedState.settings.boardTheme).toBe("ocean");
    expect(storedState.settings.volume).toBe(40);
    expect(storedState.settings.autoQueen).toBe(true);
  });

  it("TC-SET-11: updateSettings rejects invalid patch with error and leaves state untouched", () => {
    const service = new SettingsService({ persistenceService });
    const listener = vi.fn();
    service.subscribe(listener);

    const result = service.updateSettings({
      boardTheme: "nonexistent-theme",
      volume: 500, // out of range
    } as unknown);

    expect(isErr(result)).toBe(true);
    expect(listener).not.toHaveBeenCalled();
    expect(service.getSettings()).toEqual(DEFAULT_PERSISTED_SETTINGS);
  });

  it("TC-SET-12: resetSettings restores factory defaults, persists, and notifies subscribers", () => {
    const service = new SettingsService({ persistenceService });
    service.updateSettings({
      boardTheme: "slate",
      volume: 10,
      reducedMotion: true,
    });

    const listener = vi.fn();
    service.subscribe(listener);

    const resetResult = service.resetSettings();
    expect(isOk(resetResult)).toBe(true);
    expect(service.getSettings()).toEqual(DEFAULT_PERSISTED_SETTINGS);
    expect(listener).toHaveBeenCalledWith(DEFAULT_PERSISTED_SETTINGS);

    const persisted = persistenceService.loadWithFallback();
    expect(persisted.settings).toEqual(DEFAULT_PERSISTED_SETTINGS);
  });

  it("TC-SET-13: unsubscribe prevents subsequent notifications", () => {
    const service = new SettingsService({ persistenceService });
    const listener = vi.fn();
    const unsubscribe = service.subscribe(listener);

    service.updateSettings({ volume: 50 });
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    service.updateSettings({ volume: 75 });
    expect(listener).toHaveBeenCalledTimes(1); // not called again
  });

  it("TC-SET-14: reload re-reads storage and recovers from external updates or corruption", () => {
    const service = new SettingsService({ persistenceService });
    const listener = vi.fn();
    service.subscribe(listener);

    // External change directly in persistence storage
    persistenceService.saveSettings({
      ...DEFAULT_PERSISTED_SETTINGS,
      boardTheme: "wood",
      volume: 95,
    });

    const reloaded = service.reload();
    expect(reloaded.boardTheme).toBe("wood");
    expect(reloaded.volume).toBe(95);
    expect(listener).toHaveBeenCalledWith(reloaded);
  });

  it("TC-SET-15: updating settings preserves active game snapshot in persistence", () => {
    // Seed active game in storage
    const activeGameSnapshot = {
      id: "active-game-preserve-test",
      mode: "human_vs_human" as const,
      fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
      moveHistorySan: ["e4"],
      players: {
        w: {
          id: "p1",
          name: "Alice",
          color: "w" as const,
          type: "human" as const,
        },
        b: {
          id: "p2",
          name: "Bob",
          color: "b" as const,
          type: "human" as const,
        },
      },
      userOrientation: "w" as const,
      startedAt: 1000,
      updatedAt: 2000,
    };
    persistenceService.saveActiveGame(activeGameSnapshot);

    const service = new SettingsService({ persistenceService });
    service.updateSettings({ boardTheme: "slate", showCoordinates: false });

    const persisted = persistenceService.loadWithFallback();
    expect(persisted.settings.boardTheme).toBe("slate");
    expect(persisted.settings.showCoordinates).toBe(false);
    expect(persisted.activeGame).toEqual(activeGameSnapshot);
  });
});
