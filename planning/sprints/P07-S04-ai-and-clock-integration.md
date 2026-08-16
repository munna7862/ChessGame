# Phase 07 · Sprint 04: AI and Clock Integration

## Sprint Objective

Ensure engine thinking and time controls cooperate correctly.

## Dependencies

Phase 06 AI and Phase 07 clocks.

## Scope

### Granular implementation tasks

1. Start AI clock when AI turn begins.
2. Stop AI clock when move is committed.
3. Handle engine timeout.
4. Ensure engine search limits respect available clock.
5. Handle reset during engine thinking.
6. Add long-thinking tests.

## Expected Files / Areas

Engine service and clock service.

## Testing & Verification

Fake engine + fake clock integration tests.

## Acceptance Criteria

- [ ] AI clock runs during engine turn.
- [ ] AI timeout is correctly handled.
- [ ] Engine cannot move after timeout.
- [ ] Reset cleans both systems.

## Risks / Guardrails

Complex race conditions.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 07, Sprint 04: AI and Clock Integration.

OBJECTIVE:
Ensure engine thinking and time controls cooperate correctly.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Start AI clock when AI turn begins.
2. Stop AI clock when move is committed.
3. Handle engine timeout.
4. Ensure engine search limits respect available clock.
5. Handle reset during engine thinking.
6. Add long-thinking tests.

TEST:
Fake engine + fake clock integration tests.

ACCEPTANCE:
- [ ] AI clock runs during engine turn.
- [ ] AI timeout is correctly handled.
- [ ] Engine cannot move after timeout.
- [ ] Reset cleans both systems.

GUARDRAILS:
Complex race conditions.

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
