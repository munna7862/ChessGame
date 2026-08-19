# Architecture & Technical Specification: Audio & Motion Polish

**Sprint:** Phase 09 · Sprint 03  
**Feature:** Audio and Motion Polish Subsystem  
**Status:** Approved  
**Author:** Chess Domain Architect & Dev Architect

---

## 1. Executive Summary & Objective

ChessForge requires a responsive, immersive, and accessible audio-visual feedback subsystem. The objective of Phase 09 · Sprint 03 is to introduce crisp, restrained procedural sound effects and subtle piece/square micro-animations that communicate game state changes without delaying authoritative domain state, causing audio glitches, or degrading accessibility for users with motion sensitivity.

---

## 2. Requirements & Invariants

### 2.1 Functional Requirements

- **REQ-AUD-01 (Procedural Sound Generation):** Implement high-fidelity local procedural audio synthesis via Web Audio API (`SoundService`), requiring zero external audio files, zero network bandwidth, and zero missing asset crashes.
- **REQ-AUD-02 (Core Chess Audio Cues):** Provide distinct auditory signatures for all primary chess events:
  - `move`: Crisp wooden board tap (pitch-bend triangular transient).
  - `capture`: Punchy percussive impact snap.
  - `check`: Urgent two-tone harmonic chime warning.
  - `castle`: Staggered dual wooden placement clack.
  - `promotion`: Ascending triumphant harmonic chime.
  - `game-over` (checkmate / resign / flag fall): Deep resonant resolve tone.
  - `draw` / `stalemate`: Neutral mellow dual-tone chime.
- **REQ-AUD-03 (Audio Settings & Volume Control):** Audio playback must strictly adhere to user configuration:
  - `soundEnabled`: Master boolean toggle (when `false`, audio synthesis is completely muted and zero oscillator nodes are dispatched).
  - `volume`: Linear master gain attenuation from `0` to `100%`.
- **REQ-AUD-04 (Audio Resiliency & SSR Safety):** AudioContext must initialize lazily upon first user interaction, resume automatically if suspended by browser autoplay policy, and gracefully no-op if Web Audio is unsupported (e.g., in headless test runners or restricted webviews).
- **REQ-MOT-01 (Restrained Board Micro-Animations):** Board animations must communicate state transitions without visual noise:
  - Piece hover and selection lift (`transform: scale(1.04)` to `1.08`).
  - Move origin/destination highlight fading (`150ms` cubic-bezier transition).
  - Capture impact pulse ring (`150ms`).
  - King check warning aura.
  - Promotion popover spring fade (`120ms`).
- **REQ-MOT-02 (Authoritative State Independence):** Animations must NEVER delay, debounce, or desynchronize authoritative chess state commits. Move validation, game status calculation, clock switching, and history recording occur synchronously.
- **REQ-MOT-03 (Interruption Safety):** Rapid consecutive moves (e.g., blitz playouts, engine responses, quick multi-click inputs) must immediately supersede previous animations without artifact accumulation or visual ghosting.
- **REQ-MOT-04 (Strict Reduced-Motion Invariant):** When reduced motion is active (via OS `prefers-reduced-motion: reduce` or explicit user setting `reducedMotion === true`), all CSS transitions and animations must be bypassed (`transition: none !important; animation: none !important; transform: none !important`).
- **REQ-MOT-05 (Interactive Sound Audition):** The Audio & Motion settings panel must provide interactive sound audition buttons for users to test audio cues directly with real-time volume feedback.

---

## 3. Audio Synthesis Architecture

```
src/services/sound/
├── types.ts              # SoundEffectType ('move' | 'capture' | 'check' | 'castle' | 'promotion' | 'gameOver' | 'draw')
├── soundSynthesis.ts     # Pure Web Audio synthesis routines (oscillator & gain envelope curves)
├── SoundService.ts       # SoundService interface, AudioContext manager, and singleton
└── index.ts              # Public exports
```

### 3.1 Audio Frequency & Envelope Signatures

| Effect Type | Synthesis Technique                          | Frequency / Harmonic Profile                                                                           | Envelope Duration |
| :---------- | :------------------------------------------- | :----------------------------------------------------------------------------------------------------- | :---------------- |
| `move`      | Lowpass-filtered triangle + fast pitch decay | $320\text{ Hz} \to 110\text{ Hz}$                                                                      | $60\text{ ms}$    |
| `capture`   | Triangle transient + noise burst snap        | $240\text{ Hz} \to 80\text{ Hz}$ + White noise burst                                                   | $85\text{ ms}$    |
| `check`     | Dual sine chime                              | $440\text{ Hz}\;(\text{A}_4) \to 659.25\text{ Hz}\;(\text{E}_5)$                                       | $180\text{ ms}$   |
| `castle`    | Dual staggered wooden impulses               | $300\text{ Hz} \to 120\text{ Hz}$ (2 pulses at $t=0\text{ms}$ and $t=50\text{ms}$)                     | $110\text{ ms}$   |
| `promotion` | Ascending major triad chime                  | $523.25\text{ Hz}\;(\text{C}_5) \to 659.25\text{ Hz}\;(\text{E}_5) \to 783.99\text{ Hz}\;(\text{G}_5)$ | $220\text{ ms}$   |
| `gameOver`  | Deep resonant minor triad chord              | $146.83\text{ Hz}\;(\text{D}_3) + 220\text{ Hz}\;(\text{A}_3)$                                         | $450\text{ ms}$   |
| `draw`      | Mellow neutral fifth interval                | $261.63\text{ Hz}\;(\text{C}_4) + 392.00\text{ Hz}\;(\text{G}_4)$                                      | $250\text{ ms}$   |

---

## 4. Integration Surface & Event Mapping

```
Game Action / Trigger       ──▶ Sound Effect Dispatched
──────────────────────────────────────────────────────────
Standard quiet move         ──▶ 'move'
Capture / En passant        ──▶ 'capture'
King Castles (O-O / O-O-O)  ──▶ 'castle'
Pawn Promotion              ──▶ 'promotion'
Move results in Check       ──▶ 'check'
Checkmate / Resign / Flag   ──▶ 'gameOver'
Stalemate / 50-move / Draw  ──▶ 'draw'
```

---

## 5. Security & Resource Guardrails

- **Zero Remote Dependencies:** All sounds are synthesized client-side via native browser Web Audio APIs. No external `.mp3`, `.wav`, or CDN requests.
- **Strict Memory Bounding:** Single shared `AudioContext` instance reused across all dispatches. Nodes are disconnected upon envelope completion ($< 500\text{ms}$).
- **CPU Footprint:** Peak audio synthesis consumes $< 0.1\%$ CPU. Frame rate remains at constant 60fps.
