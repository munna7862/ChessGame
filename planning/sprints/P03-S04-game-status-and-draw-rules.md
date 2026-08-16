# Phase 03 · Sprint 04: Game Status and Draw Rules

## Sprint Objective

Implement authoritative game-status detection.

## Dependencies

Legal moves and special moves.

## Scope

### Granular implementation tasks

1. Normal state.
2. Check state.
3. Checkmate.
4. Stalemate.
5. Threefold repetition.
6. Fifty-move rule.
7. Insufficient material.
8. Resignation and timeout status hooks.
9. Define status precedence.

## Expected Files / Areas

Game-status adapter/service and regression tests.

## Testing & Verification

Run curated checkmate, stalemate and draw positions.

## Acceptance Criteria

- [ ] Status is deterministic.
- [ ] Checkmate blocks further moves.
- [ ] Stalemate is distinguished from checkmate.
- [ ] Supported draw rules are correctly surfaced.

## Risks / Guardrails

Incorrect status precedence.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 03, Sprint 04: Game Status and Draw Rules.

OBJECTIVE:
Implement authoritative game-status detection.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Normal state.
2. Check state.
3. Checkmate.
4. Stalemate.
5. Threefold repetition.
6. Fifty-move rule.
7. Insufficient material.
8. Resignation and timeout status hooks.
9. Define status precedence.

TEST:
Run curated checkmate, stalemate and draw positions.

ACCEPTANCE:
- [ ] Status is deterministic.
- [ ] Checkmate blocks further moves.
- [ ] Stalemate is distinguished from checkmate.
- [ ] Supported draw rules are correctly surfaced.

GUARDRAILS:
Incorrect status precedence.

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
