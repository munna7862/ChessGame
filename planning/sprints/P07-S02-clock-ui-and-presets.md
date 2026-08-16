# Phase 07 · Sprint 02: Clock UI and Presets

## Sprint Objective

Display clocks and provide standard time-control presets.

## Dependencies

Clock domain.

## Scope

### Granular implementation tasks

1. Build clock display.
2. Highlight active clock.
3. Add presets.
4. Add custom time input.
5. Validate inputs.
6. Add low-time visual state.
7. Ensure accessibility of time status.

## Expected Files / Areas

Clock UI, settings/game setup.

## Testing & Verification

Component tests for preset selection and display states.

## Acceptance Criteria

- [ ] Presets create valid controls.
- [ ] Active clock is obvious.
- [ ] Low-time state is visible without color alone.
- [ ] Invalid custom values are rejected.

## Risks / Guardrails

UI timer diverging from authoritative state.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 07, Sprint 02: Clock UI and Presets.

OBJECTIVE:
Display clocks and provide standard time-control presets.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Build clock display.
2. Highlight active clock.
3. Add presets.
4. Add custom time input.
5. Validate inputs.
6. Add low-time visual state.
7. Ensure accessibility of time status.

TEST:
Component tests for preset selection and display states.

ACCEPTANCE:
- [ ] Presets create valid controls.
- [ ] Active clock is obvious.
- [ ] Low-time state is visible without color alone.
- [ ] Invalid custom values are rejected.

GUARDRAILS:
UI timer diverging from authoritative state.

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
