# Phase 06 · Sprint 04: Engine Difficulty and Thinking Policy

## Sprint Objective

Expose useful computer difficulty controls without claiming false Elo accuracy.

## Dependencies

Stable engine integration.

## Scope

### Granular implementation tasks

1. Define difficulty configuration.
2. Map levels to engine settings.
3. Define thinking-time limits.
4. Prevent unbounded searches.
5. Persist selected difficulty through settings hook.
6. Add deterministic configuration tests.

## Expected Files / Areas

Engine configuration and settings interfaces.

## Testing & Verification

Verify each level produces valid engine configuration and bounded behavior.

## Acceptance Criteria

- [ ] Eight initial levels are configurable.
- [ ] Search is bounded.
- [ ] Configuration is deterministic.
- [ ] No exact Elo claim is made without calibration.

## Risks / Guardrails

Difficulty levels feeling arbitrary.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 06, Sprint 04: Engine Difficulty and Thinking Policy.

OBJECTIVE:
Expose useful computer difficulty controls without claiming false Elo accuracy.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Define difficulty configuration.
2. Map levels to engine settings.
3. Define thinking-time limits.
4. Prevent unbounded searches.
5. Persist selected difficulty through settings hook.
6. Add deterministic configuration tests.

TEST:
Verify each level produces valid engine configuration and bounded behavior.

ACCEPTANCE:
- [ ] Eight initial levels are configurable.
- [ ] Search is bounded.
- [ ] Configuration is deterministic.
- [ ] No exact Elo claim is made without calibration.

GUARDRAILS:
Difficulty levels feeling arbitrary.

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
