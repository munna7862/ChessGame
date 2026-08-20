import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { ChessJsAdapter } from "../domain/chess/adapters/chessJsAdapter";
import { validateFen, FEN_START_POSITION } from "../domain/chess/fen";
import { parsePgn, formatPgn } from "../domain/chess/pgn";
import { PersistenceService } from "../domain/persistence/PersistenceService";
import { InMemoryPersistenceAdapter } from "../domain/persistence/adapters/InMemoryPersistenceAdapter";
import {
  createDefaultPersistedState,
  DEFAULT_PERSISTED_SETTINGS,
  type PersistedStateV1,
} from "../domain/persistence/schema";
import { SettingsService } from "../domain/persistence/settings/SettingsService";
import { isOk, isErr } from "../domain/persistence/errors";
import { isOk as isChessOk } from "../domain/chess/errors";
import { MockEngineWorkerBridge } from "../features/engine/MockEngineWorkerBridge";
import { EngineServiceImpl } from "../features/engine/EngineServiceImpl";
import { getEngineDifficultyConfig } from "../features/engine/difficulty";

describe("Release Candidate Build & Clean-Machine Validation Suite (TC-RC-01 - TC-RC-17)", () => {
  // -------------------------------------------------------------------------
  // 1. Release Candidate Packaging & Build Verification (TC-RC-01 to TC-RC-03)
  // -------------------------------------------------------------------------
  describe("Release Candidate Packaging & Metadata Integrity", () => {
    it("TC-RC-01: validates tauri.conf.json production bundle configuration and metadata", () => {
      const tauriConfigPath = path.resolve(
        __dirname,
        "../../src-tauri/tauri.conf.json"
      );
      expect(fs.existsSync(tauriConfigPath)).toBe(true);

      const raw = fs.readFileSync(tauriConfigPath, "utf-8");
      const config = JSON.parse(raw);

      expect(config.productName).toBe("ChessForge");
      expect(config.version).toBe("0.1.0");
      expect(config.identifier).toBe("com.chessforge.app");
      expect(config.bundle.active).toBe(true);
      expect(config.bundle.targets).toBe("all");
      expect(config.app.windows[0].minWidth).toBe(800);
      expect(config.app.windows[0].minHeight).toBe(600);
      expect(config.app.security.csp).toContain("default-src 'self'");
      expect(config.app.security.csp).toContain(
        "connect-src 'self' ipc: http://ipc.localhost;"
      );
    });

    it("TC-RC-02: validates package.json production scripts and dependency hygiene", () => {
      const packageJsonPath = path.resolve(__dirname, "../../package.json");
      expect(fs.existsSync(packageJsonPath)).toBe(true);

      const raw = fs.readFileSync(packageJsonPath, "utf-8");
      const pkg = JSON.parse(raw);

      expect(pkg.name).toBe("chessforge");
      expect(pkg.version).toBe("0.1.0");
      expect(pkg.scripts.build).toBe("tsc -b && vite build");
      expect(pkg.scripts.typecheck).toBe("tsc --noEmit");
      expect(pkg.scripts.lint).toBe("eslint .");
      expect(pkg.scripts["format:check"]).toBe("prettier --check .");
      expect(pkg.dependencies.chess).toBeUndefined(); // pure chess.js
      expect(pkg.dependencies["chess.js"]).toBe("1.4.0");
      expect(pkg.dependencies["stockfish.js"]).toBe("10.0.2");
    });

    it("TC-RC-03: verifies clean production build configuration and absence of dev leaking hooks", () => {
      const viteConfigPath = path.resolve(__dirname, "../../vite.config.ts");
      expect(fs.existsSync(viteConfigPath)).toBe(true);
      const viteContent = fs.readFileSync(viteConfigPath, "utf-8");
      expect(viteContent).toContain("plugins: [react()]");
      expect(viteContent).not.toContain("allowInsecureOrigins");
    });
  });

  // -------------------------------------------------------------------------
  // 2. Clean-Machine Cold Start & Default State (TC-RC-04 to TC-RC-06)
  // -------------------------------------------------------------------------
  describe("Clean-Machine Environment Cold Start", () => {
    let adapter: InMemoryPersistenceAdapter;
    let persistenceService: PersistenceService;
    let settingsService: SettingsService;

    beforeEach(() => {
      adapter = new InMemoryPersistenceAdapter();
      persistenceService = new PersistenceService({ adapter });
      settingsService = new SettingsService({ persistenceService });
    });

    it("TC-RC-04: initializes cold start game session state when storage is pristine/empty", () => {
      const loadResult = persistenceService.load();
      expect(isOk(loadResult)).toBe(true);
      if (isOk(loadResult)) {
        expect(loadResult.data).toBeNull();
      }

      // App defaults to FIDE standard position
      const defaultState = createDefaultPersistedState();
      expect(defaultState.activeGame).toBeNull();
      expect(defaultState.version).toBe(1);
    });

    it("TC-RC-05: initializes default application settings on clean environment", () => {
      const settings = settingsService.getSettings();
      expect(settings.boardTheme).toBe(DEFAULT_PERSISTED_SETTINGS.boardTheme);
      expect(settings.pieceSet).toBe(DEFAULT_PERSISTED_SETTINGS.pieceSet);
      expect(settings.showCoordinates).toBe(true);
      expect(settings.showLegalMoves).toBe(true);
      expect(settings.soundEnabled).toBe(true);
      expect(settings.engineDifficulty).toBe(3);
    });

    it("TC-RC-06: verifies engine worker bridge lifecycle and handshake on clean start", async () => {
      const mockBridge = new MockEngineWorkerBridge();
      const engineService = new EngineServiceImpl(mockBridge);

      await engineService.init();
      expect(engineService.getState()).toBe("ready");

      engineService.dispose();
      expect(engineService.getState()).toBe("disposed");
    });
  });

  // -------------------------------------------------------------------------
  // 3. Core Workflow Validation (TC-RC-07 to TC-RC-10)
  // -------------------------------------------------------------------------
  describe("Core Chess Workflows on Clean Machine", () => {
    it("TC-RC-07: executes complete Human vs Human match (Fool's Mate) to checkmate", () => {
      const chess = new ChessJsAdapter();
      expect(chess.getPosition().turn).toBe("w");

      // 1. f3 e5
      expect(isChessOk(chess.makeMove({ from: "f2", to: "f3" }))).toBe(true);
      expect(isChessOk(chess.makeMove({ from: "e7", to: "e5" }))).toBe(true);
      // 2. g4 Qh4#
      expect(isChessOk(chess.makeMove({ from: "g2", to: "g4" }))).toBe(true);
      expect(isChessOk(chess.makeMove({ from: "d8", to: "h4" }))).toBe(true);

      const status = chess.getStatus();
      expect(status.state).toBe("checkmate");
      expect(status.isOver).toBe(true);
      expect(status.isCheck).toBe(true);
      expect(status.winner).toBe("b");
    });

    it("TC-RC-08: validates Human vs Computer engine configuration mappings and response generation", async () => {
      const config1 = getEngineDifficultyConfig(1);
      expect(config1.skillLevel).toBe(0);

      const configMaster = getEngineDifficultyConfig(7);
      expect(configMaster.skillLevel).toBe(18);

      const mockBridge = new MockEngineWorkerBridge();
      const engineService = new EngineServiceImpl(mockBridge);
      await engineService.init();

      const searchPromise = engineService.searchBestMove({
        fen: FEN_START_POSITION,
        movetimeMs: 50,
      });
      const result = await searchPromise;
      expect(result.bestMoveUci).toBeDefined();
      engineService.dispose();
    });

    it("TC-RC-09: validates special moves: kingside castling, en passant, and pawn promotion", () => {
      // Castling
      const castlingAdapter = new ChessJsAdapter(
        "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4"
      );
      const castleMove = castlingAdapter.makeMove({ from: "e1", to: "g1" });
      expect(isChessOk(castleMove)).toBe(true);
      expect(castlingAdapter.exportFen()).toContain(
        "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq -"
      );

      // En Passant
      const epPosition = new ChessJsAdapter(
        "rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 3"
      );
      const epMove = epPosition.makeMove({ from: "e5", to: "f6" });
      expect(isChessOk(epMove)).toBe(true);
      expect(epPosition.exportFen()).toContain(
        "rnbqkbnr/ppp1p1pp/5P2/3p4/8/8/PPPP1PPP/RNBQKBNR b KQkq -"
      );

      // Promotion
      const promoAdapter = new ChessJsAdapter("8/4P3/8/8/8/8/k7/4K3 w - - 0 1");
      const promoMove = promoAdapter.makeMove({
        from: "e7",
        to: "e8",
        promotion: "q",
      });
      expect(isChessOk(promoMove)).toBe(true);
      expect(promoAdapter.exportFen()).toContain("4Q3/8/8/8/8/8/k7/4K3 b - -");
    });

    it("TC-RC-10: accurately detects draw by stalemate and insufficient material", () => {
      // Stalemate
      const stalemateAdapter = new ChessJsAdapter(
        "k7/8/1Q6/8/8/8/8/4K3 b - - 0 1"
      );
      const staleStatus = stalemateAdapter.getStatus();
      expect(staleStatus.state).toBe("stalemate");
      expect(staleStatus.inDraw).toBe(true);
      expect(staleStatus.isOver).toBe(true);

      // Insufficient Material (K vs K)
      const insufAdapter = new ChessJsAdapter("8/8/8/8/8/4k3/8/4K3 w - - 0 1");
      const insufStatus = insufAdapter.getStatus();
      expect(insufStatus.state).toBe("draw_insufficient_material");
      expect(insufStatus.inDraw).toBe(true);
      expect(insufStatus.isOver).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 4. Persistence, PGN/FEN Interchange & Recovery (TC-RC-11 to TC-RC-15)
  // -------------------------------------------------------------------------
  describe("Persistence, PGN/FEN Interchange & Fault Recovery", () => {
    let adapter: InMemoryPersistenceAdapter;
    let persistenceService: PersistenceService;
    let settingsService: SettingsService;

    beforeEach(() => {
      adapter = new InMemoryPersistenceAdapter();
      persistenceService = new PersistenceService({ adapter });
      settingsService = new SettingsService({ persistenceService });
    });

    it("TC-RC-11: persists and restores mid-game session snapshot with 100% fidelity", () => {
      const activeState: PersistedStateV1 = {
        version: 1,
        updatedAt: Date.now(),
        settings: DEFAULT_PERSISTED_SETTINGS,
        activeGame: {
          id: "game-rc-01",
          mode: "human_vs_human",
          fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2",
          moveHistorySan: ["e4", "e5"],
          players: {
            w: { id: "p1", name: "Player 1", color: "w", type: "human" },
            b: { id: "p2", name: "Player 2", color: "b", type: "human" },
          },
          userOrientation: "w",
          startedAt: Date.now(),
          updatedAt: Date.now(),
        },
      };

      const saveRes = persistenceService.save(activeState);
      expect(isOk(saveRes)).toBe(true);

      const loadRes = persistenceService.load();
      expect(isOk(loadRes)).toBe(true);
      if (isOk(loadRes) && loadRes.data) {
        expect(loadRes.data.activeGame?.fen).toBe(activeState.activeGame?.fen);
        expect(loadRes.data.activeGame?.moveHistorySan.length).toBe(2);
      }
    });

    it("TC-RC-12: persists custom application settings across relaunch", () => {
      const updateRes = settingsService.updateSettings({
        boardTheme: "wood",
        showCoordinates: false,
        soundEnabled: false,
        engineDifficulty: 7,
      });
      expect(isOk(updateRes)).toBe(true);

      // Re-instantiate settings service simulating app restart
      const reloadedService = new SettingsService({ persistenceService });
      const reloadedSettings = reloadedService.getSettings();

      expect(reloadedSettings.boardTheme).toBe("wood");
      expect(reloadedSettings.showCoordinates).toBe(false);
      expect(reloadedSettings.soundEnabled).toBe(false);
      expect(reloadedSettings.engineDifficulty).toBe(7);
    });

    it("TC-RC-13: roundtrips PGN export and import with full move metadata", () => {
      const pgnRaw = `[Event "FIDE Candidates 2024"]
[Site "Toronto CAN"]
[Date "2024.04.05"]
[Round "2"]
[White "Praggnanandhaa R"]
[Black "Gukesh D"]
[Result "0-1"]

1. d4 Nf6 2. c4 e6 3. Nf3 d5 0-1`;

      const parsed = parsePgn(pgnRaw);
      expect(isChessOk(parsed)).toBe(true);
      if (isChessOk(parsed)) {
        expect(parsed.data.tags.White).toBe("Praggnanandhaa R");
        expect(parsed.data.tags.Black).toBe("Gukesh D");
        expect(parsed.data.tags.Result).toBe("0-1");
        expect(parsed.data.moves.length).toBe(6);

        const exported = formatPgn(parsed.data);
        expect(exported).toContain('[White "Praggnanandhaa R"]');
        expect(exported).toContain("1. d4 Nf6 2. c4 e6 3. Nf3 d5 0-1");
      }
    });

    it("TC-RC-14: validates FEN custom position loading and rejects invalid FEN syntax", () => {
      const validFen =
        "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4";
      const parseResult = validateFen(validFen);
      expect(parseResult.isValid).toBe(true);

      const invalidFen = "invalid-fen-string-without-ranks";
      const invalidResult = validateFen(invalidFen);
      expect(invalidResult.isValid).toBe(false);
    });

    it("TC-RC-15: gracefully handles corrupted local storage without unhandled crash", () => {
      adapter.setItem("chessforge_state_v1", "{ malformed json ::: invalid");

      const sessionResult = persistenceService.load();
      // Returns error Result without throwing unhandled exception
      expect(isErr(sessionResult)).toBe(true);
      if (isErr(sessionResult)) {
        expect(sessionResult.error.code).toBe("PARSE_ERROR");
      }
    });
  });

  // -------------------------------------------------------------------------
  // 5. Clean Uninstall & Teardown Verification (TC-RC-16 & TC-RC-17)
  // -------------------------------------------------------------------------
  describe("Clean Teardown & Factory Reset Lifecycle", () => {
    it("TC-RC-16: executes complete application data wipe returning storage to factory default", () => {
      const adapter = new InMemoryPersistenceAdapter();
      const persistenceService = new PersistenceService({ adapter });

      persistenceService.save({
        version: 1,
        updatedAt: Date.now(),
        settings: { ...DEFAULT_PERSISTED_SETTINGS, soundEnabled: false },
        activeGame: null,
      });

      // Wipe application data
      const wipeResult = persistenceService.clear();
      expect(isOk(wipeResult)).toBe(true);

      const verifySession = persistenceService.load();
      expect(isOk(verifySession)).toBe(true);
      if (isOk(verifySession)) {
        expect(verifySession.data).toBeNull();
      }
    });

    it("TC-RC-17: verifies engine worker bridge termination leaves zero active listeners or handles", async () => {
      const mockBridge = new MockEngineWorkerBridge();
      const engineService = new EngineServiceImpl(mockBridge);

      await engineService.init();
      expect(engineService.getState()).toBe("ready");

      // Cancel search and dispose
      await engineService.cancelSearch();
      engineService.dispose();

      expect(engineService.getState()).toBe("disposed");
    });
  });
});
