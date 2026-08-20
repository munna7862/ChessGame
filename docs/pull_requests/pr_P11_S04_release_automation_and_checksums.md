# Pull Request: Phase 11 · Sprint 04 — Release Automation and Checksums

**Sprint:** Phase 11 · Sprint 04  
**Branch:** `feature/p11-s04-release-automation-and-checksums`  
**Target Branch:** `main`  
**Author:** DevOps Engineer (with Scrum Master, Chess Domain Architect, Dev Architect, Security Officer, SDET Architect, Product Owner)  

---

## 1. Summary of Changes

This pull request implements automated tagged release creation, multi-stage gated CI verification, Windows desktop artifact bundling, SHA-256 checksum generation, and GitHub Release publication for ChessForge v1.0.0 desktop distribution.

### Key Deliverables & Changes

1. **Gated GitHub Actions Release Workflow (`.github/workflows/release.yml`)**:
   - **Triggers**: Tag pushes matching `v*` and manual `workflow_dispatch` (with `dry_run` input parameter).
   - **Stage 1 (Quality Gates)**: Parallel execution of frontend quality gates (`npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, Playwright `npm run test:e2e`, `npm run build`) and Rust native compilation (`cargo test`, `cargo clippy`, `cargo check --release`).
   - **Stage 2 (Windows Desktop Packaging)**: Builds NSIS (`.exe`) and MSI installers, performs Authenticode signing if secrets are present, computes SHA-256 checksums, and uploads bundle artifacts.
   - **Stage 3 (GitHub Release Publication)**: Strictly gated behind all verification and packaging jobs, extracts version release notes, attaches installers and `checksums.txt`, and publishes the GitHub Release (safely skipped if `dry_run: true`).
   - **Permissions**: Top-level permissions default to `contents: read`; `contents: write` is strictly isolated to the release publication job.

2. **Zero-Dependency Release Checksums Utility (`scripts/release_checksums.mjs`)**:
   - Standalone ESM utility computing lowercase 64-character SHA-256 hashes adhering to GNU Coreutils standard format (`<hash>  <filename>`).
   - Comprehensive directory scanning, file writing, and verification reporting with tamper and missing file detection.

3. **Version Release Notes Extractor (`scripts/extract_release_notes.mjs`)**:
   - Standalone parser extracting version-specific release summaries and changelogs from `RELEASE_NOTES.md` and `CHANGELOG.md`.

4. **Comprehensive Operator Guide (`docs/release/release_automation_and_checksums_guide.md`)**:
   - Full architecture diagrams, tagging protocols, dry-run procedures, and end-user checksum verification instructions for Windows PowerShell (`Get-FileHash`), Command Prompt (`certutil`), and Linux/macOS (`sha256sum`).

5. **Automated Test Suite (`src/test/releaseAutomationAndChecksums.test.ts`)**:
   - 14 automated tests validating workflow YAML structure, triggers, job gating dependencies, permissions scoping, checksum generation/formatting, tamper detection, and release notes extraction.

---

## 2. Quality Gate & Verification Results

| Quality Gate | Command | Result |
| :--- | :--- | :--- |
| **Code Formatting** | `npm run format:check` | **PASS (100% matched)** |
| **Static Analysis** | `npm run lint` | **PASS (0 errors, 0 warnings)** |
| **TypeScript Typecheck** | `npm run typecheck` | **PASS (0 errors)** |
| **Unit & Property Tests** | `npm test` | **PASS (121 test files, 1,002 tests passed, 0 failures, 0 skips)** |
| **Desktop E2E Playout** | `npm run test:e2e` | **PASS (24 spec files, 82 scenarios passed, 0 failures, 0 skips)** |
| **Production Web Bundle** | `npm run build` | **PASS (clean 504 kB bundle)** |
| **Dependency Security Audit** | `npm audit` | **PASS (0 vulnerabilities)** |

---

## 3. Desktop Security & Offline-First Sign-Off

- **Least Privilege Tokens**: Default workflow permissions are `contents: read`; elevated `contents: write` is strictly restricted to the final publish job.
- **Code Signing Isolation**: PFX certificate is decoded to temporary storage and wiped inside a PowerShell `finally` block even if errors occur. Zero secrets stored in repository.
- **Zero Cloud Invariants**: 100% offline desktop architecture maintained with zero telemetry endpoints.

---

## 4. Definition of Done (DoD) Verification

- [x] Scope complete without unrelated or speculative changes.
- [x] 100% Green automation across all test tiers with 0 skips.
- [x] Clean typecheck (`tsc --noEmit`) and lint (`eslint .`) with 0 errors.
- [x] Security audit approved with zero vulnerabilities and least-privilege token permissions.
- [x] Product Owner acceptance approved.
- [x] Git diff reviewed and conventional commit prepared.
