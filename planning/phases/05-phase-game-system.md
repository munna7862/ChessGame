# Phase 05: Game System

## Objective

Turn the board into a complete playable local chess product.

## Outcome

A user can start, play, control, finish and review a complete Human vs
Human game.

## Scope

- New Game
- Player configuration
- Human vs Human
- Game controller
- Move history
- Captured pieces
- Restart
- Undo
- Resign
- Draw offer
- Game result
- Game-over state
- Game session state

## Suggested state model

```text
GameSession
├── game
├── players
├── moveHistory
├── status
├── selectedSquare
├── boardOrientation
├── capturedPieces
└── controls
```

Keep transient UI state separate from domain state.

## Game lifecycle

```text
New
 ↓
In Progress
 ↓
Check / Normal
 ↓
Game Over
 ↓
Review / New Game
```

## Important scenarios

### Normal game

```text
New Game
→ White moves
→ Black moves
→ history updates
→ repeat
```

### Checkmate

```text
Move
→ domain reports checkmate
→ disable further moves
→ show result
```

### Resignation

```text
Resign
→ confirm
→ mark game resigned
→ show result
```

## Move history

Display:

```text
1. e4 e5
2. Nf3 Nc6
3. Bb5 a6
```

History must come from the domain's authoritative notation.

## Antigravity strategy

Use a game-system agent after the board/domain contracts stabilize.

Require integration tests before adding AI.

## Acceptance criteria

- New games start correctly.
- Two humans can play complete games.
- Move history is accurate.
- Captured pieces are accurate.
- Undo works within defined rules.
- Resignation works.
- Draw flow works.
- Game-over state blocks additional moves.
- Restart works.
- No stale UI state survives a new game.

## Exit criteria

Human vs Human is feature-complete and reliable.

This is the gate before Stockfish integration.

## Sprint decomposition candidates

- Game session state
- New game flow
- Player configuration
- Move history
- Captured pieces
- Undo
- Resign
- Draw
- Game result
- Restart
- Integration tests
