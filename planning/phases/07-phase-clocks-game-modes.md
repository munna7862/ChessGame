# Phase 07: Clocks & Game Modes

## Objective

Add serious game-mode support and accurate chess clocks.

## Outcome

ChessForge supports timed games without timer drift or state
inconsistencies.

## Scope

-   Bullet
-   Blitz
-   Rapid
-   Classical
-   Custom
-   Clock service
-   Time controls
-   Timeout
-   AI clock handling
-   Pause/resume policy if supported

## Clock architecture

Do not decrement time based on React render frequency.

Use timestamps:

``` text
remaining = configuredTime - elapsedSinceTurnStart
```

Persist authoritative clock timestamps.

## Clock model

``` ts
interface ClockState {
  whiteMs: number;
  blackMs: number;
  activeColor: "white" | "black";
  turnStartedAt: number;
  running: boolean;
}
```

## Time controls

Example presets:

``` text
1 + 0
2 + 1
3 + 0
3 + 2
5 + 0
5 + 3
10 + 0
10 + 5
15 + 10
30 + 0
Custom
```

The exact presets can evolve.

## Timeout lifecycle

``` text
Clock reaches zero
 ↓
Domain/game controller verifies timeout
 ↓
Game over
 ↓
Winner determined
```

Do not let a visual timer alone decide the winner.

## Testing

-   initial clock
-   turn switch
-   elapsed-time calculation
-   increment
-   timeout
-   AI thinking time
-   reset
-   long-running drift test
-   game-over race

## Antigravity strategy

Use deterministic fake clocks in tests.

Do not rely on sleeping for several seconds to test time calculations.

## Acceptance criteria

-   Clock remains accurate.
-   Turn switches correctly.
-   Increment is correct.
-   Timeout ends game correctly.
-   AI turns interact correctly with clocks.
-   UI updates smoothly.
-   Reset starts clean clocks.
-   Clock tests are deterministic.

## Exit criteria

Timed games can run for extended sessions without noticeable drift or
incorrect game-over behavior.

## Sprint decomposition candidates

-   Clock domain
-   Timer service
-   UI clock
-   Presets
-   Custom time control
-   Increment
-   Timeout
-   AI clock integration
-   Deterministic tests
