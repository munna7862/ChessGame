# Phase 05 · Sprint 06: Human vs Human End-to-End

## Sprint Objective

Close the local chess loop with a complete playable game.

## Dependencies

All Phase 05 preceding sprints.

## Scope

### Granular implementation tasks

1. Wire full New Game → board → domain → history → result flow.
2. Add E2E smoke scenario.
3. Add checkmate scenario.
4. Add resignation scenario.
5. Add restart scenario.
6. Fix integration defects.
7. Review user journey end-to-end.

## Expected Files / Areas

E2E suite and integration test helpers.

## Testing & Verification

Run full local-game E2E suite repeatedly.

## Acceptance Criteria

- [ ] Complete Human vs Human game works.
- [ ] Checkmate works.
- [ ] Resignation works.
- [ ] Restart works.
- [ ] No critical UI/domain synchronization bugs remain.

## Risks / Guardrails

Integration complexity and hidden state.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 05, Sprint 06: Human vs Human End-to-End.

OBJECTIVE:
Close the local chess loop with a complete playable game.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Wire full New Game → board → domain → history → result flow.
2. Add E2E smoke scenario.
3. Add checkmate scenario.
4. Add resignation scenario.
5. Add restart scenario.
6. Fix integration defects.
7. Review user journey end-to-end.

TEST:
Run full local-game E2E suite repeatedly.

ACCEPTANCE:
- [ ] Complete Human vs Human game works.
- [ ] Checkmate works.
- [ ] Resignation works.
- [ ] Restart works.
- [ ] No critical UI/domain synchronization bugs remain.

GUARDRAILS:
Integration complexity and hidden state.

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
