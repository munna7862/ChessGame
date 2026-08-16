## 1. Pull Request Overview

- **Sprint:** <!-- e.g., Phase 02 · Sprint 05: Antigravity Workspace and Agent Guardrails -->
- **Feature Branch:** <!-- e.g., feature/p02-s05-antigravity-workspace-and-agent-guardrails -->
- **Target Branch:** `main`
- **Related Issues / PRs:** <!-- e.g., Fixes #, Closes #, References PR # -->

---

## 2. Summary of Changes

<!-- Provide a concise, bulleted summary of key architectural, domain, UI, and tooling changes implemented in this PR. -->

-
-
-

---

## 3. AI-Assisted & Multi-Agent Verification Checklist

- [ ] **Clean Git Diff:** Scope is strictly confined to active sprint tasks; 0 unrelated files or speculative modifications.
- [ ] **No Test Bypass:** Zero test suppression (`it.skip`, `test.skip`, `xit`), zero softened assertions, and no fake passes.
- [ ] **Strict Type Safety:** Zero `@ts-ignore`, zero `@ts-nocheck`, and zero `any` usage.
- [ ] **Zero Cloud / Telemetry:** Strictly local-first Windows desktop operation; no remote databases, auth APIs, or telemetry beacons.
- [ ] **Protected Boundaries Respected:** Protected paths (`.git/`, `.github/workflows/`, core configs) modified only with explicit architectural authorization.
- [ ] **Reproducible Evidence:** All test logs and command output correspond to actual local terminal execution.

---

## 4. Test Execution & Quality Gate Evidence

| Verification Gate             | Command                      | Execution Status | Observed Output                      |
| :---------------------------- | :--------------------------- | :--------------- | :----------------------------------- |
| **Code Formatting**           | `npm run format:check`       | Pass / Fail      | <!-- Output summary -->              |
| **Static Code Analysis**      | `npm run lint`               | Pass / Fail      | <!-- 0 errors, 0 warnings -->        |
| **Typecheck**                 | `npm run typecheck`          | Pass / Fail      | <!-- 0 errors under strict: true --> |
| **Unit & Invariant Tests**    | `npm run test:unit`          | Pass / Fail      | <!-- e.g., X passed in Y ms -->      |
| **E2E Smoke Tests**           | `npm run test:e2e`           | Pass / Fail      | <!-- e.g., X passed in Y ms -->      |
| **Frontend Production Build** | `npm run build`              | Pass / Fail      | <!-- Output bundle size / status --> |
| **Tauri Rust Toolchain**      | `cargo test` / `cargo check` | Pass / Skip      | <!-- Status if native touched -->    |

---

## 5. Security & Desktop Safety Sign-off

- **Security Officer Sign-off:** <!-- APPROVED / NOT APPLICABLE -->
- **Tauri Permissions Scoped:** <!-- Verified least-privilege capability allowlist -->
- **WebWorker / Engine Isolation:** <!-- Stockfish WASM non-blocking & isolated -->
- **Untrusted Input Validation:** <!-- Runtime Zod / Serde schemas for imported PGN/FEN/IPC -->

---

## 6. Sprint Definition of Done (DoD)

- [ ] **Scope Complete:** Implemented without speculative or unrelated changes.
- [ ] **100% Green Automation:** Vitest unit, fast-check property, and integration tests pass without skips.
- [ ] **Clean Typecheck & Lint:** `tsc --noEmit` and `eslint` pass with 0 errors and 0 warnings.
- [ ] **Security Audit Approved:** Tauri permissions and CSP verified against least privilege.
- [ ] **PO Acceptance Approved:** Product requirements and UX journeys satisfied.
- [ ] **Git Diff Reviewed & Clean:** Conventional commits on feature branch with no artifacts or temporary files.
- [ ] **Documentation Updated:** Architectural ADRs, test catalogs, and operating docs updated.
- [ ] **GitHub PR Raised:** Remote Pull Request created and linked in `task.md`.
