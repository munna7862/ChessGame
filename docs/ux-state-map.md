# ChessForge: UX State Machine & Navigation Map

**Sprint:** `Phase 01 · Sprint 02: UX Journeys and Information Architecture`  
**Author:** Dev Architect & Senior SDE  
**Status:** `Approved Specification Baseline`  
**Target Platform:** Windows 10/11 x64 Desktop (Tauri v2 + React UI)

---

## 1. High-Level Application State Machine

The ChessForge application UI behaves as a deterministic finite state machine (FSM). This guarantees zero orphan UI states, prevents race conditions during AI move calculation, and maintains complete separation between UI presentation and the authoritative chess domain.

```mermaid
stateDiagram-v2
    [*] --> BOOT_INIT: App Launch

    state BOOT_INIT {
        [*] --> LOAD_CONFIG: Read Settings JSON
        LOAD_CONFIG --> CHECK_PERSISTENCE: Read Saved Game Snapshot
        CHECK_PERSISTENCE --> RESTORE_SESSION: Valid In-Flight Game Exists
        CHECK_PERSISTENCE --> FRESH_SESSION: No Saved Game / Clean State
        RESTORE_SESSION --> [*]
        FRESH_SESSION --> [*]
    }

    BOOT_INIT --> GAME_IDLE: Session Ready

    state GAME_ACTIVE_CLUSTER {
        [*] --> GAME_PLAYING: White to Move

        state GAME_PLAYING {
            [*] --> AWAITING_HUMAN_MOVE
            AWAITING_HUMAN_MOVE --> PIECE_SELECTED: Click / Drag Start
            PIECE_SELECTED --> AWAITING_HUMAN_MOVE: Click Away / Drag Cancel
            PIECE_SELECTED --> PROMOTION_CHOICE: Pawn to 8th Rank
            PROMOTION_CHOICE --> AWAITING_HUMAN_MOVE: Cancel Promotion
            PROMOTION_CHOICE --> MOVE_EXECUTED: Select Q/R/B/N
            PIECE_SELECTED --> MOVE_EXECUTED: Legal Target Square Drop
            MOVE_EXECUTED --> [*]
        }

        GAME_PLAYING --> ENGINE_THINKING: AI Turn / Analysis Request
        ENGINE_THINKING --> GAME_PLAYING: Bestmove Returned / User Move Applied

        GAME_PLAYING --> HISTORY_REVIEW: User Clicks Past Ply / Arrow Keys
        HISTORY_REVIEW --> GAME_PLAYING: Click Live Ply (End) / Make Live Move
    }

    GAME_IDLE --> GAME_ACTIVE_CLUSTER: New Game Started / Restored
    GAME_ACTIVE_CLUSTER --> GAME_TERMINATED: Checkmate / Stalemate / Resign / Timeout

    state MODAL_LAYER {
        MODAL_NEW_GAME
        MODAL_SETTINGS
        MODAL_IMPORT_FEN_PGN
        MODAL_EXPORT_PGN
    }

    GAME_ACTIVE_CLUSTER --> MODAL_LAYER: Open Modal (New Game / Settings / Import / Export)
    GAME_TERMINATED --> MODAL_LAYER: Open Modal
    GAME_IDLE --> MODAL_LAYER: Open Modal
    MODAL_LAYER --> GAME_ACTIVE_CLUSTER: Dismiss Modal / Apply Changes
    MODAL_LAYER --> GAME_IDLE: Cancel Initial Setup
    MODAL_LAYER --> GAME_TERMINATED: Dismiss Modal

    GAME_TERMINATED --> GAME_ACTIVE_CLUSTER: Rematch / New Game
```

---

## 2. Modal Overlay & Focus Transition Flow

Modals in ChessForge are rendered in a dedicated top-level portal layer above the game canvas with strict focus containment (focus trap) and backdrop blurring.

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Board as Board Viewport
    participant AppState as UI State Machine
    participant Modal as Modal Layer (Dialog)
    participant DOM as Keyboard Focus Manager

    User->>Board: Presses Ctrl+N (or clicks "New Game")
    Board->>AppState: Trigger Event `OPEN_MODAL(NEW_GAME)`
    AppState->>AppState: Enter State `MODAL_LAYER.MODAL_NEW_GAME`
    AppState->>Board: Disable Board Drag-and-Drop & Hotkeys
    AppState->>Modal: Mount New Game Modal & Backdrop
    Modal->>DOM: Trap Focus inside First Focusable Element (e.g. Mode Radio)

    alt User Confirms New Game
        User->>Modal: Selects Options -> Clicks "Start Game" (or Enter)
        Modal->>AppState: Trigger Event `START_GAME(Config)`
        AppState->>AppState: Reset Game Session -> Enter `GAME_PLAYING`
        Modal->>Modal: Unmount Dialog
        AppState->>Board: Restore Board Interaction & Global Hotkeys
    else User Cancels / Closes
        User->>Modal: Presses `Escape` or Clicks Backdrop
        Modal->>AppState: Trigger Event `CLOSE_MODAL`
        AppState->>AppState: Return to Previous State (`GAME_PLAYING` / `GAME_TERMINATED`)
        Modal->>Modal: Unmount Dialog
        AppState->>Board: Restore Board Interaction & Restore Focus to Board
    end
```

---

## 3. Engine Worker Interaction & Evaluation State Flow

The Stockfish WASM engine runs in a dedicated background `WebWorker`. The UI communicates strictly asynchronously via the UCI protocol without blocking React rendering.

```mermaid
sequenceDiagram
    autonumber
    participant UI as Board & UI Components
    participant Bridge as Engine Bridge Service
    participant Worker as Stockfish WASM WebWorker
    participant Domain as Authoritative Chess Domain

    Note over UI,Worker: Engine Evaluation / AI Move Computation
    UI->>Domain: Human Move Executed (FEN: Position A -> B)
    UI->>Bridge: Send `evaluatePosition(fen, difficulty, maxTime)`
    Bridge->>Worker: PostMessage `position fen <B>`
    Bridge->>Worker: PostMessage `go movetime 1200`

    loop Stream Evaluation Info (Non-blocking)
        Worker-->>Bridge: `info depth 12 score cp +45 pv e7e5 ...`
        Bridge-->>UI: Update Eval Bar (+0.45) & Best Move Hint
    end

    Worker-->>Bridge: `bestmove e7e5`
    Bridge->>Bridge: Verify response matches active position FEN (Anti-Stale Guard)
    alt Response Matches Active Turn
        Bridge-->>Domain: Execute Move `e7e5`
        Domain-->>UI: Update Board to Position C -> Pass Turn to Human
    else Position Changed During Computation (e.g. User Reset/Undo)
        Bridge->>Bridge: Discard Stale Engine Move (0 State Corruption)
    end
```

---

## 4. Game Clock & Time Control State Machine

```mermaid
stateDiagram-v2
    [*] --> CLOCK_STOPPED: Game Initialized

    CLOCK_STOPPED --> WHITE_TICKING: White Starts Move 1

    WHITE_TICKING --> BLACK_TICKING: White Makes Move (+ Increment Added)
    BLACK_TICKING --> WHITE_TICKING: Black Makes Move (+ Increment Added)

    WHITE_TICKING --> CLOCK_PAUSED: Modal Open / Review Mode Active
    BLACK_TICKING --> CLOCK_PAUSED: Modal Open / Review Mode Active
    CLOCK_PAUSED --> WHITE_TICKING: Modal Closed / Return to Live (White Turn)
    CLOCK_PAUSED --> BLACK_TICKING: Modal Closed / Return to Live (Black Turn)

    WHITE_TICKING --> TIME_OUT_BLACK_WINS: White Clock Hits 00:00.0
    BLACK_TICKING --> TIME_OUT_WHITE_WINS: Black Clock Hits 00:00.0

    WHITE_TICKING --> CLOCK_STOPPED: Game Terminates (Checkmate/Resign/Draw)
    BLACK_TICKING --> CLOCK_STOPPED: Game Terminates (Checkmate/Resign/Draw)
```

---

## 5. Complete UI State Transition Matrix

| Current State         | Event / Action               | Guard Condition                    | Target State                        | UI / System Effect                                                               |
| :-------------------- | :--------------------------- | :--------------------------------- | :---------------------------------- | :------------------------------------------------------------------------------- |
| `BOOT_INIT`           | `SNAPSHOT_LOADED`            | Saved game is valid                | `GAME_PLAYING`                      | Rehydrates game state, board positions, SAN table, and clocks.                   |
| `BOOT_INIT`           | `NO_SNAPSHOT`                | No saved session                   | `GAME_IDLE`                         | Sets standard starting position with default settings.                           |
| `AWAITING_HUMAN_MOVE` | `PIECE_CLICK / DRAG_START`   | Piece belongs to active player     | `PIECE_SELECTED`                    | Highlights source square and target legal destination squares.                   |
| `PIECE_SELECTED`      | `SQUARE_DROP / CLICK`        | Destination is legal non-promotion | `AWAITING_HUMAN_MOVE` (Turn switch) | Commits move, updates SAN, plays sound FX, triggers AI worker or opponent clock. |
| `PIECE_SELECTED`      | `SQUARE_DROP / CLICK`        | Destination is 8th rank pawn move  | `PROMOTION_CHOICE`                  | Displays Promotion Picker modal directly over target square.                     |
| `PROMOTION_CHOICE`    | `SELECT_PIECE(Q/R/B/N)`      | Valid piece choice                 | `AWAITING_HUMAN_MOVE` (Turn switch) | Promotes pawn to chosen piece, closes picker, passes turn.                       |
| `PROMOTION_CHOICE`    | `CANCEL / ESCAPE`            | None                               | `AWAITING_HUMAN_MOVE`               | Aborts move, restores pawn to source square, closes picker.                      |
| `GAME_PLAYING`        | `SELECT_HISTORY_PLY(N)`      | `0 <= N < totalPlies`              | `HISTORY_REVIEW`                    | Board renders historical position; clocks pause; live return banner shown.       |
| `HISTORY_REVIEW`      | `CLICK_LIVE_PLY / PRESS_END` | None                               | `GAME_PLAYING`                      | Board restores current live position; drag-and-drop enabled; clocks resume.      |
| `GAME_PLAYING`        | `MOVE_RESULTS_CHECKMATE`     | Legal move delivers mate           | `GAME_TERMINATED`                   | Stops clocks, locks board, displays Checkmate modal/banner.                      |
| `GAME_PLAYING`        | `MOVE_RESULTS_DRAW`          | Stalemate / 50-move / 3-fold       | `GAME_TERMINATED`                   | Stops clocks, locks board, displays Draw notification.                           |
| `GAME_PLAYING`        | `CLICK_RESIGN`               | User confirms in prompt            | `GAME_TERMINATED`                   | Concedes match, sets winner to opponent, logs result to history.                 |
| `ANY_STATE`           | `OPEN_MODAL(TYPE)`           | None                               | `MODAL_LAYER(TYPE)`                 | Dims background, freezes board interactions, traps keyboard focus.               |
| `MODAL_LAYER`         | `CLOSE_MODAL / ESCAPE`       | None                               | `PREVIOUS_STATE`                    | Unmounts modal, returns focus to previous active UI component.                   |
| `GAME_TERMINATED`     | `CLICK_REMATCH`              | Same players/settings              | `GAME_PLAYING`                      | Inverts player colors (if chosen), resets board and clocks to new game.          |
