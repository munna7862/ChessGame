# Test Cases Catalog: Phase 11 · Sprint 02

**Sprint:** Phase 11 · Sprint 02: Windows Installer and Packaging  
**Author:** SDET Architect  
**Status:** APPROVED  
**Date:** 2026-08-20

---

## 1. Overview & Objectives

The primary objective of Sprint 11.02 is to configure, validate, and verify the Windows packaging and installer configuration for **ChessForge v1.0.0**. This catalog defines automated test specifications, boundary invariants, and manual verification criteria to ensure reliable, reproducible, and secure Windows desktop installer generation (NSIS / MSI) via Tauri v2.

---

## 2. Test Cases Matrix

| Test ID       | Category      | Target Component                           | Verification Scope                                                                                                   | Priority |
| :------------ | :------------ | :----------------------------------------- | :------------------------------------------------------------------------------------------------------------------- | :------- |
| **TC-PKG-01** | Configuration | `src-tauri/tauri.conf.json`                | Validate bundle activation and Windows packaging targets (`nsis`, `msi`, or `all`).                                  | `P0`     |
| **TC-PKG-02** | Configuration | `src-tauri/tauri.conf.json`                | Verify NSIS installer settings (install mode, shortcuts, display names).                                             | `P0`     |
| **TC-PKG-03** | Metadata      | `src-tauri/tauri.conf.json` & `Cargo.toml` | Verify product metadata consistency (Product name, v1.0.0, identifier, publisher, copyright, description, category). | `P0`     |
| **TC-PKG-04** | Assets        | `src-tauri/icons/`                         | Verify multi-resolution application icons suite existence and format validity (ico, png, icns).                      | `P0`     |
| **TC-PKG-05** | Security      | `src-tauri/tauri.conf.json`                | Verify Content Security Policy (CSP) and capability allowlist invariants for packaged binaries.                      | `P0`     |
| **TC-PKG-06** | Distribution  | `dist/` & `public/`                        | Verify local-first offline runtime assets (Stockfish WASM, sound audio, piece SVGs) are included in build.           | `P0`     |
| **TC-PKG-07** | Build Scripts | `package.json`                             | Verify desktop packaging CLI scripts (`tauri:build`, `build`, etc.) are properly defined.                            | `P1`     |
| **TC-PKG-08** | Windows Paths | Packaging Config                           | Verify Windows install path behavior (`currentUser` / `perMachine`), start menu shortcut, and clean registry policy. | `P1`     |
| **TC-PKG-09** | Schema        | `src/test/windowsPackaging.test.ts`        | Validate runtime JSON schema for `tauri.conf.json` using Zod.                                                        | `P0`     |
| **TC-PKG-10** | Documentation | `docs/release/windows_packaging_guide.md`  | Verify operator and release packaging guide completeness.                                                            | `P1`     |

---

## 3. Detailed Test Specifications

### TC-PKG-01: Windows Bundle Target Configuration

- **Given:** The `src-tauri/tauri.conf.json` configuration file.
- **When:** Loaded and parsed during build and automated test runs.
- **Then:**
  - `bundle.active` MUST be `true`.
  - `bundle.targets` MUST include `"all"` or explicit Windows targets `["nsis", "msi"]`.

### TC-PKG-02: NSIS Windows Installer Configuration

- **Given:** Tauri v2 NSIS bundling configuration.
- **When:** The NSIS packaging options are evaluated.
- **Then:**
  - `bundle.windows` configuration MUST specify appropriate install mode (e.g., `currentUser` or standard per-user elevation-free install) or NSIS options.
  - Desktop shortcuts and Start menu entries must be configured cleanly without intrusive bloatware.

### TC-PKG-03: Application Metadata Invariants

- **Given:** Core desktop configuration files (`tauri.conf.json`, `Cargo.toml`, `package.json`).
- **When:** Compared for metadata synchronization.
- **Then:**
  - Product name is `"ChessForge"`.
  - Version is `"1.0.0"`.
  - Identifier is `"com.chessforge.app"`.
  - Publisher is `"ChessForge Team"`.
  - Copyright statement is present and accurate.
  - Category is `"Game"`.
  - Short and long descriptions are non-empty and accurately describe the application.

### TC-PKG-04: Multi-Resolution Icon Suite Completeness

- **Given:** `src-tauri/icons/` directory.
- **When:** Checked against icon array defined in `tauri.conf.json`.
- **Then:**
  - All referenced icon files MUST exist on disk and have non-zero size:
    - `icons/32x32.png`
    - `icons/128x128.png`
    - `icons/128x128@2x.png`
    - `icons/icon.ico`
    - `icons/icon.png`
    - `icons/icon.icns`

### TC-PKG-05: CSP & Security Invariants in Packaged Build

- **Given:** Packaged Tauri application security configuration.
- **When:** Inspected for least-privilege compliance.
- **Then:**
  - CSP MUST enforce `default-src 'self'`.
  - External network connections MUST be disallowed.
  - No secrets, private keys, or code signing certificates shall be present in repository source trees.

### TC-PKG-06: Local-First Asset Bundling

- **Given:** The frontend distribution directory (`dist/`).
- **When:** `npm run build` is executed.
- **Then:**
  - `dist/index.html` exists.
  - `dist/assets/` contains compiled JavaScript, CSS, and sound/piece assets.
  - Stockfish engine worker bundle is locally packaged.

### TC-PKG-07: Desktop Packaging Scripts

- **Given:** `package.json`.
- **When:** Inspecting scripts.
- **Then:**
  - `tauri` and `tauri:build` commands exist to invoke `@tauri-apps/cli`.

---

## 4. Invariants & Acceptance Gates

1. **Zero Untyped Packaging Fields:** `tauri.conf.json` must validate strictly against a TypeScript Zod schema.
2. **Deterministic Output:** Packaging config must produce identical NSIS/MSI output parameters on any Windows 10/11 environment.
3. **Quality Gate Pass Requirement:** 100% test pass rate across Vitest, Playwright, TypeScript typecheck, and ESLint.
