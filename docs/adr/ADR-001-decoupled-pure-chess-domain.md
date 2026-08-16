# ADR-001: Decoupled Pure Chess Domain & Adapter Pattern

**Status:** Accepted  
**Date:** 2026-08-16  
**Author:** Dev Architect & Senior SDE / Chess Domain Architect  
**Deciders:** Dev Architect, Chess Domain Architect, SDET Architect  

---

## 1. Context & Problem Statement

A chess desktop application requires rigorous adherence to FIDE rules (castling restrictions, en passant target expiration, check/checkmate detection, 50-move rule, threefold repetition, insufficient material). If chess business logic is intertwined with UI rendering (React components, state hooks) or coupled directly to a specific third-party library, the application suffers from:
1. Difficult automated testing (requiring DOM/React harnesses for pure rule checks).
2. Dual-state synchronization bugs between UI state and domain state.
3. Vulnerability to breaking changes if the underlying chess engine or library is modified or replaced.

## 2. Decision

We mandate a **Pure Chess Domain Layer** (`src/domain/chess`) implemented in 100% portable TypeScript, completely decoupled from React, the DOM, and Tauri native runtime:
1. The domain models (`GameSession`, `Position`, `Move`, `ChessClock`) represent the authoritative runtime state.
2. The UI never validates moves or calculates check invariants; it asks the domain layer via application coordinators.
3. All third-party chess libraries (e.g. `chess.js`) are hidden behind an explicit `ChessAdapterPort` interface, allowing the internal implementation to be swapped or augmented with custom bitboard generators without affecting the UI or application layers.

```text
Presentation Layer (React) ──> Application Coordinator ──> Pure Chess Domain ──> Chess Adapter Port
```

## 3. Considered Alternatives & Rejected Rationale

### Alternative A: Direct UI-to-Chess.js Coupling in React Hooks
- **Description:** Instantiating `new Chess()` directly inside React `useState` / `useRef` and invoking `chess.move()` within UI click handlers.
- **Why Rejected:** Causes state duplication, makes headless unit testing cumbersome, prevents clean undo/redo history trees, and leaks third-party library specifics into the UI components.

### Alternative B: Implementing Pure Chess Domain in Rust (Tauri Backend)
- **Description:** Moving all chess move generation and board state into Rust via Tauri IPC commands.
- **Why Rejected:** Adds unnecessary IPC serialization overhead on every user click, drag interaction, and legal move highlight calculation (which requires sub-millisecond response for 60fps board rendering). Rust is reserved for OS capabilities (file dialogs, windowing), while chess validation stays in fast client-side TypeScript.

## 4. Consequences & Trade-offs

- **Positive:**
  - 100% headless testability with Vitest and property-based testing (`fast-check`) without DOM simulation.
  - Portable across browser, WebWorker, or future mobile runtimes.
  - Zero UI-driven state corruption.
- **Negative / Neutral:**
  - Requires maintaining explicit mapper/adapter types between raw library outputs and domain models.
