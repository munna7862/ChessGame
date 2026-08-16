# Phase 01 · Sprint 05: Testing and Agent Operating Contract

## Summary of Changes

This Pull Request establishes the official Testing Strategy and Multi-Agent Operating Contract for **ChessForge**, defining how human developers, AI agents (Antigravity), and CI pipelines collaborate throughout the project lifecycle.

### Key Deliverables & Specifications

1. **Testing Strategy & Pyramid Architecture (`docs/testing-strategy.md`)**:
   - 6-tier test pyramid: Tier 1 (Vitest pure chess domain unit tests), Tier 2 (fast-check generative property-based invariant testing), Tier 3 (WebWorker Stockfish UCI engine integration), Tier 4 (React Testing Library UI component & gesture tests), Tier 5 (Playwright desktop E2E playout automation), Tier 6 (Tauri capability & security schema audits).
   - Core mathematical chess invariants specification (King parity, legal move safety, board-history parity, FEN/PGN serialization round-trip, move reversibility, terminal state immutability, stale search token isolation).
   - Deterministic Golden FEN test fixture suite covering standard start, castling restrictions, en passant expiration, promotion check/underpromotion, absolute pins, discovered checks, threefold repetition, 50-move rule, and malformed FEN handling.
   - Zero-flakiness policy forbidding real-time `setTimeout` in favor of fake timers (`vi.useFakeTimers()`) and deterministic mock WebWorker bridges.
   - Desktop performance & latency benchmarks (move validation $< 1.0\text{ms}$, 60fps render budget, memory $< 150\text{MB}$).

2. **Agent Workflow & Operating Contract (`docs/agent-workflow.md`)**:
   - Detailed roles for virtual personas: Scrum Master, Chess Domain Architect, SDET Architect, Dev Architect / Senior SDE, Security & Desktop Safety Officer, Product Owner, DevOps Engineer.
   - 8-step sprint execution lifecycle and review handoff sequence.
   - Explicit review finding severity (`BLOCKING`, `NON-BLOCKING`, `SUGGESTION`) with refinement loop logging in `task.md`.
   - Worktree and branching standards (`feature/*`, `bugfix/*`), conventional commit conventions, and automated PR submission via GitHub CLI.
   - Local-first desktop mandate (no unsolicited cloud infrastructure, remote DBs, or auth servers in v1).

3. **Universal Agent Operating Rules (`AGENTS.md` and `.agents/AGENTS.md`)**:
   - Synchronized root and workspace configuration rules enforcing engineering mandates, type safety (`any` prohibited, Zod/Serde boundaries), failure-handling rules, and anti-bypass guardrails.
   - Strict prohibition of test suppression (`it.skip`, `test.skip`), assertion weakening, compiler error masking (`// @ts-ignore`), and unverified metrics.

4. **Sprint 05 Verification Catalog & Dry-Run Test Matrix (`docs/testing/test_cases_catalog_P01_S05.md`)**:
   - TC-AGT-01 through TC-AGT-10 mapping operating rules and testing strategy.
   - Full dry-run sprint simulation documenting defect injection, review blocking, refinement loop, and green re-evaluation.

---

## Verification & Quality Gates

- [x] **SDET Architect Test Cases Matrix (`docs/testing/test_cases_catalog_P01_S05.md`):** TC-AGT-01 to TC-AGT-10 **APPROVED**.
- [x] **Dev Technical Code Review:** Specification structure and invariants verified. **APPROVED**.
- [x] **Desktop Security Audit:** Local-first constraints and least privilege operating bounds verified. **APPROVED**.
- [x] **Product Owner Acceptance:** Sprint acceptance criteria fully satisfied without ceremonial bloat. **APPROVED**.

---

## Persona Handoff Sign-off

- **Scrum Master:** Sprint plan, task breakdown, and dependency tracking verified.
- **SDET Architect:** Testing pyramid, fast-check property testing, Golden FENs, and anti-bypass guardrails established.
- **Dev Architect:** Agent workflow, conventional commits, and root `AGENTS.md` operating contract established.
- **Security Officer:** Desktop isolation, zero telemetry, and safe operating bounds verified.
- **Product Owner:** Accepted for merge.
- **DevOps Engineer:** Ready for PR submission.
