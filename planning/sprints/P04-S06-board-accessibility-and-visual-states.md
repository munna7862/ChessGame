# Phase 04 · Sprint 06: Board Accessibility and Visual States

## Sprint Objective

Make the board usable and understandable with accessible interaction cues.

## Dependencies

Board interaction and check/promotion UI.

## Scope

### Granular implementation tasks

1. Add keyboard navigation strategy.
2. Add focus states.
3. Add accessible descriptions.
4. Add non-color indicators for check/selection.
5. Add high-contrast-friendly styling.
6. Add reduced-motion handling.
7. Add visual regression scenarios.

## Expected Files / Areas

Board components and accessibility tests.

## Testing & Verification

Keyboard and visual verification of normal, selected, check and promotion states.

## Acceptance Criteria

- [ ] Focus is visible.
- [ ] Important states are not color-only.
- [ ] Reduced motion works.
- [ ] Keyboard behavior is documented and tested.

## Risks / Guardrails

Accessibility added as a cosmetic afterthought.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 04, Sprint 06: Board Accessibility and Visual States.

OBJECTIVE:
Make the board usable and understandable with accessible interaction cues.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Add keyboard navigation strategy.
2. Add focus states.
3. Add accessible descriptions.
4. Add non-color indicators for check/selection.
5. Add high-contrast-friendly styling.
6. Add reduced-motion handling.
7. Add visual regression scenarios.

TEST:
Keyboard and visual verification of normal, selected, check and promotion states.

ACCEPTANCE:
- [ ] Focus is visible.
- [ ] Important states are not color-only.
- [ ] Reduced motion works.
- [ ] Keyboard behavior is documented and tested.

GUARDRAILS:
Accessibility added as a cosmetic afterthought.

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
