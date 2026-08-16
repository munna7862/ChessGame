# Phase 04 · Sprint 03: Selection and Legal Move Interaction

## Sprint Objective

Allow users to select pieces and see authoritative legal destinations.

## Dependencies

Piece rendering and domain legal-move API.

## Scope

### Granular implementation tasks

1. Add selected-square state.
2. Query legal moves from domain.
3. Highlight legal destinations.
4. Distinguish captures.
5. Clear selection on invalid destination.
6. Support selecting another piece.
7. Prevent interaction when game is over.

## Expected Files / Areas

Board interaction components and tests.

## Testing & Verification

Component and integration tests for selection/move behavior.

## Acceptance Criteria

- [ ] Only legal destinations are actionable.
- [ ] Capture indicators are distinct.
- [ ] Invalid moves do not mutate game state.
- [ ] Selection behavior is predictable.

## Risks / Guardrails

UI inventing legality; stale legal-move list.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 04, Sprint 03: Selection and Legal Move Interaction.

OBJECTIVE:
Allow users to select pieces and see authoritative legal destinations.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Add selected-square state.
2. Query legal moves from domain.
3. Highlight legal destinations.
4. Distinguish captures.
5. Clear selection on invalid destination.
6. Support selecting another piece.
7. Prevent interaction when game is over.

TEST:
Component and integration tests for selection/move behavior.

ACCEPTANCE:
- [ ] Only legal destinations are actionable.
- [ ] Capture indicators are distinct.
- [ ] Invalid moves do not mutate game state.
- [ ] Selection behavior is predictable.

GUARDRAILS:
UI inventing legality; stale legal-move list.

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
