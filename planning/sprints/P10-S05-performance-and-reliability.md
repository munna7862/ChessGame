# Phase 10 · Sprint 05: Performance and Reliability

## Sprint Objective

Verify responsiveness, startup, engine behavior and long-session stability.

## Dependencies

Feature-complete release candidate.

## Scope

### Granular implementation tasks

1. Measure startup.
2. Measure board interaction.
3. Measure engine worker responsiveness.
4. Run long games.
5. Observe memory behavior.
6. Test repeated engine start/stop.
7. Test repeated import/export.
8. Document results against targets.

## Expected Files / Areas

Performance scripts, diagnostics and report.

## Testing & Verification

Run defined scenarios on a representative Windows machine.

## Acceptance Criteria

- [ ] No critical UI freeze.
- [ ] Engine stays off UI thread.
- [ ] Long sessions remain stable.
- [ ] Measurements are recorded.

## Risks / Guardrails

Benchmarking on non-representative hardware.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 10, Sprint 05: Performance and Reliability.

OBJECTIVE:
Verify responsiveness, startup, engine behavior and long-session stability.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Measure startup.
2. Measure board interaction.
3. Measure engine worker responsiveness.
4. Run long games.
5. Observe memory behavior.
6. Test repeated engine start/stop.
7. Test repeated import/export.
8. Document results against targets.

TEST:
Run defined scenarios on a representative Windows machine.

ACCEPTANCE:
- [ ] No critical UI freeze.
- [ ] Engine stays off UI thread.
- [ ] Long sessions remain stable.
- [ ] Measurements are recorded.

GUARDRAILS:
Benchmarking on non-representative hardware.

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
