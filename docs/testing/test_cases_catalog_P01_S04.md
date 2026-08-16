# Test Cases Catalog & Security Verification Matrix: Sprint 04

**Phase 01 · Sprint 04: Security and Permissions Model**  
**Author:** SDET Architect  
**Status:** Approved for Implementation  
**Target:** Desktop Security Boundary, Tauri v2 Capabilities, IPC Validation, Untrusted Data Ingestion, and Privacy Controls

---

## 1. Scope & Verification Strategy

This catalog defines deterministic verification specifications, attack surface assessments, and security conformance tests for **ChessForge**. In Phase 01 Sprint 04, desktop security and permission boundaries are audited against:

1. **Principle of Least Privilege (Tauri v2 Capabilities):** Granular capability configuration restricting native APIs to the absolute bare minimum required for a local chess application.
2. **File Access Scoping & Path Traversal Defenses:** Strict filesystem boundary restricting persistence to the designated AppData directory and user-selected file dialog paths.
3. **Safe IPC & Payload Validation:** Enforcing typed IPC boundaries where all arguments received from the frontend are validated with runtime schemas before execution.
4. **Untrusted Data & Ingestion Sanitization:** All imported PGN, FEN, and JSON configuration files treated as hostile inputs with size bounds, syntax parsing validation, and metadata sanitization.
5. **Secret Handling & Supply Chain Security:** Zero-secret repository policy, strict lockfile integrity, and dependency vulnerability auditing (`cargo audit`, `npm audit`).
6. **Logging, Privacy & Telemetry Prohibition:** 100% local-first privacy, zero external telemetry/cloud tracking, path sanitization in logs, and bounded log rotation.
7. **Prohibited Capabilities:** Active prohibition and verification that high-risk capabilities (`shell:execute`, arbitrary unscoped filesystem access, network listeners, `eval`) are blocked.
8. **Content Security Policy (CSP) & WebWorker Isolation:** Hardened CSP headers restricting script and worker execution, ensuring Stockfish WASM operates in an isolated worker without DOM or native bridge access.

---

## 2. Security Verification Matrix

| Test ID       | Test Category           | Target Component / Boundary                                     | Verification Criteria & Assertion                                                                                                                                                     | Severity     |
| :------------ | :---------------------- | :-------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :----------- |
| **TC-SEC-01** | Least Privilege         | Tauri v2 Capabilities Configuration (`src-tauri/capabilities/`) | Every enabled permission in Tauri capability manifests has an explicit, documented architectural justification. Zero wildcard (`*`) permissions enabled.                              | **BLOCKING** |
| **TC-SEC-02** | Capability Scoping      | Core Native Plugins (`dialog`, `fs`, `clipboard`, `store`)      | Core plugins are locked down to specific allowed commands (e.g. `dialog:allow-open`, `dialog:allow-save`, `clipboard-manager:allow-read-text`, `clipboard-manager:allow-write-text`). | **BLOCKING** |
| **TC-SEC-03** | File Boundary           | Filesystem Access & Path Traversal                              | Application writes only to `$APPDATA/ChessForge` or user-chosen export paths. Relative traversal sequences (`../`, `..\`) and null-byte injections are rejected.                      | **BLOCKING** |
| **TC-SEC-04** | IPC Validation          | Tauri IPC Command Handlers                                      | All IPC commands validate input arguments using runtime schemas (Serde in Rust / Zod in TS). Malformed payloads return typed errors without panic.                                    | **BLOCKING** |
| **TC-SEC-05** | Import Sanitization     | PGN/FEN Codec & File Ingestion                                  | Max file size bound (10MB) enforced on PGN imports. FEN/PGN parsers reject invalid syntax, control characters, and sanitize metadata tags (XSS prevention).                           | **BLOCKING** |
| **TC-SEC-06** | Secrets & Credentials   | Repository & Binary Artifacts                                   | Zero secrets, private keys, API credentials, or certificates committed in repository. Release signing keys managed via isolated CI environment secrets.                               | **BLOCKING** |
| **TC-SEC-07** | Supply Chain            | Dependencies (`npm`, `cargo`)                                   | Lockfiles (`package-lock.json`, `Cargo.lock`) tracked and audited. Automated scanning via `npm audit` and `cargo audit` returns 0 critical/high vulnerabilities.                      | **BLOCKING** |
| **TC-SEC-08** | Privacy & Logging       | Application Logger & Telemetry                                  | Zero network telemetry or phone-home analytics. Error logs sanitize absolute user paths (e.g. `C:\Users\Username\...` replaced with `[USER_HOME]`). Logs bounded in size.             | **BLOCKING** |
| **TC-SEC-09** | Prohibited Capabilities | High-Risk Native APIs                                           | `shell:execute`, `shell:open` (arbitrary protocols), `http:default`, arbitrary TCP/UDP listeners, and raw SQL/native exec are disabled and absent from permissions.                   | **BLOCKING** |
| **TC-SEC-10** | Sandboxing & CSP        | Stockfish WebWorker & Tauri CSP                                 | Strict CSP configured (`default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; connect-src 'none'`). WebWorker cannot access Tauri IPC or DOM.            | **BLOCKING** |

---

## 3. Granular Test Case Specifications

### TC-SEC-01: Tauri v2 Least Privilege Capability Audit

- **Preconditions:** Tauri capabilities manifest (`src-tauri/capabilities/default.json`) inspected.
- **Action:** Parse all permission identifiers in the capability file against the approved v1 matrix.
- **Expected Result:** Only authorized permission identifiers (`core:default`, `dialog:allow-open`, `dialog:allow-save`, `clipboard-manager:allow-read-text`, `clipboard-manager:allow-write-text`, `store:allow-get`, `store:allow-set`) exist. Any unrecognized or unscoped permission fails the build.

### TC-SEC-03: Filesystem Path Traversal & Scoping Test

- **Preconditions:** Persistence and file export service invoked with malicious paths.
- **Action:** Pass malicious file paths such as `../../Windows/System32/evil.pgn`, `C:\autoexec.bat`, and `..\..\AppData\Local\Temp\test.json`.
- **Expected Result:** Path canonicalizer validates that destination path resides strictly within the permitted app data directory or user-selected dialog path. Traversal sequences are rejected with `StorageError.AccessDenied`.

### TC-SEC-04: IPC Argument Deserialization & Boundary Validation

- **Preconditions:** Tauri IPC command invoked with malformed or type-mismatched JSON payload.
- **Action:** Send command `save_game_state` with missing fields, negative clock timers, or oversized strings.
- **Expected Result:** Rust Serde / TS Zod validator rejects the payload at boundary. The command returns `{ ok: false, error: { code: 'INVALID_PAYLOAD', message: '...' } }`. No panic, no stack trace leak.

### TC-SEC-05: Untrusted PGN/FEN Ingestion & DoS Defense

- **Preconditions:** External PGN file loaded via file dialog or drag-and-drop.
- **Action:** Ingest: (1) 50MB oversized file, (2) PGN with recursive variation comments nested 500 levels deep, (3) PGN with script tags in header tags `[Event "<script>alert(1)</script>"]`.
- **Expected Result:**
  1. Files > 10MB are rejected before buffer allocation with `ParsingError.FileTooLarge`.
  2. Nested variations exceeding limit (e.g. > 32 depth) are gracefully capped or rejected.
  3. Header values are parsed as plain UTF-8 text and sanitized before rendering in DOM.

### TC-SEC-06: Secrets Scanning & Zero-Leakage Policy

- **Preconditions:** Repository root scanned for credential patterns.
- **Action:** Run secret detection regex and entropy scanner across all files and git history.
- **Expected Result:** Zero private keys (`.pem`, `.key`), zero API tokens (`ghp_`, `sk_`, `Bearer`), and zero certificates found.

### TC-SEC-08: Privacy & Telemetry Verification

- **Preconditions:** Application execution network traffic and logging monitored.
- **Action:** Launch app, play game against AI, export PGN, alter settings.
- **Expected Result:** Zero outbound network requests (`connect-src 'none'`). Error logs written to local directory only. Usernames and machine identifiers stripped from error log outputs.

### TC-SEC-09: Verification of Prohibited Capabilities

- **Preconditions:** Check Tauri configuration (`src-tauri/tauri.conf.json` and capabilities).
- **Action:** Check for prohibited plugins: `tauri-plugin-shell:execute`, `tauri-plugin-http`, raw socket access, dynamic script evaluation.
- **Expected Result:** No prohibited plugins are installed or bundled in `Cargo.toml` or `package.json`.

### TC-SEC-10: Content Security Policy & Worker Isolation Verification

- **Preconditions:** Inspect HTML `<meta http-equiv="Content-Security-Policy">` and `tauri.conf.json > app > security > csp`.
- **Action:** Verify CSP directives. Attempt inline script evaluation or external fetch from within WebWorker.
- **Expected Result:** External network requests and inline script injection are blocked by browser runtime. Stockfish WASM executes only through WebAssembly instantiation allowed by `'wasm-unsafe-eval'`.

---

## 4. SDET Quality Gate Checklist

- [x] Security test matrix covers all 9 granular implementation tasks in Sprint 04.
- [x] Clear blocking severity assigned to least-privilege, file boundaries, IPC validation, untrusted data sanitization, and CSP.
- [x] Anti-DoS and path traversal attack vectors specified with expected error contracts.
- [x] Ready for Security Officer & Dev Architect documentation and specification.
