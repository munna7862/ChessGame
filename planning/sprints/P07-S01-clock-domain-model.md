# Phase 07 · Sprint 01: Clock Domain Model

## Sprint Objective

Create deterministic chess-clock calculations independent of rendering.

## Dependencies

Phase 05 game controller.

## Scope

### Granular implementation tasks

1. Define ClockState.
2. Define time-control model.
3. Implement elapsed-time calculation.
4. Implement turn switching.
5. Implement increment.
6. Implement timeout determination.
7. Use injectable clock/time source for tests.

## Expected Files / Areas

`src/domain/game/clock*`, tests.

## Testing & Verification

Use fake timestamps to verify exact calculations.

## Acceptance Criteria

- [ ] No render-loop dependency.
- [ ] Calculations are deterministic.
- [ ] Increment is exact.
- [ ] Timeout is authoritative.

## Risks / Guardrails

Timer drift and hidden wall-clock dependencies.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 07, Sprint 01: Clock Domain Model.

OBJECTIVE:
Create deterministic chess-clock calculations independent of rendering.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Define ClockState.
2. Define time-control model.
3. Implement elapsed-time calculation.
4. Implement turn switching.
5. Implement increment.
6. Implement timeout determination.
7. Use injectable clock/time source for tests.

TEST:
Use fake timestamps to verify exact calculations.

ACCEPTANCE:
- [ ] No render-loop dependency.
- [ ] Calculations are deterministic.
- [ ] Increment is exact.
- [ ] Timeout is authoritative.

GUARDRAILS:
Timer drift and hidden wall-clock dependencies.

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
