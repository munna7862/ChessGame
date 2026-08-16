# ChessForge Phase Plan Index

## Purpose

This directory decomposes the ChessForge Master Plan into implementation
phases. Each phase is a **parent plan** that will later be decomposed
into sprint-plan `.md` files.

## Planning hierarchy

```text
Master Plan
    |
    +-- Phase Plan
          |
          +-- Sprint Plan
                |
                +-- Tasks
                      |
                      +-- Implementation
                            |
                            +-- Tests
                                  |
                                  +-- Review
```

## Phase map

---

Phase Name Primary outcome

---

01 Product & Architecture Approved product,
architecture, UX and
engineering contracts

02 Project Bootstrap Runnable
Tauri/React/TypeScript
foundation with CI

03 Chess Domain Correct, thoroughly
tested chess rules and
game state

04 Board UI High-quality interactive
chessboard

05 Game System Complete local game
experience and controls

06 Stockfish AI Human vs Computer with
reliable engine
integration

07 Clocks & Game Modes Timed games and
configurable game modes

08 Persistence & Settings Durable games, PGN/FEN
and preferences

09 UX Polish & Product-level visual,
Accessibility audio and accessibility
quality

10 Quality Engineering & Deep verification,
Release Candidate performance, security
and release readiness

11 Windows Release Installer, packaging,
distribution and v1.0
release
------------------------------------------------------------------------

## Dependency flow

```text
01
 ↓
02
 ↓
03 ───────┐
 ↓        │
04       │
 ↓        │
05       │
 ↓        │
06       │
 ↓        │
07       │
 ↓        │
08       │
 ↓        │
09       │
 ↓        │
10 <─────┘
 ↓
11
```

Phase 03 is the critical domain foundation. Phase 04 can begin once the
domain contracts are stable. Phase 06 must not begin until Human vs
Human is reliable.

## Sprint planning rule

When creating sprint files from a phase:

- Keep each sprint independently verifiable.
- Prefer vertical slices over layer-by-layer implementation.
- Every sprint must have explicit acceptance criteria.
- Every sprint must identify files/modules likely to change.
- Every sprint must define tests.
- Every sprint must have an exit condition.
- Do not allow an AI agent to silently expand sprint scope.

## Antigravity operating principle

Use Antigravity's Planning Mode and Artifact review for significant
work. Antigravity supports implementation-plan artifacts and human
feedback before code execution, while worktrees can isolate concurrent
agent work. Use those controls deliberately rather than allowing
multiple agents to mutate the same working tree without coordination.

Official references: - Antigravity overview:
https://antigravity.google/docs/overview - Artifacts:
https://antigravity.google/docs/artifacts - Artifact review:
https://antigravity.google/docs/artifact-review - Projects/worktrees:
https://antigravity.google/docs/projects
