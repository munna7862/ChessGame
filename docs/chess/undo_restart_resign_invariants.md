# Domain Invariants & State Transition Specifications: Undo, Restart, and Resign

**Phase 05 · Sprint 04**  
**Document Ref:** `docs/chess/undo_restart_resign_invariants.md`  
**Author:** Chess Domain Architect (CDA)  
**Status:** Canonical & Authoritative

---

## 1. Executive Summary

This document formalizes the domain mechanics, state transition rules, and UI synchronization invariants for the three core game lifecycle controls: **Undo**, **Restart**, and **Resign**.

---

## 2. Invariant 1: Move Undo Semantics & Exact Reversibility

### 2.1 Domain State Reversibility

Given any sequence of $N$ legal moves starting from an initial position $P_0$:
$$P_0 \xrightarrow{m_1} P_1 \xrightarrow{m_2} P_2 \dots \xrightarrow{m_N} P_N$$

Applying $k$ successive `undo()` operations ($1 \le k \le N$) yields position $P_{N-k}$, preserving the exact FEN representation, active player turn, castling rights, en passant availability, and halfmove clock:
$$\text{FEN}(P_{N-k}) = \text{FEN}(\text{Initial Position after } N-k \text{ moves})$$

### 2.2 Captured Piece & Material Restoration

- If move $m_N$ was a capture (including en passant), the captured piece $C$ is removed from the session's captured piece collection $\mathcal{C}_{\text{player}}$ and restored to its destination square on the board.
- The material advantage $\Delta = \sum V(\mathcal{C}_{\text{white}}) - \sum V(\mathcal{C}_{\text{black}})$ is recomputed from the updated $N-1$ move history.

### 2.3 UI & Transient State Synchronization

Upon successful `undo()`:

1. **Last Move State:** Set to the previous move in history $m_{N-1}$ (`from`, `to`, `isCapture`, `san`), or `null` if $N=1$.
2. **Selection State:** Active square selection `selectedSquare` is cleared (`null`) and legal destination markers are emptied.
3. **Promotion State:** Any pending promotion dialog is immediately dismissed (`pendingPromotion = null`).
4. **Announcements:** ARIA live region announces: `"Move undone: reverted to [Turn] to move."`

---

## 3. Invariant 2: Restart Semantics & Complete State Reset

### 3.1 Session Reset Contract

Calling `resetGame(config)` resets the game session to the standard starting position (or configured initial FEN) while preserving existing player metadata and active game mode:

$$\mathcal{S}_{\text{new}} = \langle P_{\text{start}}, \text{mode}, \text{players}, \text{history} = [], \mathcal{C} = \emptyset, \text{status} = \text{Active} \rangle$$

### 3.2 Transient State Purge

A restart must purge all transient UI state with zero residue:

- `selectedSquare` $\to \text{null}$
- `focusedSquare` $\to \text{null}$ (or reset to default `e2`/`e7`)
- `legalDestinations` $\to \emptyset$
- `lastMove` $\to \text{null}$
- `pendingPromotion` $\to \text{null}$
- `moveHistory` $\to []$
- `capturedPieces` $\to \{ \text{white}: [], \text{black}: [] \}$
- `isGameOver` $\to \text{false}$
- Board `aria-disabled` $\to \text{"false"}$

---

## 4. Invariant 3: Resignation Semantics & Game-Over Terminality

### 4.1 Resignation Rule

When player $c \in \{ \text{'w'}, \text{'b'} \}$ resigns:

1. Authoritative status transitions:
   - `status.isOver = true`
   - `status.state = "resigned"`
   - `status.winner = opponent(c)`
2. The game concludes immediately and terminally.

### 4.2 Board Non-Interactivity

Once resigned:

- Board container sets `aria-disabled="true"`.
- All square click and drag events are inert.
- Keyboard navigation is restricted to review inspection (no move execution).
- Any attempt to invoke `makeMove()` yields domain error `GAME_ALREADY_OVER`.

---

## 5. Invariant 4: Confirmation Dialogs & Safety Guardrails

Destructive lifecycle actions (**Restart** and **Resign**) require explicit user confirmation:

1. Triggering the action displays an accessible modal dialog (`role="dialog"`, `aria-modal="true"`).
2. The dialog traps keyboard focus and supports `Escape` (Cancel) and `Enter` (Confirm).
3. Cancelling leaves all game state, clocks, moves, and board positions completely unmutated.
4. Confirming executes the lifecycle transition atomically.
