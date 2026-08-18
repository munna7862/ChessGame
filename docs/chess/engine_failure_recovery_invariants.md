# Engine Failure Recovery Invariants & Contract Specification

## 1. Architectural Scope & Context

This document establishes the authoritative specifications and invariants for **Engine Failure Recovery** in **ChessForge** (Phase 06 · Sprint 06).

```text
+-------------------------------------------------------------------------+
|                           UI Presentation Layer                         |
|   (App.tsx, PlayerPanel.tsx, EngineErrorBanner.tsx, NewGameModal.tsx)   |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                          Application Service                            |
|             (useEngineOpponent.ts, IGameSessionController)              |
+-------------------------------------------------------------------------+
            |                                               |
            v                                               v
+-----------------------+                       +-----------------------+
|  Chess Domain Layer   |                       | Engine Subsystem Layer|
| (Pure Game State, FEN,|                       |  (EngineServiceImpl,  |
| Move History, Status) |                       |StockfishWorkerBridge) |
+-----------------------+                       +-----------------------+
            |                                               |
   Immutable Authority                             Ephemeral Worker
 (Zero State Corruption)                           (Crashes Handled)
```

---

## 2. Invariants Catalog

### `INV-EFR-01`: Deterministic Crash Detection & State Transition

- **Rule:** Any unhandled exception, syntax error, memory exhaustion, `onerror` event, `onmessageerror` event, or explicit `{ type: "ERROR", fatal: true }` message emitted by the WebWorker must be intercepted by `StockfishWorkerBridge`.
- **State Machine:** `EngineServiceImpl` MUST transition its lifecycle state to `"error"`.
- **Promise Rejection:** Any in-flight `searchBestMove()` promise must be immediately rejected with an `EngineFatalError` (or `EngineError`). Any pending `init()` promise must be rejected.
- **Listener Notification:** All registered `onStateChange` and `onError` subscribers must be notified with the failure details.

### `INV-EFR-02`: Absolute Game State Preservation

- **Rule:** Engine failures MUST NOT mutate, reset, truncate, or corrupt the `GameSessionState` or `ChessDomain` model.
- **Invariants Preserved:**
  - Board position (ranks/files piece placements) remains identical to the position prior to the crash.
  - Move history array length, SAN strings, captured piece arrays, and turn indicator are 100% preserved.
  - Clocks and game status (check, turn) remain unaffected.

### `INV-EFR-03`: Stale Response Invalidation & Token Cleansing

- **Rule:** Upon detecting worker crash or entering `"error"` state, `EngineServiceImpl` MUST immediately invalidate the active `currentSearchToken` and clear `activeSearch`.
- **Protection:** If a crashed worker unexpectedly delivers delayed messages during teardown, the system must discard them based on token mismatch (`response.searchToken !== currentSearchToken`). Stale engine moves can NEVER be committed to the game domain.

### `INV-EFR-04`: Clean Engine Restart Lifecycle

- **Rule:** Triggering an engine restart (via `engineService.reset()` or `engineService.init()`) must:
  1. Terminate the damaged WebWorker and remove all event listeners.
  2. Instantiate a fresh WebWorker through the configured `WorkerFactory`.
  3. Re-execute the complete UCI initialization handshake (`uci` $\to$ `uciok` $\to$ `setoption` $\to$ `isready` $\to$ `readyok`).
  4. Transition state from `"idle"` $\to$ `"starting"` $\to$ `"ready"`.
  5. Clear the error state in the UI.
  6. If the game is in progress and it is the engine player's turn, automatically re-dispatch the search for the current preserved FEN position.

### `INV-EFR-05`: Seamless Fallback to Human vs Human (Two-Player Mode)

- **Rule:** When the user selects **[Continue as Two Players]**, the active game session mode is converted from `"human_vs_engine"` to `"pass_and_play"`, updating the engine player config to type `"human"` with appropriate labeling.
- **Outcome:** The board and move history remain intact, the error banner is cleared, board interaction is enabled for the active color, and human players can finish the match manually.

### `INV-EFR-06`: Local-First Diagnostics & Telemetry Logging

- **Rule:** All worker crash events, error messages, and recovery actions (restart, mode switch) must be logged locally to a diagnostics logger with structured timestamps, session IDs, and error codes.
- **Desktop Guardrail:** Zero external network traffic, telemetry endpoints, or cloud analytics are permitted.

---

## 3. UI Error & Recovery Banner State Specification

When `engineState === "error"`, the UI renders a prominent, accessible notification banner:

```text
+-----------------------------------------------------------------------------------+
| [!] Chess Engine Error                                                            |
| The chess engine encountered an unexpected error and stopped responding.          |
| Current game position and move history have been preserved.                       |
|                                                                                   |
|  [ Restart Engine ]    [ Continue as Two Players ]    [ Dismiss ]                 |
+-----------------------------------------------------------------------------------+
```

- **Buttons & Actions:**
  - `[Restart Engine]`: Dispatches `engineService.reset()`, restarts worker, and re-triggers AI thinking if on engine's turn.
  - `[Continue as Two Players]`: Converts game session mode to two-player human mode.
  - `[Dismiss]`: Dismisses the banner while keeping error state recorded in logs.

---

## 4. Verification & Testing Matrix

| Scenario ID | Test Condition                                   | Expected Behavior                                                                                                                 |
| :---------- | :----------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| `TC-EFR-01` | Worker crash during initialization (`init()`)    | Engine state transitions to `"error"`, error banner is displayed, `init()` promise rejects cleanly with `EngineFatalError`.       |
| `TC-EFR-02` | Worker crash while thinking (`searchBestMove()`) | In-flight search promise rejects, engine state becomes `"error"`, thinking indicator clears, board position is preserved.         |
| `TC-EFR-03` | User clicks `[Restart Engine]` after crash       | Damaged worker is terminated, new worker is created and initialized to `"ready"`, engine resumes calculation for active position. |
| `TC-EFR-04` | User clicks `[Continue as Two Players]`          | Session mode updates to `"pass_and_play"`, engine player converted to human, user can move pieces for active turn.                |
| `TC-EFR-05` | Stale best-move arriving after crash             | Delayed response is discarded because `searchToken` is invalidated; board remains uncorrupted.                                    |
| `TC-EFR-06` | Diagnostics logger records crash                 | Error message, timestamp, and recovery action are logged to local memory/console without external network calls.                  |
