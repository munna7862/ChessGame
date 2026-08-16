# Phase 02 · Sprint 05: Antigravity Workspace and Agent Guardrails

## Sprint Objective

Make the repository safe and predictable for multi-agent development.

## Dependencies

AGENTS.md and CI baseline.

## Scope

### Granular implementation tasks

1. Finalize AGENTS.md.
2. Define protected files/areas.
3. Define branch/worktree naming.
4. Define agent handoff format.
5. Define review artifact expectations.
6. Define commands agents may run.
7. Add PR checklist for AI-assisted changes.

## Expected Files / Areas

`AGENTS.md`, `.github/pull_request_template.md` or equivalent.

## Testing & Verification

Perform a simulated feature task and verify the agent instructions lead to a focused diff.

## Acceptance Criteria

- [ ] Agent rules are discoverable.
- [ ] Handoff format is defined.
- [ ] Review expectations are explicit.
- [ ] CI is mandatory before merge.

## Risks / Guardrails

Conflicting instructions; agents touching unrelated files.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 02, Sprint 05: Antigravity Workspace and Agent Guardrails.

OBJECTIVE:
Make the repository safe and predictable for multi-agent development.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Finalize AGENTS.md.
2. Define protected files/areas.
3. Define branch/worktree naming.
4. Define agent handoff format.
5. Define review artifact expectations.
6. Define commands agents may run.
7. Add PR checklist for AI-assisted changes.

TEST:
Perform a simulated feature task and verify the agent instructions lead to a focused diff.

ACCEPTANCE:
- [ ] Agent rules are discoverable.
- [ ] Handoff format is defined.
- [ ] Review expectations are explicit.
- [ ] CI is mandatory before merge.

GUARDRAILS:
Conflicting instructions; agents touching unrelated files.

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
