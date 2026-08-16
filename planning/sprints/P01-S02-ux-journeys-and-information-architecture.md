# Phase 01 · Sprint 02: UX Journeys and Information Architecture

## Sprint Objective

Define the desktop application's primary screens, navigation and interaction flows before UI implementation.

## Dependencies

Product requirements approved.

## Scope

### Granular implementation tasks

1. Define main game screen.
2. Define New Game flow.
3. Define game-over flow.
4. Define settings flow.
5. Define PGN/FEN import/export flows.
6. Define recovery flow after restart.
7. Define error and empty states.
8. Define keyboard interaction expectations.
9. Define major UI states and transitions.
10. Create low-fidelity screen descriptions/diagrams.

## Expected Files / Areas

`docs/ux-journeys.md`, `docs/ux-state-map.md`.

## Testing & Verification

Walk through every user journey from launch to completed game and identify dead ends.

## Acceptance Criteria

- [ ] Every MVP flow has a defined start and end state.
- [ ] Game states map to UI states.
- [ ] Error/recovery flows are defined.
- [ ] Accessibility expectations are documented.

## Risks / Guardrails

Design decisions leaking into implementation prematurely.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 01, Sprint 02: UX Journeys and Information Architecture.

OBJECTIVE:
Define the desktop application's primary screens, navigation and interaction flows before UI implementation.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Define main game screen.
2. Define New Game flow.
3. Define game-over flow.
4. Define settings flow.
5. Define PGN/FEN import/export flows.
6. Define recovery flow after restart.
7. Define error and empty states.
8. Define keyboard interaction expectations.
9. Define major UI states and transitions.
10. Create low-fidelity screen descriptions/diagrams.

TEST:
Walk through every user journey from launch to completed game and identify dead ends.

ACCEPTANCE:
- [ ] Every MVP flow has a defined start and end state.
- [ ] Game states map to UI states.
- [ ] Error/recovery flows are defined.
- [ ] Accessibility expectations are documented.

GUARDRAILS:
Design decisions leaking into implementation prematurely.

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
