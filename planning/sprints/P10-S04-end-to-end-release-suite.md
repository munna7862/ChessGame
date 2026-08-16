# Phase 10 · Sprint 04: End-to-End Release Suite

## Sprint Objective

Build the small, reliable E2E suite that blocks release regressions.

## Dependencies

All major user journeys.

## Scope

### Granular implementation tasks

1. Launch smoke.
2. Human vs Human.
3. Human vs Computer.
4. Promotion.
5. Checkmate.
6. Resignation.
7. Draw.
8. PGN import/export.
9. FEN workflow.
10. Recovery.
11. Settings persistence.
12. Timed game.

## Expected Files / Areas

`tests/e2e/*` and fixtures.

## Testing & Verification

Run repeatedly and eliminate flakes.

## Acceptance Criteria

- [ ] Critical user journeys are covered.
- [ ] Failures produce diagnostics.
- [ ] Suite is stable enough for CI gating.

## Risks / Guardrails

Flaky desktop timing.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 10, Sprint 04: End-to-End Release Suite.

OBJECTIVE:
Build the small, reliable E2E suite that blocks release regressions.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Launch smoke.
2. Human vs Human.
3. Human vs Computer.
4. Promotion.
5. Checkmate.
6. Resignation.
7. Draw.
8. PGN import/export.
9. FEN workflow.
10. Recovery.
11. Settings persistence.
12. Timed game.

TEST:
Run repeatedly and eliminate flakes.

ACCEPTANCE:
- [ ] Critical user journeys are covered.
- [ ] Failures produce diagnostics.
- [ ] Suite is stable enough for CI gating.

GUARDRAILS:
Flaky desktop timing.

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
