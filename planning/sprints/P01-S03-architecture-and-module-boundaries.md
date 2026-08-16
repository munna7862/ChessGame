# Phase 01 · Sprint 03: Architecture and Module Boundaries

## Sprint Objective

Establish the technical architecture and ownership boundaries for the application.

## Dependencies

Product and UX requirements.

## Scope

### Granular implementation tasks

1. Define Tauri/React/TypeScript/Rust boundaries.
2. Define domain/application/UI layers.
3. Define engine-service boundary.
4. Define persistence boundary.
5. Define state ownership.
6. Define error propagation.
7. Define dependency direction.
8. Define data flow.
9. Define module structure.
10. Record rejected alternatives and rationale.

## Expected Files / Areas

`docs/architecture.md`, `docs/adr/*`.

## Testing & Verification

Architecture review against MVP requirements and future online-analysis extensibility.

## Acceptance Criteria

- [ ] No circular dependency is required.
- [ ] Chess domain is UI-independent.
- [ ] Engine is isolated.
- [ ] Native capabilities are isolated.
- [ ] Future multiplayer does not force a rewrite of the domain.

## Risks / Guardrails

Overengineering; premature abstractions.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 01, Sprint 03: Architecture and Module Boundaries.

OBJECTIVE:
Establish the technical architecture and ownership boundaries for the application.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Define Tauri/React/TypeScript/Rust boundaries.
2. Define domain/application/UI layers.
3. Define engine-service boundary.
4. Define persistence boundary.
5. Define state ownership.
6. Define error propagation.
7. Define dependency direction.
8. Define data flow.
9. Define module structure.
10. Record rejected alternatives and rationale.

TEST:
Architecture review against MVP requirements and future online-analysis extensibility.

ACCEPTANCE:
- [ ] No circular dependency is required.
- [ ] Chess domain is UI-independent.
- [ ] Engine is isolated.
- [ ] Native capabilities are isolated.
- [ ] Future multiplayer does not force a rewrite of the domain.

GUARDRAILS:
Overengineering; premature abstractions.

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
