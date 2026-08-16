# Phase 03 · Sprint 01: Chess Domain Types and Adapter Contract

## Sprint Objective

Define the application-facing chess domain contract and isolate the third-party rules library.

## Dependencies

Phase 02 foundation; Phase 01 architecture.

## Scope

### Granular implementation tasks

1. Define Square, Color, Piece, Move and Position types.
2. Define GameStatus.
3. Define domain errors.
4. Define ChessGame interface.
5. Implement adapter skeleton around selected chess library.
6. Add dependency inversion tests.
7. Document adapter ownership rules.

## Expected Files / Areas

`src/domain/chess/*`, adapter and type files.

## Testing & Verification

Compile domain package independently of React and run contract tests.

## Acceptance Criteria

- [ ] Domain compiles without React.
- [ ] Third-party library is hidden behind adapter.
- [ ] Core types are explicit.
- [ ] Invalid inputs have defined error behavior.

## Risks / Guardrails

Leaking third-party types across the application.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 03, Sprint 01: Chess Domain Types and Adapter Contract.

OBJECTIVE:
Define the application-facing chess domain contract and isolate the third-party rules library.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Define Square, Color, Piece, Move and Position types.
2. Define GameStatus.
3. Define domain errors.
4. Define ChessGame interface.
5. Implement adapter skeleton around selected chess library.
6. Add dependency inversion tests.
7. Document adapter ownership rules.

TEST:
Compile domain package independently of React and run contract tests.

ACCEPTANCE:
- [ ] Domain compiles without React.
- [ ] Third-party library is hidden behind adapter.
- [ ] Core types are explicit.
- [ ] Invalid inputs have defined error behavior.

GUARDRAILS:
Leaking third-party types across the application.

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
