# Phase 08: Persistence & Settings

## Objective

Make games durable and make the application remember user preferences.

## Outcome

Users can safely save/load chess games and configure ChessForge without
losing state.

## Scope

### Persistence

- Current game recovery
- Settings
- PGN export
- PGN import
- FEN copy
- FEN load
- Versioned local storage/data

### Settings

- Board theme
- Piece set
- Animation
- Coordinates
- Sound
- Move highlighting
- Auto queen
- Engine difficulty
- Reduced motion
- Accessibility options

## Persistence architecture

```text
Application
   |
Persistence Service
   |
Versioned Data Model
   |
Tauri/local storage mechanism
```

Do not scatter persistence calls throughout components.

## Data versioning

Persist:

```ts
interface PersistedState {
  version: number;
  settings: Settings;
  activeGame?: PersistedGame;
}
```

Future migrations should be possible.

## Import security

Treat FEN and PGN as untrusted input.

Validate:

- syntax
- legal position
- move sequence
- unexpected size
- malformed metadata

## Recovery

If the app closes during a game:

```text
Launch
 ↓
Detect recoverable game
 ↓
"Continue previous game?"
```

## Testing

- settings save/load
- version migration
- corrupted persistence
- PGN export/import
- FEN export/import
- invalid FEN
- malformed PGN
- interrupted write/recovery behavior

## Acceptance criteria

- Preferences survive restart.
- Active game recovery works.
- PGN round-trip works.
- FEN round-trip works.
- Invalid imports fail safely.
- Data format is versioned.
- Persistence is isolated from UI.

## Exit criteria

A user can close ChessForge, reopen it and continue or restore the
expected state reliably.

## Sprint decomposition candidates

- Persistence abstraction
- Settings model
- Settings UI
- Local game recovery
- PGN export
- PGN import
- FEN workflows
- Validation
- Migration
- Corruption handling
