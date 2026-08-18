# Sprint 06 Test Cases Catalog: Engine Failure Recovery

**Sprint:** Phase 06 · Sprint 06: Engine Failure Recovery  
**Target Areas:** Engine Worker Error Interception, Engine Service Error State Transition, Stale Response Invalidation, Game Position Preservation, Engine Restart Lifecycle, Two-Player Fallback, Local Diagnostics Telemetry Logging, UI Error & Recovery Banner.  
**Author:** SDET Architect  
**Status:** **APPROVED FOR EXECUTION**

---

## 1. Test Matrix Overview

| Test ID       | Category             | Description                                                                                     | Verification Method         |
| :------------ | :------------------- | :---------------------------------------------------------------------------------------------- | :-------------------------- |
| **TC-EFR-01** | Negative / Startup   | Worker crash or script load failure during `init()` transitions to error & rejects promise      | Unit / Integration (Vitest) |
| **TC-EFR-02** | Negative / In-flight | Worker crash while thinking (`searchBestMove()`) triggers state `"error"` & rejects promise     | Unit / Integration (Vitest) |
| **TC-EFR-03** | Invariant / Boundary | Game position, move history, and captured pieces remain 100% intact after worker crash          | Unit / Integration (Vitest) |
| **TC-EFR-04** | Security / Race      | Delayed or lingering worker messages arriving after crash/recovery are discarded                | Unit / Integration (Vitest) |
| **TC-EFR-05** | Positive / Lifecycle | Engine restart (`reset()`) terminates damaged worker, spawns fresh worker, returns to `"ready"` | Unit / Integration (Vitest) |
| **TC-EFR-06** | Positive / Game Flow | Restarting engine while on engine's turn re-dispatches thinking and makes move                  | Component / Integration     |
| **TC-EFR-07** | Positive / Fallback  | User clicking `[Continue as Two Players]` switches mode to 2-player and allows human play       | Component / Integration     |
| **TC-EFR-08** | UI / A11y            | Error notification banner renders with role `alert`, recovery buttons, and accessible labels    | Component Test (RTL)        |
| **TC-EFR-09** | Telemetry / Audit    | Local diagnostics logger logs crash events, timestamps, and recovery actions with zero network  | Unit / Integration (Vitest) |
| **TC-EFR-10** | Property Fuzzing     | Generative fast-check invariant test injecting crashes at random plies & recovering             | Vitest / fast-check         |
| **TC-EFR-11** | E2E Playout          | Full Playwright E2E test verifying in-browser worker failure, recovery banner, restart & 2P     | Playwright E2E              |

---

## 2. Detailed Test Cases

### TC-EFR-01: Worker Crash During Initialization (`init()`)

- **Given:** Engine worker is initialized via `engineService.init()`.
- **When:** WebWorker triggers an `error` event before emitting `READY` / `readyok`.
- **Then:** `StockfishWorkerBridge` catches the error and notifies handlers; `EngineServiceImpl` transitions to state `"error"`; `init()` promise is rejected with `EngineFatalError`.

### TC-EFR-02: Worker Crash During In-Flight Search (`searchBestMove()`)

- **Given:** Engine is in `"thinking"` state with an active `searchToken`.
- **When:** WebWorker emits an `error` event or worker crash occurs.
- **Then:** Active `searchBestMove()` promise rejects with `EngineFatalError`; `isEngineThinking` clears to `false`; `engineService.state` becomes `"error"`; UI error banner is displayed.

### TC-EFR-03: Absolute Game State Preservation

- **Given:** Active Human vs Computer game with move history `1. e4 e5 2. Nf3 Nc6` and captured pieces.
- **When:** Engine worker crashes during Black's 3rd move calculation.
- **Then:** FEN string, SAN move history list, captured pieces counts, and turn indicator (`b`) remain exactly unchanged; board state is not corrupted.

### TC-EFR-04: Stale Response Invalidation After Recovery

- **Given:** Engine worker crashes during search token `search-1`. Engine is restarted and given new token `search-2`.
- **When:** A delayed message with token `search-1` is received from the old or recovering worker.
- **Then:** Message is rejected by token comparison (`searchToken !== currentSearchToken`); no move is made from the stale response.

### TC-EFR-05: Clean Engine Restart Lifecycle

- **Given:** Engine is in `"error"` state with a crashed worker.
- **When:** `engineService.reset()` or restart action is triggered.
- **Then:** Previous worker is terminated; new worker is created; UCI initialization handshake completes; engine transitions to `"ready"` state; error state is cleared.

### TC-EFR-06: Automatic Search Resume on Engine Turn After Restart

- **Given:** Game is in progress, it is engine's turn (e.g. Black), and engine crashed.
- **When:** User clicks `[Restart Engine]`.
- **Then:** Engine restarts to `"ready"`, detects it is engine's turn, triggers `searchBestMove()` for the preserved FEN, and executes the best move once calculated.

### TC-EFR-07: Fallback to Two-Player Mode

- **Given:** Engine crashes during Human vs Computer game.
- **When:** User clicks `[Continue as Two Players]`.
- **Then:** Game session mode updates from `"human_vs_engine"` to `"pass_and_play"`; Black player type becomes `"human"`; error banner closes; board interaction unlocks for Black; human can click and move Black pieces.

### TC-EFR-08: UI Error Banner Rendering & Accessibility

- **Given:** Engine encounters error state.
- **When:** UI renders.
- **Then:** An accessible error banner (`role="alert"`, `data-testid="engine-error-banner"`) appears containing:
  - Clear heading ("Chess Engine Error")
  - Informative explanation ("The chess engine encountered an unexpected error...")
  - Action buttons: `[Restart Engine]`, `[Continue as Two Players]`, `[Dismiss]`
  - Accessible focus and keyboard navigation.

### TC-EFR-09: Local Diagnostics & Telemetry Logging

- **Given:** Worker error or crash event occurs.
- **When:** Event is processed by diagnostics logger.
- **Then:** Local log entry is created containing timestamp, error code, engine state, and active FEN; no network requests are made (zero external telemetry).

### TC-EFR-10: Generative Invariant Fuzzing Under Crash Injection

- **Given:** fast-check test generating random game moves and injecting worker errors at arbitrary steps.
- **When:** Recovery actions (restart or fallback) are executed.
- **Then:** Game session invariants (valid FEN, matching move histories, single king per side, valid turn alternation) hold across all fuzzing runs.

### TC-EFR-11: Playwright E2E Playout of Engine Failure & Recovery

- **Given:** Live application in Playwright test environment.
- **When:** Engine crash is triggered, error banner appears, user clicks `[Restart Engine]` or `[Continue as Two Players]`.
- **Then:** Playout succeeds with expected visual updates, board unfreezing, and successful move completion.
