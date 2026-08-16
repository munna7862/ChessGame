# Phase 08 · Sprint 02: Automatic Game Recovery

## Sprint Objective

Restore an interrupted game safely after application restart.

## Dependencies

Persistence service and game session.

## Scope

### Granular implementation tasks

1. Persist active game after authoritative state changes.
2. Persist player/game metadata.
3. Detect recoverable session on launch.
4. Present continue/discard choice.
5. Restore board/history/clocks as applicable.
6. Clear recovery state after game completion.

## Expected Files / Areas

Game session, persistence, recovery UI.

## Testing & Verification

Simulate close/relaunch using persisted fixtures and test recovery choices.

## Acceptance Criteria

- [ ] Active game can be restored.
- [ ] Completed games do not reappear as active recovery.
- [ ] Corrupt recovery data is safely discarded.
- [ ] User can decline recovery.

## Risks / Guardrails

Data loss or stale recovery prompts.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 08, Sprint 02: Automatic Game Recovery.

OBJECTIVE:
Restore an interrupted game safely after application restart.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Persist active game after authoritative state changes.
2. Persist player/game metadata.
3. Detect recoverable session on launch.
4. Present continue/discard choice.
5. Restore board/history/clocks as applicable.
6. Clear recovery state after game completion.

TEST:
Simulate close/relaunch using persisted fixtures and test recovery choices.

ACCEPTANCE:
- [ ] Active game can be restored.
- [ ] Completed games do not reappear as active recovery.
- [ ] Corrupt recovery data is safely discarded.
- [ ] User can decline recovery.

GUARDRAILS:
Data loss or stale recovery prompts.

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
