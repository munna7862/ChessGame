# Phase 08 · Sprint 06: Settings UI

## Sprint Objective

Provide user-facing configuration for board, sound, motion and engine behavior.

## Dependencies

Settings model.

## Scope

### Granular implementation tasks

1. Build Settings screen/dialog.
2. Board theme selector.
3. Piece set selector.
4. Sound toggle.
5. Animation/reduced-motion controls.
6. Coordinate/highlight controls.
7. Engine difficulty control.
8. Reset settings.

## Expected Files / Areas

Settings feature and UI components.

## Testing & Verification

Component and E2E settings persistence tests.

## Acceptance Criteria

- [ ] Every exposed setting changes behavior.
- [ ] Settings persist.
- [ ] Reset works.
- [ ] Unsupported combinations are prevented.

## Risks / Guardrails

Settings UI exposing features not actually implemented.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 08, Sprint 06: Settings UI.

OBJECTIVE:
Provide user-facing configuration for board, sound, motion and engine behavior.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Build Settings screen/dialog.
2. Board theme selector.
3. Piece set selector.
4. Sound toggle.
5. Animation/reduced-motion controls.
6. Coordinate/highlight controls.
7. Engine difficulty control.
8. Reset settings.

TEST:
Component and E2E settings persistence tests.

ACCEPTANCE:
- [ ] Every exposed setting changes behavior.
- [ ] Settings persist.
- [ ] Reset works.
- [ ] Unsupported combinations are prevented.

GUARDRAILS:
Settings UI exposing features not actually implemented.

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
