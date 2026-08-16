# Phase 08 · Sprint 01: Persistence Abstraction and Versioned State

## Sprint Objective

Create a versioned persistence service for settings and active games.

## Dependencies

Stable game system.

## Scope

### Granular implementation tasks

1. Define persistence interface.
2. Define persisted state schema.
3. Add version field.
4. Implement local storage mechanism.
5. Add serialization/deserialization.
6. Handle missing/corrupt data.
7. Add migration framework.

## Expected Files / Areas

`src/domain/persistence/*`, storage adapter, tests.

## Testing & Verification

Round-trip and corrupted-data tests.

## Acceptance Criteria

- [ ] Persistence is isolated.
- [ ] State is versioned.
- [ ] Corrupt data cannot crash startup.
- [ ] Tests can use an in-memory adapter.

## Risks / Guardrails

Schema lock-in and corrupted startup state.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 08, Sprint 01: Persistence Abstraction and Versioned State.

OBJECTIVE:
Create a versioned persistence service for settings and active games.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Define persistence interface.
2. Define persisted state schema.
3. Add version field.
4. Implement local storage mechanism.
5. Add serialization/deserialization.
6. Handle missing/corrupt data.
7. Add migration framework.

TEST:
Round-trip and corrupted-data tests.

ACCEPTANCE:
- [ ] Persistence is isolated.
- [ ] State is versioned.
- [ ] Corrupt data cannot crash startup.
- [ ] Tests can use an in-memory adapter.

GUARDRAILS:
Schema lock-in and corrupted startup state.

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
