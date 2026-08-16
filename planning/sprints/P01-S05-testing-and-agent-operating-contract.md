# Phase 01 · Sprint 05: Testing and Agent Operating Contract

## Sprint Objective

Define how humans, Antigravity agents and CI will collaborate throughout development.

## Dependencies

Architecture and security model.

## Scope

### Granular implementation tasks

1. Define test pyramid.
2. Define unit/integration/E2E ownership.
3. Define regression expectations.
4. Define Definition of Done.
5. Define agent roles.
6. Define planning/review gates.
7. Define worktree rules.
8. Define commit rules.
9. Define failure-handling rules.
10. Create root AGENTS.md.

## Expected Files / Areas

`AGENTS.md`, `docs/testing-strategy.md`, `docs/agent-workflow.md`.

## Testing & Verification

Run a dry-run review of a hypothetical sprint using the new operating contract.

## Acceptance Criteria

- [ ] AGENTS.md is actionable.
- [ ] Agent roles are clear.
- [ ] Review gates are explicit.
- [ ] Test expectations are explicit.
- [ ] Agents are prohibited from bypassing failures.

## Risks / Guardrails

Process becoming ceremonial rather than useful.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 01, Sprint 05: Testing and Agent Operating Contract.

OBJECTIVE:
Define how humans, Antigravity agents and CI will collaborate throughout development.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Define test pyramid.
2. Define unit/integration/E2E ownership.
3. Define regression expectations.
4. Define Definition of Done.
5. Define agent roles.
6. Define planning/review gates.
7. Define worktree rules.
8. Define commit rules.
9. Define failure-handling rules.
10. Create root AGENTS.md.

TEST:
Run a dry-run review of a hypothetical sprint using the new operating contract.

ACCEPTANCE:
- [ ] AGENTS.md is actionable.
- [ ] Agent roles are clear.
- [ ] Review gates are explicit.
- [ ] Test expectations are explicit.
- [ ] Agents are prohibited from bypassing failures.

GUARDRAILS:
Process becoming ceremonial rather than useful.

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
