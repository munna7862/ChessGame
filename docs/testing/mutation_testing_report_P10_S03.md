# Domain Mutation Testing & Property Invariant Report: Phase 10 · Sprint 03

**Sprint:** Phase 10 · Sprint 03: Property and Mutation Testing  
**Author:** Dev Architect & SDET Architect  
**Status:** `Verified & 100% Green`  
**Execution Date:** 2026-08-20

---

## 1. Executive Summary

Phase 10 · Sprint 03 establishes rigorous mathematical invariance and mutation resilience across the ChessForge chess domain engine.

- **Generative Property Fuzzing (`fast-check`):** Hundreds of multi-ply legal game trajectories generated with deterministic PRNG seeds to prove universal chess invariants (king safety, piece counts, irreversible counters, bijective FEN/PGN codecs, and move reversibility).
- **Controlled Domain Fault Injection Battery:** 12 targeted domain mutations injected across rule verification, castling rights, en passant semantics, promotion mechanics, king safety, turn alternation, and state restoration.
- **Mutation Kill Rate:** **100.0% (12 of 12 Mutants Killed, 0 Surviving Mutants)**.
- **Suite Execution Time:** $< 12\text{s}$ for complete property fuzzing and multi-iteration mutation battery.

---

## 2. Property Invariant Verification Results

All generative property tests executed with `fast-check` using bounded deterministic runs:

| Invariant Test ID | Property Description                                         | Fuzzing Runs          | Status     |
| :---------------- | :----------------------------------------------------------- | :-------------------- | :--------- |
| **TC-PROP-01**    | Reproducible Seeded PRNG Legal Game Playouts                 | 30 runs (10-40 plies) | **PASSED** |
| **TC-PROP-02**    | Exactly 1 King per side & Strict Inactive King Safety        | 50 runs (10-50 plies) | **PASSED** |
| **TC-PROP-03**    | Legal Move Generation vs Validation Agreement                | 35 runs (5-25 plies)  | **PASSED** |
| **TC-PROP-04**    | Sequential Move History Reversibility via $N$ `undo()` calls | 20 runs (5-30 plies)  | **PASSED** |
| **TC-PROP-05**    | FEN Bijective Codec Invariance across all game states        | 20 runs (10-35 plies) | **PASSED** |
| **TC-PROP-06**    | PGN Export & Full Replay Bijective Invariance                | 15 runs (10-30 plies) | **PASSED** |
| **TC-PROP-07**    | Halfmove Clock & Fullmove Counter Transition Invariants      | 20 runs (10-35 plies) | **PASSED** |
| **TC-PROP-08**    | Material Upper Bounds & Strict Promotion Piece Types         | 20 runs (15-45 plies) | **PASSED** |

---

## 3. Domain Mutation Battery & Kill-Rate Matrix

The 12 domain fault mutants were evaluated against the test harness:

| Mutant ID            | Category        | Mutation Description                                 | Killer Invariant / Assertion                     | Result     |
| :------------------- | :-------------- | :--------------------------------------------------- | :----------------------------------------------- | :--------- |
| `M-KING-SAFETY`      | King Safety     | Bypassing check safety filter on pinned pieces       | Bishop moves off absolute pin ray excluded       | **KILLED** |
| `M-CASTLE-THROUGH`   | Castling        | Permitting castling when transit square is attacked  | Kingside castling rejected on attacked $f_1$     | **KILLED** |
| `M-CASTLE-IN-CHECK`  | Castling        | Permitting castling while king is under check        | Castling move rejected under direct rook check   | **KILLED** |
| `M-EP-PAWN-RETAIN`   | En Passant      | Failing to remove captured victim pawn on e.p.       | Captured pawn on $d_5$ verified cleanly removed  | **KILLED** |
| `M-EP-PIN-EXPOSURE`  | En Passant      | Permitting e.p. when removal exposes king on rank    | Horizontal pin detection excludes e.p. move      | **KILLED** |
| `M-PROMO-CORRUPT`    | Promotion       | Corrupting promoted piece type or ignoring choice    | Target square piece matches Queen type/color     | **KILLED** |
| `M-TURN-INVERT`      | Turn Mechanics  | Failing to toggle active player turn                 | Turn alternation transition from 'w' to 'b'      | **KILLED** |
| `M-CLOCK-NO-RESET`   | Draw Counters   | Failing to reset halfmove clock on pawn push/capture | Halfmove counter reset to 0 verified             | **KILLED** |
| `M-MATE-SUPPRESS`    | Terminal States | Suppressing checkmate detection in terminal mate     | Fool's mate identified as checkmate / winner 'b' | **KILLED** |
| `M-STALEMATE-INVERT` | Terminal States | Inverting stalemate and checkmate states             | Stalemate classified as `draw_stalemate`         | **KILLED** |
| `M-OPPONENT-MOVE`    | Validation      | Permitting moving opponent's piece                   | Opponent piece move rejected with error          | **KILLED** |
| `M-UNDO-CORRUPT`     | Reversibility   | Corrupting board or piece restoration on undo        | Undo exactly restores captured piece and FEN     | **KILLED** |

### Mutation Score Calculation

$$\text{Mutation Score} = \frac{\text{Killed Mutants}}{\text{Total Mutants}} \times 100\% = \frac{12}{12} \times 100\% = \mathbf{100.0\%}$$
$$\text{Surviving Mutants} = \mathbf{0}$$

---

## 4. Performance & Desktop Guardrails Compliance

- **Execution Footprint:** Zero memory leaks detected during generative fuzzing.
- **CPU / Execution Time:** Fault injection suite executes in $< 100\text{ms}$; generative invariant fuzzing executes in $< 11\text{s}$.
- **Isolation:** Fault injector operates strictly via deterministic delegates and adapters, guaranteeing zero lingering test side-effects on production code or state.
