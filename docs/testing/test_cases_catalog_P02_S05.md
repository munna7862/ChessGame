# Test Cases Catalog: Phase 02 · Sprint 05 — Antigravity Workspace and Agent Guardrails

## 1. Overview & Objective

This document defines the test catalog, verification criteria, and quality gates for **Phase 02 · Sprint 05: Antigravity Workspace and Agent Guardrails**. The objective is to ensure that all autonomous and AI-assisted development operations within ChessForge are strictly governed by discoverable rules, bounded command scopes, protected file boundaries, structured handoff schemas, review artifact contracts, and comprehensive Pull Request templates.

---

## 2. Test Cases Matrix

| Test ID      | Category               | Scenario / Description                 | Expected Outcome                                                                                                                                                        | Verification Method                       |
| :----------- | :--------------------- | :------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------- |
| **TC-GR-01** | Rule Discoverability   | Root and workspace agent rules         | `AGENTS.md` and `.agents/AGENTS.md` exist, are identical in substance, and clearly discoverable at repository entry points.                                             | File existence & content parity audit     |
| **TC-GR-02** | Protected Areas        | Protected workspace paths & files      | Core infrastructure files (`.git/`, `.github/workflows/`, `package-lock.json`, Tauri security capabilities, ADRs) are categorized with explicit modification protocols. | Document audit & static rule verification |
| **TC-GR-03** | Branch Standards       | Branch & worktree naming standards     | Conventional branch naming patterns (`feature/<phase-sprint-slug>`, `bugfix/<issue-slug>`) are defined with unambiguous naming rules.                                   | Pattern review & git branch check         |
| **TC-GR-04** | Agent Handoff          | Structured handoff template            | Standardized 5-point handoff schema (Completed, Remaining, Tests/Results, Known Issues, Next Persona) is defined and enforced in `task.md`.                             | Schema inspection & lifecycle review      |
| **TC-GR-05** | Review Artifacts       | Review artifact specifications         | Expectations and formats for `task.md`, test catalogs, PR documents, and implementation plans are defined.                                                              | Artifact schema & documentation audit     |
| **TC-GR-06** | Allowed Commands       | Terminal command execution allowlist   | Permissible development, linting, testing, and git commands are explicitly enumerated.                                                                                  | Documentation review & command audit      |
| **TC-GR-07** | Restricted Commands    | Destructive terminal command blocklist | Destructive and risky operations (`git push --force`, `git reset --hard`, cloud telemetry, arbitrary script execution) are explicitly prohibited.                       | Security review & rule audit              |
| **TC-GR-08** | PR Template            | AI-Assisted Pull Request Template      | `.github/pull_request_template.md` exists with AI-assisted checklists, verification artifacts, and DoD sign-offs.                                                       | File existence & schema validation        |
| **TC-GR-09** | Anti-Bypass Guardrails | Strict anti-bypass enforcement         | Prohibitions on `it.skip()`, `test.skip()`, `// @ts-ignore`, `eslint-disable`, assertion weakening, and fabricated evidence are codified.                               | Linter & codebase verification            |
| **TC-GR-10** | Local-First Invariants | Zero-cloud and resource limits         | Invariants regarding $< 150\text{ MB}$ memory footprint, 60fps rendering, local Stockfish WASM, and zero cloud services are codified.                                   | Architectural rule audit                  |
| **TC-GR-11** | Zero Unrelated Changes | Scope containment & clean diffs        | Rules preventing agents from modifying unrelated files, introducing speculative code, or committing temporary artifacts are enforced.                                   | Git diff audit & simulated task check     |
| **TC-GR-12** | Type Safety            | TypeScript strictness & validation     | `strict: true`, 0 `any` types, Zod runtime validation at boundaries, and Serde in Rust are codified.                                                                    | Compiler & linter verification            |
| **TC-GR-13** | Review Severity        | Finding severity & refinement loop     | `BLOCKING`, `NON-BLOCKING`, and `SUGGESTION` severities with refinement loop format in `task.md` are documented.                                                        | Review protocol audit                     |
| **TC-GR-14** | Link & Doc Integrity   | GitHub markdown links & doc standards  | Absolute file URI links (`file:///...`) and consistent markdown formatting across docs are maintained.                                                                  | Markdown link & formatting check          |
| **TC-GR-15** | DoD Compliance         | Sprint Definition of Done              | Complete 8-point Definition of Done checklist is verified across all sprint artifacts.                                                                                  | Sprint DoD verification                   |

---

## 3. Detailed Test Specifications

### TC-GR-01 & TC-GR-02: Rule Discoverability & Protected Areas

- **Preconditions:** Repository root contains `AGENTS.md` and `.agents/AGENTS.md`.
- **Test Steps:**
  1. Inspect `AGENTS.md` and `.agents/AGENTS.md`.
  2. Verify that protected paths (e.g. `.git/`, `.github/workflows/ci.yml`, `package-lock.json`, `docs/adr/`, `src-tauri/capabilities/`) are listed with required permissions and rationale.
- **Pass Criteria:** Both files contain comprehensive protected area sections and synchronized operating rules.

### TC-GR-03 through TC-GR-05: Branching, Handoffs, and Review Artifacts

- **Preconditions:** Agent workflow guide and rules define collaboration schemas.
- **Test Steps:**
  1. Verify branch naming convention matches `^(feature|bugfix|hotfix|docs|refactor|chore)/[a-z0-9-]+$`.
  2. Verify handoff template contains:
     - 1. Completed work
     - 2. Remaining work
     - 3. Executed tests & results
     - 4. Known issues or deferred items
     - 5. Next assigned persona and exact verification required
  3. Verify required review artifacts: `task.md`, `docs/testing/test_cases_catalog_*.md`, `docs/pull_requests/pr_*.md`.
- **Pass Criteria:** Handoff and artifact formats are unambiguous, structured, and repeatable.

### TC-GR-06 & TC-GR-07: Terminal Command Allowlist & Blocklist

- **Test Steps:**
  1. Verify permissible commands: `npm test`, `npm run test:e2e`, `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run format`, `npm run build`, `npm run tauri:*`, `cargo test`, `git status`, `git diff`, `git add`, `git commit`, `git checkout`, `git push -u origin <branch>`, `gh pr create`, `gh pr view`.
  2. Verify blocked commands: `git push --force`, `git push -f`, `git reset --hard`, `rm -rf /`, `del /s /q C:\*`, unsolicited npm install without scope approval.
- **Pass Criteria:** Command boundaries are explicitly documented in `AGENTS.md` and `docs/guides/agent_guardrails_guide.md`.

### TC-GR-08: AI-Assisted Pull Request Template

- **Preconditions:** `.github/pull_request_template.md` exists.
- **Test Steps:**
  1. Verify PR template sections: Summary, Sprint & Story Context, AI-Assisted Changes Checklist, Test & Verification Evidence, Security & Desktop Safety Sign-off, and Sprint DoD.
  2. Confirm formatting supports GitHub PR creation with markdown checklist compatibility.
- **Pass Criteria:** Template is comprehensive, clean, and ready for automated `gh pr create` workflows.

### TC-GR-09 through TC-GR-15: Quality Gates, Anti-Bypass, and DoD Verification

- **Test Steps:**
  1. Execute `npm run format:check` -> verify Prettier compliance.
  2. Execute `npm run lint` -> verify 0 ESLint warnings or errors.
  3. Execute `npm run typecheck` -> verify strict TypeScript compilation.
  4. Execute `npm run test:unit` -> verify domain & component tests pass.
  5. Execute `npm run test:e2e` -> verify Playwright smoke tests pass.
  6. Execute `npm run build` -> verify production bundle generates without errors.
- **Pass Criteria:** All automated checks pass with exit code 0.

---

## 4. Test Catalog Sign-off

- **Author:** SDET Architect (SDET)
- **Status:** **APPROVED & BASELINED**
- **Date:** 2026-08-16
