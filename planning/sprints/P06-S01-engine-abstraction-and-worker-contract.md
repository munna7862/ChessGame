# Phase 06 · Sprint 01: Engine Abstraction and Worker Contract

## Sprint Objective

Define a stable engine interface and worker message protocol.

## Dependencies

Phase 05 Human vs Human stable.

## Scope

### Granular implementation tasks

1. Define EngineService interface.
2. Define worker request/response messages.
3. Define engine lifecycle states.
4. Define request IDs.
5. Define cancellation semantics.
6. Add mocked engine implementation for tests.

## Expected Files / Areas

`src/features/engine/*`, worker protocol types/tests.

## Testing & Verification

Contract tests with mocked engine.

## Acceptance Criteria

- [ ] UI does not know UCI protocol details.
- [ ] Requests have unique identity.
- [ ] Lifecycle states are explicit.
- [ ] Mock engine enables deterministic testing.

## Risks / Guardrails

Overcoupling to Stockfish protocol.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 06, Sprint 01: Engine Abstraction and Worker Contract.

OBJECTIVE:
Define a stable engine interface and worker message protocol.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Define EngineService interface.
2. Define worker request/response messages.
3. Define engine lifecycle states.
4. Define request IDs.
5. Define cancellation semantics.
6. Add mocked engine implementation for tests.

TEST:
Contract tests with mocked engine.

ACCEPTANCE:
- [ ] UI does not know UCI protocol details.
- [ ] Requests have unique identity.
- [ ] Lifecycle states are explicit.
- [ ] Mock engine enables deterministic testing.

GUARDRAILS:
Overcoupling to Stockfish protocol.

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
