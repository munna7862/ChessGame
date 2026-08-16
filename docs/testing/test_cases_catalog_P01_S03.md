# Test Cases Catalog & Architecture Verification Matrix: Sprint 03

**Phase 01 · Sprint 03: Architecture and Module Boundaries**  
**Author:** SDET Architect  
**Status:** Approved for Implementation  
**Target:** Architecture Verification, Dependency Enforcement, Layer Boundaries, and Error Contracts

---

## 1. Scope & Verification Strategy

This catalog defines the deterministic verification specifications and architectural conformance tests for the **ChessForge** modular architecture. In Phase 01 Sprint 03, architectural boundaries are audited against:

1. **Layer Decoupling & Isolation:** Strict separation between UI, Application Service, Pure Chess Domain, Engine Bridge, and Desktop Platform (Tauri/Rust).
2. **State Ownership & Invariant Preservation:** Single authoritative runtime session state; persistence as snapshots; engine evaluations as transient asynchronous advisors.
3. **Dependency Direction & Circular Dependency Prohibition:** Strictly unidirectional dependency flow (`UI -> App Service -> Chess Domain`). Zero circular dependencies.
4. **Error Propagation & Type-Safe Result Contracts:** No leaked exceptions, no raw engine panics, runtime schema validation at all external boundaries (Tauri IPC, WebWorker, Persistence).
5. **Future-Proofing & Extensibility:** Domain model extensibility for online analysis, clock synchronizers, and network play without domain rewrite.

---

## 2. Architecture Verification Matrix

| Test ID        | Test Category         | Target Component / Boundary                           | Verification Criteria & Assertion                                                                                                                                                                      | Severity         |
| :------------- | :-------------------- | :---------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------- |
| **TC-ARCH-01** | Layer Isolation       | Pure Chess Domain (`src/domain/chess`)                | Zero imports from `react`, `react-dom`, `@tauri-apps/*`, or UI libraries. Domain compiles in pure Node/WebWorker/Browser contexts without DOM.                                                         | **BLOCKING**     |
| **TC-ARCH-02** | Dependency Direction  | Module Dependency Graph                               | Madge/ESLint dependency graph analysis confirms strictly unidirectional hierarchy: `presentation -> application -> domain`. Zero cycles detected (`cycles: 0`).                                        | **BLOCKING**     |
| **TC-ARCH-03** | State Ownership       | Game Session & State Machine                          | Single authoritative `GameSession` state. React components never maintain divergent piece coordinate matrices or turn state. Board UI is a pure reactive projection.                                   | **BLOCKING**     |
| **TC-ARCH-04** | Engine Boundary       | Engine WebWorker Bridge (`src/infrastructure/engine`) | Stockfish engine runs exclusively inside a dedicated WebWorker. Engine communication is strictly asynchronous via typed UCI messages. UI thread is never blocked.                                      | **BLOCKING**     |
| **TC-ARCH-05** | Engine Invalidation   | Engine Evaluation & Move Race                         | When a user makes a move while engine evaluation is in-flight, the pending evaluation is discarded via generation/cancellation tokens. Stale engine responses cannot commit to board state.            | **BLOCKING**     |
| **TC-ARCH-06** | Persistence Isolation | Persistence Service (`src/infrastructure/storage`)    | Persistence is a snapshot-only layer. Corrupted JSON files or invalid FEN/PGN state are validated at load time using Zod/domain checks; bad data triggers safe recovery or reset without crashing.     | **BLOCKING**     |
| **TC-ARCH-07** | Native Boundary       | Desktop Platform Layer (Tauri v2 IPC)                 | Native dialogs (file open/save) and settings file writes occur across typed Tauri IPC commands. Frontend never executes direct OS shell commands.                                                      | **BLOCKING**     |
| **TC-ARCH-08** | Error Handling        | Centralized Result / Error Contracts                  | All domain operations and IPC bridges return typed `Result<T, AppError>` models. No unformatted stack traces or unhandled promise rejections reach the presentation layer.                             | **BLOCKING**     |
| **TC-ARCH-09** | Extensibility         | Future Multiplayer / Online Services                  | The domain interfaces (`ChessEnginePort`, `GameSessionPort`, `PersistencePort`) allow drop-in swapping of local Stockfish with cloud engines or P2P/WebSocket sessions without modifying domain logic. | **NON-BLOCKING** |
| **TC-ARCH-10** | Concurrency & CPU     | Stockfish Thread & Memory Bounds                      | Stockfish WASM WebWorker enforces configurable CPU thread limits (default: 1 thread, max: `navigator.hardwareConcurrency - 1`) and memory bounds (max 32MB hash) to prevent system freeze.             | **BLOCKING**     |

---

## 3. Granular Test Case Specifications

### TC-ARCH-01: Pure Chess Domain Isolation

- **Preconditions:** Source codebase inspected at `src/domain/chess`.
- **Action:** Static analysis scan for forbidden imports (`react`, `react-dom`, `@tauri-apps`, `window`, `document`, `localStorage`).
- **Expected Result:** Clean boundary. Pure TypeScript functions and classes with 100% portable logic executable in unit test harnesses.

### TC-ARCH-02: Dependency Graph Cycle Check

- **Preconditions:** Automated module analysis tool configured.
- **Action:** Run dependency cycle detection across `src/**`.
- **Expected Result:** 0 circular dependencies. Layer hierarchy strictly respected:
  ```text
  Presentation Layer (UI/React)
          │
          ▼
  Application Service Layer (Use Cases / Coordinators)
     │            │                 │
     ▼            ▼                 ▼
  Chess Domain   Engine Bridge    Persistence / Native Ports
  (Pure Rules)   (WebWorker/UCI)  (Tauri IPC / Local Storage)
  ```

### TC-ARCH-03: Single Authoritative State & Invariant Preservation

- **Preconditions:** Active game session in progress.
- **Action:** Execute user move `e2e4`.
- **Expected Result:** Move is validated by Chess Domain -> GameSession transitions -> UI receives immutable snapshot state. No local React state modifies board position independently.

### TC-ARCH-04 & 05: Engine WebWorker Concurrency & Stale Response Rejection

- **Preconditions:** Engine evaluation running on move 12 (Position FEN: $F_1$).
- **Action:** User executes human move 12...Nf6 (Position FEN: $F_2$). Engine worker returns evaluation for $F_1$ after $F_2$ has already been committed.
- **Expected Result:** Engine bridge tags evaluation requests with monotonic token / FEN hash. The response for $F_1$ is safely ignored. A new evaluation for $F_2$ is queued or started.

### TC-ARCH-06: Persistence Snapshot Validation & Safe Recovery

- **Preconditions:** Persisted state contains malformed FEN or non-numeric clock timer.
- **Action:** Application boots and attempts auto-recovery from local storage/file.
- **Expected Result:** Runtime schema validator flags schema violation. Application logs human-readable warning, falls back to default initial state (Standard New Game), and informs user via non-fatal toast. Zero UI crash.

### TC-ARCH-08: Standardized Typed Error Contracts

- **Preconditions:** Invalid move or missing file requested.
- **Action:** Domain / Native layer returns error.
- **Expected Result:** Error conforms to typed structure:
  ```typescript
  export type AppError =
    | {
        code: "INVALID_MOVE";
        message: string;
        details?: { from: string; to: string; reason: string };
      }
    | { code: "ENGINE_CRASH"; message: string; recoverable: boolean }
    | { code: "STORAGE_FAILURE"; message: string; path?: string }
    | { code: "PARSING_ERROR"; message: string; line?: number };
  ```
  The UI gracefully renders contextual feedback based on `code`.

---

## 4. SDET Quality Gate Checklist

- [x] Test matrix covers all 10 architectural tasks specified in Sprint 03.
- [x] Invariants verified for chess domain isolation, engine worker decoupling, and atomic persistence.
- [x] Error propagation contracts defined with typed Result patterns.
- [x] Ready for Dev Architect & Senior SDE documentation and implementation.
