# Phase 11 · Sprint 04: Release Automation and Checksums

## Sprint Objective

Automate tagged release creation and artifact integrity checks.

## Dependencies

Installer and versioning.

## Scope

### Granular implementation tasks

1. Trigger on release tag.
2. Run full required verification.
3. Build Windows artifact.
4. Generate checksum.
5. Upload artifacts.
6. Generate release notes from approved content.
7. Publish GitHub Release after gates pass.

## Expected Files / Areas

`.github/workflows/release.yml`, scripts.

## Testing & Verification

Use a test tag or dry-run strategy before v1.0.

## Acceptance Criteria

- [ ] Release workflow is gated.
- [ ] Checksums are generated.
- [ ] Correct artifacts are attached.
- [ ] Failed verification prevents release publication.

## Risks / Guardrails

Accidental production release.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 11, Sprint 04: Release Automation and Checksums.

OBJECTIVE:
Automate tagged release creation and artifact integrity checks.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Trigger on release tag.
2. Run full required verification.
3. Build Windows artifact.
4. Generate checksum.
5. Upload artifacts.
6. Generate release notes from approved content.
7. Publish GitHub Release after gates pass.

TEST:
Use a test tag or dry-run strategy before v1.0.

ACCEPTANCE:
- [ ] Release workflow is gated.
- [ ] Checksums are generated.
- [ ] Correct artifacts are attached.
- [ ] Failed verification prevents release publication.

GUARDRAILS:
Accidental production release.

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
