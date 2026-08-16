# Phase 03 · Sprint 02: Legal Move Execution

## Sprint Objective

Implement authoritative move validation and state transitions.

## Dependencies

Domain contract.

## Scope

### Granular implementation tasks

1. Load initial position.
2. Query legal moves.
3. Validate move input.
4. Execute legal moves.
5. Reject illegal moves without mutation.
6. Update turn.
7. Record move metadata.
8. Implement undo.
9. Add position reconstruction tests.

## Expected Files / Areas

`src/domain/chess/*`, move tests.

## Testing & Verification

Test legal and illegal moves across all piece types and verify state immutability on rejection.

## Acceptance Criteria

- [ ] Legal moves execute.
- [ ] Illegal moves fail safely.
- [ ] Turn changes correctly.
- [ ] Undo restores the previous position.
- [ ] Move records are deterministic.

## Risks / Guardrails

State mutation on failed moves.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 03, Sprint 02: Legal Move Execution.

OBJECTIVE:
Implement authoritative move validation and state transitions.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Load initial position.
2. Query legal moves.
3. Validate move input.
4. Execute legal moves.
5. Reject illegal moves without mutation.
6. Update turn.
7. Record move metadata.
8. Implement undo.
9. Add position reconstruction tests.

TEST:
Test legal and illegal moves across all piece types and verify state immutability on rejection.

ACCEPTANCE:
- [ ] Legal moves execute.
- [ ] Illegal moves fail safely.
- [ ] Turn changes correctly.
- [ ] Undo restores the previous position.
- [ ] Move records are deterministic.

GUARDRAILS:
State mutation on failed moves.

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
