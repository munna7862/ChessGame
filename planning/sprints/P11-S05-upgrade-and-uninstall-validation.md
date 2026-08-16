# Phase 11 · Sprint 05: Upgrade and Uninstall Validation

## Sprint Objective

Verify lifecycle behavior beyond fresh installation.

## Dependencies

Installer exists.

## Scope

### Granular implementation tasks

1. Install previous test version.
2. Install v1.0 over it.
3. Verify settings migration.
4. Verify active-game policy.
5. Launch after upgrade.
6. Uninstall.
7. Verify expected user-data behavior.
8. Reinstall.

## Expected Files / Areas

Clean Windows validation environment and release artifacts.

## Testing & Verification

Fresh, upgrade, uninstall and reinstall test matrix.

## Acceptance Criteria

- [ ] Upgrade succeeds.
- [ ] User data behavior matches policy.
- [ ] Uninstall succeeds.
- [ ] Reinstall succeeds.

## Risks / Guardrails

Unexpected data deletion or stale files.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 11, Sprint 05: Upgrade and Uninstall Validation.

OBJECTIVE:
Verify lifecycle behavior beyond fresh installation.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Install previous test version.
2. Install v1.0 over it.
3. Verify settings migration.
4. Verify active-game policy.
5. Launch after upgrade.
6. Uninstall.
7. Verify expected user-data behavior.
8. Reinstall.

TEST:
Fresh, upgrade, uninstall and reinstall test matrix.

ACCEPTANCE:
- [ ] Upgrade succeeds.
- [ ] User data behavior matches policy.
- [ ] Uninstall succeeds.
- [ ] Reinstall succeeds.

GUARDRAILS:
Unexpected data deletion or stale files.

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
