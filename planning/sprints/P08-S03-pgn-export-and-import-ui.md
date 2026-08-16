# Phase 08 · Sprint 03: PGN Export and Import UI

## Sprint Objective

Expose the domain PGN capability through safe desktop workflows.

## Dependencies

Phase 03 PGN and persistence boundary.

## Scope

### Granular implementation tasks

1. Add Export PGN action.
2. Choose save destination through approved native API.
3. Add Import PGN action.
4. Validate imported game.
5. Preview/confirm import if needed.
6. Replace active game only after successful validation.

## Expected Files / Areas

Game menu/actions, Tauri file APIs, PGN UI.

## Testing & Verification

Import valid/invalid PGN and verify failed import leaves current game unchanged.

## Acceptance Criteria

- [ ] Export creates valid PGN.
- [ ] Import validates before mutation.
- [ ] Invalid file cannot destroy current game.
- [ ] Native file permissions are minimal.

## Risks / Guardrails

File permission mistakes; destructive import.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 08, Sprint 03: PGN Export and Import UI.

OBJECTIVE:
Expose the domain PGN capability through safe desktop workflows.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Add Export PGN action.
2. Choose save destination through approved native API.
3. Add Import PGN action.
4. Validate imported game.
5. Preview/confirm import if needed.
6. Replace active game only after successful validation.

TEST:
Import valid/invalid PGN and verify failed import leaves current game unchanged.

ACCEPTANCE:
- [ ] Export creates valid PGN.
- [ ] Import validates before mutation.
- [ ] Invalid file cannot destroy current game.
- [ ] Native file permissions are minimal.

GUARDRAILS:
File permission mistakes; destructive import.

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
