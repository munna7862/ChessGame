# Test Cases Catalog: Phase 02 · Sprint 01 (Repository and Tauri Bootstrap)

**Sprint:** Phase 02 · Sprint 01: Repository and Tauri Bootstrap  
**Test Suite Reference:** `docs/testing-strategy.md`  
**Test Author:** SDET Architect  
**Status:** Baseline Specification

---

## 1. Scope & Verification Objective

This catalog defines the deterministic test scenarios and automated quality gates for bootstrapping the ChessForge repository, React 19 + TypeScript + Vite frontend, Vitest testing harness, and Tauri v2 Windows desktop shell baseline.

---

## 2. Test Cases Catalog

| Test ID        | Category | Description                                          | Verification Method                              | Expected Outcome                                                                                                                                                                                            |
| :------------- | :------- | :--------------------------------------------------- | :----------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TC-BOOT-01** | Positive | Baseline repository file layout verification         | Filesystem structural integrity check            | All mandatory files (`package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/App.tsx`, `src/main.tsx`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`, `.gitignore`, `README.md`) exist. |
| **TC-BOOT-02** | Positive | Strict TypeScript typecheck verification             | `npm run typecheck` (`tsc --noEmit`)             | Exits with code 0, 0 type errors, strict null checks enabled.                                                                                                                                               |
| **TC-BOOT-03** | Positive | Vite frontend production bundle verification         | `npm run build` (`vite build`)                   | Exits with code 0, bundles assets into `dist/` directory cleanly.                                                                                                                                           |
| **TC-BOOT-04** | Positive | Vitest unit/component test suite execution           | `npm run test` (`vitest run`)                    | Exits with code 0, all component and layout assertions pass with 100% green results.                                                                                                                        |
| **TC-BOOT-05** | Positive | React 19 UI component rendering & layout             | `@testing-library/react` render assertions       | Root App component renders ChessForge title, status indicator, and desktop viewport container without errors.                                                                                               |
| **TC-BOOT-06** | Positive | Tauri v2 configuration schema validity               | JSON schema validation & JSON parser check       | `tauri.conf.json` contains valid `app.title`, `app.windows`, `bundle.identifier`, and CSP string conforming to Tauri v2.                                                                                    |
| **TC-BOOT-07** | Negative | Disallowed native permissions / network capabilities | Tauri capability JSON audit                      | `src-tauri/capabilities/default.json` contains least-privilege capability set; no unvetted shell or remote network permissions.                                                                             |
| **TC-BOOT-08** | Boundary | Gitignore exclusion of build artifacts and cache     | `.gitignore` pattern analysis                    | `node_modules`, `dist`, `target/`, and `.tauri` are properly ignored by Git.                                                                                                                                |
| **TC-BOOT-09** | Quality  | Clean checkout setup instructions                    | Documentation inspection against clean workspace | `README.md` documents complete Windows setup, Node/npm prerequisites, Rust toolchain setup, and step-by-step commands.                                                                                      |

---

## 3. Automation Quality Gate Criteria

Before this sprint can be handed over to the Product Owner:

1. `npm run typecheck` must pass with 0 errors.
2. `npm run test` must execute and pass 100% of test cases.
3. `npm run build` must generate valid production output in `dist/`.
4. Tauri v2 configuration must pass security validation for CSP and permissions.
