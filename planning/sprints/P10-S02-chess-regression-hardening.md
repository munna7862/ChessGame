# Phase 10 · Sprint 02: Chess Regression Hardening

## Sprint Objective

Stress the chess domain and integration with adversarial rule scenarios.

## Dependencies

Phase 03 test suite and full game integration.

## Scope

### Granular implementation tasks

1. Expand known-position corpus.
2. Add check/pin scenarios.
3. Add special-move edge cases.
4. Add repetition/draw scenarios.
5. Add game-over boundary cases.
6. Verify UI/domain consistency.

## Expected Files / Areas

Domain and integration tests.

## Testing & Verification

Run full chess regression suite in CI-like mode.

## Acceptance Criteria

- [ ] Critical chess regressions are covered.
- [ ] Game status is correct in edge cases.
- [ ] No integration path bypasses domain validation.

## Risks / Guardrails

Rare rule defects.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 10, Sprint 02: Chess Regression Hardening.

OBJECTIVE:
Stress the chess domain and integration with adversarial rule scenarios.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Expand known-position corpus.
2. Add check/pin scenarios.
3. Add special-move edge cases.
4. Add repetition/draw scenarios.
5. Add game-over boundary cases.
6. Verify UI/domain consistency.

TEST:
Run full chess regression suite in CI-like mode.

ACCEPTANCE:
- [ ] Critical chess regressions are covered.
- [ ] Game status is correct in edge cases.
- [ ] No integration path bypasses domain validation.

GUARDRAILS:
Rare rule defects.

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
