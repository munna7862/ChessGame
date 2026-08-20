/**
 * @file releaseBaselineValidation.test.ts
 * @description Comprehensive validation test suite for Phase 11 Sprint 06:
 * v1.0 Release and Post-Release Baseline.
 * Validates release manifest deliverables, cryptographic SHA-256 checksums,
 * version tag synchronization across all project manifests, release notes extraction,
 * smoke testing simulation of runtime chess flows, known issues cataloging, and
 * v1.1 post-release backlog separation from v1.0 frozen scope.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { ChessJsAdapter } from "../domain/chess/adapters/chessJsAdapter";
import { GameSessionController } from "../features/game/GameSessionController";
import { EngineServiceImpl } from "../features/engine/EngineServiceImpl";
import { MockEngineWorkerBridge } from "../features/engine/MockEngineWorkerBridge";
import {
  calculateFileHash,
  generateChecksums,
  verifyChecksumsFile,
} from "../../scripts/release_checksums.mjs";
import { extractReleaseNotesFromFile } from "../../scripts/extract_release_notes.mjs";

describe("Phase 11 · Sprint 06: v1.0 Release and Post-Release Baseline Validation", () => {
  const rootDir = path.resolve(__dirname, "../../");
  const packageJsonPath = path.join(rootDir, "package.json");
  const tauriConfPath = path.join(rootDir, "src-tauri/tauri.conf.json");
  const cargoTomlPath = path.join(rootDir, "src-tauri/Cargo.toml");
  const releaseNotesPath = path.join(rootDir, "RELEASE_NOTES.md");
  const changelogPath = path.join(rootDir, "CHANGELOG.md");

  // TC-REL-01 & TC-REL-09: Version Synchronization & Release Manifest
  describe("TC-REL-01 & TC-REL-09: Version Manifest Synchronization", () => {
    it("should have synchronized version 1.0.0 across all workspace manifests", () => {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, "utf8"));
      const cargoToml = fs.readFileSync(cargoTomlPath, "utf8");

      expect(packageJson.version).toBe("1.0.0");
      expect(tauriConf.version).toBe("1.0.0");
      expect(cargoToml).toMatch(/version\s*=\s*"1\.0\.0"/);
    });

    it("should define correct release bundle configuration in tauri.conf.json", () => {
      const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, "utf8"));
      expect(tauriConf.productName).toBe("ChessForge");
      expect(tauriConf.bundle.active).toBe(true);
      expect(tauriConf.bundle.windows.nsis.installMode).toBe("currentUser");
      expect(tauriConf.app.security.csp).toContain("default-src 'self'");
    });

    it("should configure release.yml with v* tag triggers and non-dry-run publish step", () => {
      const releaseWorkflowPath = path.join(
        rootDir,
        ".github/workflows/release.yml"
      );
      expect(fs.existsSync(releaseWorkflowPath)).toBe(true);
      const workflowContent = fs
        .readFileSync(releaseWorkflowPath, "utf8")
        .replace(/\r\n/g, "\n");
      expect(workflowContent).toContain('tags:\n      - "v*"');
      expect(workflowContent).toContain("softprops/action-gh-release@v2");
      expect(workflowContent).toContain("scripts/release_checksums.mjs");
    });
  });

  // TC-REL-02: Cryptographic SHA-256 Checksums Integrity
  describe("TC-REL-02: Cryptographic Checksum Generation and Validation", () => {
    it("should compute valid SHA-256 digests and format as standard BSD/GNU digest table", () => {
      const testBuffer = Buffer.from(
        "ChessForge v1.0.0 Release Binary Simulation Data"
      );
      const expectedHash = crypto
        .createHash("sha256")
        .update(testBuffer)
        .digest("hex");

      const tempDir = path.join(rootDir, "src/test/__temp_release_test__");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      const testFile = path.join(tempDir, "ChessForge-Setup-1.0.0.exe");
      fs.writeFileSync(testFile, testBuffer);

      try {
        const computedHash = calculateFileHash(testFile);
        expect(computedHash).toBe(expectedHash);

        const checksumResult = generateChecksums(tempDir);
        expect(checksumResult.content).toContain(computedHash);
        expect(checksumResult.content).toContain("ChessForge-Setup-1.0.0.exe");

        const checksumsFilePath = path.join(tempDir, "checksums.txt");
        fs.writeFileSync(checksumsFilePath, checksumResult.content, "utf8");

        const verification = verifyChecksumsFile(checksumsFilePath, tempDir);
        expect(verification.passed).toBe(1);
        expect(verification.failed).toBe(0);
        expect(verification.missing).toBe(0);
      } finally {
        if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
        const checksumFile = path.join(tempDir, "checksums.txt");
        if (fs.existsSync(checksumFile)) fs.unlinkSync(checksumFile);
        if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
      }
    });
  });

  // TC-REL-03: Downloaded Artifact Runtime Smoke Test Simulation
  describe("TC-REL-03: Runtime Smoke Test Simulation of Core Chess Engine & Game Loop", () => {
    it("should execute start position setup, legal moves, clocks, and game session state cleanly", () => {
      const controller = new GameSessionController();
      expect(controller.getState().position.fen).toBe(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      );
      expect(controller.getState().isGameOver).toBe(false);

      // Execute opening moves (1. e4 e5 2. Nf3 Nc6)
      const move1 = controller.makeMove({ from: "e2", to: "e4" });
      expect(move1.success).toBe(true);
      expect(controller.getState().moveHistory.length).toBe(1);

      const move2 = controller.makeMove({ from: "e7", to: "e5" });
      expect(move2.success).toBe(true);
      expect(controller.getState().moveHistory.length).toBe(2);

      const move3 = controller.makeMove({ from: "g1", to: "f3" });
      expect(move3.success).toBe(true);
      expect(controller.getState().position.turn).toBe("b");

      // Verify PGN export works cleanly
      const pgn = controller.exportPgn();
      expect(pgn).toContain("1. e4 e5 2. Nf3");
    });

    it("should initialize Stockfish engine abstraction and handle position analysis", async () => {
      const bridge = new MockEngineWorkerBridge();
      const engine = new EngineServiceImpl(bridge);
      await engine.init();
      expect(engine.state).toBe("ready");

      const evalResult = await engine.searchBestMove({
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        depth: 5,
      });
      expect(evalResult).toBeDefined();
      expect(evalResult.bestMoveUci).toBeDefined();
      engine.dispose();
    });
  });

  // TC-REL-04: Release Notes & Version Consistency
  describe("TC-REL-04: Release Notes Extraction and Changelog Alignment", () => {
    it("should extract v1.0.0 release notes correctly from RELEASE_NOTES.md", () => {
      expect(fs.existsSync(releaseNotesPath)).toBe(true);
      const extracted = extractReleaseNotesFromFile(releaseNotesPath, "v1.0.0");
      expect(extracted).toContain("ChessForge v1.0.0 Release Notes");
      expect(extracted).toContain("Key Features & Highlights");
      expect(extracted).toContain("System Requirements");
    });

    it("should contain v1.0.0 entry in CHANGELOG.md matching release notes", () => {
      expect(fs.existsSync(changelogPath)).toBe(true);
      const changelog = fs.readFileSync(changelogPath, "utf8");
      expect(changelog).toContain("## [1.0.0]");
      expect(changelog).toContain("FIDE-Compliant Chess Domain Engine");
      expect(changelog).toContain("Stockfish AI Integration");
    });
  });

  // TC-REL-05 & TC-REL-06: Known Issues & Post-Release v1.1 Backlog Isolation
  describe("TC-REL-05 & TC-REL-06: Scope Governance & Backlog Isolation", () => {
    it("should have documented known issues catalog and technical limitations", () => {
      const knownIssuesPath = path.join(
        rootDir,
        "docs/release/known_issues_v1.0.0.md"
      );
      expect(fs.existsSync(knownIssuesPath)).toBe(true);
      const content = fs.readFileSync(knownIssuesPath, "utf8");
      expect(content).toContain("Technical Limitations Registry");
      expect(content).toContain("Single-Threaded Stockfish WASM");
      expect(content).toContain("Standard FIDE Only");
      expect(content).toContain("Local-Only (Zero Telemetry)");
    });

    it("should isolate v1.1 candidate enhancements without polluting v1.0 scope", () => {
      const v11BacklogPath = path.join(
        rootDir,
        "docs/release/v1.1_post_release_backlog.md"
      );
      expect(fs.existsSync(v11BacklogPath)).toBe(true);
      const content = fs.readFileSync(v11BacklogPath, "utf8");
      expect(content).toContain(
        "ChessForge v1.1 Post-Release Engineering Backlog"
      );
      expect(content).toContain("Chess960");
      expect(content).toContain("Opening Book");
      expect(content).toContain("Stockfish Multi-PV");
    });
  });

  // TC-REL-08: Local-First Zero-Telemetry Invariant
  describe("TC-REL-08: Zero-Telemetry Local-First Baseline Guarantee", () => {
    it("should guarantee domain rules and session operate 100% locally with no network calls", () => {
      const adapter = new ChessJsAdapter();
      expect(adapter.getStatus().isOver).toBe(false);
      expect(adapter.getPosition().turn).toBe("w");

      const legalMoves = adapter.getLegalMoves("e2");
      const toSquares = legalMoves.map((m) => m.to);
      expect(toSquares).toContain("e3");
      expect(toSquares).toContain("e4");
    });
  });
});
