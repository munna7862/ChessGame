# Known Issues and Limitations: ChessForge v1.0.0

**Document Version:** `1.0.0`  
**Status:** Canonical Release Registry  
**Audience:** Operators, Users, Support Engineers

---

## 1. Overview

This document records the official registry of known technical limitations, architectural constraints, and deferred capabilities for **ChessForge v1.0.0**. None of these items represent blocking defects; rather, they document the intentional scope boundaries of the v1.0.0 local-first desktop application.

---

## 2. Technical Limitations Registry

### 2.1 Engine Architecture: Single-Threaded Stockfish WASM

- **Description:** Embedded Stockfish 10 executes as a single-threaded WebAssembly worker module without multi-core SharedArrayBuffer threading.
- **Rationale:** Ensures guaranteed memory boundaries ($< 150\text{ MB}$ footprint) and eliminates UI thread contention across entry-level Windows 10/11 machines.
- **User Impact:** Engine search speed is calibrated for rapid responses (depth 10-18) rather than deep multi-core analysis ($> \text{depth } 30$).
- **Planned Evolution:** Multi-threading and custom hash size configurations are prioritized in the [v1.1 Backlog](file:///c:/Workspace/ChessGame/docs/release/v1.1_post_release_backlog.md).

### 2.2 Chess Rule Scope: Standard FIDE Only

- **Description:** ChessForge v1.0.0 strictly validates and executes standard FIDE rules (castling, en passant, promotion, standard check/draw conditions).
- **Scope Boundary:** Non-standard chess variants such as Chess960 (Fischer Random), Crazyhouse, 3-Check, and Antichess are not supported.
- **User Impact:** Attempting to paste non-standard FEN setups with irregular piece sets or castling rights will trigger standard validation errors.
- **Workaround:** Use standard FEN starting positions or legal piece layouts.

### 2.3 Network Architecture: Local-Only (Zero Telemetry)

- **Description:** ChessForge does not include network sockets, backend servers, or online matchmaking services.
- **Rationale:** Strict adherence to user privacy, local data sovereignty, zero network telemetry, and 100% offline playability.
- **User Impact:** Multiplayer games require two players sharing a single local machine (pass-and-play).

### 2.4 PGN Formatting: Standard Seven Tag Roster

- **Description:** Imported PGNs with highly nested multi-branch sub-variations or non-standard comments (`[%clk]`, `[%eval]`) are simplified to main-line algebraic moves upon import.
- **User Impact:** Deep annotation trees are preserved in raw text but navigate only through the principal variation in the UI tree.

---

## 3. Defect Classification & Severity Baseline

| Issue Key   | Category    | Summary                                                       | Severity       | Workaround / Mitigation                                                                  | Target Release |
| :---------- | :---------- | :------------------------------------------------------------ | :------------- | :--------------------------------------------------------------------------------------- | :------------- |
| `KISSUE-01` | Engine      | Stockfish evaluation bar updates throttled to 100ms intervals | `NON-BLOCKING` | Natural smoothing prevents rapid visual flickering                                       | v1.0 Baseline  |
| `KISSUE-02` | UI / Layout | Minimum window dimensions constrained to 800x600              | `NON-BLOCKING` | Standard desktop resolutions ($1080\text{p}$, $1440\text{p}$, $4\text{K}$) scale cleanly | v1.0 Baseline  |
| `KISSUE-03` | PGN Codec   | Non-standard glyph annotations (`!?`, `?!`) normalized        | `NON-BLOCKING` | Standard SAN moves parsed accurately                                                     | v1.1           |
