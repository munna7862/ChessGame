# Test Cases Catalog: Phase 05 · Sprint 01 (Game Session State)

This catalog defines the test requirements, domain invariants, positive/negative/boundary test scenarios, and quality gate criteria for **Game Session State, Game Controller / Service, Domain-UI Wiring, Move Event Routing, Status Propagation, and Clean Reset** in **ChessForge**.

---

## 1. Test Coverage Matrix

| Test ID      | Category      | Description                                                     | Target Component / Service                 | Invariant / Rule                                                               |
| :----------- | :------------ | :-------------------------------------------------------------- | :----------------------------------------- | :----------------------------------------------------------------------------- |
| **TC-GS-01** | Positive      | Initial GameSession default state creation                      | `GameSessionController` / `useGameSession` | Starts with standard FEN, turn='w', empty history, empty captures, in_progress |
| **TC-GS-02** | Positive      | Legal move execution & state transition                         | `GameSessionController`                    | Commits move, flips turn ('w' -> 'b'), records SAN in move history             |
| **TC-GS-03** | Positive      | Capture move execution & captured piece tracking                | `GameSessionController`                    | Adds captured piece to opponent's captured pieces list & records SAN           |
| **TC-GS-04** | Positive      | Pawn promotion move execution                                   | `GameSessionController`                    | Executes promotion with specified piece ('q','r','b','n'), updates FEN         |
| **TC-GS-05** | Negative      | Illegal move rejection without state corruption                 | `GameSessionController`                    | Returns failure/error, preserves exact board position, turn, & history         |
| **TC-GS-06** | Invariant     | Check state detection and propagation                           | `GameSessionController`                    | Exposes `isCheck: true`, identifies checked king square accurately             |
| **TC-GS-07** | Invariant     | Checkmate terminal state handling                               | `GameSessionController`                    | Exposes `isCheckmate: true`, `isGameOver: true`, identifies winner             |
| **TC-GS-08** | Invariant     | Move dispatch rejection on terminal game states                 | `GameSessionController`                    | Disallows further moves after checkmate / stalemate / draw / resign            |
| **TC-GS-09** | Positive      | Clean game session reset                                        | `GameSessionController`                    | Atomically clears history, captures, resets starting position & status         |
| **TC-GS-10** | Positive      | Custom starting configuration & player metadata                 | `GameSessionController`                    | Supports custom player names, player types ('human'), and game metadata        |
| **TC-GS-11** | Isolation     | Transient UI state separation                                   | `useGameSession` / `Board`                 | Square selection / dialogs do not mutate domain position or history            |
| **TC-GS-12** | Integration   | GameSession wiring with Board UI and App status indicators      | `App.tsx`, `Board.tsx`                     | UI reflects turn, check badge, last move, legal move dots, reset button        |
| **TC-GS-13** | E2E / Playout | Scholar's Mate full game sequence execution                     | `gameSession.test.ts`, `App.test.tsx`      | 1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7# reaches checkmate & captures           |
| **TC-GS-14** | Property      | Generative property fuzzing for session invariants (fast-check) | `gameSessionInvariants.test.ts`            | History length matches moves made; FEN matches replay; captures match          |

---

## 2. Test Execution & Quality Gate Criteria

1. **Unit & Integration Automation:** 100% pass across all existing test suites and new Game Session suites in `npm test`.
2. **Type Safety & Linting:** 0 errors, 0 warnings across `npm run typecheck`, `npm run lint`, `npm run format:check`.
3. **E2E Validation:** Full application flow verified in Playwright desktop tests (`npm run test:e2e`).
4. **No Flakiness:** Zero arbitrary sleep timeouts; deterministic event and timer testing.

**SDET Sign-off:** APPROVED for Dev Implementation.
