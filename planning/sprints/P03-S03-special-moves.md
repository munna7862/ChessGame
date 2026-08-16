# Phase 03 · Sprint 03: Special Moves

## Sprint Objective

Verify and expose castling, en passant and promotion as first-class domain behavior.

## Dependencies

Legal move execution.

## Scope

### Granular implementation tasks

1. Test kingside castling.
2. Test queenside castling.
3. Test castling restrictions.
4. Test en passant.
5. Test promotion to queen.
6. Test promotion to rook.
7. Test promotion to bishop.
8. Test promotion to knight.
9. Verify SAN for special moves.

## Expected Files / Areas

Special-move domain tests.

## Testing & Verification

Use curated FEN positions for every special-move scenario.

## Acceptance Criteria

- [ ] All special moves are legal only under correct conditions.
- [ ] Invalid special moves are rejected.
- [ ] Promotion preserves game state.
- [ ] Notation is correct.

## Risks / Guardrails

Subtle edge cases and library misuse.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 03, Sprint 03: Special Moves.

OBJECTIVE:
Verify and expose castling, en passant and promotion as first-class domain behavior.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Test kingside castling.
2. Test queenside castling.
3. Test castling restrictions.
4. Test en passant.
5. Test promotion to queen.
6. Test promotion to rook.
7. Test promotion to bishop.
8. Test promotion to knight.
9. Verify SAN for special moves.

TEST:
Use curated FEN positions for every special-move scenario.

ACCEPTANCE:
- [ ] All special moves are legal only under correct conditions.
- [ ] Invalid special moves are rejected.
- [ ] Promotion preserves game state.
- [ ] Notation is correct.

GUARDRAILS:
Subtle edge cases and library misuse.

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
