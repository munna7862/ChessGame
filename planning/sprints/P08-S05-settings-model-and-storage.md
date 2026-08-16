# Phase 08 · Sprint 05: Settings Model and Storage

## Sprint Objective

Implement persistent application preferences.

## Dependencies

Persistence service.

## Scope

### Granular implementation tasks

1. Define Settings schema.
2. Add defaults.
3. Validate settings.
4. Persist changes.
5. Load settings at startup.
6. Add version migration path.
7. Add reset-to-defaults.

## Expected Files / Areas

Settings domain/UI and persistence.

## Testing & Verification

Defaults, persistence, invalid values and migration tests.

## Acceptance Criteria

- [ ] Defaults are deterministic.
- [ ] Changes persist across restart.
- [ ] Invalid values are rejected.
- [ ] Reset restores defaults.

## Risks / Guardrails

Settings becoming coupled to individual components.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 08, Sprint 05: Settings Model and Storage.

OBJECTIVE:
Implement persistent application preferences.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Define Settings schema.
2. Add defaults.
3. Validate settings.
4. Persist changes.
5. Load settings at startup.
6. Add version migration path.
7. Add reset-to-defaults.

TEST:
Defaults, persistence, invalid values and migration tests.

ACCEPTANCE:
- [ ] Defaults are deterministic.
- [ ] Changes persist across restart.
- [ ] Invalid values are rejected.
- [ ] Reset restores defaults.

GUARDRAILS:
Settings becoming coupled to individual components.

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
