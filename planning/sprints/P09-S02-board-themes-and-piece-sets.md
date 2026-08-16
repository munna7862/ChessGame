# Phase 09 · Sprint 02: Board Themes and Piece Sets

## Sprint Objective

Make board appearance configurable without changing domain behavior.

## Dependencies

Design tokens and board renderer.

## Scope

### Granular implementation tasks

1. Add at least two board themes.
2. Add approved piece sets.
3. Persist selection.
4. Validate contrast.
5. Ensure all pieces remain recognizable.
6. Add theme preview if useful.

## Expected Files / Areas

Board theme assets/styles and settings integration.

## Testing & Verification

Visual checks for all pieces on every supported theme.

## Acceptance Criteria

- [ ] Themes apply immediately.
- [ ] Settings persist.
- [ ] Pieces remain distinguishable.
- [ ] No theme breaks legal-state indicators.

## Risks / Guardrails

Contrast conflicts between theme and state indicators.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 09, Sprint 02: Board Themes and Piece Sets.

OBJECTIVE:
Make board appearance configurable without changing domain behavior.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Add at least two board themes.
2. Add approved piece sets.
3. Persist selection.
4. Validate contrast.
5. Ensure all pieces remain recognizable.
6. Add theme preview if useful.

TEST:
Visual checks for all pieces on every supported theme.

ACCEPTANCE:
- [ ] Themes apply immediately.
- [ ] Settings persist.
- [ ] Pieces remain distinguishable.
- [ ] No theme breaks legal-state indicators.

GUARDRAILS:
Contrast conflicts between theme and state indicators.

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
