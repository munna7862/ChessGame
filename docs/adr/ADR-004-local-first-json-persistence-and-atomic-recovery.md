# ADR-004: Local-First JSON Snapshot Persistence & Crash Recovery

**Status:** Accepted  
**Date:** 2026-08-16  
**Author:** Dev Architect & Senior SDE  
**Deciders:** Dev Architect, Security Officer, SDET Architect  

---

## 1. Context & Problem Statement

ChessForge requires seamless recovery of active game sessions if the application closes or crashes, alongside user preferences storage (theme, sound, piece set, engine difficulty). The persistence strategy must:
1. Guarantee data integrity and atomic writes without corrupted partial files.
2. Allow instant crash recovery on launch with zero user data loss.
3. Validate recovered state against domain schemas to prevent application lockup from corrupted data.
4. Strictly comply with the local-first mandate (no external databases or cloud sync).

## 2. Decision

We mandate **Local-First JSON Snapshot Persistence** utilizing atomic write semantics:
1. **Runtime Schema Validation:** All saved session state and user preferences are validated at load time using **Zod** schemas in TypeScript.
2. **Snapshot Model:** State is persisted as an immutable snapshot (`SessionSnapshot`) containing the initial FEN, move history SAN array, player configurations, and clock balances.
3. **Atomic File Storage:** File writes use temporary-file replacement semantics (`write to .tmp -> flush -> atomic rename`) to prevent file corruption during sudden system shutdowns.
4. **Crash-Resilient Recovery:** On startup, if a recoverable active session exists in storage, the application validates the snapshot and prompts or restores the session automatically. If the snapshot fails schema or domain validation, it logs a warning, falls back cleanly to a fresh game state, and notifies the user via a non-fatal banner.

```text
GameSession (Active Move Committed)
       │
       ▼
SessionCoordinator.captureSnapshot()
       │
       ▼
Zod Schema Validation & Serialization
       │
       ▼
Atomic File / Local Persistence Write
```

## 3. Considered Alternatives & Rejected Rationale

### Alternative A: Embedded SQLite Database (`tauri-plugin-sql` / `rusqlite`)
- **Description:** Storing games, moves, and preferences in an embedded relational SQLite database.
- **Why Rejected:** Excessive architectural complexity and binary overhead for a local desktop chess app. Single-session recovery and preferences are cleanly handled by lightweight, human-readable JSON files with zero database schema migrations or SQL query overhead.

### Alternative B: Direct Unvalidated `localStorage` Storage
- **Description:** Directly calling `localStorage.setItem('gameState', JSON.stringify(session))` inside React components.
- **Why Rejected:** Vulnerable to silent corruption, size limits, lacks atomic file guarantees, and bypasses domain validation upon deserialization.

### Alternative C: Remote Cloud Sync Backend
- **Description:** Syncing game state to a PostgreSQL or Firebase backend.
- **Why Rejected:** Explicitly forbidden by the Local-First Infrastructure Rule (ChessForge v1 is a 100% offline desktop app).

## 4. Consequences & Trade-offs

- **Positive:**
  - Zero external database dependencies; pure lightweight JSON.
  - Human-readable settings and recovery state in `%APPDATA%/ChessForge`.
  - Atomic write safety guarantees zero corrupt save files.
- **Negative / Neutral:**
  - If a large game database (e.g. 100,000 PGN games) is added in future phases, a specialized indexing engine will be introduced at that time without impacting v1 active session storage.
