# Phase 02 · Sprint 03: Playwright and E2E Foundation

## Sprint Objective

Create the browser/UI automation foundation that can later validate the desktop application's webview-facing UI.

## Dependencies

Frontend and test tooling.

## Scope

### Granular implementation tasks

1. Configure Playwright.
2. Define test directory.
3. Add application startup strategy.
4. Create a launch smoke test.
5. Add stable test identifiers policy.
6. Document E2E execution.
7. Add artifact collection on failure.

## Expected Files / Areas

`playwright.config.ts`, `tests/e2e/*`, test helpers.

## Testing & Verification

Run the smoke test and verify useful traces/screenshots are produced on failure.

## Acceptance Criteria

- [ ] E2E command works.
- [ ] Smoke test launches the application context.
- [ ] Failures collect diagnostics.
- [ ] Test IDs policy is documented.

## Risks / Guardrails

Desktop/webview automation limitations.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 02, Sprint 03: Playwright and E2E Foundation.

OBJECTIVE:
Create the browser/UI automation foundation that can later validate the desktop application's webview-facing UI.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Configure Playwright.
2. Define test directory.
3. Add application startup strategy.
4. Create a launch smoke test.
5. Add stable test identifiers policy.
6. Document E2E execution.
7. Add artifact collection on failure.

TEST:
Run the smoke test and verify useful traces/screenshots are produced on failure.

ACCEPTANCE:
- [ ] E2E command works.
- [ ] Smoke test launches the application context.
- [ ] Failures collect diagnostics.
- [ ] Test IDs policy is documented.

GUARDRAILS:
Desktop/webview automation limitations.

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
