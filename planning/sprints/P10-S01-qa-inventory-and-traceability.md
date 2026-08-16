# Phase 10 · Sprint 01: QA Inventory and Traceability

## Sprint Objective

Map every requirement to implementation and automated/manual verification.

## Dependencies

Feature-complete application.

## Scope

### Granular implementation tasks

1. Enumerate requirements.
2. Map requirements to tests.
3. Identify untested requirements.
4. Identify duplicate tests.
5. Identify manual-only risks.
6. Create release test matrix.
7. Define critical-path smoke suite.

## Expected Files / Areas

`docs/qa-matrix.md`, test inventory.

## Testing & Verification

Review traceability for every MVP requirement.

## Acceptance Criteria

- [ ] Every MVP requirement has verification evidence.
- [ ] Critical paths have automated coverage.
- [ ] Known manual-only checks are documented.

## Risks / Guardrails

False coverage caused by superficial tests.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 10, Sprint 01: QA Inventory and Traceability.

OBJECTIVE:
Map every requirement to implementation and automated/manual verification.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Enumerate requirements.
2. Map requirements to tests.
3. Identify untested requirements.
4. Identify duplicate tests.
5. Identify manual-only risks.
6. Create release test matrix.
7. Define critical-path smoke suite.

TEST:
Review traceability for every MVP requirement.

ACCEPTANCE:
- [ ] Every MVP requirement has verification evidence.
- [ ] Critical paths have automated coverage.
- [ ] Known manual-only checks are documented.

GUARDRAILS:
False coverage caused by superficial tests.

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
