# Test Cases Catalog: Phase 06 · Sprint 03 (Engine Position Synchronization)

**Document Version:** 1.0.0  
**Phase:** Phase 06 (Local Engine Integration & AI Opponent)  
**Sprint:** Sprint 03 (Engine Position Synchronization)  
**Author:** SDET Architect  
**Status:** Approved Quality Gate Baseline

---

## 1. Test Suite Overview & Invariant Mapping

This test cases catalog validates the synchronization bridge between `GameSessionController` and `EngineService` / Stockfish WebWorker, ensuring strict compliance with invariants INV-SYNC-01 through INV-SYNC-07.

| Test Case ID   | Invariant                | Description                                            | Target Layer                           |
| :------------- | :----------------------- | :----------------------------------------------------- | :------------------------------------- |
| **TC-SYNC-01** | INV-SYNC-01, INV-SYNC-04 | Position-to-FEN serialization & sync dispatch          | Integration (Vitest)                   |
| **TC-SYNC-02** | INV-SYNC-02, INV-SYNC-03 | Search preemption on rapid move dispatch               | Unit / Concurrency (Vitest)            |
| **TC-SYNC-03** | INV-SYNC-03, INV-SYNC-05 | Game reset during active search & session invalidation | Unit / Integration (Vitest)            |
| **TC-SYNC-04** | INV-SYNC-02, INV-SYNC-03 | Move undo during active search & epoch invalidation    | Unit / Integration (Vitest)            |
| **TC-SYNC-05** | INV-SYNC-03              | Delayed out-of-order bestmove discarding               | Unit / Fuzz (Vitest)                   |
| **TC-SYNC-06** | INV-SYNC-01, INV-SYNC-04 | Custom FEN load synchronization                        | Unit / Integration (Vitest)            |
| **TC-SYNC-07** | INV-SYNC-01, INV-SYNC-03 | Real-time evaluation info filtering by active token    | Integration (Vitest)                   |
| **TC-SYNC-08** | INV-SYNC-06              | Engine error containment (game state preserved)        | Integration / Fault Injection (Vitest) |
| **TC-SYNC-09** | INV-SYNC-07              | Synchronizer state machine transitions                 | Unit (Vitest)                          |
| **TC-SYNC-10** | INV-SYNC-05, INV-SYNC-07 | Disposal and cleanup lifecycle                         | Unit (Vitest)                          |

---

## 2. Granular Test Specifications

### TC-SYNC-01: Position-to-FEN Serialization & Sync Dispatch

- **Preconditions:** `GameSessionController` at starting position (`rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`). `EngineService` initialized and ready.
- **Action:** Call `synchronizer.syncPosition()`.
- **Expected Outcome:**
  - Synchronizer exports current FEN from game session.
  - Passes valid FEN, active `sessionId`, and current `epoch` (0) to `EngineService.searchBestMove()`.
  - Resolves with valid evaluation result containing best move.

### TC-SYNC-02: Search Preemption on Rapid Move Dispatch

- **Preconditions:** Synchronizer actively analyzing move 1 (`e2e4`).
- **Action:** User plays move 1... (`e7e5`) before engine completes calculation.
- **Expected Outcome:**
  - In-flight search for `e2e4` is immediately cancelled via `cancelSearch()`.
  - Epoch advances to 1.
  - New search dispatched for position after `e7e5`.
  - Previous promise resolves to `null` or is aborted without error throwing to caller.

### TC-SYNC-03: Game Reset During Active Search & Session Invalidation

- **Preconditions:** Game session A in progress. Synchronizer calculating move at epoch 5.
- **Action:** Call `gameSession.reset()` or `synchronizer.notifyNewGame()`.
- **Expected Outcome:**
  - In-flight search cancelled.
  - Session ID changes from A to B.
  - Epoch reset to 0.
  - Late `BEST_MOVE` or `SEARCH_INFO` messages from session A are silently ignored.
  - New game signal `ucinewgame` dispatched to engine.

### TC-SYNC-04: Move Undo During Active Search & Epoch Invalidation

- **Preconditions:** Game at move 3. Synchronizer calculating best move for Black.
- **Action:** Call `gameSession.undo()`.
- **Expected Outcome:**
  - Active search cancelled.
  - Epoch increments to signal new position state.
  - Synchronizer reflects White's turn at move 2 FEN.
  - Engine does not return a move for the undone position.

### TC-SYNC-05: Delayed Out-of-Order Bestmove Discarding

- **Preconditions:** Mock worker configured to delay response for search token $T_1$.
- **Action:** Trigger search $T_1$, immediately trigger search $T_2$, then let mock worker emit `BEST_MOVE` for $T_1$, then for $T_2$.
- **Expected Outcome:**
  - Response for $T_1$ is discarded (no listener notification).
  - Response for $T_2$ is accepted and emitted to listeners.

### TC-SYNC-06: Custom FEN Load Synchronization

- **Preconditions:** Game in progress.
- **Action:** Call `gameSession.loadFen("8/8/8/4k3/8/8/4K3/8 w - - 0 1")`.
- **Expected Outcome:**
  - In-flight search cancelled.
  - Synchronizer updates `currentFen` to the endgame position.
  - Next search dispatches the endgame FEN to the engine.

### TC-SYNC-07: Real-Time Evaluation Info Filtering

- **Preconditions:** Synchronizer subscribed to evaluation info events.
- **Action:** Inject `SEARCH_INFO` messages for active token and stale/foreign tokens.
- **Expected Outcome:**
  - Synchronizer emits `SynchronizedEvalInfo` only for messages matching active `searchToken` and `sessionId`.
  - Stale tokens produce 0 listener invocations.

### TC-SYNC-08: Engine Error Containment

- **Preconditions:** Game session active with move history.
- **Action:** Inject fatal engine error during position search.
- **Expected Outcome:**
  - Synchronizer enters `error` status.
  - `GameSessionController` remains unaffected (status, turn, history, position fully intact).
  - Synchronizer allows recovery via `reset()`.

### TC-SYNC-09: Synchronizer State Machine Transitions

- **Preconditions:** Fresh synchronizer instance.
- **Action:** Step through init -> sync -> analyzing -> complete -> cancel.
- **Expected Outcome:**
  - Status updates monotonically: `idle` -> `syncing` -> `analyzing` -> `idle` / `cancelled`.
  - `onStatusChange` listener called with exact transition sequence.

### TC-SYNC-10: Teardown and Disposal Lifecycle

- **Preconditions:** Synchronizer active with listeners.
- **Action:** Call `dispose()`.
- **Expected Outcome:**
  - All listeners detached.
  - Active search aborted.
  - Subsequent calls throw `EngineDisposedError` or return early.
