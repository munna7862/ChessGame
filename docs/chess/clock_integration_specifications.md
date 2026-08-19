# Clock Integration & Timeout Invariant Specification (Phase 07 · Sprint 03)

## Document Metadata

- **Sprint:** Phase 07 · Sprint 03: Clock Integration and Timeout
- **Author:** Chess Domain Architect (CDA) & Dev Architect (SDE)
- **Status:** APPROVED
- **Associated Requirements:** `REQ-CLK-INT-01` to `REQ-CLK-INT-06`

---

## 1. Domain Overview & Purpose

In standard chess with time controls, clocks are authoritative mechanisms for enforcing time limits, turns, increments, and flag-fall game termination. The clock must integrate with the game loop without UI thread drift, race conditions between move submission and timeout, or state synchronization inconsistencies.

---

## 2. Invariant & Functional Requirements

### `REQ-CLK-INT-01`: Clock Initialization & First-Move Start Policy

- When a game is initialized with a timed control ($> 0$ ms), both White and Black clocks start loaded with their initial duration $T_{\text{initial}}$ in the `ready` status.
- In "Unlimited" time controls (`type: "none"`), the clock remains in `idle` state and does not tick or expire.
- The clock begins ticking actively for White when White plays their first move (or when the game is actively started in timed mode).
- Timestamps must be recorded authoritatively ($t_{\text{start}} = \text{now}()$).

### `REQ-CLK-INT-02`: Turn Transition & Increment Mechanics

- Upon execution of a legal move by player $C$:
  1. The remaining time for player $C$ is computed deterministically:
     $$\Delta t = t_{\text{move}} - t_{\text{turn\_start}}$$
     $$T_{\text{remaining}} = \max(0, T_{\text{start}} - \Delta t)$$
  2. If $T_{\text{remaining}} > 0$, the increment $\Delta T_{\text{inc}}$ is immediately credited:
     $$T_{\text{new}} = T_{\text{remaining}} + \Delta T_{\text{inc}}$$
  3. The clock for player $C$ is stopped.
  4. The opponent's clock (player $\neg C$) immediately begins ticking from $t_{\text{move}}$ without gap or timer drift.

### `REQ-CLK-INT-03`: Authoritative Timeout & Flag-Fall Semantics

- When an active player's remaining time reaches $\le 0\text{ ms}$:
  1. The clock emits a flag-fall event identifying the timed-out player $C$.
  2. The game controller verifies that the game is not already concluded (`isGameOver === false`).
  3. The domain method `chessGame.timeout(C)` is invoked.
  4. The game outcome is set to `state: "timeout"`, `winner: oppositeColor(C)`, `isOver: true`.
  5. The clock is immediately paused/flagged and ceases ticking.

### `REQ-CLK-INT-04`: Game-Over Clock Freeze

- Whenever the game concludes via any terminal event:
  - Checkmate (`checkmate`)
  - Resignation (`resigned`)
  - Timeout (`timeout`)
  - Stalemate (`stalemate`)
  - 50-move rule (`draw_fifty_moves`)
  - Threefold repetition (`draw_threefold_repetition`)
  - Insufficient material (`draw_insufficient_material`)
  - Mutual agreement (`draw_agreement`)
- The clock MUST freeze immediately. No further time deductions, increments, or tick interval updates are processed.

### `REQ-CLK-INT-05`: Session Lifecycle & Reset Policy

- **Restart Game / Rematch:** Resets both White and Black clocks to their initial duration $T_{\text{initial}}$ for the current `timeControl`.
- **New Game:** Re-initializes clocks with the newly selected `TimeControl` preset or custom configuration.
- **Undo Move:** Restores game state. If no moves remain (reset to ply 0), the clock resets to `ready` state with full initial time.

### `REQ-CLK-INT-06`: Race Condition Mitigation (Move Execution vs Flag Fall)

- If a legal move is processed before flag fall is acknowledged by the domain, the move takes precedence, increment is applied, and the turn switches.
- If flag fall is registered by the domain before a move is submitted, subsequent move attempts are rejected with `GAME_ALREADY_OVER`.
- No race condition shall lead to corrupted clock or double game-over states.
