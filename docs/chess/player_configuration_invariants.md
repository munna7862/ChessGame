# Player Configuration & New Game Domain Invariants

## 1. Architectural Scope & Context

In **ChessForge**, creating a new game establishes an authoritative `GameSession` binding two players to specific colors (`w` and `b`), a starting chess position (standard or validated custom FEN), and a game mode (`human_vs_human` or `human_vs_engine`).

This document formalizes the domain rules, configuration invariants, validation requirements, and player metadata models.

---

## 2. Player Model & Configuration Schema

### 2.1 Player Entity Specification

Every player participating in a `GameSession` conforms to the canonical `PlayerConfig` schema:

```typescript
export interface PlayerConfig {
  readonly id: string;
  readonly name: string;
  readonly color: "w" | "b";
  readonly type: "human" | "engine";
  readonly rating?: number | undefined;
}
```

### 2.2 Game Mode Schema

```typescript
export type GameMode = "human_vs_human" | "human_vs_engine";
export type PlayerColorChoice = "w" | "b" | "random";
```

---

## 3. Core Invariants

### Invariant 1: Color Exhaustion & Uniqueness

- Every session must have exactly one player assigned to White (`color: 'w'`) and exactly one player assigned to Black (`color: 'b'`).
- `session.players.w.color === 'w'` and `session.players.b.color === 'b'` must strictly hold.
- A player cannot be assigned to both colors simultaneously.

### Invariant 2: Player Name Validation & Sanitization

- Player names must be trimmed strings between 1 and 32 characters in length.
- Empty or whitespace-only inputs are invalid and must fall back to default labels (e.g. `"White"` and `"Black"` or `"Player 1"` / `"Player 2"`).
- Names must be plain text sanitized against script injection and control characters.

### Invariant 3: Color Selection & Random Resolution

- When a user chooses `"w"`, Player 1 receives White (`'w'`) and Player 2 receives Black (`'b'`).
- When a user chooses `"b"`, Player 1 receives Black (`'b'`) and Player 2 receives White (`'w'`).
- When a user chooses `"random"`, color assignment is computed at creation time using `Math.random() >= 0.5 ? 'w' : 'b'` and committed as a fixed deterministic pair (`w` and `b`) in the resulting `GameSession`.

### Invariant 4: Player Type & Engine Compatibility

- In `human_vs_human`, both `players.w.type` and `players.b.type` are `'human'`.
- In `human_vs_engine`, exactly one player has `type: 'human'` and one player has `type: 'engine'`.
- The engine player model carries optional difficulty/rating parameters (`rating?: number`) to support future Stockfish UCI configuration without domain refactoring.

### Invariant 5: Initial Position Validation (FEN)

- Default initialization starts from standard starting position (`rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`).
- If a custom starting FEN is provided:
  1. FEN string syntax is validated against FEN grammar regex.
  2. Position legality is validated by `ChessPort.loadFen()` (must contain exactly one White King, one Black King, no pawns on 1st/8th ranks, side to move not delivering direct check on non-active King).
  3. Rejection of invalid FEN must return `Result.err(ChessDomainError)` without corrupting previous or initial session state.

### Invariant 6: Session Immutability

- Once created, `session.players` and `session.mode` are immutable for that game session.
- To change player names, colors, or mode, a new session must be initialized via `reset(config)`.

### Invariant 7: Board Orientation Correlation

- In `human_vs_engine`, default board orientation automatically matches the human player's assigned color (`'w'` or `'b'`).
- In `human_vs_human`, default board orientation is `'w'`, but can be toggled by the user at any point without affecting session state.

---

## 4. State Transition & Reset Lifecycle

```text
[New Game Modal Open]
       │
       ▼
[Validate Form (Names, Mode, Color, FEN)]
       │
  (Valid Form)
       │
       ▼
[Resolve Random Color (if 'random')]
       │
       ▼
[Construct PlayerConfig: w & b]
       │
       ▼
[Invoke sessionController.reset(config)]
       │
       ├── Domain ChessGame reset to initial/custom position
       ├── Session moveHistory cleared ([])
       ├── Captured pieces cleared (white: [], black: [])
       ├── UI transient state cleared (selectedSquare, promotion, lastMove)
       └── Active player panels rendered with new names
```

---

## 5. Security & Safety Boundaries

1. **Client-Side Sanitization**: Player names are encoded when rendered in the DOM.
2. **Schema Enforcement**: All player configuration objects crossing UI / Session boundaries must be validated via Zod schemas (`PlayerConfigSchema`, `GameSessionConfigSchema`).
3. **No Unbounded Memory**: Player configuration is bounded to fixed scalar properties; history records do not leak unconstrained closures.
