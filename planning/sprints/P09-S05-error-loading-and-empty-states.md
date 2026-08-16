# Phase 09 · Sprint 05: Error Loading and Empty States

## Sprint Objective

Polish failure paths so users always understand what happened and what to do next.

## Dependencies

Functional persistence, engine and game flows.

## Scope

### Granular implementation tasks

1. Engine failure state.
2. Invalid PGN state.
3. Invalid FEN state.
4. Persistence recovery failure.
5. Missing asset fallback.
6. Unexpected error boundary.
7. Loading states.
8. Empty history/settings states where applicable.

## Expected Files / Areas

Error components, boundaries, feature UIs.

## Testing & Verification

Force each error condition and verify recovery action.

## Acceptance Criteria

- [ ] Errors are understandable.
- [ ] Recovery action is obvious.
- [ ] Technical details are logged rather than dumped on users.
- [ ] Errors do not corrupt current game state.

## Risks / Guardrails

Error paths accidentally mutating state.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 09, Sprint 05: Error Loading and Empty States.

OBJECTIVE:
Polish failure paths so users always understand what happened and what to do next.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Engine failure state.
2. Invalid PGN state.
3. Invalid FEN state.
4. Persistence recovery failure.
5. Missing asset fallback.
6. Unexpected error boundary.
7. Loading states.
8. Empty history/settings states where applicable.

TEST:
Force each error condition and verify recovery action.

ACCEPTANCE:
- [ ] Errors are understandable.
- [ ] Recovery action is obvious.
- [ ] Technical details are logged rather than dumped on users.
- [ ] Errors do not corrupt current game state.

GUARDRAILS:
Error paths accidentally mutating state.

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
