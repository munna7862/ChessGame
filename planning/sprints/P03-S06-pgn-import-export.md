# Phase 03 · Sprint 06: PGN Import Export

## Sprint Objective

Provide reliable game-history serialization and replay.

## Dependencies

Move history and FEN support.

## Scope

### Granular implementation tasks

1. Export SAN move history to PGN.
2. Include result.
3. Support standard metadata.
4. Import valid PGN.
5. Replay imported moves through domain validation.
6. Reject malformed/illegal PGN.
7. Test special moves and checkmate notation.
8. Verify round trips.

## Expected Files / Areas

PGN service/tests.

## Testing & Verification

Replay known games and compare final FEN after import/export.

## Acceptance Criteria

- [ ] Valid PGN imports.
- [ ] Illegal move sequence is rejected.
- [ ] Exported PGN replays to same final position.
- [ ] Result metadata is correct.

## Risks / Guardrails

PGN parser edge cases.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 03, Sprint 06: PGN Import Export.

OBJECTIVE:
Provide reliable game-history serialization and replay.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Export SAN move history to PGN.
2. Include result.
3. Support standard metadata.
4. Import valid PGN.
5. Replay imported moves through domain validation.
6. Reject malformed/illegal PGN.
7. Test special moves and checkmate notation.
8. Verify round trips.

TEST:
Replay known games and compare final FEN after import/export.

ACCEPTANCE:
- [ ] Valid PGN imports.
- [ ] Illegal move sequence is rejected.
- [ ] Exported PGN replays to same final position.
- [ ] Result metadata is correct.

GUARDRAILS:
PGN parser edge cases.

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
