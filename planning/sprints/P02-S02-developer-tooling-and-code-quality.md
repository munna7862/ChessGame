# Phase 02 · Sprint 02: Developer Tooling and Code Quality

## Sprint Objective

Establish consistent linting, formatting, strict typing and test commands.

## Dependencies

Repository bootstrap.

## Scope

### Granular implementation tasks

1. Enable strict TypeScript.
2. Configure ESLint.
3. Configure formatter.
4. Add unit test framework.
5. Add scripts for lint/typecheck/test/build.
6. Establish import and naming conventions.
7. Add a small smoke test.
8. Document commands.

## Expected Files / Areas

TypeScript, ESLint, formatter, test config, `package.json`.

## Testing & Verification

Run lint, typecheck, unit tests and build locally and in CI-ready mode.

## Acceptance Criteria

- [ ] Strict typing enabled.
- [ ] Lint passes.
- [ ] Formatter is deterministic.
- [ ] Test runner works.
- [ ] Standard commands are documented.

## Risks / Guardrails

Tooling configuration becoming excessively complex.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 02, Sprint 02: Developer Tooling and Code Quality.

OBJECTIVE:
Establish consistent linting, formatting, strict typing and test commands.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Enable strict TypeScript.
2. Configure ESLint.
3. Configure formatter.
4. Add unit test framework.
5. Add scripts for lint/typecheck/test/build.
6. Establish import and naming conventions.
7. Add a small smoke test.
8. Document commands.

TEST:
Run lint, typecheck, unit tests and build locally and in CI-ready mode.

ACCEPTANCE:
- [ ] Strict typing enabled.
- [ ] Lint passes.
- [ ] Formatter is deterministic.
- [ ] Test runner works.
- [ ] Standard commands are documented.

GUARDRAILS:
Tooling configuration becoming excessively complex.

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
