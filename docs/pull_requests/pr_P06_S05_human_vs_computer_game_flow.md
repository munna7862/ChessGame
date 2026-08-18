# Pull Request: Phase 06 · Sprint 05 — Human vs Computer Game Flow

**PR Title:** `feat(engine): Phase 06 Sprint 05 - Human vs Computer Game Flow`  
**Branch:** `feature/p06-s05-human-vs-computer-game-flow`  
**Author:** DevOps Engineer / Dev Architect  
**Reviewers:** Scrum Master, Chess Domain Architect, SDET Architect, Security Officer, Product Owner  
**Status:** Approved for Merge

---

## 1. Summary of Changes

This sprint implements the complete, end-to-end **Human vs Computer Game Flow** for ChessForge v1. Building on top of our isolated Stockfish WebWorker bridge and discrete difficulty tier engine, this sprint connects the chess game session directly with Stockfish via the `useEngineOpponent` coordinator hook.

### Key Deliverables:

- **`src/features/engine/useEngineOpponent.ts`**: Autonomous coordinator hook that observes the `gameSession` turn and mode (`mode === "vs-computer"`), automatically submits search requests when it is the engine's turn, executes returned best moves onto the authoritative game session, and manages search tokens to cancel inflight searches on undo/restart/resign.
- **`src/features/engine/uciProtocol.ts`**: Added `parseUciMoveToInput` helper to reliably convert UCI format strings (`e2e4`, `e7e8q`) into domain `MoveInput` objects (`{ from, to, promotion }`). Fixed UCI command serialization for clean Emscripten communication.
- **`src/features/engine/StockfishWorkerBridge.ts`**: Switched default worker target to `/vendor/stockfish/stockfish.js`, guarded single-threaded `Threads` option configuration, and ensured trimmed UCI message streaming.
- **`src/features/game/PlayerPanel.tsx` & `PlayerPanel.css`**: Added visual pulse thinking badge (`data-testid="player-thinking-indicator"`) displayed when the engine is actively calculating its move.
- **`src/App.tsx`**: Integrated `useEngineOpponent` with the active game session and bound `isBoardDisabled` when the computer is thinking to prevent human interaction during engine turns.
- **`docs/chess/human_vs_computer_game_flow_invariants.md`**: CDA architectural specifications documenting invariants INV-HVC-01 through INV-HVC-09.
- **`docs/testing/test_cases_catalog_P06_S05.md`**: SDET Test Cases Catalog defining TC-HVC-01 through TC-HVC-12.
- **`src/features/engine/__tests__/useEngineOpponent.test.ts` & `src/features/game/__tests__/humanVsComputerFlow.test.tsx`**: Unit and integration test suites validating automated playouts, black perspective auto-starts, and search cancellations.
- **`tests/e2e/human-vs-computer.spec.ts`**: Playwright E2E test suite running real Stockfish WebWorker games in headless Chromium.

---

## 2. Invariants & Verification Matrix

| Invariant / Test Scenario                                    | Implementation Target                          | Verification Result |
| :----------------------------------------------------------- | :--------------------------------------------- | :-----------------: |
| **INV-HVC-01: Engine Autonomous Turn Execution**             | `useEngineOpponent.ts`                         |      **PASS**       |
| **INV-HVC-02: UCI Move Translation**                         | `parseUciMoveToInput` in `uciProtocol.ts`      |      **PASS**       |
| **INV-HVC-03: Single Source of Truth Authority**             | `gameSession.makeMove` via `useGameSession`    |      **PASS**       |
| **INV-HVC-04: Thinking State & Board Interactivity Lock**    | `PlayerPanel.tsx`, `App.tsx`                   |      **PASS**       |
| **INV-HVC-05: Automatic Computer Opening as White**          | `useEngineOpponent.ts` (`playerColor === 'b'`) |      **PASS**       |
| **INV-HVC-06: Inflight Search Cancellation on Game Actions** | `engineService.stop()` & token invalidation    |      **PASS**       |
| **INV-HVC-07: Terminal State Search Suppression**            | Checkmate/Stalemate/Draw guards in coordinator |      **PASS**       |
| **INV-HVC-08: Reversibility & Clean State Recovery**         | Undo / Restart / Resign handlers               |      **PASS**       |
| **INV-HVC-09: WebWorker Sandboxing & Non-Blocking UI**       | asm.js / WebWorker UCI bridge                  |      **PASS**       |

---

## 3. Quality Gate & Test Execution Summary

- **Vitest Unit & Property Suites:** 56 test files, 527 tests passing (100% Green, 0 skips).
- **Playwright E2E Suites:** 45 test scenarios across 12 spec files passing (100% Green, 0 skips).
- **TypeScript Typecheck (`tsc --noEmit`):** 0 errors.
- **ESLint (`eslint .`):** 0 errors, 0 warnings.
- **Prettier (`prettier --check .`):** Clean formatting.
- **Vite Production Build (`vite build`):** Successful bundle creation in 1.20s.

---

## 4. Multi-Agent Persona Approvals

- **Scrum Master (SM):** Backlog complete, acceptance criteria satisfied.
- **Chess Domain Architect (CDA):** Domain rules, turn invariants, and move translations verified.
- **SDET Architect (SDET):** Full test pyramid coverage with 0 skips across all tiers.
- **Security & Desktop Safety Officer (SEC):** Confirmed local WebWorker confinement, 0 telemetry, 0 cloud dependencies, least-privilege Tauri footprint.
- **Product Owner (PO):** Verified responsive UI, animated thinking indicators, robust board locks, and seamless Human vs Engine gameplay.
