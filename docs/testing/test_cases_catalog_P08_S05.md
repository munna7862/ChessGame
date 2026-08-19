# Test Cases Catalog: Phase 08 · Sprint 05 (Settings Model & Storage)

## 1. Traceability Matrix

| Test ID     | Category        | Target Component / Method                                                    | Requirements Covered       |
| :---------- | :-------------- | :--------------------------------------------------------------------------- | :------------------------- |
| `TC-SET-01` | Unit            | `PersistedSettingsSchema` defaults                                           | `REQ-SET-01`, `REQ-SET-02` |
| `TC-SET-02` | Unit            | `PersistedSettingsSchema` full parsing                                       | `REQ-SET-01`               |
| `TC-SET-03` | Unit (Negative) | `BoardThemeSchema` & `PieceSetSchema` invalid enums                          | `REQ-SET-01`, `REQ-SET-03` |
| `TC-SET-04` | Unit (Negative) | `engineDifficulty` bounds (1..8)                                             | `REQ-SET-01`, `REQ-SET-03` |
| `TC-SET-05` | Unit (Negative) | `volume` bounds (0..100)                                                     | `REQ-SET-01`, `REQ-SET-03` |
| `TC-SET-06` | Unit            | `PartialPersistedSettingsSchema` patch validation                            | `REQ-SET-03`, `REQ-SET-04` |
| `TC-SET-07` | Unit            | `sanitizeSettings()` fallback repair                                         | `REQ-SET-03`               |
| `TC-SET-08` | Unit / Service  | `SettingsService` initialization & load                                      | `REQ-SET-04`               |
| `TC-SET-09` | Unit / Service  | `SettingsService.getSettings()` caching                                      | `REQ-SET-04`               |
| `TC-SET-10` | Unit / Service  | `SettingsService.updateSettings()` valid partial patch                       | `REQ-SET-04`, `REQ-SET-05` |
| `TC-SET-11` | Unit (Negative) | `SettingsService.updateSettings()` invalid patch rejection                   | `REQ-SET-03`, `REQ-SET-04` |
| `TC-SET-12` | Unit / Service  | `SettingsService.resetSettings()` to defaults                                | `REQ-SET-02`, `REQ-SET-07` |
| `TC-SET-13` | Unit / Service  | `SettingsService.subscribe()` listener notification & unmount cleanup        | `REQ-SET-05`               |
| `TC-SET-14` | Integration     | Schema migration & missing fields backfill                                   | `REQ-SET-06`               |
| `TC-SET-15` | Integration     | Settings update preserves active game snapshot                               | `REQ-SET-04`               |
| `TC-SET-16` | UI Component    | `SettingsProvider` & `useSettings()` hook integration                        | `REQ-SET-08`               |
| `TC-SET-17` | UI Component    | `useSettings()` boundary guard outside provider                              | `REQ-SET-08`               |
| `TC-SET-18` | Property Fuzz   | `fast-check` generative fuzzing of settings updates & round-trip persistence | `REQ-SET-01`, `REQ-SET-04` |

---

## 2. Test Execution Details

### 2.1 Schema & Validation Tests (`TC-SET-01` to `TC-SET-07`)

- **Objective:** Verify that `PersistedSettingsSchema`, `PartialPersistedSettingsSchema`, and `sanitizeSettings()` strictly enforce types and repair malformed data deterministically.
- **Pass Criteria:**
  - `PersistedSettingsSchema.parse({})` produces exact `DEFAULT_PERSISTED_SETTINGS`.
  - Negative values, non-integers, and out-of-range bounds on `engineDifficulty` and `volume` fail Zod validation.
  - Invalid theme or piece set strings (e.g. `"neon"`, `"gothic"`) are rejected.
  - `sanitizeSettings({ boardTheme: "invalid", volume: 50 })` returns valid settings with default `boardTheme: "classic"` and preserved `volume: 50`.

### 2.2 Service & Persistence Lifecycle Tests (`TC-SET-08` to `TC-SET-15`)

- **Objective:** Verify `SettingsService` coordinates with `PersistenceService`, caches state, dispatches listener notifications, and handles resets.
- **Pass Criteria:**
  - `SettingsService` loads existing persisted settings from adapter or defaults.
  - `updateSettings({ boardTheme: "slate" })` updates cache, calls `persistenceService.saveSettings()`, and calls all subscribed listeners.
  - `resetSettings()` resets in-memory cache to `DEFAULT_PERSISTED_SETTINGS`, persists, and notifies subscribers.
  - Persisting settings when an active game is present in storage preserves the active game data intact.

### 2.3 React Context & Hook Integration (`TC-SET-16` to `TC-SET-17`)

- **Objective:** Ensure React components can consume and modify settings seamlessly via `useSettings()`.
- **Pass Criteria:**
  - Consumer component renders updated setting immediately upon mutation.
  - Calling `useSettings()` outside `SettingsProvider` throws an informative runtime error.

### 2.4 Generative Property Invariants (`TC-SET-18`)

- **Objective:** Fuzz `updateSettings()` and persistence serialization across 1,000 random arbitrary patches.
- **Pass Criteria:**
  - Valid patches always succeed and deserialize into identical values.
  - Invalid patches are rejected without throwing unhandled exceptions or corrupting storage.
