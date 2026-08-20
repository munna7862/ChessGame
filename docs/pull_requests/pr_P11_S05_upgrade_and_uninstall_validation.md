# Pull Request: Phase 11 · Sprint 05 — Upgrade and Uninstall Validation

**PR Title:** `feat(release): validate upgrade, migration, uninstall, and reinstall lifecycle (Phase 11 Sprint 05)`  
**Target Branch:** `main`  
**Source Branch:** `feature/p11-s05-upgrade-and-uninstall-validation`  
**Sprint:** Phase 11 · Sprint 05  
**Author:** DevOps Engineer

---

## 1. Summary & Sprint Objectives

This pull request implements and verifies the complete Windows desktop lifecycle of ChessForge v1.0.0 beyond fresh installation. It ensures that application updates, schema migrations, uninstallation, and reinstallation strictly adhere to the local-first desktop operating contract and Windows user-profile isolation standards.

### Key Deliverables

1. **Automated Lifecycle Validation Suite (`src/test/upgradeAndUninstallValidation.test.ts`):**
   - Implements tests for TC-LIFE-01 through TC-LIFE-09 covering schema transformation, user settings preservation, mid-game state retention, crash-resilient fallback on corrupt data, post-upgrade engine initialization, NSIS `currentUser` packaging invariants, user data sovereignty, and reinstallation resumption.
2. **Windows Desktop Lifecycle Guide (`docs/release/upgrade_and_uninstall_lifecycle_guide.md`):**
   - Architectural reference documenting storage topology, NSIS installer modes, migration mechanics, active game recovery policies, and clean uninstallation guarantees.
3. **Pre-Implementation Test Cases Catalog (`docs/testing/test_cases_catalog_P11_S05.md`):**
   - Structured verification matrix outlining positive, negative, and boundary scenarios.
4. **Test Automation Quality Gate Report (`docs/testing/upgrade_and_uninstall_validation_report_P11_S05.md`):**
   - Comprehensive test execution audit with 100% green results across all tiers.
5. **Release Script ESM Shebang Fix:**
   - Removed hashbang headers from `scripts/release_checksums.mjs` and `scripts/extract_release_notes.mjs` to ensure seamless ES module import and bundler compatibility.

---

## 2. Quality Gate Verification Results

| Quality Gate                     | Command                | Result                                             |
| :------------------------------- | :--------------------- | :------------------------------------------------- |
| **Linting**                      | `npm run lint`         | 0 errors, 0 warnings                               |
| **Typecheck**                    | `npm run typecheck`    | 0 errors                                           |
| **Formatting**                   | `npm run format:check` | 100% matched                                       |
| **Unit, Property & Integration** | `npm test`             | 122 test files (1,011 passed, 0 failed, 0 skipped) |
| **Playwright Desktop E2E**       | `npm run test:e2e`     | 24 test suites (82 passed, 0 failed, 0 skipped)    |
| **Production Build**             | `npm run build`        | Clean production bundle (504.76 kB)                |
| **Security Audit**               | `npm audit`            | 0 vulnerabilities                                  |

---

## 3. Definition of Done (DoD) Verification

- [x] Scope implemented without unrelated changes.
- [x] Full test suite (Vitest + Playwright) passing at 100% with 0 skips.
- [x] Typecheck and ESLint pass with 0 errors.
- [x] Desktop & Capability Security Audit approved.
- [x] Product Owner acceptance criteria satisfied and approved.
- [x] Git diff reviewed and formatted cleanly.
