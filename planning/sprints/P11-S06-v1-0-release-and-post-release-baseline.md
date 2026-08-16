# Phase 11 · Sprint 06: v1.0 Release and Post-Release Baseline

## Sprint Objective

Publish ChessForge v1.0 and establish the post-release engineering baseline.

## Dependencies

All release gates complete.

## Scope

### Granular implementation tasks

1. Create final tag.
2. Run release workflow.
3. Verify published artifact.
4. Verify checksums.
5. Test downloaded artifact.
6. Publish release notes.
7. Capture known issues.
8. Create v1.1 backlog without changing v1.0 scope.
9. Archive release validation evidence.

## Expected Files / Areas

GitHub release, release notes, validation report.

## Testing & Verification

Download published artifact independently and perform smoke test.

## Acceptance Criteria

- [ ] v1.0 artifact is available.
- [ ] Published artifact matches validated build.
- [ ] Release notes are accurate.
- [ ] Post-release backlog is captured separately.

## Risks / Guardrails

Last-minute scope creep.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 11, Sprint 06: v1.0 Release and Post-Release Baseline.

OBJECTIVE:
Publish ChessForge v1.0 and establish the post-release engineering baseline.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Create final tag.
2. Run release workflow.
3. Verify published artifact.
4. Verify checksums.
5. Test downloaded artifact.
6. Publish release notes.
7. Capture known issues.
8. Create v1.1 backlog without changing v1.0 scope.
9. Archive release validation evidence.

TEST:
Download published artifact independently and perform smoke test.

ACCEPTANCE:
- [ ] v1.0 artifact is available.
- [ ] Published artifact matches validated build.
- [ ] Release notes are accurate.
- [ ] Post-release backlog is captured separately.

GUARDRAILS:
Last-minute scope creep.

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
