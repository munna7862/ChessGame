# Master Plan: Windows Desktop Chess Game with Google Antigravity

**Project codename:** `ChessForge`\
**Target platform:** Windows 10/11 x64\
**Development approach:** AI-assisted, agent-first development with
Google Antigravity\
**Primary developer stack:** TypeScript + React + Tauri/Rust\
**Chess engine:** Stockfish WASM\
**Initial release:** Offline single-player desktop chess\
**Future releases:** Online multiplayer, accounts, tournaments, analysis
cloud

------------------------------------------------------------------------

## 1. Executive Vision

Build a polished Windows desktop chess application that feels like a
real product rather than a chessboard demo.

The first release should support:

-   Human vs Human on the same computer
-   Human vs Computer
-   Multiple AI difficulty levels
-   Legal chess move enforcement
-   Check, checkmate, stalemate, draw and insufficient-material
    detection
-   Castling, en passant and promotion
-   Move history
-   Undo/restart
-   FEN import/export
-   PGN save/load
-   Game clocks
-   Resign and draw
-   Board orientation
-   Last-move and legal-move highlighting
-   Captured-piece display
-   Settings
-   Keyboard accessibility
-   Responsive Windows desktop UI
-   Automated unit, integration, UI and end-to-end tests
-   Windows installer/package
-   Crash-safe error handling
-   GitHub CI/CD
-   Reproducible builds

The architecture should deliberately leave room for:

-   Online multiplayer
-   LAN play
-   Game database
-   Opening explorer
-   Analysis board
-   Engine evaluation graph
-   Puzzle mode
-   Accounts
-   Cloud synchronization
-   Tournaments

Do **not** build these future features in v1 unless the core game is
already stable.

------------------------------------------------------------------------

# 2. How Antigravity Should Be Used

Google Antigravity is an agent-first development environment. Its agents
can work across the editor, terminal and browser, create implementation
artifacts, execute commands and verify work. Antigravity also supports
asynchronous/subagents, which makes it useful for splitting a large
product into specialized engineering streams.

The key principle for this project:

> Do not ask one AI agent to "build the chess game."

Instead:

> Give the agent a product specification, architecture rules, acceptance
> criteria and small verifiable milestones.

The human remains the architect and final reviewer. Antigravity becomes
the engineering team.

Recommended agent roles:

  Agent                   Responsibility
  ----------------------- ------------------------------------------------
  Product Architect       Requirements, architecture, roadmap
  Chess Domain Engineer   Rules, game state, notation, validation
  UI Engineer             Board, pieces, animations, UX
  Engine Engineer         Stockfish integration and difficulty
  Desktop Engineer        Tauri, Rust shell, Windows packaging
  Test Engineer           Unit/integration/E2E testing
  Security Engineer       File access, IPC boundaries, dependency review
  Performance Engineer    Rendering, engine workers, memory
  Release Engineer        CI/CD, signing, packaging
  Reviewer Agent          Code review and architecture consistency

Do not allow multiple agents to modify the same files simultaneously
unless the work is explicitly isolated.

------------------------------------------------------------------------

# 3. Recommended Technology Stack

## 3.1 Desktop Framework

### Recommended: Tauri 2.x

Use:

-   Tauri
-   Rust
-   React
-   TypeScript
-   Vite

Why:

-   Windows desktop application
-   Small distribution footprint compared with Electron
-   Native desktop shell
-   Strong security model
-   TypeScript can remain the main application language
-   Rust is available for native functionality where required
-   Good fit for an engineer already comfortable with TypeScript

The application should keep most business logic in TypeScript initially.
Rust should be used for native desktop integration rather than forcing
all chess logic into Rust.

------------------------------------------------------------------------

## 3.2 Frontend

Use:

-   React
-   TypeScript
-   Vite
-   CSS Modules or a disciplined CSS architecture

Avoid introducing a large UI framework until the visual design requires
it.

The chessboard should be its own isolated component tree.

Suggested structure:

``` text
src/
  app/
  components/
  features/
    board/
    game/
    engine/
    settings/
    history/
  domain/
    chess/
    notation/
    persistence/
  services/
  hooks/
  state/
  styles/
  test/
```

------------------------------------------------------------------------

## 3.3 Chess Rules

Use a mature chess rules library rather than implementing chess legality
from scratch.

Recommended responsibility:

``` text
Chess rules library
        |
        v
Game Domain Adapter
        |
        +--> UI
        +--> Move History
        +--> PGN/FEN
        +--> Engine
        +--> Tests
```

The domain adapter should hide the third-party library from most of the
application.

This prevents the rest of the application from becoming tightly coupled
to one chess library.

------------------------------------------------------------------------

## 3.4 Chess Engine

Use Stockfish through a WebAssembly-compatible integration.

Architecture:

``` text
React Application
      |
      v
Engine Service
      |
      v
Web Worker
      |
      v
Stockfish WASM
```

Never run long engine calculations directly on the UI thread.

The UI must remain responsive while Stockfish is calculating.

------------------------------------------------------------------------

## 3.5 State Management

Start simple.

Recommended:

-   React state for local UI state
-   A small centralized game store for game/session state
-   Immutable state transitions

Do not introduce Redux unless complexity actually requires it.

Suggested high-level state:

``` text
GameSession
├── position
├── moveHistory
├── capturedPieces
├── currentTurn
├── gameStatus
├── players
├── clocks
├── boardOrientation
├── selectedSquare
├── legalMoves
└── engineState
```

------------------------------------------------------------------------

# 4. Product Scope

## 4.1 MVP

### Game modes

-   Human vs Human
-   Human vs Computer
-   Computer vs Computer for development/testing only

### Rules

-   Standard chess
-   Castling
-   En passant
-   Promotion
-   Check
-   Checkmate
-   Stalemate
-   Threefold repetition
-   Fifty-move rule
-   Insufficient material
-   Draw by agreement

### Board

-   8x8 board
-   Coordinates
-   Piece themes
-   Board themes
-   Legal-move indicators
-   Last-move indicator
-   Selected-square indicator
-   Check indicator
-   Captured pieces
-   Promotion dialog
-   Board flip

### Game controls

-   New Game
-   Restart
-   Undo
-   Resign
-   Offer Draw
-   Pause clock where applicable
-   Save PGN
-   Load PGN
-   Copy FEN
-   Load FEN

### AI

Initial levels:

``` text
Level 1: Beginner
Level 2: Easy
Level 3: Casual
Level 4: Intermediate
Level 5: Advanced
Level 6: Strong
Level 7: Expert
Level 8: Maximum
```

Do not promise that these levels correspond to exact Elo ratings unless
calibrated.

Difficulty should initially be based on engine configuration such as:

-   skill level
-   search depth/time
-   randomization where appropriate

------------------------------------------------------------------------

# 5. Non-Functional Requirements

The application should:

-   Launch quickly
-   Never freeze while the engine thinks
-   Recover gracefully from engine failures
-   Never allow illegal moves
-   Preserve game state during normal operation
-   Avoid writing unnecessary sensitive data
-   Work offline
-   Support Windows high-DPI displays
-   Support keyboard navigation where practical
-   Produce useful logs in development mode
-   Avoid leaking engine worker errors into the UI
-   Have deterministic tests for chess rules
-   Have automated smoke tests for every release build

Performance targets:

  Area                  Target
  --------------------- -----------------------------------
  Application startup   \< 3 seconds on typical modern PC
  Board interaction     No perceptible input lag
  UI rendering          Smooth during animations
  Engine calculation    Runs outside UI thread
  Memory                Stable during long sessions
  Save/load             \< 1 second for normal games

Treat these as engineering targets, not contractual guarantees.

------------------------------------------------------------------------

# 6. Proposed Architecture

``` text
+------------------------------------------------------+
|                  Windows Desktop App                 |
|                                                      |
|  +-----------------------------------------------+   |
|  | React + TypeScript                            |   |
|  |                                               |   |
|  | Board UI                                      |   |
|  | Game Controls                                 |   |
|  | Move History                                  |   |
|  | Settings                                      |   |
|  | Game Clock                                    |   |
|  +----------------------+------------------------+   |
|                         |                            |
|                 Application Services                 |
|                         |                            |
|        +----------------+----------------+           |
|        |                                 |           |
|   Chess Domain                      Engine Service   |
|        |                                 |           |
|   FEN / PGN                         Web Worker       |
|   Move validation                       |            |
|   Game status                      Stockfish WASM    |
|                                                      |
|                         Tauri                        |
|              Native Windows Integration             |
+------------------------------------------------------+
```

------------------------------------------------------------------------

# 7. Domain Model

Define these concepts before building the UI.

## 7.1 Player

``` ts
type PlayerType = "human" | "computer";

interface Player {
  id: string;
  name: string;
  color: "white" | "black";
  type: PlayerType;
}
```

## 7.2 Game

``` ts
interface Game {
  id: string;
  initialFen: string;
  currentFen: string;
  moves: MoveRecord[];
  status: GameStatus;
  players: Player[];
  createdAt: string;
  updatedAt: string;
}
```

## 7.3 Move

``` ts
interface MoveRecord {
  ply: number;
  san: string;
  uci?: string;
  fenAfter: string;
  timestamp: string;
}
```

## 7.4 Game Status

``` ts
type GameStatus =
  | "in_progress"
  | "check"
  | "checkmate"
  | "stalemate"
  | "draw"
  | "resigned"
  | "timeout"
  | "abandoned";
```

Keep domain types independent from UI components.

------------------------------------------------------------------------

# 8. Repository Structure

Recommended repository:

``` text
chessforge/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── windows-build.yml
│       └── release.yml
│
├── docs/
│   ├── product-requirements.md
│   ├── architecture.md
│   ├── chess-domain.md
│   ├── testing-strategy.md
│   ├── release-process.md
│   └── adr/
│
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   │   ├── board/
│   │   ├── game/
│   │   ├── engine/
│   │   ├── history/
│   │   └── settings/
│   ├── domain/
│   │   ├── chess/
│   │   ├── notation/
│   │   └── persistence/
│   ├── services/
│   ├── state/
│   ├── hooks/
│   ├── styles/
│   └── test/
│
├── src-tauri/
│   ├── src/
│   ├── capabilities/
│   ├── icons/
│   └── tauri.conf.json
│
├── public/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── playwright.config.ts
├── README.md
├── AGENTS.md
└── .gitignore
```

------------------------------------------------------------------------

# 9. Antigravity Project Rules

Create an `AGENTS.md` at repository root.

The rules should tell Antigravity:

1.  Never make large architectural changes without first presenting a
    plan.
2.  Never modify unrelated files.
3.  Prefer small commits.
4.  Run tests after meaningful changes.
5.  Never bypass failing tests merely to make CI green.
6.  Never implement chess rules manually when an established rules
    library is being used.
7.  Never execute engine calculations on the UI thread.
8.  Keep domain logic independent of React.
9.  Keep native Tauri/Rust code minimal.
10. Do not introduce dependencies without explaining why.
11. Review security-sensitive Tauri permissions.
12. Do not access files outside the workspace unless explicitly
    required.
13. Do not store secrets in source control.
14. Do not disable linting or type checking to make a task pass.
15. Every feature must have acceptance criteria.
16. Every bug fix must include a regression test when practical.
17. Before declaring a task complete, run the relevant verification
    commands.
18. Summarize changed files, tests run and known limitations.

------------------------------------------------------------------------

# 10. Development Method: Vertical Slices

Do not develop:

``` text
UI -> then backend -> then testing -> then engine
```

Instead develop:

``` text
Feature
  |
  +--> Domain
  +--> UI
  +--> Tests
  +--> Verification
  +--> Commit
```

Example:

``` text
Move a pawn
  |
  +--> validate move
  +--> update position
  +--> update history
  +--> update UI
  +--> test
```

This keeps the application executable throughout development.

------------------------------------------------------------------------

# 11. Master Implementation Roadmap

## Phase 0: Product Definition

### Deliverables

-   Product requirements
-   MVP scope
-   Architecture decision
-   UX principles
-   Definition of Done
-   Risk register

### Antigravity prompt

``` text
Act as the Product Architect for ChessForge.

Create a product requirements document for a Windows desktop chess application.

The MVP is offline chess with Human vs Human and Human vs Computer modes.

Define:
- target users
- MVP scope
- non-MVP scope
- functional requirements
- non-functional requirements
- acceptance criteria
- major risks
- future roadmap

Do not write application code yet.

Create docs/product-requirements.md and review it with me before implementation.
```

------------------------------------------------------------------------

# 12. Phase 1: Repository Bootstrap

### Goal

Create the minimal runnable Tauri + React + TypeScript project.

### Tasks

-   Initialize Git
-   Initialize Tauri
-   Initialize React/Vite
-   Configure TypeScript
-   Configure ESLint
-   Configure formatting
-   Configure unit testing
-   Configure Playwright
-   Add basic CI
-   Create `AGENTS.md`
-   Create README
-   Run application

### Acceptance criteria

-   App launches on Windows
-   Test command works
-   Lint works
-   Type checking works
-   Production build works
-   Git repository is clean after initial commit

### Antigravity prompt

``` text
Bootstrap the ChessForge Windows desktop application.

Technology:
- Tauri 2
- React
- TypeScript
- Vite

Add:
- ESLint
- formatter
- unit test framework
- Playwright
- basic GitHub Actions CI
- AGENTS.md

Do not implement chess functionality yet.

After implementation:
1. run lint
2. run typecheck
3. run unit tests
4. build the application

Report every command executed and its result.
```

------------------------------------------------------------------------

# 13. Phase 2: Chess Domain

This is the most important engineering phase.

### Implement

-   Board state
-   Move generation through the selected chess library
-   Move execution
-   Legal move detection
-   Check
-   Checkmate
-   Stalemate
-   Draw detection
-   Promotion
-   Castling
-   En passant
-   FEN
-   SAN
-   PGN

### Critical rule

Do not trust the UI to determine whether a move is legal.

The domain layer must be authoritative.

### Test matrix

Test at minimum:

``` text
Pawn movement
Pawn capture
Double pawn move
Promotion
Knight movement
Bishop movement
Rook movement
Queen movement
King movement
Castling kingside
Castling queenside
Castling restrictions
En passant
Pinned piece
Check
Checkmate
Stalemate
Threefold repetition
Fifty-move rule
Insufficient material
FEN loading
PGN loading
PGN generation
```

### Antigravity prompt

``` text
Implement the ChessForge chess domain.

Important:
- Keep all chess rules behind a domain adapter.
- Do not put chess rules inside React components.
- Use the selected mature chess rules library.
- Expose a clean application-facing API.

Implement:
- game creation
- legal move query
- move execution
- undo
- FEN import/export
- SAN history
- PGN import/export
- game status

Create comprehensive unit tests for legal and illegal positions.

Before completion, run the full domain test suite.
Do not proceed to UI work until the domain tests pass.
```

------------------------------------------------------------------------

# 14. Phase 3: Board UI

Build the board before adding the AI.

### UI requirements

-   8x8 board
-   White/black pieces
-   Coordinates
-   Click-to-move
-   Optional drag-and-drop
-   Legal-move indicators
-   Last-move highlighting
-   Check highlighting
-   Promotion modal
-   Board flip
-   Captured pieces
-   Move animations

### UX principle

The board is the product.

Avoid clutter.

The user should understand:

``` text
Where am I?
Whose turn is it?
What did I just move?
Can I move this piece?
Is my king in danger?
```

without reading documentation.

### Antigravity prompt

``` text
Implement the ChessForge board UI.

Requirements:
- render an 8x8 chessboard
- render pieces
- select pieces
- display legal moves
- execute legal moves through the domain layer
- highlight last move
- highlight check
- support promotion
- support board orientation
- show captured pieces

Do not implement chess rules inside UI components.

Add component tests for important interactions.

Run tests after implementation.
```

------------------------------------------------------------------------

# 15. Phase 4: Game Shell

Add:

-   New Game dialog
-   Player selection
-   Human vs Human
-   Human vs Computer placeholder
-   Restart
-   Undo
-   Resign
-   Draw
-   Game result modal
-   Move history
-   Game status

Suggested screen:

``` text
+------------------------------------------------------+
| ChessForge                              New Game ⚙   |
|                                                      |
|  Black: AI                                           |
|                                                      |
|        +-------------------------+                   |
|        |                         |                   |
|        |                         |                   |
|        |        CHESSBOARD       |                   |
|        |                         |                   |
|        |                         |                   |
|        +-------------------------+                   |
|                                                      |
|  White: Munna              10:00                     |
|                                                      |
|  Move History                                        |
|  1. e4 e5                                            |
|  2. Nf3 Nc6                                          |
|                                                      |
|  [Undo] [Draw] [Resign]                              |
+------------------------------------------------------+
```

The exact visual design can evolve.

------------------------------------------------------------------------

# 16. Phase 5: Chess Engine

Integrate Stockfish only after Human vs Human is stable.

### Architecture

``` text
Game Controller
      |
      v
Engine Service
      |
      v
Worker
      |
      v
Stockfish
```

### Requirements

-   Start engine
-   Stop engine
-   Send position
-   Request best move
-   Receive best move
-   Handle thinking state
-   Handle timeout/cancellation
-   Configure difficulty
-   Prevent stale engine responses

### Important concurrency problem

Scenario:

``` text
Position A -> engine starts
User resets game
Position B -> engine starts
Engine returns result for A
```

The result for A must be discarded.

Use a request/session ID.

Example:

``` ts
interface EngineRequest {
  requestId: string;
  fen: string;
  difficulty: number;
}
```

Only apply an engine result if its request still matches the active game
state.

### Antigravity prompt

``` text
Implement the ChessForge Stockfish integration.

Architecture:
React UI
 -> EngineService
 -> Web Worker
 -> Stockfish WASM

Requirements:
- no engine computation on UI thread
- start/stop
- position synchronization
- best move requests
- cancellation
- difficulty configuration
- stale response protection
- error recovery

Create tests for:
- engine lifecycle
- request cancellation
- stale response rejection
- correct position transmission

Do not modify unrelated UI code.
```

------------------------------------------------------------------------

# 17. Phase 6: Chess Clocks

Implement:

-   Bullet
-   Blitz
-   Rapid
-   Classical
-   Custom time

Represent clock state independently of UI.

Example:

``` ts
interface ClockState {
  whiteMs: number;
  blackMs: number;
  activeColor: "white" | "black";
  running: boolean;
}
```

Do not decrement the clock using React render cycles.

Use a timer service and calculate elapsed time from timestamps.

This avoids timer drift.

------------------------------------------------------------------------

# 18. Phase 7: Persistence

Support:

### Session persistence

Automatically save:

-   current game
-   settings
-   last selected mode
-   board theme
-   board orientation

### Export

-   PGN
-   FEN

### Import

Validate all imported content.

Never assume a loaded PGN/FEN is valid.

Test corrupted input.

Examples:

``` text
empty FEN
invalid FEN
illegal position
malformed PGN
missing move
invalid promotion
```

------------------------------------------------------------------------

# 19. Phase 8: Settings

Create:

``` text
Settings
├── Appearance
│   ├── Board theme
│   ├── Piece set
│   ├── Animation
│   └── Coordinates
│
├── Game
│   ├── Confirm resignation
│   ├── Auto queen
│   ├── Sound
│   └── Move highlighting
│
├── Engine
│   ├── Difficulty
│   ├── Thinking time
│   └── Engine behavior
│
└── Accessibility
    ├── Reduced motion
    ├── Keyboard controls
    └── High contrast
```

Keep settings versioned so future migrations are possible.

------------------------------------------------------------------------

# 20. Phase 9: Audio and Animation

Add subtle feedback:

-   Move sound
-   Capture sound
-   Check sound
-   Game-over sound
-   Promotion sound

Animations:

-   Piece movement
-   Capture
-   Check
-   Promotion

Add a reduced-motion option.

Do not let animation block game state updates.

------------------------------------------------------------------------

# 21. Phase 10: Error Handling

Define an application error strategy.

Categories:

``` text
DomainError
EngineError
PersistenceError
ImportError
NativeError
UnexpectedError
```

User-facing errors should be understandable.

Bad:

``` text
Error: undefined is not a function
```

Good:

``` text
The chess engine stopped unexpectedly.
Your current game is safe.

[Restart Engine]
```

For development builds, log detailed diagnostics.

------------------------------------------------------------------------

# 22. Phase 11: Testing Strategy

This project should be unusually test-heavy because chess has an
enormous state space.

## Unit tests

Test:

-   Game state
-   Move adapter
-   FEN
-   PGN
-   Game status
-   Clock calculations
-   Settings
-   Engine request management

## Integration tests

Test:

``` text
UI -> Game Controller -> Domain -> State
```

Examples:

-   click piece
-   click destination
-   position changes
-   move history updates
-   turn changes

## E2E tests

Use Playwright where practical.

Smoke scenarios:

### Scenario 1

``` text
Launch application
Create Human vs Human
Move e2-e4
Move e7-e5
Verify board
Verify move history
```

### Scenario 2

``` text
Start Human vs Computer
Make first move
Wait for engine
Verify computer makes legal move
```

### Scenario 3

``` text
Load known checkmate position
Make mating move
Verify game over
```

### Scenario 4

``` text
Promote pawn
Select queen
Verify promoted piece
```

### Scenario 5

``` text
Save PGN
Load PGN
Verify identical position
```

------------------------------------------------------------------------

# 23. Property-Based / Invariant Testing

This is a powerful opportunity for AI-assisted testing.

Define invariants:

``` text
After every legal move:
- exactly one side has the turn
- both kings exist
- no illegal position is accepted
- move history can reconstruct the position
- FEN generated from state can be reloaded
```

Ask Antigravity to generate property-based tests around these
invariants.

Example prompt:

``` text
Act as a chess-domain verification engineer.

Identify invariants that must always hold after legal chess moves.

Implement property-based tests around those invariants.

Do not generate random tests without defining the invariant first.
```

------------------------------------------------------------------------

# 24. Mutation Testing

After the domain suite is mature, intentionally introduce defects such
as:

-   allow king into check
-   break castling
-   ignore en passant
-   corrupt promotion
-   change turn handling

Verify tests catch them.

This tells you whether the test suite is actually strong rather than
merely large.

------------------------------------------------------------------------

# 25. Visual Testing

Use screenshots for:

-   Main board
-   New game dialog
-   Promotion dialog
-   Settings
-   Check state
-   Checkmate state
-   Game result
-   Empty state
-   Import/export error

If Antigravity browser/visual capabilities are available for the chosen
workflow, use them to inspect rendered UI artifacts.

Keep visual assertions focused on important layout and interaction
behavior rather than brittle pixel-perfect comparisons.

------------------------------------------------------------------------

# 26. Security Plan

Tauri permissions are important.

Use the smallest possible permission set.

The application should not need broad file-system access.

Recommended principle:

``` text
UI
 |
 | limited IPC
 v
Tauri
 |
 | only required native capabilities
 v
Windows
```

Review:

-   Tauri capabilities
-   filesystem permissions
-   shell permissions
-   external process execution
-   file import/export
-   update mechanism
-   dependencies
-   bundled engine files

Do not give the agent unrestricted terminal/file access simply for
convenience.

Use Antigravity's workspace isolation and review-oriented command
execution settings where appropriate.

------------------------------------------------------------------------

# 27. Git Strategy

Use:

``` text
main
develop
feature/*
fix/*
release/*
```

Prefer small feature branches.

Example:

``` text
feature/chess-domain
feature/board-ui
feature/stockfish
feature/game-clock
feature/pgn
feature/windows-packaging
```

Commit style:

``` text
feat: add chess domain adapter
feat: add legal move highlighting
feat: integrate stockfish worker
test: add castling regression cases
fix: reject stale engine responses
build: configure windows release
```

Never allow an AI agent to make a giant commit containing unrelated
changes.

------------------------------------------------------------------------

# 28. CI/CD

GitHub Actions pipeline:

``` text
Pull Request
    |
    +--> install
    |
    +--> lint
    |
    +--> typecheck
    |
    +--> unit tests
    |
    +--> integration tests
    |
    +--> build
    |
    +--> Windows build
    |
    +--> smoke tests
    |
    +--> artifact upload
```

Release pipeline:

``` text
Tag v1.0.0
    |
    v
Build Windows
    |
    v
Run release tests
    |
    v
Package installer
    |
    v
Generate checksums
    |
    v
Publish GitHub Release
```

Code signing can be added when distributing beyond personal/testing use.

------------------------------------------------------------------------

# 29. Windows Packaging

Choose one installer format initially:

-   NSIS installer, or
-   MSI if your distribution requirements favor it

The release artifact should include:

``` text
ChessForge-Setup-x.y.z.exe
```

Test installation on a clean Windows environment.

Test:

-   fresh installation
-   upgrade
-   uninstall
-   reinstall
-   application launch
-   file associations if implemented
-   saved settings migration

------------------------------------------------------------------------

# 30. Observability

For a desktop app, observability should remain lightweight.

Track locally useful diagnostics:

``` text
application version
OS version
startup duration
engine startup failure
engine crash
import/export failure
unexpected exception
```

Avoid collecting personal information unnecessarily.

If telemetry is ever added:

-   make it explicit
-   document it
-   provide an opt-out
-   collect the minimum required data

------------------------------------------------------------------------

# 31. Antigravity Multi-Agent Workflow

Once the repository is stable, use specialized subagents.

Example:

``` text
                 Product Architect
                        |
                Implementation Plan
                        |
       +----------------+----------------+
       |                |                |
 Chess Domain       UI Engineer     Test Engineer
       |                |                |
       +----------------+----------------+
                        |
                 Integration Agent
                        |
                  Reviewer Agent
                        |
                    Human Review
```

Recommended sequence:

1.  Architect creates plan.
2.  Domain agent implements core behavior.
3.  UI agent implements presentation.
4.  Test agent creates/extends tests.
5.  Integration agent wires modules together.
6.  Reviewer agent audits the changes.
7.  Human approves.
8.  CI verifies.
9.  Merge.

Do not allow all agents to independently redesign architecture.

------------------------------------------------------------------------

# 32. Agent Prompt Template

Use this template for almost every task:

``` text
You are working on ChessForge.

ROLE:
<specialized role>

TASK:
<one specific task>

CONTEXT:
<relevant architecture>

CONSTRAINTS:
- Do not modify unrelated files.
- Preserve existing architecture.
- Do not bypass tests.
- Do not introduce dependencies without justification.
- Keep domain logic independent of UI.
- Follow AGENTS.md.

ACCEPTANCE CRITERIA:
1. ...
2. ...
3. ...

TEST REQUIREMENTS:
- Add/update tests for ...
- Run ...
- Report failures honestly.

DELIVERABLE:
- implementation
- tests
- short summary
- known limitations

Before changing files, inspect the existing implementation and explain your plan.
After changing files, run verification commands.
```

------------------------------------------------------------------------

# 33. Antigravity Task Decomposition

Do not send:

``` text
Build the entire chess application.
```

Instead send tasks such as:

``` text
Create the chess domain adapter.
```

Then:

``` text
Add legal move tests.
```

Then:

``` text
Add board rendering.
```

Then:

``` text
Connect board clicks to domain move execution.
```

Then:

``` text
Add Stockfish worker.
```

Then:

``` text
Add Human vs Computer game flow.
```

Then:

``` text
Add clocks.
```

This reduces hallucinated architecture and makes failures recoverable.

------------------------------------------------------------------------

# 34. Definition of Done

A feature is not done when the code exists.

A feature is done when:

``` text
[ ] Requirements are clear
[ ] Implementation exists
[ ] Unit tests exist
[ ] Integration tests exist where needed
[ ] UI behavior is verified
[ ] Error cases are handled
[ ] No type errors
[ ] No lint errors
[ ] Relevant tests pass
[ ] Documentation is updated
[ ] No unrelated files changed
[ ] Code has been reviewed
[ ] Git diff is understood
```

------------------------------------------------------------------------

# 35. Milestone Plan

## Milestone 1: Skeleton

Deliver:

-   Tauri app
-   React app
-   CI
-   Testing
-   AGENTS.md

Result:

``` text
Empty Windows desktop application
```

------------------------------------------------------------------------

## Milestone 2: Playable Local Chess

Deliver:

-   Chess domain
-   Board
-   Legal moves
-   Move history
-   Check/checkmate
-   Promotion
-   Castling
-   En passant

Result:

``` text
Two humans can play a complete legal chess game.
```

This is the first major victory.

------------------------------------------------------------------------

## Milestone 3: Computer Opponent

Deliver:

-   Stockfish
-   Worker
-   Difficulty
-   Human vs Computer

Result:

``` text
User can play against AI.
```

------------------------------------------------------------------------

## Milestone 4: Product Experience

Deliver:

-   Clocks
-   Settings
-   Themes
-   Audio
-   Animations
-   PGN/FEN
-   Persistence

Result:

``` text
Feels like a real desktop chess application.
```

------------------------------------------------------------------------

## Milestone 5: Quality Gate

Deliver:

-   Full automated suite
-   Regression suite
-   Property tests
-   Visual tests
-   Performance checks
-   Security review

Result:

``` text
Release candidate.
```

------------------------------------------------------------------------

## Milestone 6: Windows Release

Deliver:

-   Installer
-   Versioning
-   GitHub release
-   Checksums
-   Release documentation
-   Clean-machine validation

Result:

``` text
ChessForge v1.0
```

------------------------------------------------------------------------

# 36. Suggested Execution Order

Follow this exact order unless a technical discovery proves otherwise:

``` text
01. Product requirements
02. Architecture
03. Repository bootstrap
04. CI
05. AGENTS.md
06. Chess domain adapter
07. Chess domain tests
08. Board UI
09. Human vs Human
10. Move history
11. Game status
12. Promotion UX
13. FEN/PGN
14. Persistence
15. Stockfish worker
16. Human vs Computer
17. Difficulty settings
18. Game clocks
19. Settings
20. Audio
21. Animations
22. Error handling
23. Accessibility
24. E2E tests
25. Property tests
26. Mutation testing
27. Performance testing
28. Security review
29. Windows packaging
30. Clean-machine installation testing
31. Release candidate
32. v1.0 release
```

------------------------------------------------------------------------

# 37. What NOT to Build Initially

Avoid feature creep.

Do not start with:

-   Online multiplayer
-   User accounts
-   Chat
-   Friends
-   Leaderboards
-   Tournaments
-   Cloud database
-   Payments
-   Social features
-   Opening database
-   Puzzle marketplace
-   AI explanations
-   Cloud engine
-   Mobile app

These are excellent v2/v3 features.

The first objective is:

> Make offline chess extremely reliable and pleasant.

------------------------------------------------------------------------

# 38. V2 Roadmap

After v1 is stable:

### Analysis

-   Engine evaluation bar
-   Best move
-   Blunder detection
-   Mistake detection
-   Move annotations

### Opening

-   Opening name detection
-   Opening explorer
-   Opening statistics

### Training

-   Puzzle mode
-   Daily puzzle
-   Tactical themes
-   Endgame trainer

### Multiplayer

``` text
Client
  |
  v
WebSocket
  |
  v
Game Server
  |
  +--> matchmaking
  +--> game state
  +--> clocks
  +--> reconnection
```

Do not retrofit online multiplayer into the offline domain model
blindly. Keep the game domain deterministic and transport-independent.

------------------------------------------------------------------------

# 39. V3 Vision

Potential long-term architecture:

``` text
                   ChessForge Platform
                           |
        +------------------+------------------+
        |                  |                  |
     Desktop             Web               Mobile
        |                  |                  |
        +------------------+------------------+
                           |
                       Game Core
                           |
          +----------------+----------------+
          |                |                |
       Offline          Online          Analysis
          |                |                |
      Stockfish        Server Engine     Cloud AI
```

The core chess domain should remain reusable.

------------------------------------------------------------------------

# 40. AI-Assisted Development Rules

Use AI aggressively for:

-   Boilerplate
-   Test generation
-   Refactoring
-   Documentation
-   CI configuration
-   UI iterations
-   Test-case enumeration
-   Regression analysis
-   Code review
-   Dependency research
-   Performance investigation

Use human judgment heavily for:

-   Architecture
-   Security
-   Chess-rule correctness
-   Product scope
-   Dependency selection
-   Release decisions
-   Data/privacy decisions

The AI should generate code.

The human should own the system.

------------------------------------------------------------------------

# 41. Recommended Antigravity Session Pattern

For every major session:

### Step 1: Orient

Ask:

``` text
Inspect the repository and summarize:
- architecture
- current milestone
- incomplete work
- failing tests
- risks
- recommended next task
Do not modify files.
```

### Step 2: Plan

Ask:

``` text
Create an implementation plan for <task>.
Do not modify code yet.
Identify files that will change and tests required.
```

### Step 3: Implement

Ask:

``` text
Implement the approved plan.
Keep the change focused.
```

### Step 4: Verify

Ask:

``` text
Run the relevant tests, lint, typecheck and build.
Investigate failures rather than suppressing them.
```

### Step 5: Review

Ask:

``` text
Review the git diff as a senior engineer.
Look for:
- bugs
- architecture violations
- security issues
- unnecessary complexity
- missing tests
- regression risks
```

### Step 6: Commit

Only after human review:

``` text
Create a focused git commit for the completed task.
```

------------------------------------------------------------------------

# 42. First 10 Antigravity Prompts

## Prompt 1: Architecture

``` text
Act as Product Architect.

Inspect this repository.

Design the architecture for a Windows desktop chess application using Tauri, React and TypeScript with Stockfish WASM.

Do not write implementation code.

Produce:
- architecture
- module boundaries
- data flow
- testing strategy
- security considerations
- risks

Wait for approval.
```

## Prompt 2: Bootstrap

``` text
Bootstrap the approved Tauri + React + TypeScript project.

Add testing, linting, type checking, CI and AGENTS.md.

Verify everything works.
```

## Prompt 3: Chess Domain

``` text
Implement the chess domain adapter using the selected chess rules library.

Keep it independent from React.

Add comprehensive rule tests.
```

## Prompt 4: Board

``` text
Implement the chessboard UI.

Connect all move execution through the domain layer.

Do not implement chess rules inside components.
```

## Prompt 5: Game Controller

``` text
Implement the game controller connecting:
board -> domain -> state -> move history.

Add integration tests.
```

## Prompt 6: PGN/FEN

``` text
Implement robust PGN and FEN import/export.

Add malformed-input tests.
```

## Prompt 7: Engine

``` text
Implement Stockfish through a Web Worker.

Guarantee that engine calculations never block the UI.

Add lifecycle and stale-response tests.
```

## Prompt 8: Clocks

``` text
Implement chess clocks using elapsed timestamps rather than render-loop decrementing.

Add deterministic clock tests.
```

## Prompt 9: QA

``` text
Act as a senior SDET.

Inspect the current application.

Create a complete test matrix for:
- chess rules
- UI
- engine
- persistence
- clocks
- error handling
- accessibility
- Windows packaging

Implement the highest-value missing tests.
```

## Prompt 10: Release

``` text
Act as Release Engineer.

Prepare ChessForge for Windows v1.0.

Verify:
- lint
- typecheck
- unit tests
- integration tests
- E2E tests
- production build
- Windows installer
- clean-machine installation

Do not declare release readiness until every required gate passes.
```

------------------------------------------------------------------------

# 43. Final Release Checklist

## Product

-   [ ] MVP requirements satisfied
-   [ ] Human vs Human works
-   [ ] Human vs Computer works
-   [ ] All major chess rules verified
-   [ ] Clocks work
-   [ ] PGN works
-   [ ] FEN works
-   [ ] Settings work
-   [ ] Error states are understandable

## Engineering

-   [ ] TypeScript strict mode enabled
-   [ ] No known type errors
-   [ ] No known lint errors
-   [ ] Unit suite passes
-   [ ] Integration suite passes
-   [ ] E2E smoke suite passes
-   [ ] Engine worker verified
-   [ ] No stale engine responses
-   [ ] No obvious memory leaks
-   [ ] Performance acceptable

## Security

-   [ ] Tauri permissions reviewed
-   [ ] File access minimized
-   [ ] No secrets committed
-   [ ] Dependencies reviewed
-   [ ] Native commands minimized
-   [ ] Import paths validated

## Release

-   [ ] Version updated
-   [ ] Changelog updated
-   [ ] Windows installer generated
-   [ ] Installer tested
-   [ ] Upgrade tested
-   [ ] Uninstall tested
-   [ ] Checksums generated
-   [ ] GitHub release prepared

------------------------------------------------------------------------

# 44. The Golden Rule

The project should evolve like this:

``` text
Specification
      |
      v
Architecture
      |
      v
Small Task
      |
      v
Agent Plan
      |
      v
Implementation
      |
      v
Automated Verification
      |
      v
Human Review
      |
      v
Commit
      |
      v
Next Task
```

Not:

``` text
"Build me a chess game"
        |
        v
       AI
        |
        v
  30,000 lines of code
        |
        v
      Panic
```

The first approach turns Antigravity into a disciplined AI engineering
team.

The second turns it into a very fast keyboard with opinions.

------------------------------------------------------------------------

# 45. Definition of Success

ChessForge v1 is successful when a user can install it on a clean
Windows machine, launch it, start a game within seconds, play a complete
legal chess game against another human or Stockfish, save/load the game,
and close the application without losing state.

More importantly, the codebase should be healthy enough that adding the
next feature does not require rebuilding the foundation.

Build the chessboard first.

Build the product second.

Build the platform third.
