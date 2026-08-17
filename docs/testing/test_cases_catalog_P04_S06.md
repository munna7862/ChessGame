# Test Cases Catalog: Phase 04 · Sprint 06 (Board Accessibility and Visual States)

This catalog defines the test requirements, invariants, positive/negative/boundary test scenarios, and quality gate criteria for **Board Accessibility, 2D Grid Spatial Navigation, ARIA Live Announcements, Non-Color Visual Indicators, High-Contrast Modes, and Reduced Motion** in **ChessForge**.

---

## 1. Test Coverage Matrix

| Test ID        | Category      | Description                                               | Target Component / Service             | Invariant / Rule                                             |
| :------------- | :------------ | :-------------------------------------------------------- | :------------------------------------- | :----------------------------------------------------------- |
| **TC-A11Y-01** | Positive      | Roving tabindex initialization (single tab stop at e2/e7) | `Board.tsx`, `Square.tsx`              | Exactly 1 square has `tabIndex={0}`, 63 have `tabIndex={-1}` |
| **TC-A11Y-02** | Positive      | ArrowUp / ArrowDown navigation in White perspective       | `Board.tsx`, `useBoardInteraction.ts`  | $r \pm 1$ rank navigation with DOM focus shift               |
| **TC-A11Y-03** | Positive      | ArrowLeft / ArrowRight navigation in White perspective    | `Board.tsx`, `useBoardInteraction.ts`  | $f \pm 1$ file navigation with DOM focus shift               |
| **TC-A11Y-04** | Positive      | Arrow navigation inverted in Black perspective            | `Board.tsx`, `useBoardInteraction.ts`  | Inverted spatial direction matching flipped board            |
| **TC-A11Y-05** | Boundary      | Edge boundary clamping on all four sides                  | `Board.tsx`, `coordinates.ts`          | Clamps at ranks 1/8 and files a/h without error              |
| **TC-A11Y-06** | Positive      | Home & End key rank navigation                            | `Board.tsx`, `useBoardInteraction.ts`  | Jumps to file a/h of current rank                            |
| **TC-A11Y-07** | Positive      | PageUp & PageDown key file navigation                     | `Board.tsx`, `useBoardInteraction.ts`  | Jumps to rank 8/1 of current file                            |
| **TC-A11Y-08** | Positive      | Home/End/PageUp/PageDown in Black perspective             | `Board.tsx`, `useBoardInteraction.ts`  | Orientation-aware rank/file jumps                            |
| **TC-A11Y-09** | Positive      | Enter / Space piece selection                             | `Square.tsx`, `useBoardInteraction.ts` | Selects friendly piece & computes legal moves                |
| **TC-A11Y-10** | Positive      | Enter / Space move execution to legal destination         | `Square.tsx`, `useBoardInteraction.ts` | Commits move, updates last move, focuses target              |
| **TC-A11Y-11** | Positive      | Escape key clears selection                               | `Board.tsx`, `useBoardInteraction.ts`  | Clears selection state, preserves focus                      |
| **TC-A11Y-12** | Positive      | Escape key cancels promotion modal                        | `PromotionDialog.tsx`, `Board.tsx`     | Dismisses dialog without move mutation                       |
| **TC-A11Y-13** | Positive      | ARIA Live announcement on piece selection                 | `Board.tsx`, `LiveAnnouncer`           | Announces piece type, square, and move count                 |
| **TC-A11Y-14** | Positive      | ARIA Live announcement on move execution & capture        | `Board.tsx`, `LiveAnnouncer`           | Announces move from, to, capture, check state                |
| **TC-A11Y-15** | Positive      | ARIA Live announcement on selection clear                 | `Board.tsx`, `LiveAnnouncer`           | Announces "Selection cleared"                                |
| **TC-A11Y-16** | Positive      | ARIA Live announcement on board flip                      | `Board.tsx`, `LiveAnnouncer`           | Announces board orientation change                           |
| **TC-A11Y-17** | Visual        | Check and checkmate non-color SVG badge rendering         | `Square.tsx`, `Board.css`              | Distinct SVG icons for check vs checkmate                    |
| **TC-A11Y-18** | Visual        | Quiet move dot vs Capture ring non-color geometry         | `Square.tsx`, `Board.css`              | 28% filled circle vs outer ring & corner notch               |
| **TC-A11Y-19** | Accessibility | High contrast mode styles (`forced-colors`)               | `Board.css`, `Square.tsx`              | System color tokens for borders, focus, badges               |
| **TC-A11Y-20** | Accessibility | Reduced motion enforcement across all animations          | `Board.css`, `useReducedMotion.ts`     | 0.001ms duration / disabled transitions                      |
| **TC-A11Y-21** | Property      | Generative property fuzzing for navigation invariants     | `accessibilityInvariants.test.tsx`     | Roving tabindex integrity across 100+ random keystrokes      |

---

## 2. Test Execution & Quality Gate Criteria

1. **Unit & Integration Automation:** 100% pass across all existing (339 tests) and new accessibility suites in `npm test`.
2. **Type Safety & Linting:** 0 errors, 0 warnings across `npm run typecheck`, `npm run lint`, `npm run format:check`.
3. **E2E Validation:** Full keyboard playout flow verified in Playwright desktop tests (`accessibility.spec.ts`).
4. **No Flakiness:** Zero arbitrary sleep timeouts; deterministic event and timer testing.
