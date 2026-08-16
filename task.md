# Task Tracking: ChessForge Sprint Lifecycle

## Active Sprint

**Phase 03 · Sprint 03: Special Moves**
Branch: `feature/p03-s03-special-moves`

---

## Sprint Tasks Breakdown

- [x] **SM-3301**: [Scrum Master] Initialize Sprint 03 plan, task breakdown, dependency verification, and feature branch `feature/p03-s03-special-moves` in `task.md`.
- [x] **CDA-3301**: [Chess Domain Architect] Formalize special move domain invariants (kingside/queenside castling legality & restrictions, en passant lifespan & target square mechanics, promotion piece validation & game state preservation, SAN notation rules) in `docs/chess/special_moves_invariants.md`.
- [x] **SDET-3301**: [SDET Architect] Author Sprint 03 Test Cases Catalog (`docs/testing/test_cases_catalog_P03_S03.md`) covering kingside/queenside castling, all castling restriction edge cases (check, transit check, destination check, moved king/rook, interposing pieces), en passant capture & expiration, promotions (Q, R, B, N) with check/checkmate, invalid special move rejection, and notation accuracy.
- [x] **DEV-3301**: [Dev Architect / Senior SDE] Inspect and refine domain ports, types, and adapter (`ChessJsAdapter`, `ports.ts`, `types.ts`) for first-class special move capabilities, validation, and SAN/UCI consistency.
- [x] **DEV-3302**: [Dev Architect / Senior SDE] Conduct Dev Technical Code Acceptance Review.
- [x] **SEC-3301**: [Security Officer] Conduct Desktop & Runtime Safety Audit (untrusted promotion piece input validation, memory safety on castling/en-passant transitions, zero injection).
- [x] **SDET-3302**: [SDET Architect] Script comprehensive unit and property-based regression suites (`castling.test.ts`, `enPassant.test.ts`, `promotion.test.ts`, `specialMovesSan.test.ts`), verify typecheck, lint, and conduct Test Automation Quality Gate Review.
- [x] **PO-3301**: [Product Owner] Conduct Product & Chess Domain Acceptance Criteria Review against Sprint 03 Definition of Done.
- [ ] **DO-3301**: [DevOps Engineer] Author PR documentation (`docs/pull_requests/pr_P03_S03_special_moves.md`), commit atomic changes, push branch to origin, and raise GitHub PR.

---

## Persona Handoff Status

- **Current Persona:** Product Owner
- **Handoff Target:** DevOps Engineer
- **Sprint Status:** **IN PROGRESS**

---

## Sprint Review Comments & Refinement Loop

- `[SCRUM_MASTER] -> [CHESS_DOMAIN_ARCHITECT]`: Phase 03 · Sprint 03 initialized on branch `feature/p03-s03-special-moves`. Prerequisites from Sprint 01 & 02 verified clean on main. Handing off to Chess Domain Architect to formalize special move domain invariants, FIDE rules, castling rights revocation, en passant mechanics, promotion rules, SAN standards, and golden FEN fixtures. Status: **APPROVED**.
- `[CHESS_DOMAIN_ARCHITECT] -> [SDET_ARCHITECT]`: Authored `docs/chess/special_moves_invariants.md` formalizing FIDE castling rules, origin/transit/landing check prohibitions, en passant one-ply lifespan, captured piece removal, horizontal pin invariant, mandatory promotion piece validation (Q, R, B, N), and golden FEN fixtures. Handing off to SDET Architect for Sprint 03 Test Cases Catalog authoring. Status: **APPROVED**.
- `[SDET_ARCHITECT] -> [DEV_ARCHITECT]`: Authored Sprint 03 Test Cases Catalog (`docs/testing/test_cases_catalog_P03_S03.md`) defining TC-SPEC-01 through TC-SPEC-27. Handing off to Dev Architect / Senior SDE for code inspection, refinement, and technical code acceptance review. Status: **APPROVED**.
- `[DEV_ARCHITECT] -> [SECURITY_OFFICER]`: Refined runtime validation for promotion piece types in `ChessJsAdapter` with `PROMOTION_PIECE_TYPES`. Verified type safety, layer isolation, and clean build. Handing off to Security Officer for desktop and runtime safety audit. Status: **APPROVED**.
- `[SECURITY_OFFICER] -> [SDET_ARCHITECT]`: Verified runtime promotion input guardrails, zero untrusted injection surface, clean in-memory state transition safety, and 0 `npm audit` vulnerabilities. Handing off to SDET Architect for test suite implementation and Quality Gate Review. Status: **APPROVED**.
- `[SDET_ARCHITECT] -> [PRODUCT_OWNER]`: Authored automated test suites (`castling.test.ts`, `enPassant.test.ts`, `promotion.test.ts`, `specialMovesSan.test.ts`). Executed local checks: 102/102 Vitest tests pass (including 50-run `fast-check` property fuzzing); 5/5 Playwright E2E smoke tests pass; `tsc --noEmit` and `eslint .` pass with 0 errors/warnings; Prettier 100% clean; production build successful. Handing off to Product Owner for acceptance review. Status: **APPROVED**.
- `[PRODUCT_OWNER] -> [DEVOPS_ENGINEER]`: Acceptance Criteria for Sprint 03 fully satisfied. Castling, en passant, and promotion execute strictly according to FIDE invariants, with complete failure immutability, notation accuracy, and undo reversibility. DevOps Engineer is authorized to commit, push branch, and submit Pull Request. Status: **APPROVED**.
