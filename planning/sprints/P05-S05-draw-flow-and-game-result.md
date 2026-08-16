# Phase 05 · Sprint 05: Draw Flow and Game Result

## Sprint Objective

Implement draw offer/accept and result presentation.

## Dependencies

Game lifecycle and domain draw statuses.

## Scope

### Granular implementation tasks

1. Define local draw-offer flow.
2. Accept/decline behavior.
3. Handle automatic draw status.
4. Create result modal.
5. Show result reason.
6. Provide New Game action.

## Expected Files / Areas

Game status and controls.

## Testing & Verification

Test agreed draw, automatic draw and normal game-over paths.

## Acceptance Criteria

- [ ] Draw flow is deterministic.
- [ ] Result reason is visible.
- [ ] Game-over controls work.
- [ ] Further moves are blocked.

## Risks / Guardrails

Confusing automatic vs agreed draws.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 05, Sprint 05: Draw Flow and Game Result.

OBJECTIVE:
Implement draw offer/accept and result presentation.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Define local draw-offer flow.
2. Accept/decline behavior.
3. Handle automatic draw status.
4. Create result modal.
5. Show result reason.
6. Provide New Game action.

TEST:
Test agreed draw, automatic draw and normal game-over paths.

ACCEPTANCE:
- [ ] Draw flow is deterministic.
- [ ] Result reason is visible.
- [ ] Game-over controls work.
- [ ] Further moves are blocked.

GUARDRAILS:
Confusing automatic vs agreed draws.

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
