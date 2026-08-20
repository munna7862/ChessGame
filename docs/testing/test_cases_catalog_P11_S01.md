# Test Cases Catalog - Phase 11 · Sprint 01

**Sprint Focus:** Release Versioning and Changelog  
**Document ID:** `TC-P11-S01`  
**Author:** SDET Architect  
**Related Documents:**

- [`P11-S01 Sprint Spec`](file:///c:/Workspace/ChessGame/planning/sprints/P11-S01-release-versioning-and-changelog.md)
- [`Phase 11 Plan`](file:///c:/Workspace/ChessGame/planning/phases/11-phase-windows-release.md)
- [`QA Matrix`](file:///c:/Workspace/ChessGame/docs/qa-matrix.md)
- [`Testing Strategy`](file:///c:/Workspace/ChessGame/docs/testing-strategy.md)

---

## 1. Overview & Objectives

Sprint P11-S01 establishes the official semantic versioning, application metadata, changelog, and release documentation for **ChessForge v1.0.0**. This ensures:

1. **Strict Version Consistency:** Semantic version `1.0.0` is uniformly defined and validated across all project configuration files (`package.json`, `package-lock.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`) and the desktop presentation UI (`Header.tsx` displaying `v1.0.0`).
2. **Standardized Changelog:** A comprehensive `CHANGELOG.md` following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning 2.0.0](https://semver.org/) specifications, documenting the complete development history from Phase 01 through Phase 11.
3. **Comprehensive Release Notes:** A dedicated `RELEASE_NOTES.md` detailing the v1.0.0 release highlights, architecture, supported chess rules, local engine specifications, system requirements, and installation instructions.
4. **Transparent Known Limitations:** Explicit documentation of technical constraints (e.g. offline-only local architecture, Stockfish WASM worker thread limits, Windows 10/11 x64 target scope).
5. **Automated Verification:** Automated unit, integration, and E2E regression tests validating version alignment, metadata integrity, and changelog/release notes existence.

---

## 2. Test Cases Catalog

### 2.1 Semantic Versioning & Configuration Consistency

| Test Case ID  | Title                                    | Description                                                                                                                      | Expected Result                                                                  | Priority |
| :------------ | :--------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------- | :------- |
| **TC-VER-01** | `package.json` Semantic Version          | Verify `package.json` contains `"version": "1.0.0"` adhering to SemVer 2.0.0.                                                    | Version is strictly `"1.0.0"`.                                                   | `P0`     |
| **TC-VER-02** | `package-lock.json` Version Sync         | Verify root package and packages section in `package-lock.json` reflect `"version": "1.0.0"`.                                    | Lockfile matches package version identically.                                    | `P0`     |
| **TC-VER-03** | `src-tauri/tauri.conf.json` Version Sync | Verify `tauri.conf.json` specifies `"version": "1.0.0"`.                                                                         | Tauri manifest contains `"version": "1.0.0"`.                                    | `P0`     |
| **TC-VER-04** | `src-tauri/Cargo.toml` Version Sync      | Verify Cargo package manifest specifies `version = "1.0.0"`.                                                                     | Rust crate manifest specifies `version = "1.0.0"`.                               | `P0`     |
| **TC-VER-05** | UI Header Version Badge Display          | Verify `Header.tsx` renders `v1.0.0` in the application header badge (`data-testid="app-version"`).                              | Header renders text `v1.0.0` with correct styling and no alpha/beta/rc suffixes. | `P0`     |
| **TC-VER-06** | Product Metadata & Identification        | Validate product name (`ChessForge`), bundle identifier (`com.chessforge.app`), and window titles across configs.                | Product metadata is consistent across Tauri, React, and HTML titles.             | `P0`     |
| **TC-VER-07** | Application Icon Bundle Integrity        | Verify all configured icons (`32x32.png`, `128x128.png`, `128x128@2x.png`, `icon.icns`, `icon.ico`) exist in `src-tauri/icons/`. | All icon assets exist and are valid PNG/ICO/ICNS formats.                        | `P1`     |

### 2.2 Changelog & Release Notes Integrity

| Test Case ID  | Title                               | Description                                                                                                                                           | Expected Result                                                                                                                         | Priority |
| :------------ | :---------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- | :------- |
| **TC-DOC-01** | `CHANGELOG.md` Specification Format | Verify `CHANGELOG.md` exists in workspace root and follows Keep a Changelog standard with valid SemVer headers.                                       | File exists, uses markdown formatting, contains `[1.0.0] - 2026-08-20` header, and subheadings `Added`, `Changed`, `Fixed`, `Security`. | `P0`     |
| **TC-DOC-02** | Feature Traceability in Changelog   | Verify all major feature deliverables from Phases 01-10 are cataloged (FIDE rules, Stockfish WASM, Clocks, Persistence, Accessibility, QA suite).     | Comprehensive list of implemented modules is recorded.                                                                                  | `P1`     |
| **TC-DOC-03** | `RELEASE_NOTES.md` Completeness     | Verify `RELEASE_NOTES.md` exists in workspace root detailing product overview, key features, hardware footprint (< 150MB), and getting started steps. | Release notes provide complete overview for end users and operators.                                                                    | `P0`     |
| **TC-DOC-04** | Known Limitations Documentation     | Verify `RELEASE_NOTES.md` and `CHANGELOG.md` explicitly document known limitations (offline-only, WASM single/multi-thread scope, Windows x64 focus). | Technical limitations clearly stated without ambiguity.                                                                                 | `P0`     |
| **TC-DOC-05** | Markdown & URI Link Validation      | Verify all internal links, markdown headers, and tables in changelog and release notes render cleanly without syntax errors.                          | 0 markdown lint errors, all relative file references valid.                                                                             | `P1`     |

### 2.3 Automated Regression & Quality Gates

| Test Case ID   | Title                              | Description                                                                                                                                      | Expected Result                              | Priority |
| :------------- | :--------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------- | :------- |
| **TC-AUTO-01** | Automated Release Versioning Suite | Implement and execute `src/test/releaseVersioning.test.ts` testing all version sync, metadata, and doc existence invariants.                     | 100% test pass rate with 0 skips.            | `P0`     |
| **TC-AUTO-02** | App Rendering & Header Unit Tests  | Update and run `src/App.test.tsx` ensuring `v1.0.0` header badge is asserted and verified.                                                       | App component test passes with `v1.0.0`.     | `P0`     |
| **TC-AUTO-03** | Release Candidate Suite Update     | Update `src/test/releaseCandidateValidation.test.ts` to assert `1.0.0` version in Tauri and Package configs.                                     | All 17 RC tests pass cleanly.                | `P0`     |
| **TC-AUTO-04** | Full Quality Gates Execution       | Run complete project verification: `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm test`, `npm run test:e2e`, `npm run build`. | All gates pass with 0 errors and 0 warnings. | `P0`     |

---

## 3. Quality Gate Pass Criteria

- **100% Green Automation:** All Vitest unit/property/integration tests and Playwright E2E scenarios pass with 0 skips.
- **Zero Version Drift:** Automated test asserts exact equality across `package.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`, and UI `Header.tsx`.
- **Zero Lint / Type Errors:** `tsc --noEmit` and `eslint` pass with 0 errors and 0 warnings.
