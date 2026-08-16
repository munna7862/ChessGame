# Phase 07 · Sprint 03: Clock Integration and Timeout

## Sprint Objective

Integrate clocks with human games and game-over behavior.

## Dependencies

Clock domain and UI.

## Scope

### Granular implementation tasks

1. Start clock on first move.
2. Stop current clock on move.
3. Apply increment.
4. Start opponent clock.
5. Detect timeout.
6. End game.
7. Test restart and resignation with clocks.

## Expected Files / Areas

Game controller, clock service/UI.

## Testing & Verification

Deterministic integration tests using injected time.

## Acceptance Criteria

- [ ] Turn transitions update clocks correctly.
- [ ] Timeout ends game.
- [ ] Increment applies correctly.
- [ ] Resign/restart cleans up clock state.

## Risks / Guardrails

Race between move and timeout.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 07, Sprint 03: Clock Integration and Timeout.

OBJECTIVE:
Integrate clocks with human games and game-over behavior.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Start clock on first move.
2. Stop current clock on move.
3. Apply increment.
4. Start opponent clock.
5. Detect timeout.
6. End game.
7. Test restart and resignation with clocks.

TEST:
Deterministic integration tests using injected time.

ACCEPTANCE:
- [ ] Turn transitions update clocks correctly.
- [ ] Timeout ends game.
- [ ] Increment applies correctly.
- [ ] Resign/restart cleans up clock state.

GUARDRAILS:
Race between move and timeout.

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
