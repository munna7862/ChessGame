# Phase 02: Project Bootstrap

## Objective

Create the production-grade engineering skeleton for ChessForge.

## Outcome

A clean Windows desktop application launches successfully and the
repository has reliable engineering automation.

## Scope

- Git repository
- Tauri 2
- React
- TypeScript
- Vite
- ESLint
- Formatting
- Unit test framework
- Playwright
- CI
- AGENTS.md
- Environment/configuration conventions
- Basic logging
- Project documentation

## Target repository structure

```text
chessforge/
├── .github/workflows/
├── docs/
├── src/
├── src-tauri/
├── tests/
├── scripts/
├── AGENTS.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── playwright.config.ts
└── README.md
```

## Engineering standards

Enable strict TypeScript.

Required baseline checks:

```text
npm run lint
npm run typecheck
npm run test
npm run build
```

Add equivalent Windows CI verification.

## CI pipeline

```text
Checkout
  ↓
Install dependencies
  ↓
Lint
  ↓
Typecheck
  ↓
Unit tests
  ↓
Build
  ↓
Windows package smoke build
```

## Antigravity workflow

First task:

```text
Inspect the repository.
Do not modify anything.
Report the current state and bootstrap plan.
```

Second task:

```text
Implement only the approved bootstrap plan.
```

Third task:

```text
Run all verification commands and inspect the final diff.
```

Use Planning Mode for the initial setup. Use Fast Mode only for tiny
localized fixes.

## Acceptance criteria

- App launches on Windows.
- Development server works.
- Production build succeeds.
- TypeScript strict checks pass.
- Lint passes.
- Unit test runner works.
- Playwright configuration works.
- GitHub Actions runs successfully.
- AGENTS.md exists and is enforced operationally.
- README contains setup and verification instructions.

## Non-goals

- Chess rules
- Board implementation
- Stockfish
- Game persistence
- Online features

## Risks

- Tauri environment mismatch
- Windows build toolchain issues
- Dependency drift
- CI environment mismatch

## Exit criteria

A new developer can clone the repository, install prerequisites, run the
application and execute the complete baseline test/build commands
successfully.

## Sprint decomposition candidates

- Tauri bootstrap
- Frontend bootstrap
- Developer tooling
- Testing setup
- Playwright setup
- CI setup
- AGENTS.md
- Documentation
- Windows build validation
