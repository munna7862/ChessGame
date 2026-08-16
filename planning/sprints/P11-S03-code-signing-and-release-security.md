# Phase 11 · Sprint 03: Code Signing and Release Security

## Sprint Objective

Prepare secure signing and release secret handling where distribution requires it.

## Dependencies

Installer pipeline and organizational signing decision.

## Scope

### Granular implementation tasks

1. Define signing strategy.
2. Configure CI secret storage.
3. Ensure signing material is never committed.
4. Sign release artifact if enabled.
5. Verify signature.
6. Document fallback for unsigned development builds.

## Expected Files / Areas

CI release workflow and signing documentation.

## Testing & Verification

Inspect CI logs for secret leakage and verify artifact signature.

## Acceptance Criteria

- [ ] Secrets remain masked.
- [ ] Release artifact signature verifies when enabled.
- [ ] Unsigned dev build process remains usable.

## Risks / Guardrails

Certificate leakage or incorrect signing.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 11, Sprint 03: Code Signing and Release Security.

OBJECTIVE:
Prepare secure signing and release secret handling where distribution requires it.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Define signing strategy.
2. Configure CI secret storage.
3. Ensure signing material is never committed.
4. Sign release artifact if enabled.
5. Verify signature.
6. Document fallback for unsigned development builds.

TEST:
Inspect CI logs for secret leakage and verify artifact signature.

ACCEPTANCE:
- [ ] Secrets remain masked.
- [ ] Release artifact signature verifies when enabled.
- [ ] Unsigned dev build process remains usable.

GUARDRAILS:
Certificate leakage or incorrect signing.

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
