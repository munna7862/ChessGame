import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

describe("Phase 11 · Sprint 03: Code Signing and Release Security", () => {
  const rootDir = path.resolve(__dirname, "../../");
  const gitignorePath = path.join(rootDir, ".gitignore");
  const ciWorkflowPath = path.join(rootDir, ".github/workflows/ci.yml");
  const releaseGuidePath = path.join(
    rootDir,
    "docs/release/code_signing_and_release_security_guide.md"
  );
  const packagingGuidePath = path.join(
    rootDir,
    "docs/release/windows_packaging_guide.md"
  );
  const tauriConfigPath = path.join(rootDir, "src-tauri/tauri.conf.json");

  it("TC-SEC-SIGN-01: verifies .gitignore excludes certificate and private key files", () => {
    expect(fs.existsSync(gitignorePath)).toBe(true);
    const gitignoreContent = fs.readFileSync(gitignorePath, "utf-8");

    const requiredPatterns = [
      "*.pfx",
      "*.p12",
      "*.key",
      "*.snk",
      "*.sig",
      "*.cert",
      "*.cer",
      "*.crt",
      "*.pem",
      "*.asc",
      "*.der",
      "*.jks",
      "*.keystore",
      "secrets/",
      "credentials/",
    ];

    for (const pattern of requiredPatterns) {
      expect(
        gitignoreContent,
        `Expected .gitignore to contain pattern: ${pattern}`
      ).toContain(pattern);
    }
  });

  it("TC-SEC-SIGN-02: verifies CI release workflow securely references secrets with proper cleanup", () => {
    expect(fs.existsSync(ciWorkflowPath)).toBe(true);
    const ciContent = fs.readFileSync(ciWorkflowPath, "utf-8");

    expect(ciContent).toContain("secrets.WINDOWS_CERTIFICATE_BASE64");
    expect(ciContent).toContain("secrets.WINDOWS_CERTIFICATE_PASSWORD");
    expect(ciContent).toContain("SIGNTOOL_TIMESTAMP_SERVER");
    expect(ciContent).toContain("finally");
    expect(ciContent).toContain("Remove-Item -Force $certPath");
    expect(ciContent).not.toMatch(/password\s*[:=]\s*["'][^$][^"']+["']/i);
  });

  it("TC-SEC-SIGN-03: verifies conditional signing workflow and unsigned build fallback", () => {
    const ciContent = fs.readFileSync(ciWorkflowPath, "utf-8");

    expect(ciContent).toContain("if ($env:WINDOWS_CERTIFICATE_BASE64");
    expect(ciContent).toContain("npm run tauri:build");
    expect(ciContent).toContain("No code signing credentials provided");
    expect(ciContent).toContain("Generate SHA-256 Artifact Checksums");
  });

  it("TC-SEC-SIGN-04: verifies completeness of Code Signing & Release Security Guide", () => {
    expect(fs.existsSync(releaseGuidePath)).toBe(true);
    const guideContent = fs.readFileSync(releaseGuidePath, "utf-8");

    expect(guideContent).toContain("Windows Authenticode");
    expect(guideContent).toContain("signtool sign");
    expect(guideContent).toContain("/tr");
    expect(guideContent).toContain("/td sha256");
    expect(guideContent).toContain("/fd sha256");
    expect(guideContent).toContain("WINDOWS_CERTIFICATE_BASE64");
    expect(guideContent).toContain("WINDOWS_CERTIFICATE_PASSWORD");
    expect(guideContent).toContain("Get-AuthenticodeSignature");
    expect(guideContent).toContain("checksums.txt");
    expect(guideContent).toContain("Unsigned Developer Fallback");
  });

  it("TC-SEC-SIGN-05: verifies no certificate or private key files are stored in the repository", () => {
    const forbiddenExtensions = [
      ".pfx",
      ".p12",
      ".key",
      ".snk",
      ".sig",
      ".cert",
      ".cer",
      ".crt",
      ".pem",
      ".asc",
      ".der",
      ".jks",
      ".keystore",
    ];

    const ignoredDirs = new Set([
      "node_modules",
      ".git",
      ".venv",
      "venv",
      "target",
      "dist",
      "dist-ssr",
      "playwright-report",
      "test-results",
    ]);

    function scanDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (ignoredDirs.has(entry.name)) {
          continue;
        }
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          expect(
            forbiddenExtensions.includes(ext),
            `Forbidden certificate/key file discovered in repository: ${fullPath}`
          ).toBe(false);
        }
      }
    }

    scanDir(rootDir);
  });

  it("TC-SEC-SIGN-06: verifies SHA-256 checksum computation determinism and format", () => {
    const testBuffer = Buffer.from(
      "ChessForge Release Artifact Binary Content",
      "utf-8"
    );
    const hash = crypto.createHash("sha256").update(testBuffer).digest("hex");

    expect(hash).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(hash)).toBe(true);

    const checksumLine = `${hash}  ChessForge_1.0.0_x64-setup.exe`;
    expect(checksumLine.split("  ")).toHaveLength(2);
    expect(checksumLine.split("  ")[0]).toBe(hash);
  });

  it("TC-SEC-SIGN-07: verifies Tauri configuration CSP and local offline execution integrity", () => {
    expect(fs.existsSync(tauriConfigPath)).toBe(true);
    const tauriConfig = JSON.parse(fs.readFileSync(tauriConfigPath, "utf-8"));

    expect(tauriConfig.app.security.csp).toContain("default-src 'self'");
    expect(tauriConfig.app.security.csp).not.toContain("http://*");
    expect(tauriConfig.app.security.csp).not.toContain("https://*");
  });

  it("TC-SEC-SIGN-08: verifies cross-documentation consistency between packaging and signing guides", () => {
    expect(fs.existsSync(packagingGuidePath)).toBe(true);
    expect(fs.existsSync(releaseGuidePath)).toBe(true);

    const packContent = fs.readFileSync(packagingGuidePath, "utf-8");
    const signContent = fs.readFileSync(releaseGuidePath, "utf-8");

    expect(packContent).toContain("Signing Key Isolation");
    expect(signContent).toContain("Zero Secret Storage in Repository");
  });
});
