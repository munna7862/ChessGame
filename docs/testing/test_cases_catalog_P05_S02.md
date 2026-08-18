# Test Cases Catalog: Phase 05 · Sprint 02 (New Game and Player Configuration)

This catalog defines the test requirements, domain invariants, positive/negative/boundary test scenarios, and quality gate criteria for **New Game Dialog, Player Configuration, Color Assignment, Active Players Display, and Session Initialization** in **ChessForge**.

---

## 1. Test Coverage Matrix

| Test ID      | Category        | Description                                                        | Target Component / Module                | Invariant / Rule                                                                       |
| :----------- | :-------------- | :----------------------------------------------------------------- | :--------------------------------------- | :------------------------------------------------------------------------------------- |
| **TC-NG-01** | Positive        | Trigger New Game dialog from UI button                             | `App.tsx` / `NewGameModal.tsx`           | Opens accessible dialog with `role="dialog"`, `aria-modal="true"`, focus trap          |
| **TC-NG-02** | Positive        | Form initialization with default values                            | `NewGameModal.tsx`                       | Defaults: Mode = Human vs Human, Player 1 = "White", Player 2 = "Black", Color = White |
| **TC-NG-03** | Positive        | Configure custom player names                                      | `NewGameModal.tsx` / `GameSession`       | Submits trimmed names ("Alice", "Bob"), initializes session `players.w` & `players.b`  |
| **TC-NG-04** | Positive        | Color selection - Black assignment                                 | `NewGameModal.tsx` / `App.tsx`           | Player 1 assigned Black, Player 2 assigned White, board orientation set to Black       |
| **TC-NG-05** | Positive        | Color selection - Random assignment                                | `NewGameModal.tsx` / `GameSession`       | Random choice resolves to either 'w' or 'b', assigned deterministically in session     |
| **TC-NG-06** | Positive        | Game mode selection - Human vs Human                               | `NewGameModal.tsx` / `GameSession`       | Both players assigned `type: 'human'`                                                  |
| **TC-NG-07** | Positive        | Game mode selection - Human vs Engine (AI placeholder)             | `NewGameModal.tsx` / `GameSession`       | Human player assigned `type: 'human'`, Opponent assigned `type: 'engine'`              |
| **TC-NG-08** | Negative        | Player name empty / whitespace validation                          | `NewGameModal.tsx`                       | Whitespace-only names fall back to default ("White"/"Black") or show validation        |
| **TC-NG-09** | Boundary        | Player name length boundary (1 to 32 chars)                        | `NewGameModal.tsx`                       | Enforces 32-character maximum, trims whitespace                                        |
| **TC-NG-10** | Negative        | Custom starting FEN validation - invalid FEN                       | `NewGameModal.tsx` / `ChessPort`         | Shows validation error, rejects invalid FEN syntax or illegal position                 |
| **TC-NG-11** | Positive        | Custom starting FEN validation - valid position                    | `NewGameModal.tsx` / `GameSession`       | Initializes game session from custom position, resets move history                     |
| **TC-NG-12** | Positive        | Dialog cancellation & dismissal                                    | `NewGameModal.tsx` / `App.tsx`           | Closes modal on Cancel button or `Escape` key without mutating current session         |
| **TC-NG-13** | Positive / UI   | Active Player Panel metadata rendering                             | `PlayerPanel.tsx`                        | Renders White & Black player cards, type badges, ratings, active turn highlight        |
| **TC-NG-14** | Integration     | Complete New Game workflow and session reset                       | `App.tsx`, `NewGameModal`, `PlayerPanel` | Clears board selection, resets moves, sets orientation, updates player banners         |
| **TC-NG-15** | Accessibility   | Modal focus trap, ARIA attributes, and keyboard escape             | `NewGameModal.tsx`                       | Focus trapped in dialog when open, restores previous focus on close, Esc exits         |
| **TC-NG-16** | Property / Fuzz | Generative property fuzzing for player config schemas (fast-check) | `playerConfig.test.ts`                   | Fuzzes names, modes, colors; validates schema invariants & session creation            |

---

## 2. Quality Gate & Acceptance Criteria

1. **Unit & Property Automation:** 100% pass across all existing test suites and new NewGameModal / PlayerPanel / PlayerConfig suites in `Vitest`.
2. **Component Integration:** `@testing-library/react` tests verify dialog interactions, focus handling, form validation, and player panel rendering.
3. **E2E Playwright Automation:** `npm run test:e2e` verifies the end-to-end New Game creation and playout flow.
4. **Type Safety & Linting:** `npm run typecheck`, `npm run lint`, and `npm run format:check` pass with 0 errors/warnings.
5. **Desktop Packaging & Build:** `npm run build` succeeds cleanly.

**SDET Sign-off:** APPROVED for Dev Implementation.
