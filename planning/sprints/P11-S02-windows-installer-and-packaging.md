# Phase 11 · Sprint 02: Windows Installer and Packaging

## Sprint Objective

Produce a reliable Windows installer artifact.

## Dependencies

Release candidate build.

## Scope

### Granular implementation tasks

1. Configure installer target.
2. Configure application icons/metadata.
3. Configure install path behavior.
4. Configure shortcuts if desired.
5. Build installer.
6. Verify artifact integrity.
7. Test fresh installation.

## Expected Files / Areas

Tauri packaging configuration and release workflow.

## Testing & Verification

Install and launch on clean Windows.

## Acceptance Criteria

- [ ] Installer builds reproducibly enough for release.
- [ ] Fresh install succeeds.
- [ ] Application launches.
- [ ] Product metadata is correct.

## Risks / Guardrails

Packaging configuration errors.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 11, Sprint 02: Windows Installer and Packaging.

OBJECTIVE:
Produce a reliable Windows installer artifact.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Configure installer target.
2. Configure application icons/metadata.
3. Configure install path behavior.
4. Configure shortcuts if desired.
5. Build installer.
6. Verify artifact integrity.
7. Test fresh installation.

TEST:
Install and launch on clean Windows.

ACCEPTANCE:
- [ ] Installer builds reproducibly enough for release.
- [ ] Fresh install succeeds.
- [ ] Application launches.
- [ ] Product metadata is correct.

GUARDRAILS:
Packaging configuration errors.

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
