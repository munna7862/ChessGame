import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { validateFen } from "../domain/chess/fen";
import { parsePgn, formatPgn } from "../domain/chess/pgn";
import { ChessJsAdapter } from "../domain/chess/adapters/chessJsAdapter";
import type { Square } from "../domain/chess/types";

describe("Phase 10 · Sprint 06: Security & Dependency Audit Suite", () => {
  const rootDir = path.resolve(__dirname, "../../");

  describe("TC-SEC-01: Tauri Capabilities & Principle of Least Privilege", () => {
    it("enforces strict scoped capabilities in src-tauri/capabilities/default.json", () => {
      const capFilePath = path.join(
        rootDir,
        "src-tauri/capabilities/default.json"
      );
      expect(fs.existsSync(capFilePath)).toBe(true);

      const capContent = JSON.parse(fs.readFileSync(capFilePath, "utf-8"));
      expect(capContent.identifier).toBe("default");
      expect(capContent.windows).toContain("main");

      // Only core:default is permitted; no shell, fs wildcard, or http permissions
      expect(capContent.permissions).toEqual(["core:default"]);
      expect(capContent.permissions).not.toContain("shell:default");
      expect(capContent.permissions).not.toContain("shell:allow-execute");
      expect(capContent.permissions).not.toContain("fs:default");
      expect(capContent.permissions).not.toContain("fs:allow-read");
      expect(capContent.permissions).not.toContain("http:default");
    });

    it("verifies minimal dependencies in src-tauri/Cargo.toml with no shell or network plugins", () => {
      const cargoTomlPath = path.join(rootDir, "src-tauri/Cargo.toml");
      expect(fs.existsSync(cargoTomlPath)).toBe(true);

      const cargoContent = fs.readFileSync(cargoTomlPath, "utf-8");
      expect(cargoContent).not.toContain("tauri-plugin-shell");
      expect(cargoContent).not.toContain("tauri-plugin-http");
      expect(cargoContent).not.toContain("tauri-plugin-websocket");
      expect(cargoContent).not.toContain("reqwest");
    });
  });

  describe("TC-SEC-02: Content Security Policy (CSP) & Network Boundary", () => {
    it("enforces strict local-first CSP in src-tauri/tauri.conf.json", () => {
      const tauriConfPath = path.join(rootDir, "src-tauri/tauri.conf.json");
      expect(fs.existsSync(tauriConfPath)).toBe(true);

      const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, "utf-8"));
      expect(tauriConf.app).toBeDefined();
      expect(tauriConf.app.security).toBeDefined();

      const csp = tauriConf.app.security.csp as string;
      expect(csp).toBeDefined();

      // Verify default-src is self
      expect(csp).toContain("default-src 'self'");

      // Verify connect-src is restricted strictly to local IPC endpoints (no remote hosts)
      expect(csp).toContain("connect-src 'self' ipc: http://ipc.localhost;");
      expect(csp).not.toContain("connect-src *");
      expect(csp).not.toContain("https://");
      expect(csp).not.toContain("http://*");
    });
  });

  describe("TC-SEC-03: Untrusted FEN & PGN Input Sanitization", () => {
    it("safely rejects malicious, malformed, and XSS FEN strings without throwing unhandled exceptions", () => {
      const adversarialFens = [
        "",
        "   ",
        "<script>alert('xss')</script>",
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 99 extra",
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR x KQkq - 0 1",
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w Jk - 0 1",
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq e9 0 1",
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - -5 1",
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 -1",
        "2k5/8/8/8/8/8/8/2K5/8 w - - 0 1", // 9 ranks
        "2k4/8/8/8/8/8/8/2K5 w - - 0 1", // rank length 6
        "2k5/8/8/8/8/8/8/2KK4 w - - 0 1", // 2 white kings
        "8/8/8/8/8/8/8/8 w - - 0 1", // 0 kings
        "p7/8/8/8/8/8/8/2K1k3 w - - 0 1", // pawn on 8th rank
        "A".repeat(10000), // buffer stress
      ];

      for (const fen of adversarialFens) {
        const result = validateFen(fen);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
        expect(typeof result.error).toBe("string");
      }
    });

    it("safely parses and escapes adversarial PGN inputs (XSS tags, SQL payloads, nested structures)", () => {
      const maliciousPgn = `[Event "<script>alert('XSS Attack!')</script>"]
[Site "'; DROP TABLE Games; --"]
[Date "2026.08.20"]
[Round "1"]
[White "Attacker <img src=x onerror=alert(1)>"]
[Black "Defender & ' \\" \`"]
[Result "1-0"]

{ Adversarial comment with <script>eval('evil')</script> }
1. e4 { [%clk 0:05:00] } 1... e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 1-0`;

      const result = parsePgn(maliciousPgn);
      expect(result.success).toBe(true);
      if (result.success) {
        const game = result.data;
        expect(game.tags.Event).toBe("<script>alert('XSS Attack!')</script>");
        expect(game.tags.Site).toBe("'; DROP TABLE Games; --");
        expect(game.tags.White).toBe("Attacker <img src=x onerror=alert(1)>");
        expect(game.moves.length).toBe(8);
        expect(game.result).toBe("1-0");

        // Generating PGN roundtrip retains structure safely
        const serialized = formatPgn({
          tags: game.tags,
          historySan: game.moves,
          result: game.result,
        });
        expect(serialized).toContain(
          "[Event \"<script>alert('XSS Attack!')</script>\"]"
        );
      }
    });

    it("rejects corrupted PGN inputs with Result error contract", () => {
      const corruptPgn = "";
      const result = parsePgn(corruptPgn);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("INVALID_PGN");
      }
    });
  });

  describe("TC-SEC-04: Engine UCI Output Validation via Domain Invariants", () => {
    it("validates that illegal UCI moves from engine output cannot be applied to domain state", () => {
      const adapter = new ChessJsAdapter();

      // Valid starting legal move
      const legalMove = adapter.makeMove({
        from: "e2" as Square,
        to: "e4" as Square,
      });
      expect(legalMove.success).toBe(true);

      // Illegal move (pawn jump to e5 on turn 1)
      const illegalMove = adapter.makeMove({
        from: "e7" as Square, // It's black's turn now, let's try illegal jump e7->e4
        to: "e4" as Square,
      });
      expect(illegalMove.success).toBe(false);

      // Attempting to apply invalid move returns error Result
      if (!illegalMove.success) {
        expect(illegalMove.error.code).toBe("ILLEGAL_MOVE");
      }

      // Invalid square coordinates from malformed engine message
      const invalidSquareMove = adapter.makeMove({
        from: "z9" as Square,
        to: "e4" as Square,
      });
      expect(invalidSquareMove.success).toBe(false);
      if (!invalidSquareMove.success) {
        expect(invalidSquareMove.error.code).toBe("INVALID_SQUARE");
      }
    });
  });

  describe("TC-SEC-05: Secret Scanning & Zero Credential Leakage", () => {
    it("verifies zero hardcoded private keys, AWS tokens, GitHub PATs, or secrets in source files", () => {
      const srcDir = path.join(rootDir, "src");
      const secretPatterns = [
        /-----BEGIN [A-Z]+ PRIVATE KEY-----/,
        /AKIA[0-9A-Z]{16}/,
        /ghp_[a-zA-Z0-9]{36}/,
        /github_pat_[a-zA-Z0-9_]{82}/,
        /sk-[a-zA-Z0-9]{48}/,
        /xox[baprs]-[0-9a-zA-Z]{10,48}/,
      ];

      function scanDirectory(dir: string): void {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            if (entry.name !== "node_modules" && entry.name !== ".git") {
              scanDirectory(fullPath);
            }
          } else if (
            /\.(ts|tsx|js|jsx|json|css|html|md|rs|toml)$/.test(entry.name)
          ) {
            const content = fs.readFileSync(fullPath, "utf-8");
            for (const pattern of secretPatterns) {
              const match = pattern.exec(content);
              expect(
                match,
                `Potential hardcoded secret detected in ${fullPath}: ${match?.[0]}`
              ).toBeNull();
            }
          }
        }
      }

      scanDirectory(srcDir);
    });
  });

  describe("TC-SEC-06: Supply Chain & Dependency Audit", () => {
    it("verifies package.json contains locked dependencies with no unvetted external telemetry packages", () => {
      const packageJsonPath = path.join(rootDir, "package.json");
      expect(fs.existsSync(packageJsonPath)).toBe(true);

      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
      };

      const forbiddenPackages = [
        "google-analytics",
        "mixpanel",
        "mixpanel-browser",
        "posthog-js",
        "@sentry/browser",
        "@sentry/react",
        "amplitude-js",
        "@amplitude/analytics-browser",
        "axios",
      ];

      for (const forbidden of forbiddenPackages) {
        expect(allDeps[forbidden]).toBeUndefined();
      }
    });
  });

  describe("TC-SEC-07: Offline Privacy & Zero Remote Telemetry Invariant", () => {
    it("verifies that production source code contains zero remote telemetry or tracking endpoints", () => {
      const srcDir = path.join(rootDir, "src");
      const telemetryPatterns = [
        /google-analytics\.com/i,
        /analytics\.google\.com/i,
        /api\.mixpanel\.com/i,
        /sentry\.io/i,
        /segment\.io/i,
      ];

      function scanSrc(dir: string): void {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            scanSrc(fullPath);
          } else if (
            /\.(ts|tsx)$/.test(entry.name) &&
            !entry.name.includes(".test.") &&
            !entry.name.includes(".spec.")
          ) {
            const content = fs.readFileSync(fullPath, "utf-8");
            for (const pattern of telemetryPatterns) {
              const match = pattern.exec(content);
              expect(
                match,
                `Prohibited remote telemetry endpoint pattern found in ${fullPath}`
              ).toBeNull();
            }
          }
        }
      }

      scanSrc(srcDir);
    });
  });
});
