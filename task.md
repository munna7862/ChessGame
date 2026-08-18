# Task Tracking: ChessForge Sprint Lifecycle

## Active Sprint

**Phase 06 · Sprint 06: Engine Failure Recovery**  
Branch: `feature/p06-s06-engine-failure-recovery`

---

## Sprint Tasks Breakdown

- [x] **SM-6601**: [Scrum Master] Initialize Sprint 06 plan, task breakdown, dependency verification, and lifecycle tracking in `task.md`. Checkout branch `feature/p06-s06-engine-failure-recovery`.
- [x] **CDA-6601**: [Chess Domain Architect / Dev Architect] Formalize Engine Failure Recovery & Invariant Specifications (worker crash detection, state machine transition to 'error', position preservation, restart mechanics, session token invalidation against stale responses, fallback to Human vs Human mode) in `docs/chess/engine_failure_recovery_invariants.md`.
- [x] **SDET-6601**: [SDET Architect] Author Sprint 06 Test Cases Catalog (`docs/testing/test_cases_catalog_P06_S06.md`) covering startup crashes, in-flight calculation crashes, error banner/recovery UI, restart engine action, fallback to 2-player action, stale response rejection during/after recovery, and position preservation.
- [x] **DEV-6601**: [Dev Architect / Senior SDE] Extend `EngineServiceImpl`, `StockfishWorkerBridge`, and `useEngineOpponent` to handle worker crashes (onerror/onmessageerror/unexpected termination), emit error state with recovery options, restart engine lifecycle cleanly, and support fallback to Human vs Human.
- [x] **DEV-6602**: [Dev Architect / Senior SDE] Implement user-friendly Engine Error & Recovery UI (notification banner / recovery action dialog in `PlayerPanel.tsx` / `EngineErrorBanner.tsx` with "[Restart Engine]" and "[Continue as Two Players]" buttons).
- [x] **DEV-6603**: [Dev Architect / Senior SDE] Implement failure logging/telemetry hooks and comprehensive unit/integration test suites (`src/features/engine/__tests__/EngineFailureRecovery.test.tsx`, `EngineDiagnostics.test.ts`, updated `useEngineOpponent.ts`, `EngineServiceImpl.ts`).
- [x] **DEV-6604**: [Dev Architect / Senior SDE] Author Playwright E2E test suite (`tests/e2e/engine-failure-recovery.spec.ts`) validating in-browser crash injection, UI error notification, engine restart, and fallback to 2-player gameplay.
- [x] **DEV-6605**: [Dev Architect / Senior SDE] Conduct Dev Technical Code Acceptance Review.
- [x] **SEC-6601**: [Security Officer] Conduct Desktop & Sandboxed Worker Security Audit (no memory leaks on worker termination/re-instantiation, crash isolation, safe logging).
- [x] **SDET-6602**: [SDET Architect] Execute comprehensive test suites, verify quality gates (100% Green, 0 skips across `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test`, `npm run test:e2e`, `npm run build`).
- [x] **PO-6601**: [Product Owner] Conduct Product & Engine Failure Recovery Acceptance Criteria Review.
- [x] **DO-6601**: [DevOps Engineer] Author PR documentation (`docs/pull_requests/pr_P06_S06_engine_failure_recovery.md`), commit atomic changes, push to origin, create GitHub PR, and auto-merge to `main`.

---

## Persona Handoff Status

- **Current Persona:** DevOps Engineer
- **Handoff Target:** Release / Main Branch
- **Sprint Status:** **COMPLETED & APPROVED FOR MERGE**

---

## Sprint Review Comments & Refinement Loop

- `[SCRUM_MASTER] -> [CHESS_DOMAIN_ARCHITECT]`: Phase 06 · Sprint 06 initialized on feature branch `feature/p06-s06-engine-failure-recovery`. Prerequisites verified: `useEngineOpponent`, `StockfishWorkerBridge`, `EngineServiceImpl`, and Human vs Computer game flow are fully tested and operational. Handing off to Chess Domain Architect / Dev Architect to formalize Engine Failure Recovery invariants in `docs/chess/engine_failure_recovery_invariants.md`. Status: **APPROVED**.
- `[CHESS_DOMAIN_ARCHITECT] -> [SDET_ARCHITECT]`: Engine Failure Recovery invariants INV-EFR-01 through INV-EFR-06 authored in `docs/chess/engine_failure_recovery_invariants.md`. Specifications cover crash detection, position preservation, request invalidation, restart mechanics, two-player fallback, and local diagnostics logging. Handing off to SDET Architect. Status: **APPROVED**.
- `[SDET_ARCHITECT] -> [DEV_ARCHITECT]`: Test Cases Catalog TC-EFR-01 through TC-EFR-11 authored in `docs/testing/test_cases_catalog_P06_S06.md`. Ready for production implementation. Status: **APPROVED**.
- `[DEV_ARCHITECT] -> [SECURITY_OFFICER]`: Implemented `StockfishWorkerBridge` error & messageerror listeners, `EngineServiceImpl` diagnostics & restart cleanup, `EngineDiagnosticsLogger`, `EngineErrorBanner.tsx`, `useEngineOpponent` recovery actions, and `GameSessionController.updateGameMode`. Handing off for Security & Crash Isolation Audit. Status: **APPROVED**.
- `[SECURITY_OFFICER] -> [SDET_ARCHITECT]`: Security & Crash Isolation Audit complete. Worker crashes are sandboxed within the WebWorker container, preventing UI degradation. Dead workers are terminated immediately before recreating fresh instances. Local-first diagnostics enforce zero external network egress. Status: **APPROVED**.
- `[SDET_ARCHITECT] -> [PRODUCT_OWNER]`: Quality Gates verified: Vitest 58/58 test suites (541/541 tests passing), Playwright 47/47 tests passing, TypeScript 0 errors, ESLint 0 errors, Prettier formatting clean, Vite production build successful. Status: **APPROVED**.
- `[PRODUCT_OWNER] -> [DEVOPS_ENGINEER]`: Product & UX Acceptance Review approved. Engine failure recovery UI banner, position preservation guarantees, seamless engine restart, and fallback to two players satisfy all acceptance criteria. Authorize release and PR. Status: **APPROVED**.
