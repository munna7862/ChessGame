# Settings Model & Storage Specification

## 1. Executive Summary & Objective

The objective of **Phase 08 · Sprint 05: Settings Model and Storage** is to establish an authoritative, decoupled, type-safe, and persistent preferences model for ChessForge. In accordance with the Universal Operating Contract in [AGENTS.md](file:///c:/Workspace/ChessGame/AGENTS.md), ChessForge is a 100% local-first desktop application. User preferences must survive application restarts, handle corrupted or partial data gracefully without crashing or throwing unhandled errors, support versioned schema migrations, provide reactive state updates across UI components, and offer deterministic reset-to-defaults capabilities.

---

## 2. Requirements Matrix

| Requirement ID | Description                                  | Architectural Invariant                                                                                                                                                  |
| :------------- | :------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REQ-SET-01`   | **Authoritative Settings Schema**            | Define complete `PersistedSettingsSchema` with strict Zod types, min/max bounds, and enum invariants.                                                                    |
| `REQ-SET-02`   | **Deterministic Defaults**                   | Provide immutable `DEFAULT_PERSISTED_SETTINGS` object used on initial launch, fallback, and reset.                                                                       |
| `REQ-SET-03`   | **Strict Validation & Partial Sanitization** | Validate all external/persisted inputs at runtime. Invalid or missing fields are safely repaired with default values rather than aborting.                               |
| `REQ-SET-04`   | **Atomic Persistence & Partial Updates**     | Support patch updates (`updateSettings(partial)`) that atomically persist to local storage via `PersistenceService` without mutating unrelated state (e.g. active game). |
| `REQ-SET-05`   | **Reactive Subscription Pattern**            | `SettingsService` provides listener subscription (`subscribe(callback)`) so components and services update instantaneously upon preference mutations.                    |
| `REQ-SET-06`   | **Version Migration & Schema Evolution**     | Integration with `MigrationEngine` ensuring future schema extensions or key renamings migrate cleanly.                                                                   |
| `REQ-SET-07`   | **Reset-to-Defaults Semantics**              | Provide an atomic `resetSettings()` operation that restores all preferences to default values and persists immediately.                                                  |
| `REQ-SET-08`   | **Decoupled React Context & Hook**           | Provide `SettingsProvider` and `useSettings` hook delivering single-source-of-truth settings state to React components without tight coupling.                           |

---

## 3. Data Model & Schema Definition

### 3.1 Settings Schema & Types

```typescript
import { z } from "zod";

export const BoardThemeSchema = z.enum(["classic", "wood", "slate", "ocean"]);
export type BoardTheme = z.infer<typeof BoardThemeSchema>;

export const PieceSetSchema = z.enum(["standard", "classic", "modern"]);
export type PieceSet = z.infer<typeof PieceSetSchema>;

export const PersistedSettingsSchema = z.object({
  boardTheme: BoardThemeSchema.default("classic"),
  pieceSet: PieceSetSchema.default("standard"),
  showCoordinates: z.boolean().default(true),
  showLegalMoves: z.boolean().default(true),
  showLastMove: z.boolean().default(true),
  soundEnabled: z.boolean().default(true),
  autoQueen: z.boolean().default(false),
  engineDifficulty: z.number().int().min(1).max(8).default(3),
  reducedMotion: z.boolean().default(false),
  volume: z.number().min(0).max(100).default(80),
});
export type PersistedSettings = z.infer<typeof PersistedSettingsSchema>;

export const PartialPersistedSettingsSchema = PersistedSettingsSchema.partial();
export type PartialPersistedSettings = z.infer<
  typeof PartialPersistedSettingsSchema
>;
```

### 3.2 Default Settings Object

```typescript
export const DEFAULT_PERSISTED_SETTINGS: Readonly<PersistedSettings> =
  Object.freeze({
    boardTheme: "classic",
    pieceSet: "standard",
    showCoordinates: true,
    showLegalMoves: true,
    showLastMove: true,
    soundEnabled: true,
    autoQueen: false,
    engineDifficulty: 3,
    reducedMotion: false,
    volume: 80,
  });
```

---

## 4. Architecture & Service Design

```
+-------------------------------------------------------------+
|                      React UI Layer                         |
|  (Board, Header, SettingsModal, SoundService, Clocks)       |
+-------------------------------------------------------------+
                              |
                     useSettings() Hook
                              |
+-------------------------------------------------------------+
|                   SettingsContext / Provider                |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
|                      SettingsService                        |
|  - In-memory cached authoritative settings state             |
|  - Listener subscription dispatcher (subscribe/notify)      |
|  - Partial update & sanitization logic                      |
|  - Reset to defaults                                        |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
|                    PersistenceService                       |
|  - Versioned PersistedStateV1 (settings + activeGame)        |
|  - MigrationEngine                                          |
|  - Storage Adapter (LocalStorage / Tauri IPC)               |
+-------------------------------------------------------------+
```

### 4.1 Settings Sanitization & Repair

When reading raw or untrusted JSON, the sanitization function evaluates each field individually:

- Valid fields are preserved.
- Invalid or missing fields are replaced by `DEFAULT_PERSISTED_SETTINGS` defaults.
- This ensures corrupted disk storage or third-party tampering never causes UI failure.

---

## 5. Security & Invariant Guardrails

1. **Zero-Privilege Local Storage:** Settings reside solely in local storage / native config files with no remote telemetry or cloud sync.
2. **Boundary Validation:** Every incoming value passed to `updateSettings()` is parsed through `PartialPersistedSettingsSchema`. Out-of-range numbers (e.g. `engineDifficulty: 9` or `volume: -10`) or invalid theme strings are strictly rejected with typed errors.
3. **State Isolation:** Modifying settings preserves the active game recovery state and version metadata in `PersistedStateV1`.
4. **Subscription Cleanup:** All React hooks and event listeners provide synchronous unsubscribe handlers to prevent memory leaks.
