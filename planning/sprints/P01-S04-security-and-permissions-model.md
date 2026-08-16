# Phase 01 · Sprint 04: Security and Permissions Model

## Sprint Objective

Define the minimal Windows/Tauri security boundary before native functionality exists.

## Dependencies

Architecture baseline.

## Scope

### Granular implementation tasks

1. Identify required native capabilities.
2. Define Tauri capability permissions.
3. Define file access rules.
4. Define IPC boundaries.
5. Define import validation expectations.
6. Define secret handling rules.
7. Define dependency/security review process.
8. Define logging/privacy constraints.
9. Document prohibited capabilities unless explicitly approved.

## Expected Files / Areas

`docs/security-model.md`, capability policy documentation.

## Testing & Verification

Review permissions against actual v1 requirements and ensure least privilege.

## Acceptance Criteria

- [ ] Every native permission has a documented reason.
- [ ] No unnecessary shell access.
- [ ] File access is scoped.
- [ ] Import data is considered untrusted.
- [ ] Secrets policy is documented.

## Risks / Guardrails

Security rules being ignored during later sprints.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 01, Sprint 04: Security and Permissions Model.

OBJECTIVE:
Define the minimal Windows/Tauri security boundary before native functionality exists.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Identify required native capabilities.
2. Define Tauri capability permissions.
3. Define file access rules.
4. Define IPC boundaries.
5. Define import validation expectations.
6. Define secret handling rules.
7. Define dependency/security review process.
8. Define logging/privacy constraints.
9. Document prohibited capabilities unless explicitly approved.

TEST:
Review permissions against actual v1 requirements and ensure least privilege.

ACCEPTANCE:
- [ ] Every native permission has a documented reason.
- [ ] No unnecessary shell access.
- [ ] File access is scoped.
- [ ] Import data is considered untrusted.
- [ ] Secrets policy is documented.

GUARDRAILS:
Security rules being ignored during later sprints.

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
