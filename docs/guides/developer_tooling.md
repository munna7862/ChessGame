# Developer Tooling and Code Quality Guide

**Version:** 1.0.0  
**Status:** Approved Standard  
**Sprint:** Phase 02 · Sprint 02: Developer Tooling and Code Quality

---

## 1. Overview & Architecture Mandates

ChessForge enforces strict developer tooling and automated quality gates across TypeScript (React 19 + Vite), Rust (Tauri v2), and WebWorker environments.

### Core Tooling Principles

- **Strict Typing:** `any` is strictly prohibited. `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`, and `noImplicitAny` are enforced.
- **Unified Linting:** ESLint 9+ flat config (`eslint.config.js`) enforces React Hooks rules, TypeScript strict rules, and import hygiene.
- **Deterministic Formatting:** Prettier (`.prettierrc`) guarantees consistent code formatting across all files.
- **Fast Unit & Invariant Testing:** Vitest and `fast-check` provide rapid, deterministic unit and property-based invariant testing.

---

## 2. Standard Developer Commands

| Command                 | Description                                                         | Quality Gate Check               |
| :---------------------- | :------------------------------------------------------------------ | :------------------------------- |
| `npm run dev`           | Starts Vite local development server on `http://localhost:1420`     | Fast local feedback              |
| `npm run typecheck`     | Executes TypeScript type checking (`tsc --noEmit`)                  | Must pass with 0 errors          |
| `npm run lint`          | Executes ESLint across all source files (`eslint .`)                | Must report 0 errors, 0 warnings |
| `npm run lint:fix`      | Automatically fixes auto-fixable ESLint violations                  | Developer convenience            |
| `npm run format`        | Runs Prettier write across the codebase (`prettier --write .`)      | Formats all code files           |
| `npm run format:check`  | Verifies code adheres to Prettier formatting (`prettier --check .`) | Must pass with 0 mismatches      |
| `npm run test`          | Executes all Vitest unit and property tests in single-run mode      | Must pass 100% of tests          |
| `npm run test:watch`    | Starts Vitest in interactive watch mode                             | TDD workflow                     |
| `npm run test:coverage` | Runs Vitest with coverage report                                    | Coverage verification            |
| `npm run build`         | Compiles TypeScript and builds production Vite bundle in `dist/`    | Must build cleanly               |
| `npm run tauri dev`     | Starts desktop application in native Tauri v2 window                | Desktop integration              |

---

## 3. TypeScript Configuration Architecture

The TypeScript configuration is modularized via project references:

- **`tsconfig.json`:** Root orchestrator referencing `tsconfig.app.json` and `tsconfig.node.json`.
- **`tsconfig.app.json`:** Compiles `src/` targeting `ES2022` with bundler module resolution, path alias `@/* -> src/*`, and strict type checking rules:
  - `strict: true`
  - `noUncheckedIndexedAccess: true`
  - `exactOptionalPropertyTypes: true`
  - `noUnusedLocals: true`
  - `noUnusedParameters: true`
  - `noFallthroughCasesInSwitch: true`
  - `forceConsistentCasingInFileNames: true`
- **`tsconfig.node.json`:** Compiles build configuration files (`vite.config.ts`, etc.) under strict mode.

---

## 4. ESLint Rules & Conventions

Configured in `eslint.config.js`:

- `@typescript-eslint/no-explicit-any`: Set to `"error"`. Untyped `any` is forbidden.
- `@typescript-eslint/no-unused-vars`: Set to `"error"` with `_` prefix exception for intentional unused arguments.
- `@typescript-eslint/consistent-type-imports`: Enforces `import type { ... }` or `import { type ... }`.
- `react-hooks/rules-of-hooks`: Enforces valid React hook invocation order.
- `react-hooks/exhaustive-deps`: Enforces complete dependency arrays.
- `prefer-const` & `no-var`: Enforces immutable declarations where possible.

---

## 5. Pre-Commit Quality Gate Checklist

Before opening a pull request or submitting code for review, execute the full local quality pipeline:

```bash
# 1. Typecheck
npm run typecheck

# 2. Lint
npm run lint

# 3. Format check
npm run format:check

# 4. Automated Tests
npm run test

# 5. Production Build
npm run build
```
