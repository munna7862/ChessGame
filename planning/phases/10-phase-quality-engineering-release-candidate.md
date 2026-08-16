# Phase 10: Quality Engineering & Release Candidate

## Objective

Turn the feature-complete application into a release candidate through
systematic verification.

## Outcome

ChessForge has evidence that the product is functionally correct,
robust, performant and secure enough for v1 release.

## Scope

- Full unit suite
- Integration suite
- E2E suite
- Property-based testing
- Mutation testing
- Regression testing
- Visual testing
- Performance testing
- Reliability testing
- Security review
- Dependency review
- Failure recovery
- Windows environment testing
- Release-candidate build

## Test pyramid

```text
              E2E
             /   \
        Integration
           /       \
       Unit + Domain
```

The chess domain should have the largest and strongest automated suite.

## Rule verification

Build a permanent regression corpus for:

- castling
- en passant
- promotion
- pins
- checks
- checkmates
- stalemates
- repetition
- fifty-move
- insufficient material

## Property testing

Verify invariants after generated legal games.

## Mutation testing

Introduce controlled faults and verify the test suite catches them.

Examples:

- disable check validation
- break castling
- alter promotion
- corrupt turn switching
- ignore en passant

## E2E critical paths

1.  Human vs Human
2.  Human vs Computer
3.  Promotion
4.  Checkmate
5.  Resignation
6.  Draw
7.  Save/load PGN
8.  FEN import
9.  Game recovery
10. Timed game

## Performance

Measure:

- startup
- board interaction
- animation
- engine responsiveness
- memory over long sessions
- persistence operations

## Security review

Review:

- Tauri capabilities
- file access
- IPC
- shell access
- external process access
- imported data
- dependencies
- update path

Keep permissions minimal.

## Antigravity strategy

Create separate review agents:

```text
QA Agent
Security Agent
Performance Agent
Release Agent
```

Have each produce a review artifact.

Then run a final human release review.

## Acceptance criteria

- All required automated tests pass.
- Critical regression suite passes.
- No unresolved critical/high defects.
- Performance targets are acceptable.
- Security review complete.
- Dependency review complete.
- Windows release candidate builds.
- Clean-machine test succeeds.

## Exit criteria

A release candidate can be installed and tested by someone who did not
build the application.

## Sprint decomposition candidates

- Test inventory
- Rule regression suite
- E2E
- Property testing
- Mutation testing
- Visual testing
- Performance
- Reliability
- Security
- Dependency audit
- Clean Windows validation
- Release candidate
