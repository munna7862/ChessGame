# Test Cases Catalog - Phase 10 · Sprint 07

**Sprint Focus:** Release Candidate Build and Clean-Machine Validation  
**Document ID:** `TC-P10-S07`  
**Author:** SDET Architect  
**Related Documents:**

- [`P10-S07 Sprint Spec`](file:///c:/Workspace/ChessGame/planning/sprints/P10-S07-release-candidate-build-and-clean-machine-validation.md)
- [`Phase 10 Plan`](file:///c:/Workspace/ChessGame/planning/phases/10-phase-quality-engineering-release-candidate.md)
- [`QA Matrix`](file:///c:/Workspace/ChessGame/docs/qa-matrix.md)
- [`Testing Strategy`](file:///c:/Workspace/ChessGame/docs/testing-strategy.md)

---

## 1. Overview & Objectives

Sprint P10-S07 validates the final Release Candidate (RC) build of ChessForge under clean-machine and production distribution conditions. This ensures that:

1. Production bundle assets and installer configurations are fully hermetic, self-contained, and free of dev-only artifacts.
2. The application launches seamlessly in pristine environments without preexisting storage or cached assets.
3. All critical user workflows (Human vs Human, Human vs Computer, Persistence, PGN/FEN interchange, and Clean Uninstall) operate flawlessly with zero release-blocking defects.

---

## 2. Test Cases Catalog

### 2.1 Release Candidate Packaging & Build Verification

| Test Case ID | Title                                         | Description                                                                                                                                                                | Expected Result                                                                                               | Priority |
| :----------- | :-------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ | :------- |
| **TC-RC-01** | Production Bundle & Asset Verification        | Verify Vite production build produces valid static bundle (`dist/index.html`, hashed JS/CSS assets, Stockfish WASM/worker scripts, asset manifest).                        | Build exits with code 0; all required assets are present in `dist/` with valid sizes and zero missing chunks. | `P0`     |
| **TC-RC-02** | Tauri Release Configuration & Bundle Metadata | Validate `src-tauri/tauri.conf.json` bundle settings (product name `ChessForge`, identifier `com.chessforge.app`, version `0.1.0`, icons list, CSP restrictions, targets). | Config matches release specifications; window dimensions and security headers are locked.                     | `P0`     |
| **TC-RC-03** | Zero Development Artifact Leaks               | Verify production output contains no source maps in release bundles, no `console.debug` dev hooks, and no hardcoded dev server URLs.                                       | Bundle is sanitized and optimized for end-user distribution.                                                  | `P0`     |

### 2.2 Clean-Machine Environment & Cold Launch

| Test Case ID | Title                               | Description                                                                                                                                        | Expected Result                                                                                                             | Priority |
| :----------- | :---------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- | :------- |
| **TC-RC-04** | Pristine Environment Cold Start     | Simulate a clean machine with empty `localStorage`, unpopulated database, and no cached game sessions. Launch application.                         | App initializes with default FIDE starting position, standard settings, White to move, clocks initialized, and engine idle. | `P0`     |
| **TC-RC-05** | UI Layout & Viewport Initialization | Verify default desktop window sizing (1200x800, min 800x600) and responsive layout of board, navigation, clocks, move history, and control panels. | Layout renders without clipping, horizontal scrollbars, or element overlap.                                                 | `P1`     |
| **TC-RC-06** | Engine Worker Spawn in Production   | Verify Stockfish WASM WebWorker initializes correctly from local production bundle path without remote CDN requests.                               | Worker spawns, answers `isready` / `uci` handshake within 500ms, and transitions to ready state.                            | `P0`     |

### 2.3 Core Workflow Validation (Clean Machine)

| Test Case ID | Title                                                       | Description                                                                                                                                                                             | Expected Result                                                                                                      | Priority |
| :----------- | :---------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- | :------- |
| **TC-RC-07** | Human vs Human Match Workflow                               | Execute full HvH game playout (e.g. Scholar's Mate / Fool's Mate) on a clean environment, verifying move generation, highlights, clock countdown, turn switching, and checkmate dialog. | Game progresses accurately; board displays game over banner; move list contains valid SAN notation.                  | `P0`     |
| **TC-RC-08** | Human vs Computer Match Workflow                            | Start game against Stockfish engine across selectable skill levels (1-8). Make opening moves and verify engine responds with legal moves.                                               | Engine computes and returns legal move; UI updates smoothly without blocking rendering loop; evaluation bar updates. | `P0`     |
| **TC-RC-09** | Special FIDE Moves (Castling, En Passant, Promotion)        | Execute queenside/kingside castling, en passant capture, and pawn promotion on clean environment.                                                                                       | Moves execute with correct board updates, promotion modal allows piece selection, and FEN state reflects new rights. | `P0`     |
| **TC-RC-10** | Draw Conditions (Stalemate, Insufficient Material, 50-Move) | Load endgame positions and trigger draw conditions.                                                                                                                                     | App accurately detects and halts clock with draw announcement.                                                       | `P1`     |

### 2.4 Persistence, PGN/FEN Interchange & Recovery

| Test Case ID | Title                                    | Description                                                                                                                                | Expected Result                                                                                                              | Priority |
| :----------- | :--------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- | :------- |
| **TC-RC-11** | Clean Storage Session Persistence        | Play moves, simulate window close/relaunch, verify game state and move history recover identically.                                        | Full move tree, turn, clocks, and FEN are restored from storage snapshot.                                                    | `P0`     |
| **TC-RC-12** | Settings Persistence Across Relaunch     | Change theme, board coordinates, sound settings, and default engine difficulty. Relaunch application.                                      | Modified user preferences persist and apply immediately upon reload.                                                         | `P1`     |
| **TC-RC-13** | PGN Export & Import Interchange          | Export active game to PGN, copy to clipboard, reset game, import PGN back into application.                                                | Game state and move history parse back with 100% fidelity.                                                                   | `P0`     |
| **TC-RC-14** | FEN Custom Position Loading & Validation | Input standard and custom valid FEN strings via dialog; verify illegal FEN strings are gracefully rejected with user-facing error message. | Valid positions load cleanly; invalid FEN strings display error without application crash.                                   | `P0`     |
| **TC-RC-15** | Corrupt Storage Graceful Recovery        | Inject corrupt/malformed JSON into `localStorage` keys and launch app.                                                                     | App detects invalid schema, logs structured warning, falls back to safe default state without throwing unhandled exceptions. | `P0`     |

### 2.5 Clean Uninstall & Teardown

| Test Case ID | Title                                 | Description                                       | Expected Result                                                                         | Priority |
| :----------- | :------------------------------------ | :------------------------------------------------ | :-------------------------------------------------------------------------------------- | :------- |
| **TC-RC-16** | Storage Wipe / Reset Application Data | Trigger application reset / clear storage action. | All local storage, game caches, and custom settings reset cleanly to factory defaults.  | `P0`     |
| **TC-RC-17** | Process & Worker Teardown             | Terminate application window / dispose session.   | All WebWorkers (Stockfish) and background timers are killed; 0 orphan processes remain. | `P0`     |

---

## 3. Automation Quality Gate Matrix

| Gate                         | Command                | Criteria                                   | Target   |
| :--------------------------- | :--------------------- | :----------------------------------------- | :------- |
| **Typecheck**                | `npm run typecheck`    | 0 TypeScript errors                        | **PASS** |
| **Lint**                     | `npm run lint`         | 0 ESLint errors & warnings                 | **PASS** |
| **Format**                   | `npm run format:check` | 100% Prettier compliance                   | **PASS** |
| **Unit & Integration Suite** | `npm test`             | 100% Green, 0 skips across all test suites | **PASS** |
| **E2E Automation Suite**     | `npm run test:e2e`     | 100% Green Playwright tests                | **PASS** |
| **Production Build**         | `npm run build`        | Clean Vite/TypeScript build without errors | **PASS** |
