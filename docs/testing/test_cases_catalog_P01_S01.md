# Test Cases Catalog: Phase 01 · Sprint 01
**Sprint Name:** Product Requirements Baseline  
**Document ID:** `test_cases_catalog_P01_S01.md`  
**SDET Architect:** Test Engineering Lead  
**Target Document Under Test:** `docs/product-requirements.md`  

---

## 1. Test Strategy & Scope Overview

This catalog defines the test and verification scenarios used to validate the **Product Requirements Baseline** for ChessForge v1. Because Sprint 01 establishes the foundational product contract, test cases in this catalog evaluate:
1. **Requirements Completeness & Non-Ambiguity:** Every capability has deterministic acceptance criteria.
2. **Chess Semantics & Invariants:** FIDE rule compliance, special moves, draw rules, and notation codecs.
3. **User Journeys & Game Modes:** End-to-end flows for Human vs. Human and Human vs. Computer.
4. **Boundary & Negative Scenarios:** Untrusted input handling (FEN/PGN), engine worker faults, clock timeouts, and crash recovery.
5. **v1 Inclusions vs. Exclusions:** Clear demarcation preventing scope creep (e.g. no cloud/multiplayer in v1).

---

## 2. Test Cases Catalog

### Category A: Core Chess Rules & Invariants (Domain Level)

| Test ID | Scenario Description | Input / Preconditions | Expected Behavior | Category | Invariant / Rule Checked |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-DOM-001** | Standard Move Validation | Initial starting position (`rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`) | Validates legal opening moves (e.g., `e2e4`, `g1f3`); rejects illegal moves (e.g., `e2e5`, `a1a8`). | Positive | Standard piece movement rules |
| **TC-DOM-002** | Kingside & Queenside Castling | White King on `e1`, Rooks on `a1`/`h1`, intervening squares empty, rights present (`r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1`) | `e1g1` (O-O) and `e1c1` (O-O-O) are legal moves; King moves 2 squares, Rook jumps over. | Positive | FIDE Castling Rules |
| **TC-DOM-003** | Castling Prevention Through Check | White King on `e1`, opponent Bishop attacks `f1` transit square | Kingside castling `e1g1` is rejected as illegal; Queenside castling remains valid if unattacked. | Boundary | Castling transit square attack invariant |
| **TC-DOM-004** | En Passant Capture & Expiration | White pawn on `e5`, Black plays `d7d5` (FEN: `rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2`) | White `e5d6` is legal, capturing Black pawn on `d5`. If White makes any other move, en passant right is permanently lost on next turn. | Boundary | En Passant immediate ply expiration |
| **TC-DOM-005** | Pawn Promotion Execution | White Pawn on `e7`, moves to `e8` | System presents promotion options (Queen, Rook, Bishop, Knight). Pawn is replaced before turn terminates. Defaulting without selection is forbidden. | Positive | Pawn Promotion (4 pieces) |
| **TC-DOM-006** | Check & Checkmate Detection | Scholar's Mate position: Queen attacks King on `e8` (`r1bqkb1r/pppp1Qpp/2n5/4p3/2B1n3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4`) | Game status immediately transitions to `checkmate`. Black has 0 legal moves. Game terminates with White win (`1-0`). | Positive | FIDE Checkmate & Termination |
| **TC-DOM-007** | Stalemate Detection | Black King trapped on `a8` without check (`7k/5Q2/6K1/8/8/8/8/8 b - - 0 1`) | Black has 0 legal moves and is NOT in check. Status transitions to `stalemate` (Draw `1/2-1/2`). | Boundary | Stalemate Invariant |
| **TC-DOM-008** | Threefold Repetition | Identical board position, active color, castling rights, and en passant square occurs 3 times | Game status transitions to `draw` (threefold repetition). | Boundary | FIDE 3-Fold Repetition Invariant |
| **TC-DOM-009** | 50-Move Rule | 100 consecutive plies (50 full moves) without a pawn move or capture | Game status transitions to `draw` (50-move rule). | Boundary | FIDE 50-Move Rule Invariant |
| **TC-DOM-010** | Insufficient Material Detection | Positions: K vs K, K+B vs K, K+N vs K, K+B vs K+B (bishops on same color) | Game automatically terminates as `draw` due to insufficient mating material. | Boundary | Insufficient Material Invariant |

---

### Category B: Game Modes & User Journeys

| Test ID | Scenario Description | Input / Preconditions | Expected Behavior | Category | User Journey Verified |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-UJ-001** | Human vs Human Complete Playout | User launches app, selects "Human vs Human", plays moves on local board | Turns alternate White -> Black; valid moves update board, captured pieces display, move notation updates in history panel. | Positive | Local 2-Player Journey |
| **TC-UJ-002** | Human vs Computer Game Flow | User selects "Human vs Computer", chooses White and AI Level 3 | User moves `e2e4`. UI disables board during engine think; Stockfish calculates via worker, returns move `e7e5`; board updates, clocks decrement. | Positive | Solo AI Journey |
| **TC-UJ-003** | Engine Move Stale Response Protection | User rapidly makes a move or requests undo while AI is calculating | Obsolete engine calculation response carries stale session ID and is discarded without mutating state. | Negative | Stale Worker Response Invariant |
| **TC-UJ-004** | Undo Move in Human vs AI | In Human vs AI mode, user clicks "Undo" on their turn | System reverts both the AI's last move and the Human's last move, restoring board to user's previous turn. | Positive | Move Reversion Flow |
| **TC-UJ-005** | Resign & Draw Offer Flow | User clicks "Resign" or "Offer Draw" | Resign immediately awards victory to opponent. Draw offer in HvH presents accept/decline modal. | Positive | Game Termination Flow |

---

### Category C: Time Controls & Clocks

| Test ID | Scenario Description | Input / Preconditions | Expected Behavior | Category | Requirement Checked |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-CLK-001** | Standard Clock Countdown & Increment | Game started with 5 min + 3 sec increment | Active player's clock decrements only during their turn; upon move completion, 3 seconds added to clock. | Positive | Fischer Increment Timing |
| **TC-CLK-002** | Time Out / Flag Fall | White's clock reaches `00:00.000` while Black has sufficient material | Game immediately halts with status `timeout`. Black wins (`0-1`). | Boundary | Clock Expiration & Flag Fall |
| **TC-CLK-003** | Time Out vs Insufficient Material | White flags (`00:00`), but Black has only a bare King | Game terminates as `draw` because Black cannot checkmate by any legal series of moves. | Boundary | FIDE Timeout vs Insufficient Material |

---

### Category D: Notation, Persistence & Desktop Boundaries

| Test ID | Scenario Description | Input / Preconditions | Expected Behavior | Category | Safety / Storage Verified |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-IO-001** | PGN Export Round-Trip | Active game with 20 moves, tags filled | System exports valid PGN text conforming to Seven Tag Roster + SAN movetext. Re-import parses exactly 20 moves to identical position. | Positive | PGN Serialization & Parsing |
| **TC-IO-002** | Malformed FEN Import | User attempts to import invalid FEN string (`rnbqkbnr/8/8/8/8/8/8/RNBQKBNR w - - 0 1` missing pawns/kings) | Domain validation rejects input with human-readable error; current board state remains untouched. | Negative | Untrusted Input Validation |
| **TC-IO-003** | Malformed / Malicious PGN Import | User imports PGN with illegal move syntax or script tags | Parser rejects file with standardized error; no injection or crash occurs. | Negative | Security & Parser Resilience |
| **TC-IO-004** | Crash Recovery of Active Game | App closed abruptly during active game; reopened | Local recoverable storage restores exact board FEN, move history, clock times, and player settings. | Positive | Crash-Safe State Recovery |

---

### Category E: v1 Scope Exclusions (Negative Verification)

| Test ID | Scenario Description | Requirement Verified | Expected Behavior | Category |
| :--- | :--- | :--- | :--- | :--- |
| **TC-EXC-001** | Online Multiplayer Exclusion | Verify no socket/HTTP multiplayer endpoints or dependencies in v1 | Application strictly functions local-first and offline. No network requests for game play. | Scope Guardrail |
| **TC-EXC-002** | User Account & Cloud Sync Exclusion | Verify no login/cloud auth requirements | All settings and game history reside in local desktop persistence. | Scope Guardrail |
| **TC-EXC-003** | Variant Chess Modes Exclusion | Verify Chess960, King of the Hill, etc. are excluded | System enforces standard FIDE 8x8 chess exclusively. | Scope Guardrail |

---

## 3. SDET Quality Sign-Off

- [x] All 9 granular scope items from `P01-S01` mapped to test scenarios.
- [x] Golden FEN test scenarios documented for special moves and terminal conditions.
- [x] Negative and untrusted input paths defined for FEN/PGN and engine worker communication.
- [x] Catalog ready for implementation handoff to Dev Architect.
