# ADR-003: Stockfish WASM WebWorker Isolation & UCI Protocol

**Status:** Accepted  
**Date:** 2026-08-16  
**Author:** Dev Architect & Senior SDE / Chess Domain Architect  
**Deciders:** Dev Architect, Security Officer, SDET Architect

---

## 1. Context & Problem Statement

ChessForge includes an integrated AI opponent and real-time position evaluation engine. Stockfish is the gold standard chess engine, requiring significant CPU compute during deep search. If engine computation is poorly isolated:

1. Long-running minimax search will freeze the main JavaScript thread, dropping UI frame rates below 60fps and making the board unresponsive.
2. Uncontrolled CPU multithreading or memory allocations can cause host CPU thermal throttling or memory exhaustion on Windows machines.
3. Out-of-order engine responses (stale evaluations from earlier positions) can corrupt the active board state.

## 2. Decision

We mandate running **Stockfish compiled to WebAssembly (WASM)** inside a dedicated, sandboxed **WebWorker** using the Universal Chess Interface (UCI) protocol:

1. **Isolated Execution:** The WebWorker runs entirely off the main UI thread.
2. **Tokenized Search & Cancellation:** Every search request is tagged with a monotonic `searchToken` and FEN hash. When the user navigates or moves, a `stop` command is dispatched, the token is incremented, and any late engine messages matching older tokens are dropped immediately.
3. **Engine as Advisor:** Stockfish outputs proposed UCI moves (e.g. `bestmove e7e5`). The `EngineCoordinator` passes this proposal to the `ChessDomain`, which validates the move against the authoritative `GameSession` before committing it.
4. **Resource Constraints:** Stockfish is initialized with strict bounds: `Threads = 1` (default, user-configurable up to `max(1, cores - 1)`), and `Hash = 16` (16MB default, max 64MB).

```text
Stockfish WASM (WebWorker)
          │  UCI Protocol (info eval, bestmove)
          ▼
   EngineCoordinator (Application Layer)
          │  Validate with Token
          ▼
   Chess Domain (Authoritative GameSession)
          │  Commit Legal Move
          ▼
   React Presentation Layer
```

## 3. Considered Alternatives & Rejected Rationale

### Alternative A: Bundled Native Stockfish Binary via Rust Process Spawning

- **Description:** Bundling `stockfish.exe` and spawning it as a child OS process via Tauri Rust commands (`std::process::Command` / `tauri-plugin-shell`).
- **Why Rejected:** Spawning native child processes introduces platform architecture compilation hurdles (x64, ARM64, AVX2 vs BMI2 variants), requires broad Tauri process execution capabilities, and creates process orphan risks if the parent application crashes. Stockfish WASM runs consistently across all machines inside the sandboxed browser environment with zero OS security risks.

### Alternative B: Stockfish on Main UI Thread (Synchronous)

- **Description:** Running a lightweight JS chess engine synchronously on the main UI thread.
- **Why Rejected:** Directly violates the 60fps responsiveness mandate, causing stutter and UI freezes during move searches.

### Alternative C: Cloud-Based Engine Evaluation API (Lichess / Chess.com / Custom Server)

- **Description:** Offloading move calculation to a remote HTTP/WebSocket server.
- **Why Rejected:** Violates the core local-first, zero-cost, offline-first mandate of ChessForge v1.

## 4. Consequences & Trade-offs

- **Positive:**
  - Non-blocking 60fps UI performance at all times.
  - Zero OS child process management overhead.
  - Sandboxed execution with strict memory and CPU throttling bounds.
- **Negative / Neutral:**
  - WASM execution is approximately 10-20% slower than native AVX-512 binaries, which is completely negligible for typical desktop analysis depths (depth 12-18 takes ~100-300ms).
