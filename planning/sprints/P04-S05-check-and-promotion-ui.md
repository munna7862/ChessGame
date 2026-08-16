# Phase 04 · Sprint 05: Check and Promotion UI

## Sprint Objective

Make critical chess states visually understandable.

## Dependencies

Game status and basic board interaction.

## Scope

### Granular implementation tasks

1. Highlight checked king.
2. Show checkmate visual state.
3. Trigger promotion choice.
4. Render four promotion choices.
5. Disable invalid promotion options.
6. Commit selected promotion through domain.
7. Handle keyboard/focus for promotion dialog.

## Expected Files / Areas

Board UI, domain special moves.

## Testing & Verification

Test check, checkmate and all promotion choices.

## Acceptance Criteria

- [ ] Check is not represented only by color.
- [ ] Promotion dialog appears at correct time.
- [ ] All four promotion choices work.
- [ ] Cancel/escape behavior is defined.

## Risks / Guardrails

Promotion race/state mismatch.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 04, Sprint 05: Check and Promotion UI.

OBJECTIVE:
Make critical chess states visually understandable.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Highlight checked king.
2. Show checkmate visual state.
3. Trigger promotion choice.
4. Render four promotion choices.
5. Disable invalid promotion options.
6. Commit selected promotion through domain.
7. Handle keyboard/focus for promotion dialog.

TEST:
Test check, checkmate and all promotion choices.

ACCEPTANCE:
- [ ] Check is not represented only by color.
- [ ] Promotion dialog appears at correct time.
- [ ] All four promotion choices work.
- [ ] Cancel/escape behavior is defined.

GUARDRAILS:
Promotion race/state mismatch.

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
