# Pull Request: Phase 03 · Sprint 03 — Special Moves

## 1. Summary of Changes

This pull request implements formal verification and first-class domain capabilities for all **Special Moves** in **ChessForge** (Castling, En Passant, Pawn Promotion & Underpromotion) in accordance with [ADR-001](file:///c:/Workspace/ChessGame/docs/adr/ADR-001-decoupled-pure-chess-domain.md) and [special_moves_invariants.md](file:///c:/Workspace/ChessGame/docs/chess/special_moves_invariants.md).

### Key Deliverables

1. **Special Moves Formal Domain Invariants (`docs/chess/special_moves_invariants.md`):**
   - Formal specification of FIDE rules for Kingside (`O-O`) and Queenside (`O-O-O`) castling, including origin, transit, and landing safety checks, non-restrictions (`b1`/`b8` attacked, attacked rook), king and rook movement rights revocation, and corner rook capture.
   - Comprehensive en passant mechanics, 1-ply window expiration, captured piece removal from board, and horizontal pin king safety invariants.
   - Mandatory 8th-rank pawn promotion rules, piece types ('q', 'r', 'b', 'n'), underpromotions, check/checkmate detection, and atomic move execution.
   - Notation standards for SAN (`O-O`, `O-O-O`, `exd6`, `e8=Q`, `e8=R`, `e8=B`, `e8=N`, `+`, `#`) and UCI/LAN (`e1g1`, `e1c1`, `e5d6`, `e7e8q`, etc.).
   - Curated Golden FEN fixtures for all special move scenarios.

2. **Sprint 03 Test Cases Catalog (`docs/testing/test_cases_catalog_P03_S03.md`):**
   - Detailed specification of 27 test cases (TC-SPEC-01 to TC-SPEC-27) covering positive execution, negative edge cases, restriction boundaries, notation formatting, failure immutability, undo reversibility, and property fuzzing.

3. **Domain Adapter Refinements (`src/domain/chess/adapters/chessJsAdapter.ts`):**
   - Enhanced runtime validation for pawn promotion piece types (`PROMOTION_PIECE_TYPES`).
   - Added explicit promotion requirement enforcement (`PROMOTION_REQUIRED`) when a pawn reaches the 8th/1st rank without a promotion piece specified.
   - Prohibited invalid promotion piece types ('k', 'p', or invalid chars) and non-promotion moves with unexpected promotion flags attached.

4. **Automated Test Suites (`src/domain/chess/__tests__/`):**
   - `castling.test.ts`: TC-SPEC-01 to TC-SPEC-13, TC-SPEC-26 (White & Black Kingside/Queenside castling, origin in check, transit attacked, landing attacked, non-restrictions on attacked rook / attacked `b1`, obstructed transit, moved king, moved rook, corner rook captured, castling delivering check `O-O+`, undo reversibility).
   - `enPassant.test.ts`: TC-SPEC-14 to TC-SPEC-18, TC-SPEC-26 (White & Black en passant execution, removed enemy pawn verification, target expiration on next ply, horizontal pin check rejection, discovered check `fxe6+`, undo reversibility).
   - `promotion.test.ts`: TC-SPEC-19 to TC-SPEC-26 (White & Black Queen promotion quiet & capture, underpromotion to Rook, Bishop, Knight, checkmate on promotion `e8=Q#`, missing promotion rejection with `PROMOTION_REQUIRED`, invalid promotion piece rejection, non-promotion move with promotion rejection, undo reversibility).
   - `specialMovesSan.test.ts`: TC-SPEC-27 (SAN & UCI notation consistency, 50-run `fast-check` generative property fuzzing across randomized legal playouts preserving special move invariants and full reversibility).

---

## 2. Test Execution & Quality Verification

| Test Category                     | Command                | Result                                     |
| :-------------------------------- | :--------------------- | :----------------------------------------- |
| **Vitest Unit & Property Tests**  | `npm test`             | **102 / 102 passed (100% green, 0 skips)** |
| **Playwright E2E Tests**          | `npm run test:e2e`     | **5 / 5 passed**                           |
| **TypeScript Strict Typecheck**   | `npm run typecheck`    | **0 errors (`strict: true`)**              |
| **ESLint Rules & Standards**      | `npm run lint`         | **0 errors, 0 warnings**                   |
| **Prettier Code Formatting**      | `npm run format:check` | **100% clean formatting**                  |
| **Vite Production Build**         | `npm run build`        | **Build successful (`dist/`)**             |
| **Supply Chain & Security Audit** | `npm audit`            | **0 vulnerabilities**                      |

---

## 3. Definition of Done (DoD) Sign-Off

- [x] **Scope Complete:** Castling, en passant, promotion, underpromotion, notation formatting, failure immutability, and undo reversibility fully verified.
- [x] **100% Green Automation:** 102 Vitest tests (including property-based fuzzing) and 5 Playwright E2E tests pass without skips.
- [x] **Clean Typecheck & Lint:** `tsc --noEmit` and `eslint .` pass with 0 errors and 0 warnings.
- [x] **Security Audit Approved:** Runtime promotion piece validation strictly enforced; 0 `npm audit` vulnerabilities.
- [x] **PO Acceptance Approved:** All sprint acceptance criteria satisfied.
- [x] **Git Diff Clean:** Atomic conventional commits on `feature/p03-s03-special-moves`.
