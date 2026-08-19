# Persistence Abstraction & Versioned State Specification

## 1. Architectural Overview & Context

ChessForge requires a local-first, crash-resilient persistence framework for storing user preferences and active game recovery snapshots. In alignment with ADR-004 (_Local-First JSON Persistence and Atomic Recovery_) and the decoupled architecture mandate, persistence must remain completely isolated from React UI components, chess domain logic, and engine workers.

```mermaid
graph TD
    subgraph UI ["Presentation Layer (React 19)"]
        Components["Settings Dialog / Game Recovery Hook"]
    end

    subgraph Service ["Application Services"]
        PersistService["PersistenceService (Coordinator & Validator)"]
        Migrator["MigrationEngine (Version Transformation)"]
    end

    subgraph Domain ["Persistence Domain"]
        Schema["Zod Schemas & Types (PersistedState v1)"]
        Errors["PersistenceError & Result Contract"]
        Ports["PersistenceStorageAdapter (Port Interface)"]
    end

    subgraph Adapters ["Infrastructure Adapters"]
        MemAdapter["InMemoryPersistenceAdapter (Testing / Ephemeral)"]
        LocalAdapter["LocalStoragePersistenceAdapter (Desktop Webview)"]
    end

    Components --> PersistService
    PersistService --> Migrator
    PersistService --> Schema
    PersistService --> Errors
    PersistService --> Ports
    Migrator --> Schema
    Ports <|.. MemAdapter
    Ports <|.. LocalAdapter
```

---

## 2. Invariant Specifications (`REQ-PERSIST-01` to `REQ-PERSIST-07`)

### `REQ-PERSIST-01`: Port & Adapter Isolation

- The persistence domain must define a clean storage port interface (`PersistenceStorageAdapter`) that abstracts the physical storage backend.
- UI components and domain models must never directly access `window.localStorage`, indexedDB, or filesystem APIs. All persistence interactions flow through `PersistenceService`.

### `REQ-PERSIST-02`: Versioned State Schema

- Every serialized root state document MUST include a positive integer `version` field (starting at `SCHEMA_VERSION = 1`).
- The schema is enforced at runtime via **Zod** (`PersistedStateSchemaV1`), defining:
  - `version: 1`
  - `updatedAt: number` (Unix epoch millisecond timestamp)
  - `settings: PersistedSettingsSchema`
  - `activeGame: PersistedActiveGameSchema.optional()`
  - `metadata: Record<string, unknown>.optional()`

### `REQ-PERSIST-03`: Storage Adapter Contracts

- Storage adapters must implement the `PersistenceStorageAdapter` port:
  - `getItem(key: string): Result<string | null, PersistenceError>`
  - `setItem(key: string, value: string): Result<void, PersistenceError>`
  - `removeItem(key: string): Result<void, PersistenceError>`
  - `clear(): Result<void, PersistenceError>`
  - `keys(): Result<string[], PersistenceError>`
- The system must provide:
  1. `InMemoryPersistenceAdapter`: Deterministic in-memory key-value map for fast, isolated unit and integration testing without side effects.
  2. `LocalStoragePersistenceAdapter`: Web Storage API wrapper with fallback handling for environments where storage is disabled or quota is exceeded.

### `REQ-PERSIST-04`: Runtime Schema Validation & Serialization

- Serialization formats domain objects into normalized JSON strings.
- Deserialization parses JSON and strictly validates against Zod schemas.
- Extra unknown fields are safely handled (either stripped or preserved according to schema design).

### `REQ-PERSIST-05`: Corruption Resilience & Safe Fallback

- If stored data is corrupted (invalid JSON syntax, missing critical fields, schema mismatches), `PersistenceService` must:
  1. Catch parsing and schema errors without throwing unhandled exceptions.
  2. Return a structured `Result.err(PersistenceError)`.
  3. Provide `loadWithFallback(defaultState)` which safely returns default state upon error or missing data, guaranteeing the desktop application boots cleanly under all circumstances.

### `REQ-PERSIST-06`: Schema Migration Framework

- The `MigrationEngine` manages step-wise schema evolution:
  - Migrations are registered as discrete transition functions: `(data: unknown) => unknown` from version $N$ to $N+1$.
  - When loading data where `payload.version < CURRENT_SCHEMA_VERSION`, the engine runs the sequence of migrations in order ($v1 \to v2 \to \dots \to v_{\text{current}}$).
  - After migration, the resulting payload is validated against the latest schema and optionally persisted back to storage.
  - If `payload.version > CURRENT_SCHEMA_VERSION`, it rejects with `UNSUPPORTED_VERSION` error and does not mutate or overwrite data.

### `REQ-PERSIST-07`: Standardized Error Contract & Result Types

- All persistence methods return `Result<T, PersistenceError>` with standardized error codes:
  - `STORAGE_UNAVAILABLE`: LocalStorage not accessible or quota exceeded.
  - `PARSE_ERROR`: Malformed JSON string.
  - `VALIDATION_FAILED`: Zod schema constraint violation.
  - `MIGRATION_FAILED`: A migration step failed during execution.
  - `UNSUPPORTED_VERSION`: Encountered an unknown or future schema version.
  - `WRITE_FAILED`: Error writing to storage backend.
  - `READ_FAILED`: Error reading from storage backend.
