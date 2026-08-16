# Phase 04 · Sprint 01: Board Layout and Coordinate System

## Sprint Objective

Render a stable 8x8 board with correct orientation and coordinate mapping.

## Dependencies

Phase 03 domain contract.

## Scope

### Granular implementation tasks

1. Create Board component.
2. Create Square component.
3. Render ranks/files.
4. Define square-to-screen mapping.
5. Support white orientation.
6. Support black orientation.
7. Add responsive board sizing.
8. Add stable test IDs.

## Expected Files / Areas

`src/features/board/*`, board styles/tests.

## Testing & Verification

Test all 64 squares and both orientations.

## Acceptance Criteria

- [ ] Every square maps to correct chess coordinate.
- [ ] Orientation is correct.
- [ ] Board scales without distortion.
- [ ] Stable selectors exist for automation.

## Risks / Guardrails

Coordinate inversion bugs.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 04, Sprint 01: Board Layout and Coordinate System.

OBJECTIVE:
Render a stable 8x8 board with correct orientation and coordinate mapping.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Create Board component.
2. Create Square component.
3. Render ranks/files.
4. Define square-to-screen mapping.
5. Support white orientation.
6. Support black orientation.
7. Add responsive board sizing.
8. Add stable test IDs.

TEST:
Test all 64 squares and both orientations.

ACCEPTANCE:
- [ ] Every square maps to correct chess coordinate.
- [ ] Orientation is correct.
- [ ] Board scales without distortion.
- [ ] Stable selectors exist for automation.

GUARDRAILS:
Coordinate inversion bugs.

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
