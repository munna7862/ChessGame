# Test Cases Catalog: Phase 06 · Sprint 02

**Sprint:** P06-S02 · Stockfish WASM Worker Integration  
**Author:** SDET Architect  
**Date:** 2026-08-18  
**Status:** Approved for Implementation

---

## 1. Test Architecture & Coverage Matrix

| Test Suite                      | Tier                 | Target File(s)                                 | Focus Area                                                                                                        |
| :------------------------------ | :------------------- | :--------------------------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| `uciProtocol.test.ts`           | Tier 1 (Unit)        | `src/features/engine/uciProtocol.ts`           | Pure UCI command generation, UCI output parsing, score/mate decoding, PV tokenization, malformed line resilience. |
| `StockfishWorkerBridge.test.ts` | Tier 3 (Integration) | `src/features/engine/StockfishWorkerBridge.ts` | Worker lifecycle, handshake sequencing, option transmission, search dispatch, stop cancellation, error handling.  |

---

## 2. Granular Test Cases

### TC-SF-01: Pure UCI Command Formatting

- **Tier:** Tier 1 (Unit)
- **Objective:** Verify pure serializer functions format valid, newline-terminated UCI command strings.
- **Inputs & Expected Outputs:**
  - `formatUci()` $\rightarrow$ `"uci\n"`
  - `formatIsReady()` $\rightarrow$ `"isready\n"`
  - `formatUciNewGame()` $\rightarrow$ `"ucinewgame\n"`
  - `formatSetOption("Threads", 1)` $\rightarrow$ `"setoption name Threads value 1\n"`
  - `formatSetOption("Hash", 16)` $\rightarrow$ `"setoption name Hash value 16\n"`
  - `formatPosition("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")` $\rightarrow$ `"position fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1\n"`
  - `formatGo({ depth: 14 })` $\rightarrow$ `"go depth 14\n"`
  - `formatGo({ movetimeMs: 1500 })` $\rightarrow$ `"go movetime 1500\n"`
  - `formatStop()` $\rightarrow$ `"stop\n"`
  - `formatQuit()` $\rightarrow$ `"quit\n"`
- **Pass Criteria:** Exact string matching with correct syntax and whitespace.

---

### TC-SF-02: UCI Output Parser - Handshake and State Signals

- **Tier:** Tier 1 (Unit)
- **Objective:** Parse handshake confirmation lines into typed worker events.
- **Scenarios:**
  - Input: `"uciok"` $\rightarrow$ `{ type: "UCIOK" }`
  - Input: `"readyok"` $\rightarrow$ `{ type: "READY" }`
- **Pass Criteria:** Parsed objects match expected types.

---

### TC-SF-03: UCI Output Parser - Evaluation and Search Info

- **Tier:** Tier 1 (Unit)
- **Objective:** Parse complex `info` lines emitted during search.
- **Scenarios:**
  - Centipawn score: `"info depth 8 seldepth 12 score cp 35 nodes 1520 nps 120000 time 12 pv e2e4 e7e5 g1f3"` $\rightarrow$
    `{ type: "SEARCH_INFO", depth: 8, scoreCp: 35, mate: undefined, nodes: 1520, nps: 120000, timeMs: 12, pv: ["e2e4", "e7e5", "g1f3"] }`
  - Mate score (White winning in 3): `"info depth 14 score mate 3 nodes 8400 time 50 pv f7f8q g8f8 d1d8"` $\rightarrow$
    `{ type: "SEARCH_INFO", depth: 14, scoreCp: undefined, mate: 3, nodes: 8400, timeMs: 50, pv: ["f7f8q", "g8f8", "d1d8"] }`
  - Negative mate score (Black winning in 2): `"info depth 10 score mate -2 nodes 3200 pv d8d1 c1d1 e8e1"` $\rightarrow$
    `{ type: "SEARCH_INFO", depth: 10, mate: -2, nodes: 3200 }`
  - Upperbound / Lowerbound / Currmove strings ignored without crashing.
- **Pass Criteria:** Number conversions and PV array extraction are exact; non-numeric values are safely parsed.

---

### TC-SF-04: UCI Output Parser - Best Move and Ponder

- **Tier:** Tier 1 (Unit)
- **Objective:** Parse `bestmove` lines with optional `ponder` move.
- **Scenarios:**
  - Standard move: `"bestmove e2e4 ponder e7e5"` $\rightarrow$ `{ type: "BEST_MOVE", uciMove: "e2e4", ponderMove: "e7e5" }`
  - Promotion move: `"bestmove e7e8q ponder d7d5"` $\rightarrow$ `{ type: "BEST_MOVE", uciMove: "e7e8q", ponderMove: "d7d5" }`
  - Move without ponder: `"bestmove g1f3"` $\rightarrow$ `{ type: "BEST_MOVE", uciMove: "g1f3", ponderMove: undefined }`
  - Terminal move: `"bestmove (none)"` $\rightarrow$ `{ type: "BEST_MOVE", uciMove: "(none)", ponderMove: undefined }`
- **Pass Criteria:** `uciMove` and `ponderMove` strings are correctly extracted.

---

### TC-SF-05: UCI Output Parser - Informational / Unknown Chatter Filtering

- **Tier:** Tier 1 (Unit)
- **Objective:** Safely ignore informational, configuration, and unrecognized engine chatter.
- **Scenarios:**
  - Banner: `"Stockfish 10 64 by Tord Romstad, Marco Costalba, Joona Kiiski, Gary Linscott"` $\rightarrow$ `null` (ignored)
  - ID lines: `"id name Stockfish 10"`, `"id author the Stockfish developers"` $\rightarrow$ `null`
  - Option lines: `"option name Threads type spin default 1 min 1 max 128"` $\rightarrow$ `null`
  - Empty lines: `""`, `"   "` $\rightarrow$ `null`
- **Pass Criteria:** Returns `null` without throwing exceptions or generating false events.

---

### TC-SF-06: Stockfish Worker Bridge - Two-Phase Initialization Handshake

- **Tier:** Tier 3 (Integration)
- **Objective:** Verify `StockfishWorkerBridge` sends `uci`, receives `uciok`, applies configured options, sends `isready`, receives `readyok`, and emits `READY`.
- **Flow:**
  1. Bridge instantiated with mock worker.
  2. Bridge receives `postMessage({ type: "INIT", config: { threads: 1, hashSizeMb: 16, skillLevel: 10 } })`.
  3. Verify worker received `"uci\n"`.
  4. Worker emits `"uciok"`.
  5. Verify worker received `"setoption name Threads value 1\n"`, `"setoption name Hash value 16\n"`, `"setoption name Skill Level value 10\n"`, `"isready\n"`.
  6. Worker emits `"readyok"`.
  7. Verify listener received `{ type: "READY" }`.
- **Pass Criteria:** State machine transitions strictly from starting to ready upon `readyok`.

---

### TC-SF-07: Stockfish Worker Bridge - Search Dispatch & Streaming Info

- **Tier:** Tier 3 (Integration)
- **Objective:** Verify search request sends position and go commands, and streams evaluation info tagged with `searchToken`.
- **Flow:**
  1. Bridge initialized and ready.
  2. Send `{ type: "SEARCH", request: { searchToken: "tok-1", fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1", depth: 10 } }`.
  3. Verify worker received `"position fen ...\n"` and `"go depth 10\n"`.
  4. Worker emits `"info depth 4 score cp 15 pv e7e5"`.
  5. Verify listener received `{ type: "SEARCH_INFO", searchToken: "tok-1", depth: 4, scoreCp: 15, pv: ["e7e5"] }`.
  6. Worker emits `"bestmove e7e5 ponder g1f3"`.
  7. Verify listener received `{ type: "BEST_MOVE", searchToken: "tok-1", uciMove: "e7e5", ponderMove: "g1f3" }`.
- **Pass Criteria:** Every emitted search info and best move matches `tok-1`.

---

### TC-SF-08: Stockfish Worker Bridge - Stop Cancellation

- **Tier:** Tier 3 (Integration)
- **Objective:** Verify `STOP` sends `"stop\n"` to worker and emits `STOPPED`.
- **Flow:**
  1. Search in progress with token `tok-cancel`.
  2. Send `{ type: "STOP" }`.
  3. Verify worker received `"stop\n"`.
  4. Verify listener received `{ type: "STOPPED" }`.
  5. Worker emits late `"bestmove e2e4"`.
  6. Verify late best move carries cancelled token or is discarded per contract.
- **Pass Criteria:** Clean cancellation with zero hung promises.

---

### TC-SF-09: Stockfish Worker Bridge - Teardown & Worker Termination

- **Tier:** Tier 3 (Integration)
- **Objective:** Verify `TERMINATE` sends `"quit\n"`, terminates worker, and unregisters listeners.
- **Flow:**
  1. Call `bridge.terminate()` or `{ type: "TERMINATE" }`.
  2. Verify worker received `"quit\n"`.
  3. Verify `worker.terminate()` called.
  4. Subscriptions cleaned up.
- **Pass Criteria:** Clean resource disposal.

---

### TC-SF-10: Stockfish Worker Bridge - Worker Error Propagation

- **Tier:** Tier 3 (Integration)
- **Objective:** Verify worker `error` event triggers error callback and emits `{ type: "ERROR", message, fatal: true }`.
- **Flow:**
  1. Worker emits an `ErrorEvent("WASM out of memory")`.
  2. Verify bridge `onError` callback fires with error object.
  3. Verify bridge `onMessage` fires `{ type: "ERROR", message: "WASM out of memory", fatal: true }`.
- **Pass Criteria:** Proper error propagation to `EngineServiceImpl`.
