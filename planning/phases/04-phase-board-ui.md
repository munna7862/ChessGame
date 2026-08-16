# Phase 04: Board UI

## Objective

Create the primary chess interaction surface.

## Outcome

A user can visually inspect a position and make legal moves through an
intuitive desktop chessboard.

## Scope

- 8x8 board
- Pieces
- Coordinates
- Selection
- Legal-move indicators
- Last-move highlighting
- Check highlighting
- Capture indication
- Promotion UI
- Board orientation
- Click-to-move
- Drag-and-drop where stable
- Responsive desktop layout
- Keyboard/accessibility foundations

## UX principle

The board must answer four questions immediately:

```text
Where am I?
Whose turn is it?
What can I move?
What just happened?
```

## Architecture

```text
BoardView
  |
BoardInteractionController
  |
Game Application Service
  |
Chess Domain
```

Never embed chess legality in visual components.

## Rendering requirements

- Stable square identity.
- Predictable coordinate system.
- Efficient piece updates.
- No unnecessary full-board recomputation.
- Animation must not alter domain state.
- Reduced-motion mode must be supported.

## Visual states

```text
Normal
Selected
Legal destination
Capture destination
Last move
Check
Checkmate
Promotion
Disabled
```

## Testing

Component tests:

- render board
- select piece
- show legal moves
- execute move
- reject illegal destination
- promotion selection
- orientation flip

E2E:

- launch
- create local game
- move e2-e4
- verify position
- verify history integration

## Antigravity browser workflow

Use Antigravity browser capabilities for visual verification where
appropriate. Generate screenshots/browser recordings for major UI states
rather than relying only on unit tests.

## Acceptance criteria

- Board renders correctly at supported desktop sizes.
- Legal moves are visually clear.
- Illegal moves cannot be committed.
- Promotion works.
- Board orientation works.
- Check state is visible.
- UI remains responsive.
- No chess rules are implemented in components.

## Exit criteria

Two humans can interact with the domain through the UI and complete a
basic game.

## Sprint decomposition candidates

- Board shell
- Piece rendering
- Coordinates
- Selection
- Legal move indicators
- Move execution
- Last-move state
- Check state
- Promotion
- Orientation
- Drag-and-drop
- Visual testing
