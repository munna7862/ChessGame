# ChessForge Sprint Plan Index

## Purpose

These sprint files are the execution layer beneath the phase plans. Each sprint is intentionally granular enough to hand to an Antigravity agent with limited additional context.

## Sprint hierarchy

```text
Master Plan
  ↓
Phase Plan
  ↓
Sprint Plan
  ↓
Implementation Tasks
  ↓
Tests
  ↓
Review
  ↓
Commit
```

## Sprint counts

| Phase                     | Sprint count |
| ------------------------- | -----------: |
| 01 Product & Architecture |            5 |
| 02 Project Bootstrap      |            5 |
| 03 Chess Domain           |            7 |
| 04 Board UI               |            6 |
| 05 Game System            |            6 |
| 06 Stockfish AI           |            6 |
| 07 Clocks & Game Modes    |            4 |
| 08 Persistence & Settings |            6 |
| 09 UX & Accessibility     |            6 |
| 10 Quality Engineering    |            7 |
| 11 Windows Release        |            6 |
| **Total**                 |       **64** |

## How to use

1. Complete the phase prerequisites.
2. Select the next sprint.
3. Give Antigravity the sprint file plus `AGENTS.md`.
4. Ask it to inspect the repository first.
5. Require a plan artifact before meaningful implementation.
6. Review the plan.
7. Allow implementation.
8. Require tests and verification.
9. Review the diff.
10. Commit only after the sprint Definition of Done is satisfied.

## Important rule

A sprint is not a prompt to "build everything in this file blindly."

The agent must reconcile the sprint with the current repository state. If the repository has evolved, the agent should report conflicts before modifying code.

## Recommended sprint status

Add this frontmatter/status block when actively managing a sprint:

```yaml
status: planned
owner: human-or-agent
started: YYYY-MM-DD
completed: YYYY-MM-DD
blocked_by:
depends_on:
```

Keep status changes separate from the implementation unless you want the sprint files themselves to become living project trackers.

## Phase gates

Do not start a phase merely because its first sprint is available.

The previous phase's exit criteria must be satisfied, or the exception must be explicitly recorded.

## Antigravity handoff

For every sprint, provide:

- Sprint file
- Relevant phase file
- `AGENTS.md`
- Current repository state
- Any architecture ADRs referenced by the sprint

The sprint file already contains a reusable execution prompt.
