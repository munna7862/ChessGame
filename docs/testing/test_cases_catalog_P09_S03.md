# Test Cases Catalog: Audio & Motion Polish

**Sprint:** Phase 09 · Sprint 03  
**Feature:** Audio and Motion Polish Subsystem  
**Author:** SDET Architect  
**Status:** Approved for Implementation

---

## 1. Overview & Test Objectives

This test catalog verifies the functionality, resilience, volume attenuation, mute overrides, reduced-motion invariants, animation state independence, and UI settings interaction for the procedural Web Audio and motion polish subsystem in ChessForge.

---

## 2. Test Cases Matrix

| Test ID     | Category                     | Description                                                                                                                                                                                           | Verification Method   | Expected Outcome                                                                                              |
| :---------- | :--------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------- | :------------------------------------------------------------------------------------------------------------ |
| `TC-AUD-01` | Synthesis Unit               | Verify procedural synthesis creates and dispatches correct Web Audio nodes (oscillators, biquad filter, gain envelope) for `move`, `capture`, `check`, `castle`, `promotion`, `gameOver`, and `draw`. | Vitest Mock WebAudio  | Node chain (oscillator -> gain -> destination) is constructed with correct decay timing and frequency curves. |
| `TC-AUD-02` | Mute Invariant               | Verify `SoundService.play()` does not dispatch any audio nodes when `soundEnabled === false`.                                                                                                         | Vitest Unit Test      | Zero AudioNodes are created/scheduled; early return occurs without error.                                     |
| `TC-AUD-03` | Volume Attenuation           | Verify master gain scales proportionally with `volume: 0..100` (e.g. 50% volume sets master gain to 0.5).                                                                                             | Vitest Unit Test      | Master gain node reflects exact percentage linear scaling.                                                    |
| `TC-AUD-04` | Audio Resilience             | Verify `SoundService` gracefully handles missing `AudioContext`, SSR/headless environments, or suspended context states without throwing exceptions.                                                  | Vitest Unit Test      | Operations no-op cleanly and return without crashing UI thread.                                               |
| `TC-AUD-05` | Move Sound Trigger           | Verify executing standard legal move on board triggers `move` sound effect.                                                                                                                           | React Testing Library | `soundService.play('move')` is invoked when move commits.                                                     |
| `TC-AUD-06` | Capture Sound Trigger        | Verify capturing move or en passant triggers `capture` sound effect.                                                                                                                                  | React Testing Library | `soundService.play('capture')` is invoked on capture ply.                                                     |
| `TC-AUD-07` | Check Sound Trigger          | Verify move delivering check triggers `check` sound effect.                                                                                                                                           | React Testing Library | `soundService.play('check')` is invoked on check state.                                                       |
| `TC-AUD-08` | Castling Sound Trigger       | Verify kingside or queenside castling triggers `castle` sound effect.                                                                                                                                 | React Testing Library | `soundService.play('castle')` is invoked on castling move.                                                    |
| `TC-AUD-09` | Promotion Sound Trigger      | Verify pawn promotion selection triggers `promotion` sound effect.                                                                                                                                    | React Testing Library | `soundService.play('promotion')` is invoked when piece is promoted.                                           |
| `TC-AUD-10` | Game Over Sound Trigger      | Verify checkmate, resignation, or clock timeout triggers `gameOver` sound effect.                                                                                                                     | React Testing Library | `soundService.play('gameOver')` is invoked on game conclusion.                                                |
| `TC-AUD-11` | Draw Sound Trigger           | Verify stalemate or draw agreement triggers `draw` sound effect.                                                                                                                                      | React Testing Library | `soundService.play('draw')` is invoked on draw conclusion.                                                    |
| `TC-MOT-01` | Motion Classes               | Verify board and squares attach micro-animation classes (`is-last-move-from`, `is-last-move-to`, `is-capture-effect`, `is-check`) with CSS transitions.                                               | Vitest / RTL DOM      | CSS classes are present on appropriate square elements.                                                       |
| `TC-MOT-02` | Reduced-Motion Override      | Verify when `reducedMotion === true` (or system `prefers-reduced-motion: reduce`), board wrapper receives `reduced-motion` attribute/class and disables all animations.                               | Vitest / RTL DOM      | CSS transitions and animations are suppressed via `.reduced-motion`.                                          |
| `TC-MOT-03` | State Independence Invariant | Verify animations do not delay domain move commit; rapid consecutive moves execute synchronously with 100% domain parity.                                                                             | Vitest Property Test  | Move commits in 0ms synchronously regardless of animation timing.                                             |
| `TC-SET-01` | Sound Settings Toggle        | Verify toggling Sound Effects switch in `AudioMotionSettingsSection` updates `useSettings` and enables/disables audio.                                                                                | React Testing Library | Switch toggles `soundEnabled` state and persists immediately.                                                 |
| `TC-SET-02` | Volume Slider Control        | Verify dragging Master Volume slider updates volume percentage in settings and audio manager.                                                                                                         | React Testing Library | Slider updates `volume` state with proper ARIA attributes.                                                    |
| `TC-SET-03` | Reduced Motion Switch        | Verify toggling Reduced Motion switch in settings toggles `reducedMotion` state.                                                                                                                      | React Testing Library | Switch toggles `reducedMotion` state immediately.                                                             |
| `TC-SET-04` | Audio Audition Preview       | Verify clicking sound audition preview buttons plays corresponding sound effect with active volume.                                                                                                   | React Testing Library | Audition buttons trigger test sound playback.                                                                 |
| `TC-E2E-01` | Full Playout & Audio/Motion  | Verify end-to-end game flow with sound & motion enabled completes without errors.                                                                                                                     | Playwright E2E Test   | Complete game flow executes cleanly with audio and motion active.                                             |

---

## 3. Quality Gate Thresholds

- **Unit & Integration Tests:** 100% Pass (0 skips, 0 failures)
- **Typecheck (`tsc --noEmit`):** 0 errors
- **Linting (`eslint`):** 0 errors, 0 warnings
- **Formatting (`prettier`):** 100% compliant
- **E2E Playout (`playwright`):** 100% Pass
- **Build (`npm run build`):** Clean exit
