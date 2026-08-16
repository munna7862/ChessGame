# Phase 11 · Sprint 01: Release Versioning and Changelog

## Sprint Objective

Prepare the product metadata and release documentation for v1.0.

## Dependencies

Release candidate accepted.

## Scope

### Granular implementation tasks

1. Set semantic version.
2. Update application metadata.
3. Create changelog.
4. Write release notes.
5. Verify product name/icons/version consistency.
6. Document known limitations.

## Expected Files / Areas

Package metadata, changelog, release notes.

## Testing & Verification

Verify displayed version and release artifact naming.

## Acceptance Criteria

- [ ] Version is consistent everywhere.
- [ ] Release notes accurately describe shipped features.
- [ ] Known limitations are documented.

## Risks / Guardrails

Version mismatch.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 11, Sprint 01: Release Versioning and Changelog.

OBJECTIVE:
Prepare the product metadata and release documentation for v1.0.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Set semantic version.
2. Update application metadata.
3. Create changelog.
4. Write release notes.
5. Verify product name/icons/version consistency.
6. Document known limitations.

TEST:
Verify displayed version and release artifact naming.

ACCEPTANCE:
- [ ] Version is consistent everywhere.
- [ ] Release notes accurately describe shipped features.
- [ ] Known limitations are documented.

GUARDRAILS:
Version mismatch.

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
