# Test Cases Catalog: Phase 02 · Sprint 04 — GitHub Actions Baseline

## 1. Overview & Objective

This document defines the comprehensive test catalog and quality gates for **Phase 02 · Sprint 04: GitHub Actions Baseline**. The objective is to ensure automated, deterministic, and diagnosable CI validation on every pull request and push to the `main` branch across frontend checks, end-to-end testing, and Windows desktop Tauri Rust compilation.

---

## 2. Test Cases Matrix

| Test ID      | Category                | Scenario / Description                | Expected Outcome                                                                                                     | Verification Method                 |
| :----------- | :---------------------- | :------------------------------------ | :------------------------------------------------------------------------------------------------------------------- | :---------------------------------- |
| **TC-CI-01** | Happy Path              | Pull request triggered against `main` | All CI workflow jobs execute automatically.                                                                          | GitHub Actions Trigger / YAML parse |
| **TC-CI-02** | Happy Path              | Push triggered on `main`              | CI workflow executes on the committed SHA.                                                                           | GitHub Actions Trigger / Event Spec |
| **TC-CI-03** | Happy Path              | Manual `workflow_dispatch` trigger    | CI workflow can be triggered on-demand via GitHub UI/CLI.                                                            | Workflow syntax validation          |
| **TC-CI-04** | Happy Path              | Deterministic package installation    | Workflow uses `npm ci` with `package-lock.json` lockfile integrity.                                                  | CI Step Configuration               |
| **TC-CI-05** | Quality Gate            | Code formatting verification          | `npm run format:check` runs Prettier against all workspace files and passes.                                         | Local execution & CI job            |
| **TC-CI-06** | Quality Gate            | ESLint code quality & rules           | `npm run lint` executes ESLint across TypeScript/React files with 0 errors/warnings.                                 | Local execution & CI job            |
| **TC-CI-07** | Quality Gate            | Strict TypeScript typecheck           | `npm run typecheck` passes with zero type violations under `strict: true`.                                           | Local execution & CI job            |
| **TC-CI-08** | Quality Gate            | Vitest unit and invariant tests       | `npm run test` executes all domain unit and invariant tests with 100% pass.                                          | Local execution & CI job            |
| **TC-CI-09** | Quality Gate            | Production frontend build             | `npm run build` generates production `dist/` bundle without errors.                                                  | Local execution & CI job            |
| **TC-CI-10** | E2E & Artifacts         | Playwright E2E test execution         | Playwright Chromium browser installed; `npm run test:e2e` executes all smoke tests.                                  | Local execution & CI job            |
| **TC-CI-11** | Failure Recovery        | E2E failure diagnostics upload        | On E2E test failure, `playwright-report/` and `test-results/` artifacts uploaded automatically (`if: failure()`).    | Workflow conditional step           |
| **TC-CI-12** | Windows Desktop         | Windows Tauri Rust compilation        | `windows-latest` runner executes Rust toolchain setup, `cargo test`, `cargo check`, `cargo clippy`, and Tauri build. | Windows CI Job definition           |
| **TC-CI-13** | Security & Supply Chain | Action version pinning                | All third-party GitHub Actions are pinned to explicit major versions (`@v4`, `@v1`).                                 | Security audit & workflow review    |
| **TC-CI-14** | Security & Access       | Principle of least privilege          | Top-level workflow permissions explicitly scoped to `contents: read`.                                                | Security audit & workflow review    |
| **TC-CI-15** | Security & Config       | Zero secrets requirement              | Baseline CI executes without requiring repository secrets or private tokens.                                         | Security audit & workflow review    |

---

## 3. Detailed Test Specifications

### TC-CI-01 through TC-CI-03: Event Triggers

- **Preconditions:** `.github/workflows/ci.yml` exists on feature branch.
- **Triggers:**
  - `pull_request`: `branches: [main]`
  - `push`: `branches: [main]`
  - `workflow_dispatch`: manual execution
- **Pass Criteria:** Workflow triggers correctly on all specified events without syntax errors.

### TC-CI-04 through TC-CI-09: Frontend Quality Gates Job (`frontend-checks`)

- **Runner:** `ubuntu-latest`
- **Node.js Version:** `22.x`
- **Steps:**
  1. `actions/checkout@v4`
  2. `actions/setup-node@v4` with `cache: 'npm'`
  3. `npm ci`
  4. `npm run format:check`
  5. `npm run lint`
  6. `npm run typecheck`
  7. `npm run test`
  8. `npm run build`
- **Pass Criteria:** All steps complete with exit code 0.

### TC-CI-10 & TC-CI-11: E2E Playwright Job (`e2e-tests`)

- **Runner:** `ubuntu-latest`
- **Steps:**
  1. `actions/checkout@v4`
  2. `actions/setup-node@v4` with `cache: 'npm'`
  3. `npm ci`
  4. `npx playwright install --with-deps chromium`
  5. `npm run test:e2e`
  6. `actions/upload-artifact@v4` with `if: failure()`, capturing `playwright-report/` and `test-results/` with retention.
- **Pass Criteria:** Tests pass in headless Chromium; failure artifacts uploaded if any test fails.

### TC-CI-12: Windows Desktop Tauri Job (`desktop-windows-build`)

- **Runner:** `windows-latest`
- **Steps:**
  1. `actions/checkout@v4`
  2. `actions/setup-node@v4` with `cache: 'npm'`
  3. `actions-rust-lang/setup-rust-toolchain@v1` with `toolchain: stable`, `components: clippy`
  4. `npm ci`
  5. `npm run build`
  6. `cargo test --manifest-path src-tauri/Cargo.toml`
  7. `cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings`
  8. `cargo check --manifest-path src-tauri/Cargo.toml --release`
- **Pass Criteria:** Rust toolchain installs cleanly, cargo tests/clippy pass, Windows Tauri backend compiles cleanly.

### TC-CI-13 through TC-CI-15: Security & Guardrails

- **Action Pinning:**
  - `actions/checkout@v4`
  - `actions/setup-node@v4`
  - `actions-rust-lang/setup-rust-toolchain@v1`
  - `actions/upload-artifact@v4`
- **Permissions:** `permissions: contents: read`
- **Secrets:** 0 repository secrets required.

---

## 4. Quality Gate Sign-Off Criteria

1. 100% of defined test cases documented and accounted for in implementation.
2. Local scripts match CI command steps exactly.
3. No suppressed tests or skipped quality checks.
