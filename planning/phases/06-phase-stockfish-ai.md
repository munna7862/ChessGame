# Phase 06: Stockfish AI

## Objective

Add a reliable computer opponent without compromising UI responsiveness
or game correctness.

## Outcome

Human vs Computer works with configurable difficulty and robust engine
lifecycle handling.

## Scope

- Stockfish WASM
- Web Worker
- Engine service
- Position synchronization
- Best-move requests
- Difficulty
- Thinking state
- Cancellation
- Error recovery
- Stale response protection
- Human vs Computer flow

## Architecture

```text
Game Controller
      |
Engine Service
      |
Web Worker
      |
Stockfish WASM
```

The worker boundary is mandatory for responsiveness.

## Critical race condition

```text
Position A
  ↓
Engine request A

User starts new game
  ↓
Position B
  ↓
Engine request B

Engine returns A
  ↓
MUST DISCARD
```

Use request/session IDs.

## Engine state

```text
idle
starting
ready
thinking
stopping
error
```

## Difficulty

Start with configurable engine settings rather than pretending to
provide exact Elo.

Possible controls:

- Skill level
- Search depth
- Thinking time
- Randomness only if intentionally designed

## Error handling

If the engine crashes:

```text
The chess engine stopped unexpectedly.

[Restart Engine]
[Continue as Two Players]
```

Never corrupt the game state.

## Testing

- engine startup
- position transmission
- best-move response
- cancellation
- stale response rejection
- restart
- worker failure
- game reset while thinking
- engine move legality

## Antigravity strategy

Assign engine work to a specialized agent.

Keep engine integration isolated from the board.

Ask a separate test/reviewer agent to attack concurrency and lifecycle
behavior.

## Acceptance criteria

- Human can play against computer.
- Engine never blocks UI.
- Computer moves are legal.
- Difficulty settings work.
- Reset during thinking is safe.
- Stale results are ignored.
- Engine failure is recoverable.
- Engine worker tests pass.

## Exit criteria

A complete Human vs Computer game can be played repeatedly without
stale-engine or UI-freeze defects.

## Sprint decomposition candidates

- Engine abstraction
- Worker
- Stockfish loading
- UCI communication
- Position sync
- Best move
- Cancellation
- Stale-response protection
- Difficulty
- AI game controller
- Failure recovery
- Engine regression suite
