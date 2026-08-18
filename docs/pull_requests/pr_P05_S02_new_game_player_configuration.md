# Pull Request: Phase 05 · Sprint 02 - New Game and Player Configuration

## Pull Request Information

- **Sprint:** Phase 05 · Sprint 02: New Game and Player Configuration
- **Branch:** `feature/p05-s02-new-game-player-configuration`
- **Target Branch:** `main`

---

## 1. Summary of Changes

This pull request introduces the **New Game Setup Dialog, Player Configuration Model, Active Player Panels, and Custom Position Initializer** for **ChessForge**, completing the user flow for creating and customizing Human vs Human and Human vs Engine game sessions:

1. **Player Configuration Model & Resolver (`src/features/game/types.ts`):**
   - Added `PlayerColorChoice` (`'w' | 'b' | 'random'`), `NewGameConfigOptions`, and `ResolvedNewGameSession` types and Zod schemas.
   - Implemented `resolveNewGameSession()` helper with support for deterministic random color resolution and name trimming (1-32 characters max).
   - Prepared engine player typing (`type: 'engine'`) for future Stockfish WASM integration without domain coupling.

2. **New Game Setup Modal (`src/features/game/NewGameModal.tsx`, `src/features/game/NewGameModal.css`):**
   - Built accessible modal dialog (`role="dialog"`, `aria-modal="true"`, `aria-labelledby="new-game-title"`) with keyboard focus trapping and `Escape` key dismissal.
   - Provided game mode selector ("Human vs Human", "vs Computer"), player name inputs, color selector, and custom starting FEN position loader with live FEN validation.

3. **Active Player Panels (`src/features/game/PlayerPanel.tsx`, `src/features/game/PlayerPanel.css`):**
   - Implemented top and bottom player metadata cards displaying player name, color avatar, player type badge ("Human" / "AI"), rating (if provided), active turn glow, in-check indicator, and captured pieces.

4. **App & Session Integration (`src/App.tsx`):**
   - Integrated `NewGameModal` with the "New Game" button, replacing simple reset with full setup dialog.
   - Connected `PlayerPanel` components dynamically synced with board orientation (`w` or `b` perspective).

5. **Test Automation & Quality Assurance:**
   - Authored `NewGameModal.test.tsx`, `PlayerPanel.test.tsx`, and `playerConfig.test.ts` (including `fast-check` generative property fuzzing).
   - Added `tests/e2e/new-game.spec.ts` for Playwright end-to-end user flows.

---

## 2. Test Execution & Quality Gate Verification

| Quality Gate              | Command                | Result | Details                              |
| :------------------------ | :--------------------- | :----- | :----------------------------------- |
| **TypeScript Typecheck**  | `npm run typecheck`    | PASS   | 0 errors                             |
| **ESLint Linter**         | `npm run lint`         | PASS   | 0 errors, 0 warnings                 |
| **Prettier Formatting**   | `npm run format:check` | PASS   | 100% formatted                       |
| **Unit & Property Tests** | `npm test`             | PASS   | 391/391 tests passed across 41 files |
| **Desktop E2E Suite**     | `npm run test:e2e`     | PASS   | 25/25 Playwright tests passed        |
| **Production Build**      | `npm run build`        | PASS   | Bundle built in 1.51s                |

---

## 3. Sprint Definition of Done (DoD) Checklist

- [x] **Scope Complete:** New Game modal, player configuration, active player panels, and session reset implemented.
- [x] **100% Green Automation:** 391 unit/property tests and 25 E2E tests pass without skips.
- [x] **Clean Typecheck & Lint:** 0 type errors, 0 lint warnings, clean formatting.
- [x] **Security Audit Approved:** Least privilege preserved, input sanitization and schema validation verified.
- [x] **PO Acceptance Approved:** All product and UX acceptance criteria verified.
- [x] **Git Diff Clean:** Feature branch isolated, conventional commits applied.
