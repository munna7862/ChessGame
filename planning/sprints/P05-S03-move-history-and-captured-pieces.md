# Phase 05 · Sprint 03: Move History and Captured Pieces

## Sprint Objective

Provide a clear game-review panel.

## Dependencies

Game session and move records.

## Scope

### Granular implementation tasks

1. Render SAN move list.
2. Group moves by move number.
3. Highlight current/latest move.
4. Show captured pieces.
5. Scroll history when long.
6. Ensure history updates atomically with domain moves.

## Expected Files / Areas

History UI and integration tests.

## Testing & Verification

Play a multi-move game and compare displayed SAN to domain output.

## Acceptance Criteria

- [ ] History is accurate.
- [ ] Captures are accurate.
- [ ] Latest move is clear.
- [ ] Long history remains usable.

## Risks / Guardrails

UI-derived notation becoming inconsistent.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 05, Sprint 03: Move History and Captured Pieces.

OBJECTIVE:
Provide a clear game-review panel.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Render SAN move list.
2. Group moves by move number.
3. Highlight current/latest move.
4. Show captured pieces.
5. Scroll history when long.
6. Ensure history updates atomically with domain moves.

TEST:
Play a multi-move game and compare displayed SAN to domain output.

ACCEPTANCE:
- [ ] History is accurate.
- [ ] Captures are accurate.
- [ ] Latest move is clear.
- [ ] Long history remains usable.

GUARDRAILS:
UI-derived notation becoming inconsistent.

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
