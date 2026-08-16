# Phase 06 · Sprint 02: Stockfish WASM Worker Integration

## Sprint Objective

Load Stockfish in a worker and establish reliable UCI communication.

## Dependencies

Engine abstraction.

## Scope

### Granular implementation tasks

1. Add approved Stockfish WASM dependency/assets.
2. Load worker.
3. Initialize UCI.
4. Handle ready state.
5. Send position.
6. Request best move.
7. Parse result.
8. Stop engine safely.

## Expected Files / Areas

Engine worker and dependency configuration.

## Testing & Verification

Run engine against known positions and verify valid UCI responses.

## Acceptance Criteria

- [ ] Engine initializes.
- [ ] UI thread remains responsive.
- [ ] Position reaches engine correctly.
- [ ] Best move is returned.
- [ ] Worker can stop/restart.

## Risks / Guardrails

Asset loading, licensing and worker lifecycle.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 06, Sprint 02: Stockfish WASM Worker Integration.

OBJECTIVE:
Load Stockfish in a worker and establish reliable UCI communication.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Add approved Stockfish WASM dependency/assets.
2. Load worker.
3. Initialize UCI.
4. Handle ready state.
5. Send position.
6. Request best move.
7. Parse result.
8. Stop engine safely.

TEST:
Run engine against known positions and verify valid UCI responses.

ACCEPTANCE:
- [ ] Engine initializes.
- [ ] UI thread remains responsive.
- [ ] Position reaches engine correctly.
- [ ] Best move is returned.
- [ ] Worker can stop/restart.

GUARDRAILS:
Asset loading, licensing and worker lifecycle.

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
