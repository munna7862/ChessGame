# Phase 06 · Sprint 05: Human vs Computer Game Flow

## Sprint Objective

Connect engine turns to the complete game controller.

## Dependencies

Stable engine and Phase 05 game system.

## Scope

### Granular implementation tasks

1. Add computer player type.
2. Trigger engine after human move.
3. Show thinking state.
4. Apply engine move through domain.
5. Handle checkmate/draw after engine move.
6. Prevent human interaction during engine turn.
7. Handle reset/resign during thinking.

## Expected Files / Areas

Game controller, engine service, domain.

## Testing & Verification

E2E Human vs Computer smoke game and reset-during-thinking test.

## Acceptance Criteria

- [ ] AI responds after human move.
- [ ] AI move is legal.
- [ ] Board locks during AI turn.
- [ ] Game result works after AI move.
- [ ] Reset during thinking is safe.

## Risks / Guardrails

State race and accidental double moves.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 06, Sprint 05: Human vs Computer Game Flow.

OBJECTIVE:
Connect engine turns to the complete game controller.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Add computer player type.
2. Trigger engine after human move.
3. Show thinking state.
4. Apply engine move through domain.
5. Handle checkmate/draw after engine move.
6. Prevent human interaction during engine turn.
7. Handle reset/resign during thinking.

TEST:
E2E Human vs Computer smoke game and reset-during-thinking test.

ACCEPTANCE:
- [ ] AI responds after human move.
- [ ] AI move is legal.
- [ ] Board locks during AI turn.
- [ ] Game result works after AI move.
- [ ] Reset during thinking is safe.

GUARDRAILS:
State race and accidental double moves.

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
