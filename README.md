# ChessForge

[![CI](https://github.com/munna7862/ChessGame/actions/workflows/ci.yml/badge.svg)](https://github.com/munna7862/ChessGame/actions/workflows/ci.yml)
[![Release Automation](https://github.com/munna7862/ChessGame/actions/workflows/release.yml/badge.svg)](https://github.com/munna7862/ChessGame/actions/workflows/release.yml)

ChessForge is an offline chess app for Windows, built with Tauri v2, React 19, TypeScript and Stockfish compiled to WebAssembly. It has no backend, no accounts and no telemetry.

## Status

**v1.0.0**, released 2026-08-20. All 11 planned phases are complete. Download the Windows installer (`ChessForge_1.0.0_x64-setup.exe` or `.msi`) from [Releases](https://github.com/munna7862/ChessGame/releases/tag/v1.0.0); the release includes `checksums.txt`.

## Features

- Full chess rules through `chess.js`: castling, en passant, promotion, check, checkmate, stalemate, threefold repetition, fifty-move rule and insufficient material.
- Human vs human on one screen, or human vs Stockfish as White or Black.
- Eight engine difficulty levels, mapped to Stockfish skill levels. The engine runs in a Web Worker over UCI and never decides move legality; the domain layer does.
- Chess clocks with increment and low-time warnings.
- PGN import and export, FEN copy and paste, move history navigation, captured pieces.
- Local persistence with Zod-validated saves and recovery of an interrupted game.
- Board themes, sound effects, keyboard play and screen-reader move announcements.

## Tech stack

- Tauri v2 (Rust shell, least-privilege capabilities), Microsoft Edge WebView2
- React 19, TypeScript, Vite
- `chess.js` 1.4, `stockfish.js` 10 (WASM), Zod
- Vitest, Testing Library, fast-check (property tests), Playwright
- ESLint, Prettier, `cargo test`, `cargo clippy`, GitHub Actions

## Run from source

Prerequisites (Windows 10/11): Node.js 20 or 24, the Rust MSVC toolchain (`rustup default stable-x86_64-pc-windows-msvc`), Visual Studio 2022 C++ Build Tools ("Desktop development with C++") and WebView2 (preinstalled on current Windows).

```powershell
npm install
npm run dev          # web UI only, http://localhost:1420
npm run tauri:dev    # desktop app
npm run tauri:build  # Windows .exe (NSIS) and .msi bundles
```

## Tests

```powershell
npm run test            # Vitest: domain, component and property-based tests
npm run test:coverage
npm run test:e2e        # Playwright end-to-end suite (tests/e2e)
npm run test:e2e:report
npm run lint
npm run format:check
npm run typecheck
npm run build
```

The test pyramid and golden FEN fixtures are described in [docs/testing-strategy.md](docs/testing-strategy.md); locator rules are in the [E2E testing guide](docs/guides/e2e_testing_guide.md).

## CI

- **CI** (`ci.yml`, every push and pull request to `main`):
  - `frontend-checks`: format, lint, typecheck, unit tests, Vite build
  - `e2e-tests`: Playwright in headless Chromium, traces kept on failure
  - `desktop-windows-build`: `cargo test`, `cargo clippy -D warnings` and a release `cargo check` on Windows
- **Release Automation** (`release.yml`, on a `v*` tag or manual dry run): re-runs the checks, builds the NSIS and MSI bundles on Windows and publishes them to GitHub Releases with checksums.

See the [CI workflow guide](docs/guides/ci_workflow_guide.md) for details.

## Project structure

```
src/
  domain/          chess rules adapter, clock and persistence (no React)
  features/        board, game, engine, clock and settings features with their tests
  components/      shared UI components
  services/, hooks/, theme/
  App.tsx, main.tsx
src-tauri/         Rust shell, capabilities, tauri.conf.json, icons
tests/e2e/         Playwright specs
docs/              architecture, ADRs, security model, testing strategy, guides, release notes
planning/          11 phase plans and sprint specs
```

Dependencies flow one way: presentation (React) -> application services -> domain -> chess library adapter. See [docs/architecture.md](docs/architecture.md) and [docs/security-model.md](docs/security-model.md).

## Contributing

Work happens on `feature/*` branches through pull requests. The Definition of Done is green tests, zero TypeScript errors, and no `it.skip`, `@ts-ignore` or `eslint-disable`. Agent rules are in [AGENTS.md](AGENTS.md) and the [agent guardrails guide](docs/guides/agent_guardrails_guide.md).
