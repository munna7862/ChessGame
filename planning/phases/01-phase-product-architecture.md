# Phase 01: Product & Architecture

## Objective

Turn the ChessForge idea into an implementation-ready product and
architecture contract before writing production code.

## Outcome

At the end of this phase, the team should know exactly:

-   What ChessForge v1 does.
-   What it deliberately does not do.
-   Who the target user is.
-   What the application architecture is.
-   What the major domain boundaries are.
-   What technology choices are approved.
-   How Antigravity agents are expected to work.
-   What "done" means.

## Scope

### Product

-   MVP definition
-   User journeys
-   Game modes
-   Chess rules
-   Import/export expectations
-   Settings
-   Accessibility goals
-   Windows distribution expectations

### Architecture

-   Tauri + React + TypeScript architecture
-   Rust/native boundary
-   Chess domain boundary
-   Engine boundary
-   Persistence boundary
-   State management
-   Testing architecture
-   Security model

### Agent engineering

-   AGENTS.md rules
-   Agent roles
-   Review policy
-   Worktree strategy
-   Definition of Done

## Out of scope

-   Production implementation
-   Stockfish integration
-   Online multiplayer
-   User accounts
-   Cloud backend
-   Tournament infrastructure

## Recommended stack

``` text
Windows
  |
Tauri
  |
React + TypeScript + Vite
  |
Application Services
  |
Chess Domain Adapter
  |
Chess Rules Library

Engine Service
  |
Web Worker
  |
Stockfish WASM
```

## Major architecture decisions

1.  Tauri is the desktop shell.
2.  TypeScript owns most application logic.
3.  Rust is used for native capabilities only when needed.
4.  Chess rules are isolated behind a domain adapter.
5.  Stockfish never runs on the UI thread.
6.  Imported FEN/PGN is treated as untrusted input.
7.  UI components do not implement chess legality.
8.  Domain logic is testable without rendering React.
9.  Native permissions are minimal.
10. Significant Antigravity changes go through planning and review.

## Required artifacts

``` text
docs/
├── product-requirements.md
├── architecture.md
├── chess-domain.md
├── testing-strategy.md
├── security-model.md
├── agent-workflow.md
└── adr/
```

## Antigravity strategy

Use a primary architect agent first. Ask it to inspect assumptions,
challenge the stack, and produce an implementation plan artifact. Review
the artifact before implementation.

For parallel research, use isolated worktrees. Antigravity's current
Project model supports scoped folders, permissions and isolated
worktrees for concurrent work.

## Acceptance criteria

-   Product requirements approved.
-   MVP and non-MVP scope documented.
-   Architecture diagram documented.
-   Domain boundaries documented.
-   Security boundaries documented.
-   Testing strategy approved.
-   Agent operating rules documented.
-   Technology decisions recorded with rationale.

## Risks

  Risk                          Mitigation
  ----------------------------- ----------------------------------
  Scope explosion               Explicit MVP/non-MVP boundary
  AI over-engineering           Architecture approval gate
  Chess rules leaking into UI   Domain adapter contract
  Excessive dependencies        Dependency approval rule
  Parallel agent conflicts      New worktrees for isolated tasks

## Exit criteria

No Phase 02 implementation should begin until the architecture and
product contracts are approved.

## Sprint decomposition candidates

-   Product requirements
-   UX journeys
-   Architecture
-   Domain contract
-   Security model
-   Testing strategy
-   Antigravity operating rules
-   Architecture review
