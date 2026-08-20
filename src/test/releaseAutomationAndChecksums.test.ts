import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import {
  calculateFileHash,
  formatChecksumLine,
  generateChecksums,
  writeChecksumsFile,
  verifyChecksumsFile,
} from "../../scripts/release_checksums.mjs";
import {
  normalizeVersion,
  parseReleaseNotes,
  extractReleaseNotesFromFile,
} from "../../scripts/extract_release_notes.mjs";

describe("Phase 11 · Sprint 04: Release Automation and Checksums", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "chessforge-release-test-")
    );
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe("1. Release Workflow Configuration & Security Invariants", () => {
    const workflowPath = path.resolve(".github/workflows/release.yml");

    it("TC-REL-01: should exist and define tag triggers and workflow_dispatch dry_run input", () => {
      expect(fs.existsSync(workflowPath)).toBe(true);
      const content = fs.readFileSync(workflowPath, "utf8");

      // Check tag trigger pattern
      expect(content).toMatch(/tags:\s*\r?\n\s*-\s*['"]?v\*['"]?/);

      // Check workflow_dispatch and dry_run
      expect(content).toContain("workflow_dispatch:");
      expect(content).toContain("dry_run:");
      expect(content).toMatch(/type:\s*boolean/);
      expect(content).toMatch(/default:\s*false/);
    });

    it("TC-REL-02: should strictly enforce multi-stage quality gates and job dependencies", () => {
      const content = fs.readFileSync(workflowPath, "utf8");

      // Verify jobs exist
      expect(content).toContain("verify-frontend-quality-gates:");
      expect(content).toContain("verify-rust-quality-gates:");
      expect(content).toContain("build-windows-release:");
      expect(content).toContain("publish-github-release:");

      // Verify packaging depends on verification gates
      expect(content).toMatch(
        /build-windows-release:[\s\S]*?needs:\s*\[[\s\S]*?verify-frontend-quality-gates[\s\S]*?verify-rust-quality-gates[\s\S]*?\]/
      );

      // Verify publishing depends on all quality and packaging gates
      expect(content).toMatch(
        /publish-github-release:[\s\S]*?needs:\s*\[[\s\S]*?verify-frontend-quality-gates[\s\S]*?verify-rust-quality-gates[\s\S]*?build-windows-release[\s\S]*?\]/
      );
    });

    it("TC-REL-07: should enforce least-privilege permissions and dry-run guardrails", () => {
      const content = fs.readFileSync(workflowPath, "utf8");

      // Top-level permissions must be read-only
      expect(content).toMatch(/^permissions:\s*\r?\n\s*contents:\s*read/m);

      // publish-github-release must have scoped write permissions and dry_run check
      expect(content).toMatch(
        /publish-github-release:[\s\S]*?permissions:\s*\r?\n\s*contents:\s*write/
      );
      expect(content).toMatch(
        /publish-github-release:[\s\S]*?if:\s*\${{\s*!inputs\.dry_run\s*}}/
      );
    });

    it("should verify Authenticode certificate destruction in finally block", () => {
      const content = fs.readFileSync(workflowPath, "utf8");
      expect(content).toContain("WINDOWS_CERTIFICATE_BASE64");
      expect(content).toContain("WINDOWS_CERTIFICATE_PASSWORD");
      expect(content).toContain("finally");
      expect(content).toContain("Remove-Item -Force $certPath");
    });
  });

  describe("2. SHA-256 Checksum Calculation, Formatting & Verification", () => {
    it("TC-REL-03: should calculate accurate SHA-256 hashes and format lines in GNU format", () => {
      const testFile = path.join(tempDir, "ChessForge-Setup-1.0.0.exe");
      const testData =
        "ChessForge Windows Desktop Installer Mock Binary v1.0.0";
      fs.writeFileSync(testFile, testData, "utf8");

      const expectedHash = crypto
        .createHash("sha256")
        .update(testData)
        .digest("hex")
        .toLowerCase();
      const actualHash = calculateFileHash(testFile);

      expect(actualHash).toBe(expectedHash);
      expect(actualHash).toHaveLength(64);
      expect(actualHash).toMatch(/^[0-9a-f]{64}$/);

      const line = formatChecksumLine(actualHash, "ChessForge-Setup-1.0.0.exe");
      expect(line).toBe(`${expectedHash}  ChessForge-Setup-1.0.0.exe`);
    });

    it("TC-REL-03: should recursively scan bundle directories and generate checksums.txt", () => {
      const nsisDir = path.join(tempDir, "nsis");
      const msiDir = path.join(tempDir, "msi");
      fs.mkdirSync(nsisDir, { recursive: true });
      fs.mkdirSync(msiDir, { recursive: true });

      const file1 = path.join(nsisDir, "ChessForge-Setup-1.0.0.exe");
      const file2 = path.join(msiDir, "ChessForge_1.0.0_x64_en-US.msi");
      fs.writeFileSync(file1, "NSIS Payload Content");
      fs.writeFileSync(file2, "MSI Payload Content");

      const { entries, content } = generateChecksums(tempDir);
      expect(entries).toHaveLength(2);

      const checksumFile = path.join(tempDir, "checksums.txt");
      writeChecksumsFile(checksumFile, content);

      expect(fs.existsSync(checksumFile)).toBe(true);
      const readContent = fs.readFileSync(checksumFile, "utf8");
      expect(readContent).toContain("ChessForge-Setup-1.0.0.exe");
      expect(readContent).toContain("ChessForge_1.0.0_x64_en-US.msi");
    });

    it("TC-REL-06: should verify valid checksums file successfully", () => {
      const file1 = path.join(tempDir, "app-installer.exe");
      fs.writeFileSync(file1, "Authentic Application Code");

      const { content } = generateChecksums(tempDir);
      const checksumFile = path.join(tempDir, "checksums.txt");
      writeChecksumsFile(checksumFile, content);

      const report = verifyChecksumsFile(checksumFile, tempDir);
      expect(report.total).toBe(1);
      expect(report.passed).toBe(1);
      expect(report.failed).toBe(0);
      expect(report.missing).toBe(0);
      expect(report.details[0]?.status).toBe("OK");
    });

    it("TC-REL-06: should detect tampered or corrupted files and flag FAILED", () => {
      const file1 = path.join(tempDir, "app-installer.exe");
      fs.writeFileSync(file1, "Original Pure Binary Content");

      const { content } = generateChecksums(tempDir);
      const checksumFile = path.join(tempDir, "checksums.txt");
      writeChecksumsFile(checksumFile, content);

      // Tamper with binary content
      fs.writeFileSync(file1, "Modified Malicious Or Corrupted Content");

      const report = verifyChecksumsFile(checksumFile, tempDir);
      expect(report.total).toBe(1);
      expect(report.passed).toBe(0);
      expect(report.failed).toBe(1);
      expect(report.missing).toBe(0);
      expect(report.details[0]?.status).toBe("FAILED");
    });

    it("TC-REL-06: should detect missing referenced files and flag MISSING", () => {
      const checksumFile = path.join(tempDir, "checksums.txt");
      const fakeHash =
        "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
      fs.writeFileSync(checksumFile, `${fakeHash}  MissingPackage.exe\n`);

      const report = verifyChecksumsFile(checksumFile, tempDir);
      expect(report.total).toBe(1);
      expect(report.passed).toBe(0);
      expect(report.failed).toBe(0);
      expect(report.missing).toBe(1);
      expect(report.details[0]?.status).toBe("MISSING");
    });
  });

  describe("3. Automated Release Notes Extraction", () => {
    it("TC-REL-04: should normalize tag and version strings correctly", () => {
      expect(normalizeVersion("v1.0.0")).toBe("1.0.0");
      expect(normalizeVersion("1.0.0")).toBe("1.0.0");
      expect(normalizeVersion("refs/tags/v1.2.3")).toBe("1.2.3");
      expect(normalizeVersion("v2.0.0-rc1")).toBe("2.0.0-rc1");
    });

    it("TC-REL-04: should extract version-specific section from RELEASE_NOTES.md", () => {
      const rootReleaseNotes = path.resolve("RELEASE_NOTES.md");
      expect(fs.existsSync(rootReleaseNotes)).toBe(true);

      const notes = extractReleaseNotesFromFile(rootReleaseNotes, "1.0.0");
      expect(notes).toContain("ChessForge v1.0.0 Release Notes");
      expect(notes).toContain("Executive Summary");
      expect(notes).toContain("Pure FIDE Chess Rules Engine");
      expect(notes).toContain("Stockfish 10 WASM");
    });

    it("TC-REL-04: should extract version-specific section from CHANGELOG.md", () => {
      const sampleChangelog = `
# Changelog

## [1.0.0] - 2026-08-20
### Added
- Initial stable release of ChessForge desktop application.
- Stockfish WASM engine integration.

## [0.9.0] - 2026-08-10
### Added
- Beta test build.
`;
      const changelogPath = path.join(tempDir, "CHANGELOG.md");
      fs.writeFileSync(changelogPath, sampleChangelog, "utf8");

      const extracted = extractReleaseNotesFromFile(changelogPath, "1.0.0");
      expect(extracted).toContain("## [1.0.0] - 2026-08-20");
      expect(extracted).toContain(
        "Initial stable release of ChessForge desktop application."
      );
      expect(extracted).not.toContain("## [0.9.0]");
    });

    it("TC-REL-04: should handle missing section with sensible fallback", () => {
      const fallbackMarkdown =
        "# ChessForge Documentation\n\nGeneral overview.";
      const notes = parseReleaseNotes(fallbackMarkdown, "9.9.9");
      expect(notes).toBe(fallbackMarkdown);
    });
  });

  describe("4. Zero Cloud & Offline Supply Chain Safety", () => {
    it("TC-REL-08: should verify release scripts contain zero remote tracking or analytics URLs", () => {
      const checksumScript = fs.readFileSync(
        path.resolve("scripts/release_checksums.mjs"),
        "utf8"
      );
      const notesScript = fs.readFileSync(
        path.resolve("scripts/extract_release_notes.mjs"),
        "utf8"
      );

      // Neither script should make HTTP/HTTPS calls
      expect(checksumScript).not.toContain("fetch(");
      expect(checksumScript).not.toContain("http.request");
      expect(checksumScript).not.toContain("https.request");

      expect(notesScript).not.toContain("fetch(");
      expect(notesScript).not.toContain("http.request");
      expect(notesScript).not.toContain("https.request");
    });
  });
});
