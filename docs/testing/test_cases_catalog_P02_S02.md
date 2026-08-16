# Test Cases Catalog: Phase 02 · Sprint 02 (Developer Tooling and Code Quality)

**Sprint:** Phase 02 · Sprint 02: Developer Tooling and Code Quality  
**Test Suite Reference:** `docs/testing-strategy.md`  
**Test Author:** SDET Architect  
**Status:** Approved & Baselined

---

## 1. Scope & Verification Objective

This catalog defines deterministic test scenarios and automated quality gates for establishing strict TypeScript compilation, ESLint flat configuration, Prettier formatting consistency, Vitest test running, unified developer scripts, and smoke test suites across the ChessForge project.

---

## 2. Test Cases Catalog

| Test ID        | Category | Description                                    | Verification Method                                                   | Expected Outcome                                                                                                                                                          |
| :------------- | :------- | :--------------------------------------------- | :-------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **TC-TOOL-01** | Positive | Strict TypeScript Compiler Configuration       | `npm run typecheck` (`tsc --noEmit`)                                  | Compiles successfully with code 0 under `strict: true`, `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes` without errors. |
| **TC-TOOL-02** | Positive | ESLint Configuration & Static Analysis         | `npm run lint` (`eslint .`)                                           | ESLint flat configuration executes across all `.ts` and `.tsx` source files, reporting 0 errors and 0 warnings.                                                           |
| **TC-TOOL-03** | Positive | Prettier Deterministic Formatting Check        | `npm run format:check` (`prettier --check .`)                         | Prettier executes across all source and configuration files, validating formatting conformity with 0 mismatches.                                                          |
| **TC-TOOL-04** | Positive | Vitest Automated Test Runner & Matchers        | `npm run test` (`vitest run`)                                         | Vitest executes all unit and property test suites, returning 100% green pass rate with 0 skipped tests.                                                                   |
| **TC-TOOL-05** | Positive | Developer Scripts Suite Completeness           | Package JSON script inspection & execution                            | `package.json` contains valid scripts for `lint`, `lint:fix`, `format`, `format:check`, `typecheck`, `test`, `test:coverage`, and `build`.                                |
| **TC-TOOL-06** | Positive | Architecture Boundary Type & Schema Smoke Test | Vitest smoke test suite (`src/test/smoke.test.ts`)                    | Verifies domain Result types, Zod schema runtime validation, and invariant handling execute deterministically.                                                            |
| **TC-TOOL-07** | Positive | UI Component & Theme Smoke Test                | Vitest RTL test suite (`src/test/App.test.tsx`)                       | Verifies App component renders header, status badge, theme tokens, and accessibility attributes cleanly.                                                                  |
| **TC-TOOL-08** | Negative | Strict Type Violation Rejection                | Intentional type error compilation test                               | Compiling an invalid type or unhandled `null`/`undefined` fails TypeScript compilation without implicit `any` fallback.                                                   |
| **TC-TOOL-09** | Negative | ESLint Rule Violation Rejection                | Intentional lint rule violation check                                 | Linting an unused variable or forbidden pattern correctly reports an error.                                                                                               |
| **TC-TOOL-10** | Quality  | Developer Tooling & Command Documentation      | Documentation audit (`docs/guides/developer_tooling.md`, `README.md`) | Comprehensive developer workflow guide detailing scripts, IDE integration, formatting, linting rules, and pre-commit checks.                                              |

---

## 3. Automation Quality Gate Criteria

Before this sprint can be handed over to the Product Owner:

1. `npm run typecheck` passes with 0 errors.
2. `npm run lint` passes with 0 errors and 0 warnings.
3. `npm run format:check` passes with 0 formatting discrepancies.
4. `npm run test` passes 100% of test suites with 0 test skips.
5. `npm run build` generates production bundle cleanly in `dist/`.
6. Zero security vulnerabilities reported in dependencies (`npm audit`).
