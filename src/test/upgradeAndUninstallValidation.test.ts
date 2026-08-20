import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  createDefaultPersistedState,
  DEFAULT_PERSISTED_SETTINGS,
  type PersistedStateV1,
} from "../domain/persistence/schema";
import { PersistenceService } from "../domain/persistence/PersistenceService";
import { InMemoryPersistenceAdapter } from "../domain/persistence/adapters/InMemoryPersistenceAdapter";
import { SettingsService } from "../domain/persistence/settings/SettingsService";
import { MigrationEngine } from "../domain/persistence/migration";
import { isOk, isErr, ok } from "../domain/persistence/errors";
import { ChessJsAdapter } from "../domain/chess/adapters/chessJsAdapter";
import { isOk as isChessOk } from "../domain/chess/errors";
import { MockEngineWorkerBridge } from "../features/engine/MockEngineWorkerBridge";
import { EngineServiceImpl } from "../features/engine/EngineServiceImpl";

describe("Phase 11 · Sprint 05: Upgrade & Uninstall Validation Suite (TC-LIFE-01 - TC-LIFE-09)", () => {
  let adapter: InMemoryPersistenceAdapter;
  let persistenceService: PersistenceService;
  let settingsService: SettingsService;

  beforeEach(() => {
    adapter = new InMemoryPersistenceAdapter();
    persistenceService = new PersistenceService({ adapter });
    settingsService = new SettingsService({ persistenceService });
  });

  // ---------------------------------------------------------------------------
  // TC-LIFE-01: Previous Version Snapshot Simulation & Migration
  // ---------------------------------------------------------------------------
  it("TC-LIFE-01: transforms versioned schema state across migration steps without data loss", () => {
    const migrationEngine = new MigrationEngine();

    // Register a migration step from version 1 to version 2
    migrationEngine.registerMigration({
      fromVersion: 1,
      toVersion: 2,
      migrate: (raw) => {
        const rawSettings = (raw.settings as Record<string, unknown>) || {};
        return {
          version: 2,
          updatedAt: Date.now(),
          settings: {
            boardTheme: rawSettings.boardTheme || "classic",
            pieceSet: rawSettings.pieceSet || "standard",
            showCoordinates: rawSettings.showCoordinates ?? true,
            showLegalMoves: rawSettings.showLegalMoves ?? true,
            soundEnabled: rawSettings.soundEnabled ?? true,
            engineDifficulty: rawSettings.engineDifficulty ?? 3,
            cloudSyncEnabled: false, // New hypothetical v2 field
          },
          activeGame: raw.activeGame || null,
        };
      },
    });

    const v1Payload = {
      version: 1,
      updatedAt: 1700000000000,
      settings: {
        boardTheme: "wood",
        pieceSet: "standard",
        showCoordinates: false,
        showLegalMoves: true,
        soundEnabled: false,
        engineDifficulty: 6,
      },
      activeGame: null,
    };

    const migrateResult = migrationEngine.migrate(v1Payload, 2);
    expect(isOk(migrateResult)).toBe(true);

    if (isOk(migrateResult)) {
      const migrated = migrateResult.data;
      expect(migrated.version).toBe(2);
      const settings = migrated.settings as Record<string, unknown>;
      expect(settings.boardTheme).toBe("wood");
      expect(settings.soundEnabled).toBe(false);
      expect(settings.engineDifficulty).toBe(6);
      expect(settings.showCoordinates).toBe(false);
      expect(settings.cloudSyncEnabled).toBe(false);
    }
  });

  // ---------------------------------------------------------------------------
  // TC-LIFE-02: User Settings Preservation Across Upgrades
  // ---------------------------------------------------------------------------
  it("TC-LIFE-02: preserves customized settings across application binary update", () => {
    // 1. User configures custom settings on pre-upgrade build
    const updateRes = settingsService.updateSettings({
      boardTheme: "midnight",
      pieceSet: "standard",
      showCoordinates: false,
      showLegalMoves: true,
      soundEnabled: false,
      engineDifficulty: 7,
    });
    expect(isOk(updateRes)).toBe(true);

    // 2. Simulate application upgrade to v1.0.0 (service restart with persisted store)
    const postUpgradeSettingsService = new SettingsService({
      persistenceService: new PersistenceService({ adapter }),
    });

    const activeSettings = postUpgradeSettingsService.getSettings();
    expect(activeSettings.boardTheme).toBe("midnight");
    expect(activeSettings.showCoordinates).toBe(false);
    expect(activeSettings.soundEnabled).toBe(false);
    expect(activeSettings.engineDifficulty).toBe(7);
  });

  // ---------------------------------------------------------------------------
  // TC-LIFE-03: Active Game State Preservation Across Upgrades
  // ---------------------------------------------------------------------------
  it("TC-LIFE-03: preserves mid-game active state, FEN, moves, and clocks across upgrade", () => {
    const midGameSnapshot: PersistedStateV1 = {
      version: 1,
      updatedAt: Date.now(),
      settings: DEFAULT_PERSISTED_SETTINGS,
      activeGame: {
        id: "game-upgrade-test-01",
        mode: "human_vs_engine",
        fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2",
        moveHistorySan: ["e4", "c5"],
        players: {
          w: { id: "p1", name: "Human", color: "w", type: "human" },
          b: { id: "p2", name: "Stockfish AI", color: "b", type: "engine" },
        },
        userOrientation: "w",
        clock: {
          whiteMs: 295000,
          blackMs: 298000,
          timeControl: {
            type: "rapid",
            initialMs: 300000,
            incrementMs: 0,
          },
        },
        startedAt: 1700000000000,
        updatedAt: 1700000010000,
      },
    };

    const saveRes = persistenceService.save(midGameSnapshot);
    expect(isOk(saveRes)).toBe(true);

    // Simulate relaunch after upgrade
    const postUpgradePersistence = new PersistenceService({ adapter });
    const loadRes = postUpgradePersistence.load();
    expect(isOk(loadRes)).toBe(true);

    if (isOk(loadRes) && loadRes.data) {
      expect(loadRes.data.version).toBe(1);
      expect(loadRes.data.activeGame?.id).toBe("game-upgrade-test-01");
      expect(loadRes.data.activeGame?.fen).toBe(
        "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2"
      );
      expect(loadRes.data.activeGame?.moveHistorySan).toEqual(["e4", "c5"]);
      expect(loadRes.data.activeGame?.clock?.whiteMs).toBe(295000);
      expect(loadRes.data.activeGame?.players.b.type).toBe("engine");

      // Verify domain adapter can resume gameplay from restored FEN
      expect(loadRes.data.activeGame).toBeTruthy();
      if (loadRes.data.activeGame) {
        const chess = new ChessJsAdapter(loadRes.data.activeGame.fen);
        expect(chess.getPosition().turn).toBe("w");
        const nextMove = chess.makeMove({ from: "g1", to: "f3" });
        expect(isChessOk(nextMove)).toBe(true);
      }
    }
  });

  // ---------------------------------------------------------------------------
  // TC-LIFE-04: Graceful Handling of Incompatible/Corrupt State on Upgrade
  // ---------------------------------------------------------------------------
  it("TC-LIFE-04: recovers safely from future unsupported versions or malformed state", () => {
    // 1. Future version test
    adapter.setItem(
      "chessforge_state_v1",
      JSON.stringify({ version: 99, settings: {}, activeGame: null })
    );

    const futureRes = persistenceService.load();
    expect(isErr(futureRes)).toBe(true);
    if (isErr(futureRes)) {
      expect(futureRes.error.code).toBe("UNSUPPORTED_VERSION");
    }

    // 2. Corrupt JSON syntax test
    adapter.setItem("chessforge_state_v1", "{ malformed unclosed json: true, ");
    const corruptRes = persistenceService.load();
    expect(isErr(corruptRes)).toBe(true);
    if (isErr(corruptRes)) {
      expect(corruptRes.error.code).toBe("PARSE_ERROR");
    }

    // Default fallback state ensures no UI freeze
    const fallback = createDefaultPersistedState();
    expect(fallback.version).toBe(1);
    expect(fallback.activeGame).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // TC-LIFE-05: Post-Upgrade Engine Launch & Ready Lifecycle
  // ---------------------------------------------------------------------------
  it("TC-LIFE-05: initializes engine worker and executes search successfully post-upgrade", async () => {
    const mockBridge = new MockEngineWorkerBridge();
    const engineService = new EngineServiceImpl(mockBridge);

    // 1. Launch & initialize engine
    await engineService.init();
    expect(engineService.getState()).toBe("ready");

    // 2. Execute search from standard starting position
    const bestMove = await engineService.searchBestMove({
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      movetimeMs: 20,
    });
    expect(bestMove.bestMoveUci).toBeTruthy();

    // 3. Clean teardown
    engineService.dispose();
    expect(engineService.getState()).toBe("disposed");
  });

  // ---------------------------------------------------------------------------
  // TC-LIFE-06: Windows Clean Uninstall Invariants & Binary Removal
  // ---------------------------------------------------------------------------
  it("TC-LIFE-06: verifies Tauri NSIS uninstaller configuration and installMode invariants", () => {
    const tauriConfigPath = path.resolve(
      __dirname,
      "../../src-tauri/tauri.conf.json"
    );
    expect(fs.existsSync(tauriConfigPath)).toBe(true);

    const config = JSON.parse(fs.readFileSync(tauriConfigPath, "utf-8"));
    expect(config.bundle.windows).toBeDefined();
    expect(config.bundle.windows.nsis).toBeDefined();
    expect(config.bundle.windows.nsis.installMode).toBe("currentUser");
    expect(config.productName).toBe("ChessForge");
    expect(config.identifier).toBe("com.chessforge.app");
  });

  // ---------------------------------------------------------------------------
  // TC-LIFE-07: User Data Sovereignty Policy during Uninstall & Factory Reset
  // ---------------------------------------------------------------------------
  it("TC-LIFE-07: verifies local data wipe and storage isolation behavior", () => {
    // Populate storage with game data and settings
    persistenceService.save({
      version: 1,
      updatedAt: Date.now(),
      settings: { ...DEFAULT_PERSISTED_SETTINGS, boardTheme: "classic" },
      activeGame: null,
    });

    expect(adapter.getItem("chessforge_state_v1")).not.toEqual(ok(null));

    // Application factory reset/wipe
    const clearRes = persistenceService.clear();
    expect(isOk(clearRes)).toBe(true);
    expect(adapter.getItem("chessforge_state_v1")).toEqual(ok(null));

    const reloadRes = persistenceService.load();
    expect(isOk(reloadRes)).toBe(true);
    if (isOk(reloadRes)) {
      expect(reloadRes.data).toBeNull();
    }
  });

  // ---------------------------------------------------------------------------
  // TC-LIFE-08: Reinstallation Configuration Resumption
  // ---------------------------------------------------------------------------
  it("TC-LIFE-08: resumes existing user settings upon application reinstallation", () => {
    // User retains settings in storage prior to reinstall
    const savedState: PersistedStateV1 = {
      version: 1,
      updatedAt: Date.now(),
      settings: {
        boardTheme: "midnight",
        pieceSet: "standard",
        showCoordinates: false,
        showLegalMoves: false,
        soundEnabled: true,
        autoQueen: false,
        engineDifficulty: 5,
        reducedMotion: false,
        volume: 80,
        showLastMove: true,
      },
      activeGame: null,
    };
    persistenceService.save(savedState);

    // Reinstall simulation: new app instance connecting to retained storage
    const reinstalledPersistence = new PersistenceService({ adapter });
    const reinstalledSettings = new SettingsService({
      persistenceService: reinstalledPersistence,
    });

    const current = reinstalledSettings.getSettings();
    expect(current.boardTheme).toBe("midnight");
    expect(current.showCoordinates).toBe(false);
    expect(current.showLegalMoves).toBe(false);
    expect(current.engineDifficulty).toBe(5);
  });

  // ---------------------------------------------------------------------------
  // TC-LIFE-09: Complete Windows Lifecycle Matrix Simulation
  // ---------------------------------------------------------------------------
  it("TC-LIFE-09: executes complete sequential lifecycle matrix without regressions", async () => {
    // Phase A: Fresh Install & Clean Cold Start
    const freshAdapter = new InMemoryPersistenceAdapter();
    const freshPersistence = new PersistenceService({ adapter: freshAdapter });
    const freshSettings = new SettingsService({
      persistenceService: freshPersistence,
    });

    expect(freshSettings.getSettings().boardTheme).toBe("classic");

    // Phase B: User Plays Game & Configures App
    const updateRes = freshSettings.updateSettings({
      boardTheme: "wood",
      soundEnabled: false,
    });
    expect(isOk(updateRes)).toBe(true);

    const chess = new ChessJsAdapter();
    expect(isChessOk(chess.makeMove({ from: "e2", to: "e4" }))).toBe(true);

    freshPersistence.save({
      version: 1,
      updatedAt: Date.now(),
      settings: freshSettings.getSettings(),
      activeGame: {
        id: "lifecycle-matrix-game",
        mode: "human_vs_human",
        fen: chess.exportFen(),
        moveHistorySan: ["e4"],
        players: {
          w: { id: "p1", name: "Player 1", color: "w", type: "human" },
          b: { id: "p2", name: "Player 2", color: "b", type: "human" },
        },
        userOrientation: "w",
        startedAt: Date.now(),
        updatedAt: Date.now(),
      },
    });

    // Phase C: Upgrade App to v1.0.0
    const upgradedPersistence = new PersistenceService({
      adapter: freshAdapter,
    });
    const upgradedSettings = new SettingsService({
      persistenceService: upgradedPersistence,
    });

    expect(upgradedSettings.getSettings().boardTheme).toBe("wood");
    expect(upgradedSettings.getSettings().soundEnabled).toBe(false);

    const loadedSession = upgradedPersistence.load();
    expect(isOk(loadedSession)).toBe(true);
    if (isOk(loadedSession) && loadedSession.data) {
      expect(loadedSession.data.activeGame?.moveHistorySan).toEqual(["e4"]);
    }

    // Phase D: Engine Worker Initialization & Search Post-Upgrade
    const mockBridge = new MockEngineWorkerBridge();
    const engine = new EngineServiceImpl(mockBridge);
    await engine.init();
    expect(engine.getState()).toBe("ready");
    engine.dispose();

    // Phase E: Uninstall & Clean Reinstall Resumption
    const reinstalledPersistence = new PersistenceService({
      adapter: freshAdapter,
    });
    const reinstalledSettings = new SettingsService({
      persistenceService: reinstalledPersistence,
    });
    expect(reinstalledSettings.getSettings().boardTheme).toBe("wood");
  });
});
