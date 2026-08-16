# Phase 03 · Sprint 07: Domain Regression and Property Testing

## Sprint Objective

Build the long-term safety net for the chess domain.

## Dependencies

All previous Phase 03 sprints.

## Scope

### Granular implementation tasks

1. Build a regression corpus of known positions.
2. Add move-generation invariants.
3. Add FEN round-trip property tests.
4. Add PGN replay invariants.
5. Add random legal-game generation where practical.
6. Verify no illegal move can mutate state.
7. Document coverage gaps.

## Expected Files / Areas

Domain test suite and test fixtures.

## Testing & Verification

Run full domain suite repeatedly and inspect flaky/random failures.

## Acceptance Criteria

- [ ] Critical chess rules have regression coverage.
- [ ] Invariants are automated.
- [ ] Randomized tests are reproducible with seeds.
- [ ] Full domain suite is stable.

## Risks / Guardrails

False confidence from high test count; nondeterministic tests.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 03, Sprint 07: Domain Regression and Property Testing.

OBJECTIVE:
Build the long-term safety net for the chess domain.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Build a regression corpus of known positions.
2. Add move-generation invariants.
3. Add FEN round-trip property tests.
4. Add PGN replay invariants.
5. Add random legal-game generation where practical.
6. Verify no illegal move can mutate state.
7. Document coverage gaps.

TEST:
Run full domain suite repeatedly and inspect flaky/random failures.

ACCEPTANCE:
- [ ] Critical chess rules have regression coverage.
- [ ] Invariants are automated.
- [ ] Randomized tests are reproducible with seeds.
- [ ] Full domain suite is stable.

GUARDRAILS:
False confidence from high test count; nondeterministic tests.

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
