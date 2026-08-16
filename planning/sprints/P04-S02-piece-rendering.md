# Phase 04 · Sprint 02: Piece Rendering

## Sprint Objective

Render chess pieces cleanly and efficiently.

## Dependencies

Board layout.

## Scope

### Granular implementation tasks

1. Select initial piece asset strategy.
2. Create piece renderer.
3. Map domain pieces to visuals.
4. Handle empty squares.
5. Add accessible labels where applicable.
6. Verify all 12 piece/color combinations.
7. Add asset-loading fallback behavior.

## Expected Files / Areas

Piece assets and `src/features/board/*`.

## Testing & Verification

Render a known position containing every piece type.

## Acceptance Criteria

- [ ] All pieces render correctly.
- [ ] No incorrect color/type mapping.
- [ ] Missing asset failure is handled.
- [ ] Rendering does not mutate domain state.

## Risks / Guardrails

Asset licensing or rendering inconsistencies.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 04, Sprint 02: Piece Rendering.

OBJECTIVE:
Render chess pieces cleanly and efficiently.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Select initial piece asset strategy.
2. Create piece renderer.
3. Map domain pieces to visuals.
4. Handle empty squares.
5. Add accessible labels where applicable.
6. Verify all 12 piece/color combinations.
7. Add asset-loading fallback behavior.

TEST:
Render a known position containing every piece type.

ACCEPTANCE:
- [ ] All pieces render correctly.
- [ ] No incorrect color/type mapping.
- [ ] Missing asset failure is handled.
- [ ] Rendering does not mutate domain state.

GUARDRAILS:
Asset licensing or rendering inconsistencies.

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
