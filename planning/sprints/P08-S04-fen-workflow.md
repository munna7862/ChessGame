# Phase 08 · Sprint 04: FEN Workflow

## Sprint Objective

Provide copy/load FEN workflows for analysis and game setup.

## Dependencies

Phase 03 FEN and game session.

## Scope

### Granular implementation tasks

1. Copy current FEN.
2. Show FEN dialog.
3. Paste/load FEN.
4. Validate before replacing game.
5. Support starting a game from FEN.
6. Show useful validation errors.

## Expected Files / Areas

FEN UI, game setup, persistence/native clipboard capability.

## Testing & Verification

Known-position round trips and invalid FEN scenarios.

## Acceptance Criteria

- [ ] Copy returns exact FEN.
- [ ] Valid FEN loads.
- [ ] Invalid FEN leaves current game untouched.
- [ ] Starting from FEN is deterministic.

## Risks / Guardrails

FEN loaded into an incompatible player/game state.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 08, Sprint 04: FEN Workflow.

OBJECTIVE:
Provide copy/load FEN workflows for analysis and game setup.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Copy current FEN.
2. Show FEN dialog.
3. Paste/load FEN.
4. Validate before replacing game.
5. Support starting a game from FEN.
6. Show useful validation errors.

TEST:
Known-position round trips and invalid FEN scenarios.

ACCEPTANCE:
- [ ] Copy returns exact FEN.
- [ ] Valid FEN loads.
- [ ] Invalid FEN leaves current game untouched.
- [ ] Starting from FEN is deterministic.

GUARDRAILS:
FEN loaded into an incompatible player/game state.

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
