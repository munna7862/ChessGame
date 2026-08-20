import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { render, screen } from "@testing-library/react";
import { Header } from "../components/Header";

describe("Phase 11 · Sprint 01: Release Versioning and Changelog Integrity", () => {
  const rootDir = path.resolve(__dirname, "../..");
  const expectedSemver = "1.0.0";
  const expectedDisplayVersion = `v${expectedSemver}`;
  const expectedProductName = "ChessForge";
  const expectedIdentifier = "com.chessforge.app";

  describe("1. Semantic Version Consistency across Manifests", () => {
    it("TC-VER-01: package.json specifies version 1.0.0 and correct metadata", () => {
      const pkgPath = path.join(rootDir, "package.json");
      expect(fs.existsSync(pkgPath)).toBe(true);

      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      expect(pkg.name).toBe("chessforge");
      expect(pkg.version).toBe(expectedSemver);
      expect(pkg.description).toContain("ChessForge");
    });

    it("TC-VER-02: package-lock.json matches root version 1.0.0", () => {
      const lockPath = path.join(rootDir, "package-lock.json");
      expect(fs.existsSync(lockPath)).toBe(true);

      const lock = JSON.parse(fs.readFileSync(lockPath, "utf-8"));
      expect(lock.name).toBe("chessforge");
      expect(lock.version).toBe(expectedSemver);
      expect(lock.packages[""].version).toBe(expectedSemver);
    });

    it("TC-VER-03: src-tauri/tauri.conf.json matches version 1.0.0 and product metadata", () => {
      const tauriPath = path.join(rootDir, "src-tauri", "tauri.conf.json");
      expect(fs.existsSync(tauriPath)).toBe(true);

      const tauriConfig = JSON.parse(fs.readFileSync(tauriPath, "utf-8"));
      expect(tauriConfig.productName).toBe(expectedProductName);
      expect(tauriConfig.version).toBe(expectedSemver);
      expect(tauriConfig.identifier).toBe(expectedIdentifier);
      expect(tauriConfig.app.windows[0].title).toBe(expectedProductName);
    });

    it("TC-VER-04: src-tauri/Cargo.toml specifies crate version 1.0.0", () => {
      const cargoPath = path.join(rootDir, "src-tauri", "Cargo.toml");
      expect(fs.existsSync(cargoPath)).toBe(true);

      const cargoContent = fs.readFileSync(cargoPath, "utf-8");
      expect(cargoContent).toMatch(/name\s*=\s*"chessforge"/);
      expect(cargoContent).toMatch(/version\s*=\s*"1\.0\.0"/);
    });

    it("TC-VER-05: Header component displays exact version badge v1.0.0", () => {
      render(React.createElement(Header));
      const versionBadge = screen.getByTestId("app-version");
      expect(versionBadge).toBeInTheDocument();
      expect(versionBadge).toHaveTextContent(expectedDisplayVersion);
    });

    it("TC-VER-06: index.html title matches product name", () => {
      const htmlPath = path.join(rootDir, "index.html");
      expect(fs.existsSync(htmlPath)).toBe(true);

      const htmlContent = fs.readFileSync(htmlPath, "utf-8");
      expect(htmlContent).toContain("<title>ChessForge</title>");
    });

    it("TC-VER-07: verify all configured icon files exist in src-tauri/icons", () => {
      const tauriPath = path.join(rootDir, "src-tauri", "tauri.conf.json");
      const tauriConfig = JSON.parse(fs.readFileSync(tauriPath, "utf-8"));
      const iconList: string[] = tauriConfig.bundle.icon;

      expect(iconList.length).toBeGreaterThan(0);
      for (const iconRelPath of iconList) {
        const fullIconPath = path.join(rootDir, "src-tauri", iconRelPath);
        expect(
          fs.existsSync(fullIconPath),
          `Icon asset missing: ${iconRelPath}`
        ).toBe(true);
        const stats = fs.statSync(fullIconPath);
        expect(stats.size).toBeGreaterThan(0);
      }
    });
  });

  describe("2. Documentation, Changelog & Release Notes Integrity", () => {
    it("TC-DOC-01: CHANGELOG.md adheres to Keep a Changelog and SemVer format", () => {
      const changelogPath = path.join(rootDir, "CHANGELOG.md");
      expect(fs.existsSync(changelogPath)).toBe(true);

      const content = fs.readFileSync(changelogPath, "utf-8");
      expect(content).toContain("# Changelog");
      expect(content).toContain("## [1.0.0]");
      expect(content).toContain("### Added");
      expect(content).toContain("### Changed");
      expect(content).toContain("### Security");
      expect(content).toContain("### Known Limitations");
    });

    it("TC-DOC-02: CHANGELOG.md details all core delivered features", () => {
      const changelogPath = path.join(rootDir, "CHANGELOG.md");
      const content = fs.readFileSync(changelogPath, "utf-8");

      expect(content).toContain("FIDE-Compliant Chess Domain Engine");
      expect(content).toContain("Stockfish AI Integration");
      expect(content).toContain("Fischer Dual Clocks");
      expect(content).toContain("PGN & FEN Interchange");
      expect(content).toContain("Local-First Session Persistence");
      expect(content).toContain("Accessibility & Keyboard Navigation");
    });

    it("TC-DOC-03: RELEASE_NOTES.md contains complete v1.0.0 product documentation", () => {
      const releaseNotesPath = path.join(rootDir, "RELEASE_NOTES.md");
      expect(fs.existsSync(releaseNotesPath)).toBe(true);

      const content = fs.readFileSync(releaseNotesPath, "utf-8");
      expect(content).toContain("# ChessForge v1.0.0 Release Notes");
      expect(content).toContain("Product Version:** `1.0.0`");
      expect(content).toContain("Target Platform:** Windows 10 / Windows 11");
      expect(content).toContain("## 2. Key Features & Highlights");
      expect(content).toContain("## 3. System Requirements");
      expect(content).toContain("< 150 MB");
    });

    it("TC-DOC-04: RELEASE_NOTES.md transparently documents technical limitations", () => {
      const releaseNotesPath = path.join(rootDir, "RELEASE_NOTES.md");
      const content = fs.readFileSync(releaseNotesPath, "utf-8");

      expect(content).toContain("## 4. Known Technical Limitations");
      expect(content).toContain("Single-Threaded Stockfish WASM");
      expect(content).toContain("Standard FIDE Rules Scope");
      expect(content).toContain("Local-Only Multiplayer");
    });
  });
});
