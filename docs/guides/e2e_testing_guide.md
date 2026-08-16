# Playwright & E2E Testing Guide

**Document Version:** 1.0.0  
**Target:** Tier 5 E2E Webview & Browser Automation  
**Applies To:** Developers, SDETs, CI/CD Pipelines

---

## 1. Overview

ChessForge employs **Playwright** for Tier 5 End-to-End (E2E) UI testing to validate the full application presentation layer in a real browser environment simulating the desktop webview (WebView2 on Windows).

### Architecture Integration

```
Playwright Runner (Chromium / Webview)
       │
       ▼ (HTTP / WebServer)
Vite Dev Server (localhost:1420)
       │
       ▼
React 19 Presentation Layer ──► Decoupled Domain
```

---

## 2. Test Scripts & Execution Commands

| Command                                         | Purpose                              | When to Use                                    |
| :---------------------------------------------- | :----------------------------------- | :--------------------------------------------- |
| `npm run test:e2e`                              | Runs all E2E test suites headlessly  | Local pre-commit verification & CI pipelines   |
| `npm run test:e2e:ui`                           | Opens interactive Playwright UI mode | Interactive test debugging & step-through      |
| `npm run test:e2e:report`                       | Serves the HTML test report          | Inspecting detailed pass/fail traces & metrics |
| `npx playwright test --debug`                   | Opens Playwright Inspector           | Stepping through test locators line-by-line    |
| `npx playwright show-trace <path-to-trace.zip>` | Opens trace analyzer                 | Forensic analysis of recorded failure traces   |

---

## 3. Configuration & Startup Strategy

The configuration is centrally managed in `playwright.config.ts`:

- **Automatic WebServer:** Playwright automatically checks if `http://localhost:1420` is running. If not, it executes `npm run dev` and waits for port readiness before starting tests.
- **Port Reuse:** In local environments (`reuseExistingServer: !process.env.CI`), Playwright attaches to an existing dev server to optimize test startup latency.
- **Strict Timeouts:** Global test timeout is bounded to 30 seconds; locator expect timeout is 5 seconds.
- **Browser Scope:** Targets Chromium (matching Windows WebView2 / Chromium engine).

---

## 4. Failure Artifacts & Diagnostic Collection

To prevent transient failure ambiguity, Playwright is configured with automated diagnostic artifact retention:

1. **Screenshots (`screenshot: 'only-on-failure'`):** High-resolution PNG captures of the window state at the exact moment of failure.
2. **Trace Archives (`trace: 'retain-on-failure'`):** Complete DOM snapshots, console logs, network traffic, and action timelines recorded into `test-results/`.
3. **Video Recording (`video: 'retain-on-failure'`):** Frame-by-frame webm video recording of the failing test session.
4. **HTML Report (`reporter: 'html'`):** Self-contained interactive report generated in `playwright-report/`.

### Inspecting Failure Diagnostics

```bash
# View the HTML test summary report
npm run test:e2e:report

# Inspect an individual failure trace file
npx playwright show-trace test-results/<test-name>/trace.zip
```

---

## 5. Authoring New E2E Tests

1. Place all E2E spec files under `tests/e2e/` with the `.spec.ts` suffix.
2. Always import test identifiers from `tests/e2e/helpers/test-constants.ts` or follow the `docs/testing/e2e_identifiers_policy.md` convention.
3. Locate elements using `page.getByTestId(...)` or `page.getByRole(...)`. Never bind locators to dynamic CSS styling classes.
4. Keep tests independent and idempotent — use `test.beforeEach` to navigate to the initial application state.
