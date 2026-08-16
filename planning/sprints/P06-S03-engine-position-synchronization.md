# Phase 06 · Sprint 03: Engine Position Synchronization

## Sprint Objective

Guarantee the engine always analyzes the current game position.

## Dependencies

Working Stockfish worker.

## Scope

### Granular implementation tasks

1. Convert domain position to engine position.
2. Track active game/session ID.
3. Send current FEN.
4. Stop previous search before new position.
5. Validate engine response against current session.
6. Discard stale responses.

## Expected Files / Areas

Game controller and engine service.

## Testing & Verification

Simulate reset/new-game during engine thinking and verify old responses are discarded.

## Acceptance Criteria

- [ ] Engine analyzes current position only.
- [ ] Stale responses cannot mutate state.
- [ ] New game invalidates old requests.
- [ ] Position synchronization is testable.

## Risks / Guardrails

Race conditions.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 06, Sprint 03: Engine Position Synchronization.

OBJECTIVE:
Guarantee the engine always analyzes the current game position.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Convert domain position to engine position.
2. Track active game/session ID.
3. Send current FEN.
4. Stop previous search before new position.
5. Validate engine response against current session.
6. Discard stale responses.

TEST:
Simulate reset/new-game during engine thinking and verify old responses are discarded.

ACCEPTANCE:
- [ ] Engine analyzes current position only.
- [ ] Stale responses cannot mutate state.
- [ ] New game invalidates old requests.
- [ ] Position synchronization is testable.

GUARDRAILS:
Race conditions.

At completion:
- Run the relevant verification commands.
- Report changed files.
- Report tests executed and results.
- Report known limitations.
- Do not suppress or bypass failing tests.
```

## Sprint Definition of Done

- [ ] Scope implemented without unrelated changes.
- [ ] Tests added or updated for changed behavior.
- [ ] Typecheck passes.
- [ ] Lint passes.
- [ ] Relevant tests pass.
- [ ] Build passes when applicable.
- [ ] Acceptance criteria verified.
- [ ] Git diff reviewed.
- [ ] Documentation updated when behavior or architecture changed.
- [ ] Sprint can be handed to the next sprint without hidden manual steps.
