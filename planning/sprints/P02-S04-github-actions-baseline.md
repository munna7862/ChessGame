# Phase 02 · Sprint 04: GitHub Actions Baseline

## Sprint Objective

Automate baseline verification for every pull request.

## Dependencies

Developer tooling and E2E foundation.

## Scope

### Granular implementation tasks

1. Create CI workflow.
2. Install dependencies deterministically.
3. Run lint.
4. Run typecheck.
5. Run unit tests.
6. Run build.
7. Add Windows job for Tauri build.
8. Upload useful artifacts on failure.
9. Pin action major versions and document exceptions.

## Expected Files / Areas

`.github/workflows/ci.yml`, Windows workflow if separate.

## Testing & Verification

Trigger CI on a test branch/PR and inspect logs.

## Acceptance Criteria

- [ ] PR CI is green.
- [ ] Windows build job runs.
- [ ] Failures are diagnosable.
- [ ] No secrets are required for baseline CI.

## Risks / Guardrails

Windows runner setup time; flaky tests.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 02, Sprint 04: GitHub Actions Baseline.

OBJECTIVE:
Automate baseline verification for every pull request.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Create CI workflow.
2. Install dependencies deterministically.
3. Run lint.
4. Run typecheck.
5. Run unit tests.
6. Run build.
7. Add Windows job for Tauri build.
8. Upload useful artifacts on failure.
9. Pin action major versions and document exceptions.

TEST:
Trigger CI on a test branch/PR and inspect logs.

ACCEPTANCE:
- [ ] PR CI is green.
- [ ] Windows build job runs.
- [ ] Failures are diagnosable.
- [ ] No secrets are required for baseline CI.

GUARDRAILS:
Windows runner setup time; flaky tests.

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
