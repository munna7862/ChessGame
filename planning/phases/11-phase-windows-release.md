# Phase 11: Windows Release

## Objective

Package, validate and release ChessForge v1.0 as a Windows desktop
application.

## Outcome

A user can download an installer, install ChessForge on a clean Windows
machine, launch it, play chess and uninstall it cleanly.

## Scope

- Versioning
- Windows installer
- Build artifacts
- Release CI
- Checksums
- Release notes
- Installation testing
- Upgrade testing
- Uninstall testing
- Distribution documentation
- GitHub Release

## Versioning

Use semantic versioning:

```text
MAJOR.MINOR.PATCH
```

Example:

```text
v1.0.0
```

## Release pipeline

```text
Create tag
    ↓
CI build
    ↓
Lint/typecheck/tests
    ↓
Windows package
    ↓
Smoke tests
    ↓
Generate checksums
    ↓
Create GitHub Release
```

## Installer validation

Test:

### Fresh install

```text
Clean Windows machine
→ installer
→ install
→ launch
→ play
```

### Upgrade

```text
v1.0
→ install v1.1
→ verify settings
→ verify recovery behavior
```

### Uninstall

```text
Uninstall
→ application removed
→ expected user data policy verified
```

## Release artifacts

At minimum:

```text
ChessForge-Setup-x.y.z.exe
checksums.txt
release-notes.md
```

## Code signing

If distributing broadly, add a Windows code-signing strategy.

Do not put signing certificates or secrets into the repository.

Use CI secret management.

## Release checklist

### Product

- [ ] Human vs Human
- [ ] Human vs Computer
- [ ] All supported chess rules
- [ ] Clocks
- [ ] PGN/FEN
- [ ] Persistence
- [ ] Settings
- [ ] Accessibility

### Engineering

- [ ] Tests pass
- [ ] Build passes
- [ ] No critical defects
- [ ] Security review complete
- [ ] Dependency review complete

### Windows

- [ ] Fresh install
- [ ] Upgrade
- [ ] Launch
- [ ] Save/load
- [ ] Uninstall
- [ ] High-DPI test
- [ ] Windows scaling test

### Distribution

- [ ] Version tagged
- [ ] Installer generated
- [ ] Checksums generated
- [ ] Release notes written
- [ ] GitHub release published

## Antigravity strategy

Use a release agent only after the human approves the release candidate.

The release agent may automate packaging and verification but must not
silently change product behavior during the release process.

## Exit criteria

ChessForge v1.0 is publicly distributable through the chosen Windows
distribution channel.

## Sprint decomposition candidates

- Versioning
- Release CI
- Installer
- Signing
- Checksums
- Clean-machine validation
- Upgrade validation
- Uninstall validation
- Release notes
- GitHub release
