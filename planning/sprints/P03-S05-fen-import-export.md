# Phase 03 · Sprint 05: FEN Import Export

## Sprint Objective

Provide safe, deterministic FEN round trips.

## Dependencies

Stable domain position model.

## Scope

### Granular implementation tasks

1. Export current position to FEN.
2. Load valid FEN.
3. Validate invalid FEN.
4. Preserve side to move.
5. Preserve castling rights.
6. Preserve en-passant target.
7. Preserve move counters.
8. Test round trips.

## Expected Files / Areas

FEN domain service/tests.

## Testing & Verification

Round-trip a curated set of positions and malformed inputs.

## Acceptance Criteria

- [ ] Valid FEN loads.
- [ ] Invalid FEN is rejected.
- [ ] Export/import round trips preserve position.
- [ ] No UI dependency exists.

## Risks / Guardrails

Overly permissive parser behavior.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 03, Sprint 05: FEN Import Export.

OBJECTIVE:
Provide safe, deterministic FEN round trips.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Export current position to FEN.
2. Load valid FEN.
3. Validate invalid FEN.
4. Preserve side to move.
5. Preserve castling rights.
6. Preserve en-passant target.
7. Preserve move counters.
8. Test round trips.

TEST:
Round-trip a curated set of positions and malformed inputs.

ACCEPTANCE:
- [ ] Valid FEN loads.
- [ ] Invalid FEN is rejected.
- [ ] Export/import round trips preserve position.
- [ ] No UI dependency exists.

GUARDRAILS:
Overly permissive parser behavior.

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
