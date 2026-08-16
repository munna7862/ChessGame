# Phase 04 · Sprint 04: Move Animation and Last-Move State

## Sprint Objective

Add visual feedback without coupling animation to authoritative game state.

## Dependencies

Basic move interaction.

## Scope

### Granular implementation tasks

1. Track last move.
2. Highlight origin/destination.
3. Add piece movement animation.
4. Add capture animation.
5. Ensure state commits before/independently of animation.
6. Add reduced-motion switch hook.

## Expected Files / Areas

Board animation components/styles.

## Testing & Verification

Test that final state is correct even when animations are disabled or interrupted.

## Acceptance Criteria

- [ ] Last move is visible.
- [ ] Animation does not block state update.
- [ ] Reduced motion removes/reduces animation.
- [ ] Rapid consecutive moves do not corrupt rendering.

## Risks / Guardrails

Race conditions during rapid moves.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 04, Sprint 04: Move Animation and Last-Move State.

OBJECTIVE:
Add visual feedback without coupling animation to authoritative game state.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Track last move.
2. Highlight origin/destination.
3. Add piece movement animation.
4. Add capture animation.
5. Ensure state commits before/independently of animation.
6. Add reduced-motion switch hook.

TEST:
Test that final state is correct even when animations are disabled or interrupted.

ACCEPTANCE:
- [ ] Last move is visible.
- [ ] Animation does not block state update.
- [ ] Reduced motion removes/reduces animation.
- [ ] Rapid consecutive moves do not corrupt rendering.

GUARDRAILS:
Race conditions during rapid moves.

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
