# Phase 06 · Sprint 06: Engine Failure Recovery

## Sprint Objective

Make engine failures recoverable without corrupting the chess game.

## Dependencies

Human vs Computer flow.

## Scope

### Granular implementation tasks

1. Detect worker crash.
2. Surface user-friendly error.
3. Allow engine restart.
4. Preserve game position.
5. Provide fallback to Human vs Human where appropriate.
6. Add failure telemetry/logging hooks.

## Expected Files / Areas

Engine service, error UI, tests.

## Testing & Verification

Mock worker crash during startup and thinking.

## Acceptance Criteria

- [ ] Engine failure is visible.
- [ ] Game position is preserved.
- [ ] Engine can restart.
- [ ] No stale response can apply after recovery.

## Risks / Guardrails

Silent failure or corrupted state.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 06, Sprint 06: Engine Failure Recovery.

OBJECTIVE:
Make engine failures recoverable without corrupting the chess game.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Detect worker crash.
2. Surface user-friendly error.
3. Allow engine restart.
4. Preserve game position.
5. Provide fallback to Human vs Human where appropriate.
6. Add failure telemetry/logging hooks.

TEST:
Mock worker crash during startup and thinking.

ACCEPTANCE:
- [ ] Engine failure is visible.
- [ ] Game position is preserved.
- [ ] Engine can restart.
- [ ] No stale response can apply after recovery.

GUARDRAILS:
Silent failure or corrupted state.

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
