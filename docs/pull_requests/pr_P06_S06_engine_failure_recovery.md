# Pull Request: Phase 06 · Sprint 06: Engine Failure Recovery

## Summary of Changes

### Sprint Objective
Make engine failures recoverable without corrupting the chess game, ensuring seamless error visibility, robust WebWorker error interception, clean restart lifecycle, zero state corruption, local diagnostics telemetry logging, and graceful two-player human mode fallback.

### Key Architectural & Implementation Enhancements
1. **Worker Crash & Fault Interception (`StockfishWorkerBridge.ts`):**
   - Added listeners for `messageerror` and enhanced `error` event interception on the Stockfish WebWorker.
   - Cleanly intercepts unexpected crashes, terminates damaged worker threads, and dispatches standardized `{ type: "ERROR", message: ..., fatal: true }` responses.

2. **Engine State Machine & Reset Lifecycle (`EngineServiceImpl.ts`):**
   - Transitions to `"error"` state upon fatal worker errors and immediately rejects in-flight search and init promises with `EngineFatalError`.
   - Upgraded `reset()` to terminate existing bridges, clear handlers, re-instantiate fresh workers through the bridge factory, and cleanly return to `"ready"` state.
   - Added diagnostic event logging for all state transitions, crash events, and restart attempts.

3. **Engine Opponent Hook Error Recovery (`useEngineOpponent.ts`):**
   - Added `engineError: Error | null` state and exposed recovery actions `restartEngine()`, `continueAsTwoPlayers()`, and `clearError()`.
   - `restartEngine()` triggers `engineService.reset()` and automatically resumes thinking for the preserved position if it is currently the computer player's turn.
   - `continueAsTwoPlayers()` converts the active game session mode to `"human_vs_human"`, updates the engine player configuration to type `"human"`, and unlocks board interaction for human players.

4. **Engine Error Banner Component (`EngineErrorBanner.tsx`, `EngineErrorBanner.css`):**
   - Implemented an accessible alert banner (`role="alert"`, `data-testid="engine-error-banner"`) rendered when an engine failure occurs.
   - Displays clear error notifications, preserved state guarantees, and action buttons for `[Restart Engine]`, `[Continue as Two Players]`, and `[Dismiss]`.

5. **Local-First Diagnostics Logger (`engineDiagnostics.ts`):**
   - Implemented a circular-buffer diagnostics logger (`EngineDiagnosticsLogger`) recording error codes, timestamps, and recovery events.
   - Strictly conforms to the zero external telemetry mandate.

6. **In-Place Game Mode Update (`GameSessionController.ts`, `types.ts`):**
   - Added `updateGameMode(mode, players)` to `IGameSessionController` allowing switching to Two Players mode in-place while preserving 100% of board position, move history, captured pieces, and clock status.

---

## Test Results & Quality Gates

### Automated Test Execution
- **Unit & Integration Tests (Vitest):** 58/58 test suites passed (541/541 tests passing, 0 failures, 0 skips).
- **Desktop E2E Tests (Playwright):** 47/47 tests passed across Chromium webview.
- **TypeScript Typecheck:** 0 errors (`tsc --noEmit`).
- **ESLint:** 0 errors, 0 warnings (`eslint .`).
- **Prettier Code Style:** Clean (`prettier --check .`).
- **Production Build:** Vite production build successful (`tsc -b && vite build`).

---

## Security & Safety Audit Sign-Off
- **WebWorker Isolation:** Stockfish WebWorker remains strictly isolated within browser WebWorker sandboxing with zero DOM access or network capabilities.
- **Zero External Telemetry:** All error telemetry and diagnostics remain in local memory circular buffers with no outbound network sockets.
- **Resource Discipline:** Zombie workers are terminated immediately upon error detection; memory footprint remains well within $< 150\text{ MB}$ limits.
