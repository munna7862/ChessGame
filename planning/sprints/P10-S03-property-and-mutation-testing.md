# Phase 10 · Sprint 03: Property and Mutation Testing

## Sprint Objective

Measure whether the test suite can detect intentionally introduced domain defects.

## Dependencies

Stable regression suite.

## Scope

### Granular implementation tasks

1. Define property/invariant suite.
2. Generate reproducible legal games.
3. Introduce controlled mutations.
4. Verify tests fail for each mutation.
5. Remove mutations.
6. Document findings and test gaps.

## Expected Files / Areas

Property test infrastructure and domain tests.

## Testing & Verification

Mutation run and review of surviving mutants.

## Acceptance Criteria

- [ ] Important mutations are detected.
- [ ] Random tests are reproducible.
- [ ] Surviving mutants are investigated.

## Risks / Guardrails

Expensive or noisy mutation runs.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 10, Sprint 03: Property and Mutation Testing.

OBJECTIVE:
Measure whether the test suite can detect intentionally introduced domain defects.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Define property/invariant suite.
2. Generate reproducible legal games.
3. Introduce controlled mutations.
4. Verify tests fail for each mutation.
5. Remove mutations.
6. Document findings and test gaps.

TEST:
Mutation run and review of surviving mutants.

ACCEPTANCE:
- [ ] Important mutations are detected.
- [ ] Random tests are reproducible.
- [ ] Surviving mutants are investigated.

GUARDRAILS:
Expensive or noisy mutation runs.

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
