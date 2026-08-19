# Pull Request: Phase 08 · Sprint 05 - Settings Model and Storage

## Summary

This PR implements **Phase 08 · Sprint 05: Settings Model and Storage** for ChessForge, establishing an authoritative, decoupled, type-safe, and persistent preferences model.

### Key Deliverables & Changes

1. **Authoritative Settings Schema & Model (`src/domain/persistence/schema.ts`):**
   - Defined strict Zod schemas for `BoardThemeSchema` (`"classic" | "wood" | "slate" | "ocean"`), `PieceSetSchema` (`"standard" | "classic" | "modern"`), `PersistedSettingsSchema`, and `PartialPersistedSettingsSchema`.
   - Immutable factory defaults `DEFAULT_PERSISTED_SETTINGS` providing deterministic baseline configurations for boards, coordinates, sound, engine difficulty, animation, and volume.

2. **Validation & Sanitization Subsystem (`src/domain/persistence/settings/settingsValidation.ts`):**
   - `validateSettings()` and `validatePartialSettings()` for strict runtime validation.
   - `sanitizeSettings()` for robust, crash-resilient repair of corrupt, partial, or missing keys without discarding valid preferences or crashing the application.

3. **Settings Service & Subscription Dispatcher (`src/domain/persistence/settings/SettingsService.ts`):**
   - In-memory cached snapshot with zero unnecessary allocations and immutable frozen state references.
   - `updateSettings(patch)`: Atomically validates, applies partial patch, persists to disk via `PersistenceService`, and dispatches updates to subscribers.
   - `resetSettings()`: Restores deterministic defaults and persists.
   - `subscribe(listener)`: Subscribes listeners with clean unsubscribe cleanup.

4. **React Context & Hook (`src/features/settings/`):**
   - `SettingsProvider` integrating React 19 `useSyncExternalStore` for tear-free, non-cascading state synchronization.
   - `useSettings()` hook offering convenient updater methods (`setBoardTheme`, `setPieceSet`, `setShowCoordinates`, `setShowLegalMoves`, `setShowLastMove`, `setSoundEnabled`, `setAutoQueen`, `setEngineDifficulty`, `setReducedMotion`, `setVolume`).
   - Integrated into `App.tsx` at the root.

5. **Comprehensive Testing & Quality Gates:**
   - 4 new test suites (18 unit, integration, and fast-check property tests):
     - `src/domain/persistence/__tests__/settingsSchema.test.ts`
     - `src/domain/persistence/__tests__/SettingsService.test.ts`
     - `src/domain/persistence/__tests__/settingsInvariants.test.ts`
     - `src/features/settings/__tests__/useSettings.test.tsx`
   - Total test suite: 88 files, 726 Vitest tests passing (0 failures, 0 skips).
   - Playwright E2E: 55 tests passing.
   - TypeScript: 0 errors.
   - ESLint: 0 errors, 0 warnings.
   - Prettier: 100% compliant.
   - Production build: Succeeded in 2.67s.

---

## Verification & Test Results

```text
✓ Vitest Test Suites: 88 passed (88)
✓ Vitest Tests: 726 passed (726)
✓ Playwright E2E Tests: 55 passed (55)
✓ Typecheck: tsc --noEmit (0 errors)
✓ Lint: eslint . (0 errors, 0 warnings)
✓ Prettier: format:check (100% compliant)
✓ Build: tsc -b && vite build (0 errors)
```

---

## Acceptance Criteria Checklist

- [x] Defaults are deterministic.
- [x] Changes persist across restart.
- [x] Invalid values are rejected.
- [x] Reset restores defaults.
- [x] Settings decoupled from UI components.
