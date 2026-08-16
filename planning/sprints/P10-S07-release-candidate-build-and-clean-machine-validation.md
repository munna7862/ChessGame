# Phase 10 · Sprint 07: Release Candidate Build and Clean-Machine Validation

## Sprint Objective

Produce a candidate installer and validate it outside the development environment.

## Dependencies

All previous Phase 10 sprints.

## Scope

### Granular implementation tasks

1. Freeze feature scope.
2. Build Windows installer.
3. Install on clean environment.
4. Launch and smoke test.
5. Play Human vs Human.
6. Play Human vs Computer.
7. Test persistence.
8. Test PGN/FEN.
9. Test uninstall.
10. Record defects and candidate status.

## Expected Files / Areas

Release build artifacts and validation report.

## Testing & Verification

Clean-machine installation and smoke suite.

## Acceptance Criteria

- [ ] Installer succeeds.
- [ ] Application launches.
- [ ] Core workflows work outside dev machine.
- [ ] Uninstall succeeds.
- [ ] No release-blocking defects remain.

## Risks / Guardrails

Environment-specific failures.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 10, Sprint 07: Release Candidate Build and Clean-Machine Validation.

OBJECTIVE:
Produce a candidate installer and validate it outside the development environment.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Freeze feature scope.
2. Build Windows installer.
3. Install on clean environment.
4. Launch and smoke test.
5. Play Human vs Human.
6. Play Human vs Computer.
7. Test persistence.
8. Test PGN/FEN.
9. Test uninstall.
10. Record defects and candidate status.

TEST:
Clean-machine installation and smoke suite.

ACCEPTANCE:
- [ ] Installer succeeds.
- [ ] Application launches.
- [ ] Core workflows work outside dev machine.
- [ ] Uninstall succeeds.
- [ ] No release-blocking defects remain.

GUARDRAILS:
Environment-specific failures.

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
