# Test Cases Catalog: Phase 11 · Sprint 04 — Release Automation and Checksums

**Document Version:** 1.0.0  
**Sprint:** Phase 11 · Sprint 04  
**Author:** SDET Architect  
**Status:** Approved for Implementation

---

## 1. Overview & Verification Strategy

Sprint 11.04 automates tagged release creation, artifact checksum generation, release notes extraction, and multi-stage gated release publishing for ChessForge v1.0.0 desktop distribution. This catalog establishes positive, negative, boundary, and security test cases to ensure that no unverified or corrupt binary can ever be published as a release.

---

## 2. Test Cases Specification Matrix

| Test ID       | Category            | Target Component                    | Description & Preconditions                   | Input / Execution Steps                                                                                                              | Expected Outcome                                                                                                                          |
| :------------ | :------------------ | :---------------------------------- | :-------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| **TC-REL-01** | Positive            | `.github/workflows/release.yml`     | Workflow Triggers & Event Filters             | Inspect YAML trigger definitions for `push: tags: ['v*']` and `workflow_dispatch` with `dry_run` input boolean.                      | Workflow triggers on valid semantic version tags (`v1.0.0`, `v1.0.1`) and supports manual execution with dry-run toggle.                  |
| **TC-REL-02** | Positive / Security | `.github/workflows/release.yml`     | Gated Execution Hierarchy                     | Verify that `publish-github-release` job has `needs: [verify-quality-gates, build-windows-release]` and fails if verification fails. | No release artifact can be published if linting, typechecking, Vitest tests, E2E tests, or Rust checks fail.                              |
| **TC-REL-03** | Positive            | `scripts/release_checksums.mjs`     | SHA-256 Checksum Generation & Standard Format | Execute checksum generator on mock distribution files (`.exe`, `.msi`).                                                              | Generates `checksums.txt` with lowercase 64-character hex SHA-256 hashes followed by two spaces and filename (`<hash>  <filename>`).      |
| **TC-REL-04** | Positive            | `scripts/extract_release_notes.mjs` | Version Release Notes Markdown Extraction     | Extract release notes for version `1.0.0` from `RELEASE_NOTES.md` and `CHANGELOG.md`.                                                | Accurately extracts markdown content for the specified version while ignoring other versions or header boilerplates.                      |
| **TC-REL-05** | Boundary / Safety   | `.github/workflows/release.yml`     | Dry-Run Release Guardrail                     | Trigger release workflow with `dry_run: true` or inspect conditional step execution.                                                 | Builds artifacts and calculates checksums, but skips GitHub Release creation with clear log output.                                       |
| **TC-REL-06** | Negative / Security | `scripts/release_checksums.mjs`     | Checksum Verification & Tamper Detection      | Verify `checksums.txt` against modified file contents or missing files.                                                              | Rejects corrupted/tampered files with clear error status, reports hash mismatch, and returns non-zero exit code.                          |
| **TC-REL-07** | Security            | `.github/workflows/release.yml`     | Least Privilege Permissions Scoping           | Audit GitHub Actions permissions block.                                                                                              | Top-level workflow sets `permissions: { contents: read }`, while `contents: write` is restricted solely to the publishing job.            |
| **TC-REL-08** | End-User Guide      | `docs/release/`                     | Dual Platform Verification Guide              | Check end-user verification instructions in documentation.                                                                           | Contains exact working commands for Windows PowerShell (`Get-FileHash -Algorithm SHA256`) and Linux/macOS (`sha256sum -c checksums.txt`). |

---

## 3. Invariant & Regression Guardrails

1. **Zero Unverified Releases:** Release publication cannot execute asynchronously or in parallel with verification jobs; it must strictly depend on 100% green quality gates.
2. **Deterministic Checksum Format:** `checksums.txt` must strictly adhere to the standard GNU Coreutils format (`<64-char-hex-hash>  <filename>`) using UTF-8 encoding with Unix LF or Windows CRLF tolerance.
3. **Immutability of Packaged Binaries:** Generated checksums must reflect the final packaged and signed installer files before release upload.
4. **No Plaintext Secret Exposure:** Code signing secrets and repository tokens must remain strictly encapsulated in CI runner memory and deleted immediately after use.
