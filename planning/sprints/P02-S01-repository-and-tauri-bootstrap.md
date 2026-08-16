# Phase 02 · Sprint 01: Repository and Tauri Bootstrap

## Sprint Objective

Create the minimal Windows desktop shell and frontend project.

## Dependencies

Phase 01 architecture approved.

## Scope

### Granular implementation tasks

1. Initialize repository structure.
2. Create Tauri application.
3. Create React + TypeScript frontend.
4. Configure Vite.
5. Configure development scripts.
6. Verify Tauri launches on Windows.
7. Add README setup instructions.
8. Add `.gitignore` and baseline metadata.

## Expected Files / Areas

`package.json`, `src/*`, `src-tauri/*`, `README.md`, configuration files.

## Testing & Verification

Launch development application and perform a production build.

## Acceptance Criteria

- [ ] Tauri app launches.
- [ ] React renders.
- [ ] TypeScript compiles.
- [ ] Production build succeeds.
- [ ] Setup instructions work on a clean checkout.

## Risks / Guardrails

Windows toolchain problems; version drift.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 02, Sprint 01: Repository and Tauri Bootstrap.

OBJECTIVE:
Create the minimal Windows desktop shell and frontend project.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Initialize repository structure.
2. Create Tauri application.
3. Create React + TypeScript frontend.
4. Configure Vite.
5. Configure development scripts.
6. Verify Tauri launches on Windows.
7. Add README setup instructions.
8. Add `.gitignore` and baseline metadata.

TEST:
Launch development application and perform a production build.

ACCEPTANCE:
- [ ] Tauri app launches.
- [ ] React renders.
- [ ] TypeScript compiles.
- [ ] Production build succeeds.
- [ ] Setup instructions work on a clean checkout.

GUARDRAILS:
Windows toolchain problems; version drift.

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
