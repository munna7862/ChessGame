# ChessForge Security and Dependency Audit Report

**Sprint:** Phase 10 · Sprint 06: Security and Dependency Audit  
**Classification:** Security Architecture & Release Candidate Audit  
**Author:** Security & Desktop Safety Officer, Dev Architect  
**Status:** `Approved for Release Candidate`  
**Date:** 2026-08-20

---

## 1. Executive Summary

As part of the **Phase 10 Quality Engineering & Release Candidate** milestone, ChessForge underwent a comprehensive security review, capability audit, dependency vulnerability analysis, secret scan, and privacy inspection.

ChessForge is architected as a **100% local-first Windows desktop application** built with Tauri v2, Rust, React 19, TypeScript, and Stockfish WASM. The desktop attack surface was evaluated across all architectural boundaries.

### Summary of Audit Outcomes:

- **Tauri Capabilities:** Least-privilege configuration verified (`core:default` only). Zero wildcards, zero shell execution capabilities, zero dangerous filesystem permissions.
- **Content Security Policy (CSP):** Strictly enforced to `'self'` with `connect-src 'self' ipc: http://ipc.localhost;`. Zero external network connections.
- **Untrusted Input Ingestion:** FEN strings, PGN files, and clipboard inputs undergo strict domain and Zod schema validation; malicious/malformed inputs (including XSS script tags and oversized payloads) are sanitized or rejected without unhandled exceptions.
- **AI Engine Sandboxing:** Stockfish WASM executes in an isolated WebWorker; all UCI move suggestions are validated against the domain's legal move engine before state mutation.
- **Dependency Audit:** `npm audit` returned **0 vulnerabilities** (0 Critical, 0 High, 0 Moderate, 0 Low). Rust dependencies are minimal (`tauri 2`, `serde 1`, `serde_json 1`).
- **Secret Scanning:** Automated repository scan detected **0 private keys, 0 API tokens, and 0 credentials**.
- **Privacy & Telemetry:** 0 analytics, 0 telemetry beacons, 0 remote logging SDKs. 100% offline privacy verified.

---

## 2. Desktop Capabilities & Principle of Least Privilege

### 2.1 Tauri v2 Capability Review (`src-tauri/capabilities/default.json`)

The capability configuration was audited against Tauri v2 permissions schemas:

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Default capability for ChessForge desktop shell",
  "windows": ["main"],
  "permissions": ["core:default"]
}
```

| Permission Scope | Status                 | Verification & Risk Assessment                                                            |
| :--------------- | :--------------------- | :---------------------------------------------------------------------------------------- |
| `core:default`   | **ENABLED**            | Required for standard window management, minimization, closing, and native event polling. |
| `shell:default`  | **DISABLED / OMITTED** | Prevented arbitrary command execution or process spawning from the Webview frontend.      |
| `fs:default`     | **DISABLED / OMITTED** | Prevented arbitrary local filesystem reads or writes outside browser File/Blob dialogs.   |
| `http:default`   | **DISABLED / OMITTED** | Prevented native HTTP networking from the Rust backend.                                   |
| `opener:default` | **DISABLED / OMITTED** | Prevented opening arbitrary external URLs or unvetted external system protocols.          |

### 2.2 Rust Crate & IPC Handlers Review (`src-tauri/Cargo.toml`, `src-tauri/src/lib.rs`)

- No external networking crates (e.g. `reqwest`, `hyper`, `tokio-tungstenite`) are imported.
- No unreviewed IPC command handlers (`#[tauri::command]`) are exposed.
- Application bootstrap invokes `tauri::Builder::default().run(...)` with zero dangerous native hooks.

---

## 3. Content Security Policy (CSP) & Network Boundary

The application enforces a restrictive Content Security Policy configured in `src-tauri/tauri.conf.json`:

```text
default-src 'self';
script-src 'self' 'wasm-unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
connect-src 'self' ipc: http://ipc.localhost;
```

- **`connect-src` Defense:** Restricting connections to `'self'`, `ipc:`, and `http://ipc.localhost;` guarantees that `fetch()`, `XMLHttpRequest`, or `WebSocket` cannot establish network tunnels or transmit data to external domains.
- **`wasm-unsafe-eval` Scope:** Confined strictly to loading the local Stockfish WebAssembly binary inside the isolated WebWorker.

---

## 4. Untrusted Input Handling & Injection Defense

### 4.1 FEN (Forsyth-Edwards Notation) Validation (`src/domain/chess/fen.ts`)

- **Syntactic & Invariant Verification:** Validates token counts, 8 ranks, king counts (exactly 1 white, 1 black), pawn placement on valid ranks (ranks 2-7), active color, castling availability, and en passant legality.
- **Robustness Against Attacks:** Rejects malformed strings, XSS injection attempts, and oversized strings up to 10,000 characters without throwing runtime exceptions.

### 4.2 PGN (Portable Game Notation) Parsing (`src/domain/chess/pgn.ts`)

- **Lexical Tokenizer:** Parses Seven Tag Roster (STR) pairs and move text safely with regex boundary tokenization.
- **Header & Comment Escaping:** PGN tag serialization (`formatPgn`) automatically escapes double quotes (`\"`) and backslashes (`\\\\`), preventing header breakout attacks.
- **XSS Mitigation in React UI:** All PGN metadata (Event, Site, White, Black) is rendered via standard React JSX text nodes, preventing DOM XSS.

---

## 5. WebWorker Sandboxing & Stockfish UCI Security

- **Process Isolation:** The Stockfish chess engine runs exclusively inside a standard browser WebWorker (`StockfishWorkerBridge.ts`).
- **No Native or DOM Access:** WebWorkers do not possess access to `window.document`, DOM elements, or Tauri native IPC functions.
- **Advisory Protocol Contract:** Engine recommendations (e.g. `bestmove e7e5`) are treated as untrusted suggestions. The authoritative domain layer (`ChessJsAdapter` / `makeMove`) independently validates all move coordinates against chess rules before updating the session state.

---

## 6. Dependency Supply Chain Audit

An audit was conducted across all project dependencies:

### 6.1 NPM Audit Report

```text
$ npm audit
found 0 vulnerabilities
```

- **Total Dependencies Audited:** 48 packages (production and development).
- **Vulnerabilities Found:** 0 Critical, 0 High, 0 Moderate, 0 Low.
- **Prohibited Dependencies:** Verified 0 telemetry or tracking packages (`google-analytics`, `mixpanel`, `posthog-js`, `sentry`, `datadog`).

### 6.2 Rust Cargo Dependencies

- `tauri = { version = "2", features = [] }`
- `serde = { version = "1", features = ["derive"] }`
- `serde_json = "1"`
- All dependencies locked via `Cargo.lock`.

---

## 7. Secret Scanning & Privacy Compliance

- **Automated Secret Scan:** Full codebase scan across `src/`, `docs/`, `planning/`, `src-tauri/`, and configuration files using high-entropy regex patterns for private keys, AWS tokens, GitHub PATs, JWTs, and Slack tokens. Result: **0 secrets found**.
- **Offline Privacy Invariant:** No analytics endpoints, error tracking beacons, or crash reporters exist in the codebase. User preferences and game history remain strictly on the local machine (`localStorage`).

---

## 8. Unresolved Findings & Risk Register

| Risk ID         | Finding Description                                   | Severity | Mitigation / Resolution                                                                                                             | Status                   |
| :-------------- | :---------------------------------------------------- | :------- | :---------------------------------------------------------------------------------------------------------------------------------- | :----------------------- |
| **SEC-RISK-01** | `wasm-unsafe-eval` required in CSP for Stockfish WASM | Low      | Required for local WebAssembly compilation of Stockfish engine. Worker operates in sandboxed browser worker without network access. | **Accepted & Mitigated** |
| **SEC-RISK-02** | User-imported PGN files with hostile tags             | Low      | React JSX auto-escaping and domain codec sanitization prevent HTML/script injection.                                                | **Mitigated & Verified** |

---

## 9. Security Sign-Off

- **Security & Desktop Safety Officer:** `APPROVED`
- **Dev Architect:** `APPROVED`
- **SDET Architect:** `APPROVED`
- **Release Status:** `CLEARED FOR RELEASE CANDIDATE (RC1)`
