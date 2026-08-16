# Phase 01 · Sprint 04: Security and Permissions Model

## Pull Request Description

### Summary of Changes
This pull request establishes the authoritative desktop security model, Tauri v2 least-privilege capability manifests, filesystem access scopes, IPC payload boundary validations, untrusted data ingestion sanitization, privacy mandates, and prohibited capabilities for **ChessForge** as defined in `planning/sprints/P01-S04-security-and-permissions-model.md`.

### Key Deliverables
1. **Authoritative Desktop Security Model (`docs/security-model.md`):**
   - **Principle of Least Privilege:** Granular mapping of approved Tauri v2 capabilities (`core:default`, `dialog:allow-*`, `clipboard-manager:allow-*`, `store:allow-*`, and scoped `fs:allow-*`).
   - **Capability Manifest Specification:** Concrete JSON schema for `src-tauri/capabilities/default.json` prohibiting wildcard (`*`) access.
   - **Prohibited Capabilities Matrix:** Strict ban on `shell:execute`, arbitrary `shell:open`, unscoped filesystem access, network listeners/HTTP clients, and dynamic code evaluation (`eval`).
   - **Filesystem Scoping & Traversal Defenses:** Strict isolation to `$APPDATA/ChessForge/**` and dialog-approved paths, canonical path verification, null-byte/device file rejection, and crash-safe atomic writes.
   - **IPC Boundaries & Double Validation:** Mandatory typed command payloads with Zod (frontend) and Serde (Rust) schema validation, preventing unhandled panics and stack leaks.
   - **Untrusted Ingestion Defenses:** Strict size limits (10MB PGN cap), recursive variation depth limits (32 levels), XSS header sanitization, and FIDE invariant validation for imported FEN/PGN.
   - **Process Sandboxing & Hardened CSP:** Stockfish WASM isolated in a dedicated WebWorker without DOM/IPC access; strict CSP headers (`connect-src 'none'`, `script-src 'self' 'wasm-unsafe-eval'`).
   - **Secrets Policy & Release Integrity:** Zero secrets in code, isolated CI signing secrets, reproducible builds, and binary checksums.
   - **Privacy & Logging Standards:** 100% offline, zero telemetry/analytics, local-only diagnostic logging with path anonymization and 10MB total disk cap.
   - **Supply Chain Security:** Automated `npm audit` and `cargo audit` in CI, pinned lockfiles, and minimal dependency vetting.

2. **SDET Security Verification Matrix (`docs/testing/test_cases_catalog_P01_S04.md`):**
   - 10 granular security test cases (TC-SEC-01 to TC-SEC-10) validating least-privilege permissions, path traversal rejection, IPC argument deserialization, untrusted ingestion bounds, secrets scanning, offline privacy, prohibited capabilities, and WebWorker CSP isolation.

---

### Verification & Quality Gates Summary
- **Scrum Master Gate:** Sprint 04 planned, tracked, and verified in `task.md`.
- **SDET Gate:** Security Test Cases Catalog committed (`docs/testing/test_cases_catalog_P01_S04.md`).
- **Security Officer Gate:** Comprehensive desktop security and least-privilege audit performed and approved.
- **Dev Technical Gate:** Security specification verified against ADRs and architecture baseline.
- **Product Owner Gate:** All Sprint 04 acceptance criteria and Definition of Done items verified and approved.

---

### Acceptance Criteria Checklist
- [x] Every native permission has a documented reason.
- [x] No unnecessary shell access (`shell:execute` strictly prohibited).
- [x] File access is scoped (`$APPDATA/ChessForge/**` and dialog paths only).
- [x] Import data is considered untrusted (bounds, depth limits, invariant validation).
- [x] Secrets policy is documented (zero secrets in repository).
