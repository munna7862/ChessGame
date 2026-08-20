# Test Cases Catalog: Phase 11 · Sprint 05 — Upgrade and Uninstall Validation

**Document Version:** 1.0.0  
**Sprint:** Phase 11 · Sprint 05  
**Author:** SDET Architect  
**Status:** Approved for Implementation

---

## 1. Overview & Lifecycle Verification Strategy

Sprint 11.05 validates the complete desktop lifecycle of ChessForge v1.0.0 on Windows beyond fresh installation. This encompasses:

1. Installing over a previous version / test build (Upgrade scenario).
2. Schema and settings migration without loss of user customizations.
3. Active-game recovery policy during version transitions.
4. Clean uninstallation of application binaries, shortcuts, and temporary caches.
5. User data sovereignty and non-destruction of user-generated PGN/FEN files.
6. Clean reinstallation and configuration resumption.

---

## 2. Test Cases Specification Matrix

| Test ID        | Category              | Target Component               | Description & Preconditions                                                | Input / Execution Steps                                                                                                             | Expected Outcome                                                                                                                         |
| :------------- | :-------------------- | :----------------------------- | :------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| **TC-LIFE-01** | Positive / Migration  | `src/domain/persistence`       | Previous Version Snapshot Simulation & Migration                           | Initialize storage with legacy v0 unversioned state / missing fields and trigger `MigrationEngine.migrate()`.                       | Successfully transforms legacy state to `PersistedStateV1` with all default fields populated and no data loss.                           |
| **TC-LIFE-02** | Positive / Settings   | `src/features/settings`        | User Settings Preservation Across Upgrades                                 | Save customized settings (theme: "wood", sound: false, difficulty: 7), simulate app binary upgrade to v1.0.0, and reload settings.  | All custom settings are preserved verbatim after upgrade; missing fields receive safe defaults without overwriting existing preferences. |
| **TC-LIFE-03** | Positive / Game       | `src/domain/persistence`       | Active Game State Preservation Across Upgrades                             | Save mid-game snapshot with active moves, turn, clocks, and orientation; simulate v1.0.0 upgrade and load active session.           | Active game state, FEN string, SAN move history, clocks, and player configuration are restored with 100% fidelity.                       |
| **TC-LIFE-04** | Negative / Recovery   | `src/domain/persistence`       | Corrupted / Future Schema Incompatibility Recovery                         | Load storage payload containing future version (`version: 99`) or corrupt JSON syntax during upgrade.                               | Returns structured error `Result<T, PersistenceError>`, logs safely, and initializes clean default session without UI panic.             |
| **TC-LIFE-05** | Positive / Runtime    | `src/features/engine`          | Post-Upgrade Application Launch & Worker Ready Lifecycle                   | Simulate post-upgrade cold start, initialize `EngineServiceImpl` with `MockEngineWorkerBridge`, issue search, and dispose.          | Engine worker successfully initializes, executes UCI search protocol, reports best move, and terminates cleanly.                         |
| **TC-LIFE-06** | Positive / Desktop    | NSIS / Installer Spec          | Clean Windows Uninstall Invariants & Binary Removal                        | Verify NSIS configuration for `currentUser` install mode, binary directory uninstallation, and shortcut removal.                    | NSIS uninstaller targets `%LOCALAPPDATA%\Programs\ChessForge`, removes executables and Start Menu shortcuts cleanly.                     |
| **TC-LIFE-07** | Security / Data       | User Data Policy               | User Data Sovereignty & PGN File Non-Destruction                           | Verify that uninstallation does not delete user-created PGN files, documents, or exported databases outside the application folder. | User-created documents and exported PGN files remain intact; only application binaries and cache are cleaned.                            |
| **TC-LIFE-08** | Positive / Resumption | `src/domain/persistence`       | Reinstallation Configuration Resumption                                    | Simulate complete uninstall -> reinstall cycle with persistent storage adapter.                                                     | Reinstalled application detects existing user settings, connects to storage seamlessly, and starts without configuration prompts.        |
| **TC-LIFE-09** | Integration Matrix    | Complete Application Lifecycle | Full Lifecycle Matrix (Fresh -> Play -> Upgrade -> Uninstall -> Reinstall) | Execute sequential lifecycle flow: fresh start -> game moves -> version upgrade -> data verification -> uninstall -> reinstall.     | All lifecycle transitions succeed with 100% invariant preservation, zero memory leaks, and zero unhandled errors.                        |

---

## 3. Invariant & Regression Guardrails

1. **Zero Data Loss on Upgrade:** Upgrading application binaries must never wipe or overwrite existing user settings or active game state.
2. **Crash Resilience on Malformed Data:** If saved data from a prior build is corrupted, ChessForge must fallback to a clean FIDE start position without throwing uncaught exceptions.
3. **Local Data Sovereignty:** Uninstallation must remove application binaries and shortcuts without touching user-exported PGN/FEN files or personal documents.
4. **Offline Isolation:** All upgrade, migration, uninstall, and reinstall verification must execute 100% locally with zero network calls or telemetry.
