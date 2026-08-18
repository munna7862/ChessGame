# Sprint 05 Test Cases Catalog: Human vs Computer Game Flow

**Sprint:** Phase 06 · Sprint 05: Human vs Computer Game Flow  
**Target Areas:** Engine Opponent Coordinator, Game Session Controller, Board Interaction Locking, Thinking State Display, Move Parsing & Execution, Concurrency/Cancellation, Undo/Restart/Resign During Thinking.  
**Author:** SDET Architect  
**Status:** **APPROVED FOR EXECUTION**

---

## 1. Test Matrix Overview

| Test ID       | Category               | Description                                                                         | Verification Method          |
| :------------ | :--------------------- | :---------------------------------------------------------------------------------- | :--------------------------- |
| **TC-HVC-01** | Positive               | Engine automatically triggers and responds after human move                         | Unit / Integration (Vitest)  |
| **TC-HVC-02** | Positive               | Engine moves are parsed from UCI and validated through chess domain                 | Unit / Integration (Vitest)  |
| **TC-HVC-03** | Boundary / Security    | Board locks and rejects user clicks/drags while engine is thinking                  | Component Test (RTL)         |
| **TC-HVC-04** | UI / A11y              | Thinking state rendered on PlayerPanel & status bar with a11y labels                | Component Test (RTL)         |
| **TC-HVC-05** | Positive               | White engine makes automatic opening move when human plays Black                    | Integration / Component Test |
| **TC-HVC-06** | Concurrency / Negative | New game / Restart during engine thinking cancels search & discards stale moves     | Integration Test (Vitest)    |
| **TC-HVC-07** | Concurrency / Negative | Resignation during engine thinking cancels search cleanly                           | Integration Test (Vitest)    |
| **TC-HVC-08** | Positive / UX          | Undo in Human vs Engine rolls back 2 plies on human turn, 1 ply during thinking     | Integration / Component Test |
| **TC-HVC-09** | Positive               | Game over (checkmate / draw) after engine move triggers result dialog               | Integration / Component Test |
| **TC-HVC-10** | Integration            | Engine difficulty configuration (Levels 1..8) properly passed to engine service     | Unit / Integration Test      |
| **TC-HVC-11** | Property Fuzzing       | fast-check generative invariant test for engine move application & turn alternation | Vitest / fast-check          |
| **TC-HVC-12** | E2E Playout            | Complete Human vs Computer game flow, reset during thinking, and Black perspective  | Playwright E2E               |

---

## 2. Detailed Test Cases

### TC-HVC-01: Engine Automatic Response After Human Move

- **Given:** A `human_vs_engine` game where White is Human and Black is Engine.
- **When:** Human plays `1. e4`.
- **Then:** Controller state updates to turn `'b'`; `isEngineThinking` becomes `true`; engine search is triggered with current FEN; engine responds with a legal move (e.g., `e7e5`); controller executes move; turn switches back to `'w'`; `isEngineThinking` becomes `false`.

### TC-HVC-02: Engine UCI Move Parsing & Domain Execution

- **Given:** Engine returns various UCI move formats:
  - Standard move: `"e7e5"` -> `{ from: "e7", to: "e5" }`
  - Promotion: `"e7e8q"` -> `{ from: "e7", to: "e8", promotion: "q" }`
  - Castling: `"e8g8"` -> `{ from: "e8", to: "g8" }`
  - Knight/Bishop move: `"g8f6"` -> `{ from: "g8", to: "f6" }`
- **When:** Parsed and executed via domain adapter.
- **Then:** Move is legal, SAN is recorded, move history is updated, captured pieces are tracked.

### TC-HVC-03: Board Locking During Engine Thinking

- **Given:** Engine is thinking (`isEngineThinking = true`).
- **When:** Human clicks on squares or attempts drag-and-drop.
- **Then:** Board is marked `disabled`; clicks do not select pieces; legal moves are not highlighted; no human move is accepted.

### TC-HVC-04: Thinking State Presentation

- **Given:** Engine is searching for a move.
- **When:** UI renders.
- **Then:** Engine `PlayerPanel` renders `data-testid="player-thinking-{color}"` and thinking badge; status bar shows thinking indicator; indicator vanishes when move is made.

### TC-HVC-05: White Engine Auto-Opening (Human Plays Black)

- **Given:** New game configured with `player1Color = "b"` (Human = Black, Engine = White).
- **When:** Game session initializes with starting position (`turn = 'w'`).
- **Then:** Engine automatically detects it is White's turn, triggers search, and executes White's opening move without user interaction.

### TC-HVC-06: Reset / Restart During Thinking

- **Given:** Human plays move, engine begins thinking.
- **When:** Human clicks Restart or New Game while engine is thinking.
- **Then:** Engine search is cancelled immediately (`cancelSearch()`); session ID / epoch is incremented; late best move from prior search is discarded; board is clean initial position; no double moves or corruptions occur.

### TC-HVC-07: Resignation During Thinking

- **Given:** Engine is thinking.
- **When:** Human resigns.
- **Then:** Engine search is cancelled; game status transitions to `resigned`; winner is declared; engine move is not played.

### TC-HVC-08: Undo / Takeback Policy in Human vs Engine

- **Given:** Human vs Engine game with move history `1. e4 e5 2. Nf3 Nc6`.
- **When:** Human clicks Undo on move 3.
- **Then:** 2 plies are undone (White 2. Nf3 and Black 2... Nc6), restoring position to `1. e4 e5` with White (Human) to move.
- **Given:** Human plays `1. e4` and clicks Undo while engine is thinking for Black.
- **Then:** Search is cancelled, 1 ply is undone, restoring initial position.

### TC-HVC-09: Game Over Handling After Engine Move

- **Given:** Position where engine delivers checkmate (e.g., Scholar's mate / Fool's mate).
- **When:** Engine plays the checkmate move.
- **Then:** Controller transitions status to `checkmate`; `isGameOver` is `true`; `GameResultModal` opens automatically; board disables.

### TC-HVC-10: Engine Difficulty Parameter Binding

- **Given:** Player configuration with difficulty level $N \in [1..8]$.
- **When:** Search is requested.
- **Then:** `skillLevel`, `depth`, and `movetimeMs` match the exact preset values for level $N$ defined in `difficulty.ts`.

### TC-HVC-11: Property-Based Invariant Fuzzing

- **Given:** fast-check generative engine mock simulator.
- **When:** Random games of $N$ moves are played with engine responses.
- **Then:** Game invariants hold (King present, legal turns, valid histories, accurate capture counts, zero unhandled errors).

### TC-HVC-12: Playwright E2E Test Playout

- **Given:** Full Tauri / Web browser UI.
- **When:** Starting Human vs Computer game, playing moves, testing restart while thinking, and starting as Black.
- **Then:** UI transitions smoothly with 0 console errors, 60fps responsiveness, and complete game resolution.
