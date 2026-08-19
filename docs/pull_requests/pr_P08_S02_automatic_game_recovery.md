# Pull Request: Phase 08 · Sprint 02 - Automatic Game Recovery

## 1. Summary & Context

This PR delivers **Automatic Game Recovery** for **ChessForge** as specified in Phase 08 Sprint 02 (`planning/sprints/P08-S02-automatic-game-recovery.md`), `docs/architecture/automatic_game_recovery_specification.md`, and ADR-004 (_Local-First JSON Persistence & Crash Recovery_).

### Key Deliverables & Architecture

1. **Authoritative Persistence Triggers (`useGameRecovery.ts` & `GameSessionController.ts`):**
   - Active game session snapshot is automatically captured and persisted to `PersistenceService.saveActiveGame()` upon authoritative move execution, move undo, custom position load, and game mode updates.
   - Comprehensive snapshot captures session ID, game mode, FEN position, SAN move sequence, player configs with engine levels, clock balances, user orientation, and timestamps.
2. **Game Completion Cleanup Guardrail (`useGameRecovery.ts`):**
   - When an active match concludes via checkmate, stalemate, draw agreement, resignation, or timeout, the recovery snapshot is automatically cleared (`saveActiveGame(null)`).
   - Completed games never reappear as active recovery prompts upon restart.
3. **Startup Recovery Detection (`useGameRecovery.ts`):**
   - Inspects persistent storage on mount. If a valid, non-concluded session with moves is found, triggers the `GameRecoveryModal`.
   - Stale or corrupted states are safely purged without throwing unhandled exceptions or disrupting startup.
4. **Game Recovery Dialog / Modal (`GameRecoveryModal.tsx` & `.css`):**
   - Fully accessible dialog with focus trap and keyboard navigation (`Escape`, `Tab`).
   - Displays match metadata: game mode, player names & colors, current turn, moves played, time control status, and timestamp.
   - **Continue Game:** Reconstitutes the game board, move history, turn, clocks, and board orientation.
   - **Discard / Start Fresh:** Clears the stored recovery snapshot from disk and continues with a clean starting board.
5. **Clock & Controller Restoration (`ClockController.ts`, `useClock.ts`, `GameSessionController.ts`):**
   - Added `restoreClock` and `restoreSession` domain methods allowing seamless state hydration.

---

## 2. Test & Quality Gate Evidence

- **Unit & Integration Tests (Vitest):** 77/77 test files passed, 657/657 tests passed (0 skips, 0 failures).
  - 3 new test suites with 17 tests specifically covering active game snapshotting, startup detection, continue/discard workflows, completed game purging, modal accessibility, and fast-check generative property fuzzing.
- **Desktop E2E Tests (Playwright):** 49/49 tests passed (0 failures).
  - Added `tests/e2e/game-recovery.spec.ts` validating real browser session reload, recovery modal display, resume playout, and discard flows.
- **TypeScript Typecheck:** `tsc --noEmit` passed with 0 errors.
- **ESLint:** `eslint .` passed with 0 warnings, 0 errors.
- **Code Style (Prettier):** 100% format compliance.
- **Production Build (Vite):** `tsc -b && vite build` succeeded cleanly.

---

## 3. Security & Desktop Compliance

- **100% Local-First:** Pure offline local storage; zero external network requests or telemetry endpoints.
- **Untrusted Input Sanitization:** Stored FEN and JSON payloads are validated through strict Zod schemas and FEN syntax checkers prior to session hydration.
- **Corruption Resilient:** Corrupted storage data or invalid FEN positions are caught safely and ignored, falling back to clean startup.
- **Least Privilege:** No extra native OS capabilities required.

---

## 4. Definition of Done Checklist

- [x] Active game snapshot persists automatically after authoritative state changes.
- [x] Completed games safely clear recovery state and do not reappear upon restart.
- [x] Corrupted recovery data is safely discarded with zero runtime errors.
- [x] User can choose between "Continue Game" and "Discard / Start Fresh".
- [x] 100% Green test automation across unit, property, integration, and E2E tiers.
- [x] Clean typecheck, lint, formatting, and production build.
