# Board Accessibility & Visual States Invariants

This document formalizes the chess domain, WAI-ARIA 2D grid spatial navigation geometry, non-color visual state indicators, high-contrast modes, and reduced-motion invariants for **ChessForge**.

---

## 1. 2D Grid Spatial Navigation Geometry

The chessboard is rendered as an $8 \times 8$ grid of cells. Keyboard navigation must allow full traversal using standard arrow keys and positional navigation keys, respecting the active board orientation ($\text{White perspective 'w'}$ vs $\text{Black perspective 'b'}$).

```
White Perspective ('w'):                 Black Perspective ('b'):
  a  b  c  d  e  f  g  h                   h  g  f  e  d  c  b  a
8 .  .  .  .  .  .  .  .  8             1 .  .  .  .  .  .  .  .  1
7 .  .  .  .  .  .  .  .  7             2 .  .  .  .  .  .  .  .  2
6 .  .  .  .  .  .  .  .  6             3 .  .  .  .  .  .  .  .  3
5 .  .  .  .  .  .  .  .  5  (Up = +R)  4 .  .  .  .  .  .  .  .  4  (Up = -R)
4 .  .  .  .  .  .  .  .  4  (Dn = -R)  5 .  .  .  .  .  .  .  .  5  (Dn = +R)
3 .  .  .  .  .  .  .  .  3  (Lf = -F)  6 .  .  .  .  .  .  .  .  6  (Lf = +F)
2 .  .  .  .  .  .  .  .  2  (Rt = +F)  7 .  .  .  .  .  .  .  .  7  (Rt = -F)
1 .  .  .  .  .  .  .  .  1             8 .  .  .  .  .  .  .  .  8
  a  b  c  d  e  f  g  h                   h  g  f  e  d  c  b  a
```

### 1.1 Navigation Key Mapping

Let $(f, r)$ denote the 0-indexed file ($0 = \text{'a'}, \dots, 7 = \text{'h'}$) and rank ($0 = \text{'1'}, \dots, 7 = \text{'8'}$).

| Key Stroke     | White Orientation ('w')       | Black Orientation ('b')       | Boundary Handling                    |
| :------------- | :---------------------------- | :---------------------------- | :----------------------------------- |
| **ArrowUp**    | $r \leftarrow \min(7, r + 1)$ | $r \leftarrow \max(0, r - 1)$ | Clamped at edge rank                 |
| **ArrowDown**  | $r \leftarrow \max(0, r - 1)$ | $r \leftarrow \min(7, r + 1)$ | Clamped at edge rank                 |
| **ArrowLeft**  | $f \leftarrow \max(0, f - 1)$ | $f \leftarrow \min(7, f + 1)$ | Clamped at edge file                 |
| **ArrowRight** | $f \leftarrow \min(7, f + 1)$ | $f \leftarrow \max(0, f - 1)$ | Clamped at edge file                 |
| **Home**       | $f \leftarrow 0$ (file 'a')   | $f \leftarrow 7$ (file 'h')   | Jumps to first file of current rank  |
| **End**        | $f \leftarrow 7$ (file 'h')   | $f \leftarrow 0$ (file 'a')   | Jumps to last file of current rank   |
| **PageUp**     | $r \leftarrow 7$ (rank 8)     | $r \leftarrow 0$ (rank 1)     | Jumps to top rank of current file    |
| **PageDown**   | $r \leftarrow 0$ (rank 1)     | $r \leftarrow 7$ (rank 8)     | Jumps to bottom rank of current file |

---

## 2. Roving Tabindex & Focus Containment Invariants

- **Single Tab Stop on Board:** The chessboard container (`role="grid"`) contains exactly ONE square with `tabIndex={0}` at any given time. All remaining 63 squares have `tabIndex={-1}`.
- **Initial Focus Target:** When entering the board via <kbd>Tab</kbd>:
  - If a square is currently selected, that square is `tabIndex={0}`.
  - If a move was just made, the destination square is `tabIndex={0}`.
  - Otherwise, default initial square is `e2` (for White orientation) or `e7` (for Black orientation).
- **Smooth Tab Traversal:** Pressing <kbd>Tab</kbd> while focused on the board moves focus directly to the next interactive control outside the board (e.g. "Flip Board" button), avoiding 64 sequential tab stops.
- **Arrow Key Focus Synchronization:** Pressing any spatial navigation key immediately updates the roving `tabIndex={0}` to the new target square and shifts DOM focus to that element (`element.focus()`).

---

## 3. Keyboard Action Invariants

- **<kbd>Enter</kbd> / <kbd>Space</kbd> Activation:**
  1. _Idle State (No square selected):_ If the focused square contains a piece belonging to the active player, selects the square and computes legal moves.
  2. _Selection Active:_
     - If the focused square equals the selected square: deselects the square.
     - If the focused square is a legal destination:
       - If pawn promotion: triggers the promotion dialog.
       - Otherwise: executes the move, updates last-move state, clears selection, and leaves focus on the destination square.
     - If the focused square contains another friendly piece: shifts selection to that piece.
     - If the focused square is not a legal move: clears selection.
- **<kbd>Escape</kbd> Cancellation:**
  - If promotion dialog is active: dismisses promotion dialog without making a move.
  - If a piece is selected: clears selection without moving.
  - If idle: no-op.

---

## 4. ARIA Contracts & Live Region Announcements

### 4.1 ARIA Roles and Attributes

- Board container: `role="grid"`, `aria-label="Chessboard, [White/Black] to move"`.
- Individual square: `role="gridcell"`, `aria-selected={isSelected}`, `aria-disabled={disabled}`, `aria-label="Square [sq], [light/dark][, piece][, selected][, legal target][, in check][, last move]"`.
- Promotion Dialog: `role="dialog"`, `aria-modal="true"`, `aria-label="Promote pawn to"`.

### 4.2 ARIA Live Region Announcements

A dedicated `<div role="status" aria-live="polite" aria-atomic="true" className="sr-only" />` provides real-time speech feedback for screen readers:

1. **Piece Selection:** `"Selected [Color] [Piece] on [Square]. [N] legal moves available: [d1, d2, ...]"`
2. **Selection Cleared:** `"Selection cleared."`
3. **Move Executed:** `"[Color] moved [Piece] from [From] to [To][, capturing Piece][, check][, checkmate]"`
4. **Promotion Opened:** `"Pawn promotion dialog opened on [Square]. Choose Queen, Rook, Bishop, or Knight."`
5. **Game Over:** `"Game over. [Checkmate - White/Black wins / Draw - Reason]"`
6. **Board Flipped:** `"Board flipped to [White/Black] perspective."`

---

## 5. Non-Color Visual Indicator Invariants

Every critical chess visual state must have a distinct non-color geometric indicator:

| State                    | Color Indicator | Non-Color Geometric / Symbolic Indicator                                 | High-Contrast Fallback                 |
| :----------------------- | :-------------- | :----------------------------------------------------------------------- | :------------------------------------- |
| **Focused**              | Cyan ring       | 2px solid offset outline (`outline-offset: -2px`)                        | System `Highlight` outline             |
| **Selected**             | Gold glow       | 2.5px inset border + inner corner indicators                             | System `Highlight` inset border        |
| **Legal Move (Quiet)**   | Green tint      | Centered circular disk ($\approx 28\%$ square width)                     | High-contrast filled disk              |
| **Legal Move (Capture)** | Red tint        | Outer circular ring ($\approx 3.5\text{px}$ thickness) + corner brackets | High-contrast high-visibility ring     |
| **Last Move From**       | Soft blue       | Inset subtle outline + origin marker                                     | Inset dashed border                    |
| **Last Move To**         | Solid blue      | Inset solid border + arrival pulse                                       | Inset solid border                     |
| **Check**                | Red background  | SVG Badge (Exclamation Circle icon in top-right)                         | High-contrast badge with border        |
| **Checkmate**            | Dark red        | SVG Badge (Crossed Circle icon in top-right)                             | High-contrast badge with double border |

---

## 6. High-Contrast and Reduced-Motion Standards

- **Forced Colors (`@media (forced-colors: active)`):**
  - Board borders and square outlines use `CanvasText` and `ButtonBorder`.
  - Selected and focused elements use `Highlight` and `HighlightText`.
  - Check badges use `Mark` or `CanvasText` with explicit solid outlines.
  - Coordinate labels use `CanvasText`.
- **Reduced Motion (`@media (prefers-reduced-motion: reduce)` & `.reduced-motion`):**
  - All animation durations forced to $0.001\text{ms}$ / `none`.
  - Transitions for scale, brightness, and transform disabled.
  - Piece animations execute instantaneously without visual motion tweening.
