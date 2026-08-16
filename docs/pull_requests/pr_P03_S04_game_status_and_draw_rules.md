# Pull Request: Phase 03 · Sprint 04 — Game Status & Draw Rules

## 1. Summary of Changes

This pull request implements authoritative game-status detection and FIDE draw rules for **ChessForge** v1:

- **Authoritative Status Calculation & Precedence:** Implemented deterministic evaluation covering `active` (normal and in-check), `checkmate`, `stalemate`, `draw_threefold_repetition`, `draw_fifty_moves`, `draw_insufficient_material`, `draw_agreement`, `resigned`, and `timeout`.
- **Status Precedence Hierarchy:** Established strict precedence order ensuring manual hooks (`resigned`, `timeout`) and decisive terminal outcomes (`checkmate`) override secondary draw conditions (e.g. 50-move clock exhaustion on mating ply).
- **FIDE Draw Rules Support:**
  - Automatic threefold repetition detection.
  - Automatic fifty-move rule detection (`halfmoveClock >= 100` plies).
  - Insufficient material matrix verification (K vs K, K+B vs K, K+N vs K, and K+B vs K+B same-color squares vs opposite-color squares).
- **Domain Hooks for Manual Outcomes:** Added `resign(player: Color)`, `timeout(player: Color)`, and `agreeDraw()` methods on `ChessGame` port and `ChessJsAdapter`.
- **Terminal Lock & Immutability:** Enforced that any terminal game state blocks subsequent move execution with `GAME_ALREADY_OVER` and returns empty legal moves (`[]`).
- **Comprehensive Test Pyramid Coverage:** Authored 33 new tests across 4 test suites (`gameStatus.test.ts`, `drawRules.test.ts`, `resignationTimeout.test.ts`, `statusPrecedence.test.ts`) including generative property-based fuzzing with `fast-check`.

---

## 2. Modified & Created Artifacts

- [`docs/chess/game_status_and_draw_invariants.md`](file:///c:/Workspace/ChessGame/docs/chess/game_status_and_draw_invariants.md)
- [`docs/testing/test_cases_catalog_P03_S04.md`](file:///c:/Workspace/ChessGame/docs/testing/test_cases_catalog_P03_S04.md)
- [`src/domain/chess/types.ts`](file:///c:/Workspace/ChessGame/src/domain/chess/types.ts)
- [`src/domain/chess/ports.ts`](file:///c:/Workspace/ChessGame/src/domain/chess/ports.ts)
- [`src/domain/chess/errors.ts`](file:///c:/Workspace/ChessGame/src/domain/chess/errors.ts)
- [`src/domain/chess/adapters/chessJsAdapter.ts`](file:///c:/Workspace/ChessGame/src/domain/chess/adapters/chessJsAdapter.ts)
- [`src/domain/chess/__tests__/gameStatus.test.ts`](file:///c:/Workspace/ChessGame/src/domain/chess/__tests__/gameStatus.test.ts)
- [`src/domain/chess/__tests__/drawRules.test.ts`](file:///c:/Workspace/ChessGame/src/domain/chess/__tests__/drawRules.test.ts)
- [`src/domain/chess/__tests__/resignationTimeout.test.ts`](file:///c:/Workspace/ChessGame/src/domain/chess/__tests__/resignationTimeout.test.ts)
- [`src/domain/chess/__tests__/statusPrecedence.test.ts`](file:///c:/Workspace/ChessGame/src/domain/chess/__tests__/statusPrecedence.test.ts)
- [`src/domain/chess/__tests__/specialMovesSan.test.ts`](file:///c:/Workspace/ChessGame/src/domain/chess/__tests__/specialMovesSan.test.ts)
- [`task.md`](file:///c:/Workspace/ChessGame/task.md)

---

## 3. Verification & Quality Gate Results

- **Unit & Property Tests (Vitest + fast-check):** 17/17 test files passed, 135/135 tests passed (100% green, 0 skips).
- **Desktop E2E Smoke Tests (Playwright):** 5/5 passed.
- **TypeScript Typecheck (`tsc --noEmit` & `tsc -b`):** 0 errors.
- **ESLint (`eslint .`):** 0 errors, 0 warnings.
- **Prettier (`prettier --check .`):** 100% compliant.
- **Production Build (`vite build`):** Clean compilation.
- **Security Audit (`npm audit`):** 0 vulnerabilities found.

---

## 4. Definition of Done Sign-Off

- [x] Scope implemented without unrelated changes.
- [x] Comprehensive test suites added.
- [x] Typecheck passes with strict mode.
- [x] Lint passes with 0 warnings/errors.
- [x] Acceptance criteria verified by Product Owner.
- [x] Security audit approved.
- [x] Pull Request created and linked in `task.md`.
