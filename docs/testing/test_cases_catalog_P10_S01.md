# Pre-Implementation Test Cases Catalog: Phase 10 · Sprint 01

**Sprint:** Phase 10 · Sprint 01: QA Inventory and Traceability  
**Target Specification:** [Product Requirements Baseline](file:///c:/Workspace/ChessGame/docs/product-requirements.md), [Testing Strategy](file:///c:/Workspace/ChessGame/docs/testing-strategy.md), [Architecture Specification](file:///c:/Workspace/ChessGame/docs/architecture.md), [Security Model](file:///c:/Workspace/ChessGame/docs/security-model.md)  
**Author:** SDET Architect & Chess Domain Architect  
**Status:** `Approved & Ready for Execution`

---

## 1. Overview & Objectives

The primary objective of **Phase 10 · Sprint 01** is to create a single authoritative Requirements Traceability Matrix and Test Inventory (`docs/qa-matrix.md`) that maps every product, domain, engine, clock, persistence, accessibility, visual, and desktop security requirement to its corresponding production code and automated test coverage across all test tiers.

This catalog formalizes the test scenarios and validation rules for verifying the completeness, accuracy, and structural integrity of the QA Inventory and the Critical-Path Smoke Suite.

---

## 2. Test Cases Specification

### 2.1 Requirements Traceability & Enumeration (TC-QA-01 to TC-QA-03)

| Test ID      | Test Category           | Description & Preconditions                                                                                                                                    | Expected Outcome                                                                                                                                                              | Verification Tier               |
| :----------- | :---------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------ |
| **TC-QA-01** | Positive / Traceability | Enumerate all functional and non-functional requirements across 7 core modules (`REQ-DOM`, `REQ-ENG`, `REQ-CLK`, `REQ-PERS`, `REQ-UI`, `REQ-A11Y`, `REQ-SEC`). | All 45+ MVP requirements are explicitly numbered, documented with clear titles, acceptance criteria, and categorized by architectural layer.                                  | Tier 1 Unit / Documentation     |
| **TC-QA-02** | Positive / Coverage     | Map every enumerated requirement to implementation source files and automated test files (Unit, Invariant, Integration, E2E).                                  | 100% of functional requirements have direct automated test coverage with verified file references and test identifiers. Zero orphaned requirements.                           | Tier 1 Invariant / Matrix Audit |
| **TC-QA-03** | Boundary / Gap Analysis | Perform systematic gap analysis on all requirements to identify any untested edge cases or partial implementations.                                            | Gap analysis explicitly classifies requirement coverage status into `Fully Automated`, `Partially Automated (Hybrid)`, or `Manual-Only`, with clear rationale and mitigation. | Tier 1 Invariant / Matrix Audit |

---

### 2.2 Test Suite Architecture & Optimization (TC-QA-04 to TC-QA-06)

| Test ID      | Test Category            | Description & Preconditions                                                                                                                                                | Expected Outcome                                                                                                                                                             | Verification Tier               |
| :----------- | :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------ |
| **TC-QA-04** | Analysis / Optimization  | Identify intentional vs redundant duplicate tests across test tiers (Vitest unit vs React Testing Library vs Playwright E2E).                                              | Document justification for intentional duplicate multi-tier defense-in-depth (e.g. FEN parser unit tests + PGN modal E2E tests) while flagging any wasteful redundant tests. | Tier 1 Documentation            |
| **TC-QA-05** | Negative / Risk Analysis | Identify manual-only and hardware/platform-dependent risks (Windows native file dialogs, hardware sound synthesis, extreme OS window scaling, abrupt process termination). | All non-mockable native boundaries are documented in a Dedicated Manual Risk Matrix with specific manual test steps and safety guardrails.                                   | Tier 1 Invariant / Matrix Audit |
| **TC-QA-06** | Release Gate / Matrix    | Author `docs/qa-matrix.md` with complete tabular traceability, test execution metrics, module health scores, and release gating criteria.                                  | `docs/qa-matrix.md` is fully rendered, formatted with clickable file links, and acts as the single source of truth for Phase 10 Quality Engineering.                         | Tier 1 Matrix Artifact          |

---

### 2.3 Critical-Path Smoke Suite & Invariants (TC-QA-07 to TC-QA-08)

| Test ID      | Test Category                   | Description & Preconditions                                                                                                                                                                                                       | Expected Outcome                                                                                                                 | Verification Tier               |
| :----------- | :------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- | :------------------------------ |
| **TC-QA-07** | Positive / Smoke Suite          | Define the Critical-Path Smoke Suite covering the 10 vital user flows (HvH playout, HvC AI sparring, pawn promotion, checkmate, resignation, draw agreement, PGN export/import, FEN load, crash recovery, Fischer clock timeout). | Smoke suite test suite execution completes rapidly (< 30s) and serves as the pre-merge and release candidate sanity check.       | Tier 3 Integration & Tier 5 E2E |
| **TC-QA-08** | Invariant / Automated Integrity | Author automated test `src/test/qaMatrixInvariants.test.ts` validating that all files, requirement keys, and test references documented in the matrix exist in the codebase.                                                      | Automated test passes, confirming zero broken file links, 100% test file registration, and strict adherence to matrix standards. | Tier 1 Invariant / Vitest       |

---

## 3. Golden Matrix Verification Checklist

- [x] Every MVP requirement in `docs/product-requirements.md` maps to at least one test.
- [x] Pure domain rules (castling, en passant, promotion, checkmate, stalemate, 50-move, threefold) have Tier 1 unit & Tier 2 property tests.
- [x] Stockfish WASM engine interactions have Tier 3 non-blocking worker tests & Tier 5 E2E tests.
- [x] Clocks and timeout mechanics have Tier 1 domain tests & Tier 4 component tests.
- [x] Local persistence and crash recovery have Tier 1 schema tests & Tier 5 E2E recovery tests.
- [x] Accessibility (ARIA, roving tabindex, screen reader live regions, high contrast) has Tier 4 & Tier 5 tests.
- [x] Windows desktop security (local-first, CSP, capability allowlist) is audited.
