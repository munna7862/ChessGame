# Test Cases Catalog: Phase 02 · Sprint 03 (Playwright and E2E Foundation)

**Sprint:** Phase 02 · Sprint 03: Playwright and E2E Foundation  
**Test Suite Reference:** `docs/testing-strategy.md` (Tier 5: Desktop E2E Playout)  
**Test Author:** SDET Architect  
**Status:** Approved & Baselined

---

## 1. Scope & Verification Objective

This catalog defines deterministic test scenarios and automated quality gates for establishing the Tier 5 Playwright end-to-end browser/webview automation foundation for ChessForge. It validates Playwright configuration, Vite webServer lifecycle, application launch smoke tests, stable `data-testid` locator conventions, diagnostic artifact collection on test failure (traces, screenshots, videos), and developer command documentation.

---

## 2. Test Cases Catalog

| Test ID       | Category | Description                                      | Verification Method                                                   | Expected Outcome                                                                                                                                            |
| :------------ | :------- | :----------------------------------------------- | :-------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TC-E2E-01** | Positive | Playwright Toolchain & Configuration Validity    | Playwright config syntax & options audit (`playwright.config.ts`)     | Config contains valid `testDir: './tests/e2e'`, `baseURL: 'http://localhost:5173'`, report configuration (`html`, `list`), and artifact retention settings. |
| **TC-E2E-02** | Positive | Dev Server Lifecycle & WebServer Startup         | `npm run test:e2e` execution                                          | Playwright automatically spawns local Vite dev server via `webServer` config, waits for port 5173 readiness, and closes cleanly after test run.             |
| **TC-E2E-03** | Positive | Application Launch Smoke Test                    | `npx playwright test tests/e2e/app-launch.spec.ts`                    | Navigates to `/`, verifies page title "ChessForge - Master the Board", root container visibility, header title, and system status badges.                   |
| **TC-E2E-04** | Positive | Stable Test Identifiers Policy & Instrumentation | DOM inspection & locator assertions (`data-testid`)                   | Core UI elements (header, badges, cards, buttons) possess standardized `data-testid` attributes matching `docs/testing/e2e_identifiers_policy.md`.          |
| **TC-E2E-05** | Positive | Diagnostic Artifact Collection on Failure        | Controlled failure test run (`retain-on-failure`)                     | On test failure, Playwright captures and writes screenshot (`.png`), trace archive (`.zip`), and video (`.webm`) into `test-results/`.                      |
| **TC-E2E-06** | Positive | E2E npm Scripts Suite Completeness               | Package JSON script audit & execution                                 | `package.json` contains functional scripts for `test:e2e`, `test:e2e:ui`, and `test:e2e:report`.                                                            |
| **TC-E2E-07** | Negative | Unreachable / Unhealthy Server Failure Handling  | Playwright timeout verification on invalid port                       | When webServer fails to start or server is unreachable, Playwright exits cleanly with exit code $\neq 0$ and descriptive error diagnostic.                  |
| **TC-E2E-08** | Negative | Missing Test ID Locator Rejection                | Locator assertion on non-existent `data-testid`                       | Playwright strictly fails locator lookup with descriptive failure trace and locator resolution error.                                                       |
| **TC-E2E-09** | Boundary | Desktop Viewport Dimensions & Layout             | Responsive desktop viewports (1024x768, 1440x900, 1920x1080)          | App layout renders without horizontal overflow, clipped headers, or broken grid containers across standard desktop resolutions.                             |
| **TC-E2E-10** | Quality  | E2E Execution & Debugging Guide Documentation    | Documentation audit (`docs/guides/e2e_testing_guide.md`, `README.md`) | Clear, step-by-step instructions for running headless tests, UI interactive mode, viewing trace files, and debugging failed runs.                           |

---

## 3. Automation Quality Gate Criteria

Before this sprint can be handed over to the Product Owner:

1. `npm run typecheck` passes with 0 errors across all source and test files.
2. `npm run lint` passes with 0 errors and 0 warnings.
3. `npm run format:check` passes with 0 formatting discrepancies.
4. `npm run test` (Vitest Tier 1-4 unit/integration tests) passes 100% with 0 skips.
5. `npm run test:e2e` (Playwright Tier 5 E2E smoke tests) passes 100% with 0 skips.
6. Diagnostic failure collection verified (traces/screenshots collected on failure).
7. `npm run build` succeeds cleanly.
8. Zero security vulnerabilities reported in dependencies (`npm audit`).
