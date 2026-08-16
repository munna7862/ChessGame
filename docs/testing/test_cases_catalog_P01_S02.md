# Test Cases Catalog: UX Journeys & Information Architecture (Phase 01 · Sprint 02)

**Sprint:** `Phase 01 · Sprint 02: UX Journeys and Information Architecture`  
**Author:** SDET Architect  
**Status:** `Approved Test Baseline`  
**Target Platform:** Windows 10/11 x64 Desktop (Tauri v2 + React UI)  

---

## 1. Overview & Verification Strategy

This Test Cases Catalog establishes deterministic verification criteria for all primary user journeys, screen layouts, modal flows, keyboard interactions, state transitions, and error/recovery mechanisms defined in Sprint 02 before UI component implementation.

### Test Categories
1. **Journey Test Cases (TC-JRN):** Step-by-step validation of the 10 core UX user flows (Main Game Screen, New Game setup, Game-Over, Settings modal, FEN/PGN import/export, Session/Crash Recovery, Error/Empty states, Keyboard navigation, UI state transitions, and Screen layouts).
2. **State Transition Test Cases (TC-TRN):** Verification of formal UI state machine transitions, modal overlays, active vs. inactive controls, and concurrent event rejection.
3. **Boundary & Edge Test Cases (TC-BND):** Window resizing, rapid piece dragging, uncommitted modal dismissal, corrupted save payload recovery, and file dialog cancellations.
4. **Keyboard & Accessibility Test Cases (TC-A11Y):** Focus trap inside modals, Escape key dismissal, Spacebar/Enter move confirmation, ARIA roles, high-contrast readability, and non-blocking screen reader announcements.

---

## 2. Test Case Matrix

### 2.1 TC-JRN: User Journeys & Screen Flows

| Test Case ID | Feature Flow | Verification Objective | Input / Action | Expected Outcome | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-JRN-001` | Main Game Screen | Layout zoning & visual hierarchy | Launch application into default active game | UI cleanly renders Top Bar (menu, title, status), Left/Center Board Viewport with coordinate gutters and captured pieces, Right Sidebar (Move History table, Clocks, Evaluation Bar/Gauge, Control Actions). 0 horizontal scrolling at 1024x768 minimum resolution. | BLOCKING |
| `TC-JRN-002` | New Game Modal | Mode and time control configuration | Click "New Game" button from Top Bar or Sidebar | Modal opens with focus trap; offers Mode Selection (Human vs AI, Human vs Human), Color Selection (White, Black, Random), Difficulty Slider (Level 1-8 / 800-2800 ELO), Time Controls (None, 1m, 3m+2s, 5m+3s, 10m, Custom). Selecting "Start Game" resets board, initializes clocks, and closes modal. | BLOCKING |
| `TC-JRN-003` | Game-Over Flow | Modal dialog & game freeze | Play game to Checkmate / Stalemate / Clock Timeout / Resignation | Board immediately disables drag-and-drop; Game-Over modal or banner displays exact termination reason (e.g., "Checkmate - White Wins", "Draw by Stalemate", "Black wins on time"), final score, and actionable buttons: "New Game", "Rematch", "Export PGN", "Analyze". | BLOCKING |
| `TC-JRN-004` | Settings Modal | Preference configuration & persistence | Open Settings via gear icon or `Ctrl+,` | Displays Sound Effects toggle, Move Animation Speed (Off, Fast, Normal), Theme Selection (Dark Modern, Classic Wood, Slate Slate), Board Coordinates toggle, Engine Concurrency slider (1-4 threads), Hash Size (16-256 MB). Changes persist immediately to local storage snapshot without requiring restart. | BLOCKING |
| `TC-JRN-005` | FEN Import Flow | Custom position setup | Open "Import Position" -> Paste valid FEN -> Click "Load" | Valid FEN is parsed; board resets to specified position; turn indicator and castling rights match FEN; Move History clears and displays "[Custom Setup FEN]"; engine evaluates current position if AI mode active. | BLOCKING |
| `TC-JRN-006` | FEN Import Error | Malformed/Illegal FEN handling | Paste malformed FEN (e.g. invalid piece count, 2 kings, missing fields) | UI displays clear inline validation error (e.g., "Invalid FEN: Missing active color token"); board state is NOT mutated; user can fix string or cancel. | BLOCKING |
| `TC-JRN-007` | PGN Import Flow | Move history loading | Open "Import PGN" -> Paste standard PGN text or select file | Valid PGN moves are replayed sequentially into Domain; move list populates with SAN moves; board displays final move position; navigation buttons (`|<`, `<`, `>`, `>|`) become active for ply-by-ply review. | BLOCKING |
| `TC-JRN-008` | PGN Export Flow | File export & clipboard copy | Click "Export PGN" -> Select "Copy to Clipboard" or "Save to File" | Exports standard PGN compliant with Seven Tag Roster (Event, Site, Date, Round, White, Black, Result) and SAN move text; shows success toast confirmation; file picker triggers native OS save dialog on Windows. | BLOCKING |
| `TC-JRN-009` | Recovery Flow | Crash/Restart recovery | Close app or simulate unexpected termination during move 14, relaunch app | On startup, app checks local recovery snapshot; detects in-flight game; prompts or seamlessly restores exact board position, SAN move list, turn, elapsed clock times, and game mode with 0 data loss. | BLOCKING |
| `TC-JRN-010` | Empty & Error States | Empty move history & missing engine | 1. Start fresh game.<br>2. Simulate engine worker initialization failure. | 1. Move history displays subtle placeholder: "No moves played yet. White to move."<br>2. Engine failure displays non-blocking warning toast: "Engine offline. Playing in manual mode.", leaving Human vs Human playable. | BLOCKING |

---

### 2.2 TC-TRN: State Transitions & Navigation

| Test Case ID | Transition Scenario | From State | Trigger Event | To State | Validation Checks |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-TRN-001` | Modal Overlay Open | `GAMEPLAY_ACTIVE` | User clicks `New Game` | `MODAL_NEW_GAME` | Background dimmed, board interaction frozen, focus trapped in modal. |
| `TC-TRN-002` | Modal Dismissal (Cancel) | `MODAL_NEW_GAME` | User presses `Escape` or clicks `Cancel` | `GAMEPLAY_ACTIVE` | Modal closes, board interaction restored, previous game state untouched. |
| `TC-TRN-003` | Modal Submission (Start) | `MODAL_NEW_GAME` | User clicks `Start Game` | `GAMEPLAY_ACTIVE` (Reset) | Modal closes, new domain session created, clocks reset, move history cleared. |
| `TC-TRN-004` | Ply History Navigation | `GAMEPLAY_ACTIVE` | User clicks `<` (Previous Move) | `GAMEPLAY_REVIEW` | Board shows position at selected ply; legal move dragging disabled or shows return-to-live prompt; clocks paused. |
| `TC-TRN-005` | Return to Live Game | `GAMEPLAY_REVIEW` | User clicks `>|` (Latest Ply) or plays move | `GAMEPLAY_ACTIVE` | Board returns to active ply; piece dragging re-enabled; clocks resume. |
| `TC-TRN-006` | Game Termination | `GAMEPLAY_ACTIVE` | Checkmate / Resignation / Time Out | `GAMEPLAY_ENDED` | Game over banner/modal presented; clock halted; board drag-and-drop disabled; PGN export enabled. |

---

### 2.3 TC-A11Y & TC-KEY: Keyboard Navigation & Accessibility

| Test Case ID | Area | Interaction / Shortcut | Expected Result | Standard Reference |
| :--- | :--- | :--- | :--- | :--- |
| `TC-KEY-001` | Global Shortcuts | `Ctrl+N` | Triggers "New Game" modal from anywhere in application. | Desktop Ergonomics |
| `TC-KEY-002` | Global Shortcuts | `Ctrl+Z` / `u` | Requests move undo (with confirmation if AI thinking or in strict mode). | Desktop Ergonomics |
| `TC-KEY-003` | Global Shortcuts | `Ctrl+F` / `f` | Flips board orientation (White on bottom $\leftrightarrow$ Black on bottom). | Ergonomics |
| `TC-KEY-004` | History Navigation | `Left Arrow` / `Right Arrow` | Steps backward / forward through move history plies. | Navigation |
| `TC-KEY-005` | History Navigation | `Home` / `End` | Jumps to initial starting position / latest live position. | Navigation |
| `TC-KEY-006` | Modal Accessibility | `Escape` | Closes any active modal/dialog without applying uncommitted changes. | WCAG 2.1 (2.1.2) |
| `TC-KEY-007` | Modal Accessibility | `Tab` / `Shift+Tab` | Cycles focus through modal interactive elements in logical order with visible focus ring. | WCAG 2.1 (2.4.3, 2.4.7) |
| `TC-A11Y-001` | Board Accessibility | Square Selection via Keyboard | `Arrow keys` move cursor square-to-square; `Space`/`Enter` selects piece; target square `Enter` executes move. | WCAG 2.1 (2.1.1) |
| `TC-A11Y-002` | Color Contrast | Dark & Light Themes | Text-to-background contrast ratio $\ge 4.5:1$ for all labels, timers, and notation badges. | WCAG 2.1 (1.4.3 AA) |
| `TC-A11Y-003` | Screen Reader ARIA | Move Announcements | Live region (`aria-live="polite"`) announces "e4, White pawn to e4", "Check", "Checkmate". | WCAG 2.1 (4.1.3) |

---

## 3. SDET Quality Gate Acceptance Criteria

1. **Completeness:** All 10 granular UX flows from the Sprint 02 scope must have explicit start states, user actions, UI reactions, and termination states documented in `docs/ux-journeys.md`.
2. **State Machine Rigor:** All UI states and transitions must be mapped in `docs/ux-state-map.md` with zero orphan states and zero unhandled dead ends.
3. **Accessibility Baseline:** Keyboard shortcuts and focus trapping rules must be unambiguously defined for every modal and board interaction.
4. **Resilience & Error Handling:** Error states for illegal FEN, malformed PGN, engine crashes, and unexpected restarts must specify exact UI representations (banners, toasts, inline alerts).
