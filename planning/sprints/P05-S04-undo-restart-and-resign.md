# Phase 05 · Sprint 04: Undo Restart and Resign

## Sprint Objective

Implement core game controls and lifecycle transitions.

## Dependencies

Game session, move history.

## Scope

### Granular implementation tasks

1. Add Undo.
2. Define undo semantics.
3. Add Restart confirmation.
4. Add Resign confirmation.
5. Transition to game-over state.
6. Disable board after resignation.
7. Reset all transient state.

## Expected Files / Areas

Game controls and tests.

## Testing & Verification

Integration/E2E tests for undo, restart and resignation.

## Acceptance Criteria

- [ ] Undo restores exact prior position.
- [ ] Restart resets all state.
- [ ] Resign ends game correctly.
- [ ] Game-over board is non-interactive.

## Risks / Guardrails

Ambiguous undo semantics after AI is added.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 05, Sprint 04: Undo Restart and Resign.

OBJECTIVE:
Implement core game controls and lifecycle transitions.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Add Undo.
2. Define undo semantics.
3. Add Restart confirmation.
4. Add Resign confirmation.
5. Transition to game-over state.
6. Disable board after resignation.
7. Reset all transient state.

TEST:
Integration/E2E tests for undo, restart and resignation.

ACCEPTANCE:
- [ ] Undo restores exact prior position.
- [ ] Restart resets all state.
- [ ] Resign ends game correctly.
- [ ] Game-over board is non-interactive.

GUARDRAILS:
Ambiguous undo semantics after AI is added.

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
