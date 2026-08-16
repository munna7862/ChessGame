# Phase 05 · Sprint 01: Game Session State

## Sprint Objective

Create the application-level game session controller connecting domain, board and UI state.

## Dependencies

Phase 03 and 04.

## Scope

### Granular implementation tasks

1. Define GameSession state.
2. Create game controller/service.
3. Wire new position to board.
4. Wire move events to domain.
5. Expose status.
6. Reset cleanly.
7. Separate transient UI state from game state.

## Expected Files / Areas

`src/features/game/*`, state/store files.

## Testing & Verification

Integration tests for state transitions and reset.

## Acceptance Criteria

- [ ] One authoritative game session exists.
- [ ] Board reflects domain state.
- [ ] New game fully resets state.
- [ ] UI state cannot corrupt domain state.

## Risks / Guardrails

Duplicate sources of truth.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 05, Sprint 01: Game Session State.

OBJECTIVE:
Create the application-level game session controller connecting domain, board and UI state.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Define GameSession state.
2. Create game controller/service.
3. Wire new position to board.
4. Wire move events to domain.
5. Expose status.
6. Reset cleanly.
7. Separate transient UI state from game state.

TEST:
Integration tests for state transitions and reset.

ACCEPTANCE:
- [ ] One authoritative game session exists.
- [ ] Board reflects domain state.
- [ ] New game fully resets state.
- [ ] UI state cannot corrupt domain state.

GUARDRAILS:
Duplicate sources of truth.

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
