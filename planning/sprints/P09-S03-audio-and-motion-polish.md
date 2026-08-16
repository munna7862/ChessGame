# Phase 09 · Sprint 03: Audio and Motion Polish

## Sprint Objective

Add optional feedback sounds and restrained animations.

## Dependencies

Functional board and settings.

## Scope

### Granular implementation tasks

1. Add move/capture/check/game-over sounds.
2. Add sound preference.
3. Add movement animation.
4. Add reduced-motion behavior.
5. Ensure animation interruption is safe.
6. Verify no audio crashes on missing assets.

## Expected Files / Areas

Audio assets, board animation, settings.

## Testing & Verification

Toggle sound/motion and verify state correctness during rapid interactions.

## Acceptance Criteria

- [ ] Sound can be disabled.
- [ ] Reduced motion works.
- [ ] Animation never delays authoritative state.
- [ ] Missing assets fail gracefully.

## Risks / Guardrails

Audio/animation becoming distracting or brittle.

## Antigravity Execution Prompt

```text
You are the implementation agent for ChessForge, Phase 09, Sprint 03: Audio and Motion Polish.

OBJECTIVE:
Add optional feedback sounds and restrained animations.

BEFORE CODING:
1. Inspect the repository and the relevant existing implementation.
2. Read AGENTS.md and the phase plan.
3. Produce a concise implementation plan artifact.
4. Identify exact files/modules that will change.
5. Do not modify unrelated areas.

IMPLEMENT:
1. Add move/capture/check/game-over sounds.
2. Add sound preference.
3. Add movement animation.
4. Add reduced-motion behavior.
5. Ensure animation interruption is safe.
6. Verify no audio crashes on missing assets.

TEST:
Toggle sound/motion and verify state correctness during rapid interactions.

ACCEPTANCE:
- [ ] Sound can be disabled.
- [ ] Reduced motion works.
- [ ] Animation never delays authoritative state.
- [ ] Missing assets fail gracefully.

GUARDRAILS:
Audio/animation becoming distracting or brittle.

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
