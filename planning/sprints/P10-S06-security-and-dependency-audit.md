# Phase 10 · Sprint 06: Security and Dependency Audit

## Sprint Objective

Perform the final security review before Windows release.

## Dependencies

Security model and complete application.

## Scope

### Granular implementation tasks

1. Review Tauri capabilities.
2. Review filesystem access.
3. Review IPC.
4. Review shell/process permissions.
5. Review imported file handling.
6. Audit dependencies.
7. Search for secrets.
8. Review logging/privacy.
9. Record unresolved findings.

## Expected Files / Areas

Security report, dependency audit output, configuration files.

## Testing & Verification

Run dependency/security checks and manual permission review.

## Acceptance Criteria

- [ ] No critical/high unresolved security issue.
- [ ] Permissions match documented requirements.
- [ ] No secrets committed.
- [ ] Imported files are validated.

## Risks / Guardrails

New dependency or permission introduced late.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 10, Sprint 06: Security and Dependency Audit.

OBJECTIVE:
Perform the final security review before Windows release.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Review Tauri capabilities.
2. Review filesystem access.
3. Review IPC.
4. Review shell/process permissions.
5. Review imported file handling.
6. Audit dependencies.
7. Search for secrets.
8. Review logging/privacy.
9. Record unresolved findings.

TEST:
Run dependency/security checks and manual permission review.

ACCEPTANCE:
- [ ] No critical/high unresolved security issue.
- [ ] Permissions match documented requirements.
- [ ] No secrets committed.
- [ ] Imported files are validated.

GUARDRAILS:
New dependency or permission introduced late.

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
