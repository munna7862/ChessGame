---
name: chessforge-documentation-standards
description: Documentation standards for ChessForge architecture, chess-domain behavior, testing, UX, security and release evidence.
---

# ChessForge Documentation Standards

## 1. Required Documentation by Change Type

### Architecture
Update `docs/architecture/` and create an ADR in `docs/adr/` when an architectural decision changes.

### Chess Domain
Update `docs/chess/` when behavior or supported chess semantics change.

### Testing
Update `docs/testing/` for significant test strategy or regression-corpus changes.

### UX
Update `docs/ux/` for meaningful user-flow or interaction changes.

### Security
Update `docs/security/` for Tauri capabilities, filesystem, IPC, import validation or release-security changes.

### Release
Update `docs/release/` for installer, signing, versioning or release-process changes.

## 2. Walkthrough

Meaningful user-facing sprints should produce a concise walkthrough containing:

- feature purpose
- changed behavior
- how to verify
- tests executed
- known limitations

Do not claim screenshots or manual verification unless actually performed.

## 3. No Fake Artifacts

Do not create:

- API contracts for nonexistent APIs
- database schemas when no database exists
- `.env` documentation for nonexistent environment variables
- performance reports without measurements

## 4. Markdown

Use clear headings, tables and checklists.

Use language tags:

```typescript
```typescript
```

```bash
```bash
```

Use Mermaid for useful architecture/state/asynchronous-flow diagrams.

## 5. Release Evidence

Release documentation must identify:

- version
- build artifact
- verification environment
- test results
- known limitations
- signing status when applicable
