# Phase 09 · Sprint 06: Visual Regression and UX Review

## Sprint Objective

Perform a deliberate visual/interaction review of the complete v1 UI.

## Dependencies

All Phase 09 features.

## Scope

### Granular implementation tasks

1. Capture baseline screenshots for key states.
2. Review board normal/selected/check/checkmate.
3. Review New Game.
4. Review settings.
5. Review PGN/FEN dialogs.
6. Review error states.
7. Check common Windows scaling sizes.
8. Record and fix high-impact issues.

## Expected Files / Areas

Visual artifacts and regression suite.

## Testing & Verification

Run visual regression and manual UX walkthrough.

## Acceptance Criteria

- [ ] Key states have baseline artifacts.
- [ ] No critical layout defects.
- [ ] Common Windows scaling is acceptable.
- [ ] UX review findings are resolved or explicitly accepted.

## Risks / Guardrails

Pixel-test brittleness.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 09, Sprint 06: Visual Regression and UX Review.

OBJECTIVE:
Perform a deliberate visual/interaction review of the complete v1 UI.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Capture baseline screenshots for key states.
2. Review board normal/selected/check/checkmate.
3. Review New Game.
4. Review settings.
5. Review PGN/FEN dialogs.
6. Review error states.
7. Check common Windows scaling sizes.
8. Record and fix high-impact issues.

TEST:
Run visual regression and manual UX walkthrough.

ACCEPTANCE:
- [ ] Key states have baseline artifacts.
- [ ] No critical layout defects.
- [ ] Common Windows scaling is acceptable.
- [ ] UX review findings are resolved or explicitly accepted.

GUARDRAILS:
Pixel-test brittleness.

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
