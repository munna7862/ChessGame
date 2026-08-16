# Phase 05 · Sprint 02: New Game and Player Configuration

## Sprint Objective

Implement the New Game flow for Human vs Human and prepare the player model for AI.

## Dependencies

Game session state.

## Scope

### Granular implementation tasks

1. Build New Game dialog.
2. Configure player names.
3. Configure colors.
4. Validate player configuration.
5. Create game session.
6. Display active players.
7. Preserve future computer-player type without implementing engine yet.

## Expected Files / Areas

New Game UI, player model, tests.

## Testing & Verification

E2E create-new-game flow.

## Acceptance Criteria

- [ ] New Game opens reliably.
- [ ] Player configuration is valid.
- [ ] Game starts from expected position.
- [ ] Player metadata is displayed correctly.

## Risks / Guardrails

Overbuilding game setup.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 05, Sprint 02: New Game and Player Configuration.

OBJECTIVE:
Implement the New Game flow for Human vs Human and prepare the player model for AI.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Build New Game dialog.
2. Configure player names.
3. Configure colors.
4. Validate player configuration.
5. Create game session.
6. Display active players.
7. Preserve future computer-player type without implementing engine yet.

TEST:
E2E create-new-game flow.

ACCEPTANCE:
- [ ] New Game opens reliably.
- [ ] Player configuration is valid.
- [ ] Game starts from expected position.
- [ ] Player metadata is displayed correctly.

GUARDRAILS:
Overbuilding game setup.

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
