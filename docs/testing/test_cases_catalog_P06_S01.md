# Test Cases Catalog: Phase 06 · Sprint 01

**Sprint:** Phase 06 · Sprint 01: Engine Abstraction and Worker Contract  
**Document Version:** 1.0.0  
**Author:** SDET Architect  
**Reviewers:** Chess Domain Architect, Dev Architect, Security Officer, Product Owner  
**Date:** 2026-08-18

---

## 1. Test Strategy Overview

This catalog defines the deterministic test specification for the **Engine Abstraction and Worker Contract** layer. Tests target:

1. Pure TypeScript interface & lifecycle state transitions.
2. Message correlation and monotonic `searchToken` cancellation invariants.
3. Stale engine response rejection and race-condition immunity.
4. Runtime Zod payload schema validation for WebWorker IPC messages.
5. Deterministic `MockEngineWorkerBridge` and `MockEngineAdapter` behaviors.

---

## 2. Test Case Specifications

### 2.1 Positive & Lifecycle Happy Paths

#### TC-ENG-01: Engine Initialization and State Transition

- **Category:** Positive / Lifecycle
- **Setup:** Instantiate `EngineServiceImpl` with `MockEngineWorkerBridge`. Initial state is `idle`.
- **Action:** Call `await engineService.init()`.
- **Expected Outcome:**
  - State transitions: `idle` -> `starting` -> `ready`.
  - Listeners subscribed to `onStateChange` receive state updates in sequence.
  - `engineService.getState()` returns `'ready'`.
  - Worker receives `{ type: 'INIT' }` request.

#### TC-ENG-02: Best Move Search Dispatch and Resolution

- **Category:** Positive / Core Search
- **Setup:** Engine is in `'ready'` state.
- **Action:** Call `engineService.searchBestMove({ fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', depth: 12, skillLevel: 10 })`.
- **Expected Outcome:**
  - Engine state transitions from `'ready'` to `'thinking'`.
  - Search is assigned a unique `searchToken`.
  - Worker receives `{ type: 'SEARCH', request: { searchToken, ... } }`.
  - When worker emits `{ type: 'BEST_MOVE', searchToken, uciMove: 'e2e4' }`, the promise resolves with `{ bestMoveUci: 'e2e4', searchToken }`.
  - Engine state transitions back from `'thinking'` to `'ready'`.

#### TC-ENG-03: Real-Time Evaluation / Search Info Streaming

- **Category:** Positive / Streaming Info
- **Setup:** Engine is in `'thinking'` state with active `searchToken`.
- **Action:** Worker emits multiple `{ type: 'SEARCH_INFO', searchToken, depth: 10, scoreCp: 35, nodes: 15420, pv: ['e2e4', 'e7e5'] }`.
- **Expected Outcome:**
  - Registered `onEvaluationInfo` listener is invoked for each valid info packet.
  - Evaluation info payload contains parsed depth, centipawn score, nodes, and principal variation array.

#### TC-ENG-04: Engine Options Configuration

- **Category:** Positive / Configuration
- **Setup:** Engine is in `'ready'` state.
- **Action:** Call `await engineService.setOptions({ skillLevel: 15, threads: 2, hashSizeMb: 32 })`.
- **Expected Outcome:**
  - Worker receives corresponding `SET_OPTION` messages for `Skill Level`, `Threads`, `Hash`.
  - Engine remains in `'ready'` state.

---

### 2.2 Concurrency, Cancellation & Stale Rejection (Critical Invariants)

#### TC-ENG-05: Synchronous Search Cancellation

- **Category:** Invariant / Cancellation
- **Setup:** Engine is in `'thinking'` state with active search for `searchToken: "token-1"`.
- **Action:** Call `await engineService.cancelSearch()`.
- **Expected Outcome:**
  - State immediately transitions to `'stopping'` (or `'ready'`).
  - Worker receives `{ type: 'STOP' }`.
  - The pending search promise is rejected with `EngineSearchCancelledError` or resolves with cancelled status.
  - The active search token is invalidated/incremented.

#### TC-ENG-06: Out-of-Order Stale Engine Response Discard

- **Category:** Invariant / Stale Rejection (INV-ENG-04)
- **Setup:**
  1. Position A evaluated with `searchToken: "token-1"`. Engine is `'thinking'`.
  2. `cancelSearch()` is called. Active search token advances to `"token-2"`.
  3. Worker emits late `{ type: 'BEST_MOVE', searchToken: 'token-1', uciMove: 'd2d4' }`.
- **Action:** Observe engine service reaction to the stale response.
- **Expected Outcome:**
  - Stale response is silently dropped.
  - No move callback is triggered.
  - Engine state remains in current valid state without corrupting `"token-2"`.

#### TC-ENG-07: Rapid Search Supersession

- **Category:** Concurrency / Race Conditions
- **Setup:** Engine is in `'ready'` state.
- **Action:**
  1. Dispatch Search 1 for Position A (`"token-1"`).
  2. Without waiting for Search 1 completion, immediately dispatch Search 2 for Position B (`"token-2"`).
- **Expected Outcome:**
  - Search 1 is automatically aborted.
  - Worker receives `STOP` for Search 1 and `SEARCH` for Search 2.
  - Only the result for `"token-2"` resolves.

---

### 2.3 Fault Handling, Error Recovery & Disposal

#### TC-ENG-08: Worker Fault / Crash Handling

- **Category:** Fault Tolerance
- **Setup:** Engine is in `'thinking'` state.
- **Action:** Worker emits `{ type: 'ERROR', message: 'WASM memory overflow', fatal: true }` or worker emits `'error'` event.
- **Expected Outcome:**
  - State transitions to `'error'`.
  - Pending search promise rejects with `EngineFatalError`.
  - Calling `reset()` terminates the failed worker and restarts a fresh worker into `'ready'`.

#### TC-ENG-09: Disposal and Resource Teardown

- **Category:** Lifecycle / Resource Safety
- **Setup:** Engine is in `'ready'` or `'thinking'` state.
- **Action:** Call `engineService.dispose()`.
- **Expected Outcome:**
  - Worker receives `{ type: 'TERMINATE' }` and `worker.terminate()` is called.
  - All event listeners and pending timeouts are cleared.
  - State transitions to `'disposed'`.
  - Subsequent calls to `searchBestMove()` reject with `EngineDisposedError`.

---

### 2.4 Payload Validation & Runtime Schemas

#### TC-ENG-10: Worker Message Zod Schema Validation

- **Category:** Security & Type Safety
- **Setup:** Instantiate schema parser with valid and malformed objects.
- **Action:** Parse valid and invalid `EngineWorkerRequest` and `EngineWorkerResponse` payloads.
- **Expected Outcome:**
  - Valid payloads parse successfully with strict typing.
  - Malformed objects (missing token, invalid type enum, negative depth) throw validation errors and are safely discarded without crashing main thread.

#### TC-ENG-11: Mock Engine Adapter Deterministic Control Suite

- **Category:** Mock Harness
- **Setup:** Create `MockEngineWorkerBridge`.
- **Action:** Test all mock helper methods: `respondInstantly`, `simulateThinkingDelay`, `simulateCrash`, `simulateStaleResponse`, `simulateInfoStream`.
- **Expected Outcome:**
  - All mock helper methods behave deterministically as scripted.

---

## 3. Quality Gate Verification Criteria

- [x] All 11 test cases have corresponding unit/contract tests in `src/features/engine/__tests__/`.
- [x] Zero `any` types across all engine abstractions.
- [x] 100% test pass rate with 0 skips in Vitest.
