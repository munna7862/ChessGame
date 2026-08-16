---
name: chessforge-dev-coding-standards
description: ChessForge production coding standards for TypeScript, React, Tauri, Rust boundaries, chess domain code, engine integration and persistence.
---

# ChessForge Dev Coding Standards

## 1. Type Safety

- TypeScript `strict: true`.
- `any` is prohibited except with explicit documented exception.
- Prefer discriminated unions for state machines.
- Use explicit types for domain inputs/outputs.
- Use `unknown` for genuinely unknown external data and narrow it safely.

## 2. Chess Domain Rules

The chess domain is framework-independent.

Do not put chess legality inside React components.

Use:

```text
UI -> Application Service -> Chess Domain -> Chess Library Adapter
```

The domain must own:

- legal move validation
- position
- turn
- game status
- move history
- FEN/PGN semantics

## 3. Engine Rules

Stockfish is an advisor, not the source of truth.

```text
Engine -> proposed Move
Move -> Chess Domain validation
Domain -> commit/reject
```

Engine responses must carry a request/session identity. Stale responses must be ignored.

## 4. Tauri Rules

- Native commands must be narrow.
- Never expose broad filesystem or shell access.
- Do not put business logic in Tauri commands.
- Validate IPC payloads.
- Keep frontend independent of Rust implementation details.
- Add a capability only when a concrete feature requires it.

## 5. State Integrity

Avoid duplicate authoritative state.

If the board position exists in the domain, do not create a second independently mutable board position in React.

Persistence is a snapshot.

Engine state is ephemeral.

UI state is presentation/transient state.

## 6. Error Handling

Use typed domain/application errors.

User-facing errors must be understandable.

Do not expose raw stack traces.

Log diagnostic information only where appropriate and never log secrets.

## 7. Async Safety

- Handle rejected promises.
- Clean up worker/listener resources.
- Cancel or invalidate stale async operations.
- Never use arbitrary timeout sleeps as synchronization.

## 8. Dependency Discipline

Before adding a dependency, document its purpose, license, maintenance, size/runtime impact and alternatives.

## 9. Code Quality

Prefer small cohesive functions and modules.

Do not split code mechanically because of a line-count rule. Extract when responsibility, testability or readability improves.

Use dependency inversion at meaningful boundaries, especially:

- chess library adapter
- engine service
- persistence
- native file APIs
- clock/time source
