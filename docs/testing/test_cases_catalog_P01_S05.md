# Test Cases Catalog: Testing Strategy and Agent Operating Contract

**Sprint:** Phase 01 · Sprint 05  
**Document Reference:** `docs/testing/test_cases_catalog_P01_S05.md`  
**SDET Architect:** Test Automation & Operating Contract Verification Matrix

---

## 1. Scope & Verification Objective

This test catalog defines the validation scenarios for:

1. **Testing Strategy & Pyramid Adherence** (`docs/testing-strategy.md`)
2. **Agent Workflow & Operating Contract** (`docs/agent-workflow.md`, `AGENTS.md`)
3. **Multi-Agent Persona Handoff Sequence & Quality Gates**
4. **Anti-Bypass Guardrails & Defect Refinement Loop**
5. **Dry-Run Sprint Simulation** (simulating a full sprint execution with defect injection and recovery)

---

## 2. Test Cases Catalog & Matrix

| Test ID       | Test Category                  | Scenario / Invariant                                            | Verification Steps / Invariant Expected                                                                                                                                                                      | Target Status |
| :------------ | :----------------------------- | :-------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------ |
| **TC-AGT-01** | **Pyramid Architecture**       | Test pyramid layers and toolchain explicitly specified          | Verify `docs/testing-strategy.md` defines Tier 1 (Vitest domain), Tier 2 (fast-check), Tier 3 (Engine/IPC), Tier 4 (RTL components), Tier 5 (Playwright E2E), Tier 6 (Security/Schema) with clear ownership. | **APPROVED**  |
| **TC-AGT-02** | **Chess Domain Invariants**    | Golden FEN suite and mathematical invariants defined            | Verify Golden FEN suite includes starting pos, castling restrictions, en passant, promotion, pins, threefold, 50-move, insufficient material, and malformed FENs.                                            | **APPROVED**  |
| **TC-AGT-03** | **Anti-Flakiness & Clocks**    | Zero real-time `setTimeout` policy enforced                     | Verify testing strategy mandates `vi.useFakeTimers()` for clocks and mock WebWorker bridge for UCI engine evaluation.                                                                                        | **APPROVED**  |
| **TC-AGT-04** | **Anti-Bypass Guardrail**      | Explicit prohibition of test suppression or assertion weakening | Verify `AGENTS.md` and `docs/testing-strategy.md` forbid `it.skip`, `test.skip`, `// @ts-ignore`, removing assertions, or lowering coverage gates.                                                           | **APPROVED**  |
| **TC-AGT-05** | **Agent Persona Sequence**     | Formal persona handoff order defined                            | Verify sequence: Scrum Master $\to$ SDET (Test Catalog) $\to$ Dev Architect (Code) $\to$ Security Officer (Audit) $\to$ SDET (QA Gate) $\to$ Product Owner (AC) $\to$ DevOps (PR).                           | **APPROVED**  |
| **TC-AGT-06** | **Conditional Quality Gates**  | Domain-specific gates applied without ceremony                  | Verify architecture, chess domain, UI, Tauri native, and release sprints have clearly tailored quality gate requirements.                                                                                    | **APPROVED**  |
| **TC-AGT-07** | **Review Severity Protocol**   | Blocking vs Non-Blocking classification                         | Verify reviews explicitly classify findings as `BLOCKING`, `NON-BLOCKING`, or `SUGGESTION`, where only `BLOCKING` halts the gate.                                                                            | **APPROVED**  |
| **TC-AGT-08** | **Git & Branching Governance** | Branch naming and atomic commit rules                           | Verify rules mandate isolated `feature/<name>` branches, conventional commits (`feat:`, `fix:`, `test:`, `docs:`), and automated PR creation via GitHub CLI.                                                 | **APPROVED**  |
| **TC-AGT-09** | **Refinement Loop Protocol**   | Feedback logging in `task.md` format                            | Verify format: `[REVIEWER_ROLE] -> [TARGET_ROLE]: Description of issue, failing test/criteria, and required fix.`                                                                                            | **APPROVED**  |
| **TC-AGT-10** | **Dry-Run Sprint Simulation**  | Dry-run execution of hypothetical defect scenario               | Simulate hypothetical Sprint (e.g., Castling validation defect), verify defect injection blocks SDET gate, triggers refinement loop in `task.md`, and unblocks upon green fix.                               | **APPROVED**  |

---

## 3. Dry-Run Sprint Simulation Scenario

### 3.1 Scenario Definition: Castling Through Check Defect

1. **Sprint Initialized:** Scrum Master breaks down task `CHESS-104: Castling rights validation`.
2. **Test Catalog Drafted:** SDET crafts `TC-CASTLE-03: White King cannot castle kingside when f1 is attacked by Black Bishop on a6`.
3. **Implementation Handed Over:** Dev Architect implements castling logic, but mistakenly checks only the destination square `g1` rather than the transit square `f1`.
4. **Dev Technical Code Review:** Dev runs initial unit tests, but misses the transit square corner case.
5. **Quality Gate QA Run:** SDET runs full test suite including Golden FEN `CASTLING_THROUGH_CHECK`.
6. **Defect Identified & Blocked:**
   - Test `TC-CASTLE-03` fails: `expected castleMove to be null, received 'e1g1'`.
   - SDET rejects the release gate: **REJECTED (BLOCKING)**.
7. **Refinement Loop Entry:** SDET logs in `task.md`:
   `[SDET_ARCHITECT] -> [DEV_ARCHITECT]: BLOCKING - Castling through attacked transit square f1 permitted under FEN CASTLING_THROUGH_CHECK. Fix move generator.`
8. **Dev Fix & Re-evaluation:** Dev fixes transit ray intersection check, re-runs tests (100% green).
9. **SDET Re-evaluation & Sign-off:** SDET verifies green report: **APPROVED**.
10. **Product Owner & DevOps Release:** PO signs off, DevOps raises PR.

---

## 4. Quality Gate Acceptance Sign-off

- [x] All 10 test case specifications mapped to operational rules and architectural standards.
- [x] Dry-run scenario confirms fail-closed behavior with zero defect bypass.
- [x] SDET Architect Sign-off: **APPROVED**.
