# Pre-Implementation Test Cases Catalog: Phase 11 · Sprint 03

**Sprint:** Phase 11 · Sprint 03: Code Signing and Release Security  
**Author:** SDET Architect  
**Target Areas:** `.gitignore`, `.github/workflows/ci.yml`, `docs/release/code_signing_and_release_security_guide.md`, `src/test/codeSigningAndReleaseSecurity.test.ts`  
**Status:** Complete & Approved

---

## 1. Test Strategy Overview

This catalog specifies verification standards and automated test scenarios for Phase 11 Sprint 03 (Code Signing and Release Security). The primary objectives are:

1. **Secret & Key Protection:** Guarantee that certificate files, private keys, and credential stores are strictly ignored by `.gitignore` and absent from the repository.
2. **CI Secret Handling & Masking:** Ensure GitHub Actions CI workflows utilize encrypted secrets, environment variable masking, and avoid printing sensitive tokens to execution logs.
3. **Conditional Signing & Unsigned Fallback:** Guarantee that release pipelines support conditional code signing when secrets are present while preserving seamless unsigned local developer builds.
4. **Signature Verification & Distribution Security:** Provide deterministic verification mechanisms for Windows Authenticode signatures and SHA-256 artifact checksums.
5. **Zero-Cloud & Offline Invariant:** Confirm that code signing does not introduce telemetry, remote authentication, or external runtime dependencies into ChessForge.

---

## 2. Test Cases Specification

| Test ID            | Test Category                   | Target Component           | Description & Verification Criteria                                                                                                                                                                          | Priority      | Expected Outcome                                    |
| :----------------- | :------------------------------ | :------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------ | :-------------------------------------------------- |
| **TC-SEC-SIGN-01** | Secret Exclusion                | `.gitignore`               | Verify `.gitignore` includes comprehensive exclusion patterns for `*.pfx`, `*.p12`, `*.key`, `*.snk`, `*.sig`, `*.cert`, `*.cer`, `*.crt`, `*.pem`, `*.asc`, `*.der`, `*.jks`, `*.keystore`, and `secrets/`. | Critical (P0) | PASS: All key/cert patterns present and active.     |
| **TC-SEC-SIGN-02** | CI Secret Masking               | `.github/workflows/ci.yml` | Verify CI workflow references secrets via `${{ secrets.* }}` context with environment variable injection, zero plaintext keys, and proper least-privilege token permissions.                                 | Critical (P0) | PASS: Secrets cleanly isolated and masked.          |
| **TC-SEC-SIGN-03** | Conditional Signing Workflow    | CI Workflow & Packaging    | Verify build pipeline conditionally executes signing steps when signing secrets are available, and gracefully falls back to unsigned packaging when secrets are unset.                                       | High (P1)     | PASS: Both signed and unsigned build paths succeed. |
| **TC-SEC-SIGN-04** | Security Guide Completeness     | `docs/release/`            | Verify `code_signing_and_release_security_guide.md` exists and covers Authenticode, SignTool parameters, timestamping servers, CI secret configuration, and local unsigned development instructions.         | High (P1)     | PASS: Comprehensive guide with complete workflows.  |
| **TC-SEC-SIGN-05** | Repository Key Leak Audit       | Repository Workspace       | Verify no private keys, certificate files, or credential dumps exist anywhere in tracked workspace files.                                                                                                    | Critical (P0) | PASS: 0 certificate/key files found in repo.        |
| **TC-SEC-SIGN-06** | Checksum & Hash Verification    | Release Artifacts          | Verify SHA-256 checksum generation and verification algorithms produce deterministic hashes for desktop packages.                                                                                            | High (P1)     | PASS: Deterministic SHA-256 calculation verified.   |
| **TC-SEC-SIGN-07** | Configuration Schema Validation | `tauri.conf.json`          | Validate Tauri v2 configuration schema compatibility with signing and packaging options.                                                                                                                     | High (P1)     | PASS: Zod schema passes validation.                 |
| **TC-SEC-SIGN-08** | Offline Security Boundary       | Application & Engine       | Verify signing workflow does not inject online telemetry or alter the offline local-first execution model of ChessForge.                                                                                     | Critical (P0) | PASS: Offline execution verified.                   |

---

## 3. Automation & Quality Gates

- **Unit / Integration Tests:** `src/test/codeSigningAndReleaseSecurity.test.ts` (Vitest)
- **Static Analysis:** `npm run lint`, `npm run typecheck`, `npm run format:check`
- **Secret Audit:** Regex search across workspace files for PEM/PFX/private key headers.
- **E2E & Build Tests:** `npm run test:e2e`, `npm run build`
