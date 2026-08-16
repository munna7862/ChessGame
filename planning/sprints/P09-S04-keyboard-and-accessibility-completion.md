# Phase 09 · Sprint 04: Keyboard and Accessibility Completion

## Sprint Objective

Finish practical keyboard and accessibility support across the application.

## Dependencies

Phase 04 accessibility foundation and final UI.

## Scope

### Granular implementation tasks

1. Define focus order.
2. Add keyboard shortcuts where appropriate.
3. Ensure dialogs trap/restore focus.
4. Add accessible names to controls.
5. Add state announcements where useful.
6. Test high contrast.
7. Test reduced motion.

## Expected Files / Areas

All major UI screens.

## Testing & Verification

Keyboard-only walkthrough and automated accessibility checks where supported.

## Acceptance Criteria

- [ ] Main workflows can be operated with keyboard where promised.
- [ ] Dialog focus is correct.
- [ ] Controls have accessible names.
- [ ] Important chess states have non-color cues.

## Risks / Guardrails

Keyboard behavior becoming inconsistent between screens.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 09, Sprint 04: Keyboard and Accessibility Completion.

OBJECTIVE:
Finish practical keyboard and accessibility support across the application.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Define focus order.
2. Add keyboard shortcuts where appropriate.
3. Ensure dialogs trap/restore focus.
4. Add accessible names to controls.
5. Add state announcements where useful.
6. Test high contrast.
7. Test reduced motion.

TEST:
Keyboard-only walkthrough and automated accessibility checks where supported.

ACCEPTANCE:
- [ ] Main workflows can be operated with keyboard where promised.
- [ ] Dialog focus is correct.
- [ ] Controls have accessible names.
- [ ] Important chess states have non-color cues.

GUARDRAILS:
Keyboard behavior becoming inconsistent between screens.

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
