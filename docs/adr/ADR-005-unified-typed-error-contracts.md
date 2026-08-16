# ADR-005: Unified Typed Result and Error Models Across Boundaries

**Status:** Accepted  
**Date:** 2026-08-16  
**Author:** Dev Architect & Senior SDE  
**Deciders:** Dev Architect, Security Officer, SDET Architect  

---

## 1. Context & Problem Statement

Desktop applications that rely on raw thrown exceptions, generic error strings, or unhandled promise rejections often suffer from:
1. Leaked runtime stack traces or engine panics shown directly to end users.
2. Silent component unmounts (white screens of death) in React when an unexpected exception occurs.
3. Ambiguous error handling where presentation components cannot distinguish between a recoverable validation error (e.g. invalid move) and an unrecoverable failure (e.g. engine worker termination).

## 2. Decision

We mandate a **Unified Typed Result and Error Architecture** using discriminated unions across all module boundaries:
1. **Result Primitive:** Functions performing fallible domain logic, file operations, or engine commands return `Result<T, AppError>`:
   ```typescript
   export type Result<T, E = AppError> =
     | { readonly success: true; readonly data: T }
     | { readonly success: false; readonly error: E };

   export const ok = <T>(data: T): Result<T, never> => ({ success: true, data });
   export const err = <E>(error: E): Result<never, E> => ({ success: false, error });
   ```
2. **Discriminated Union Errors:** Errors are strictly categorized and typed:
   - `DomainError`: `ILLEGAL_MOVE`, `INVALID_FEN`, `INVALID_PGN`, `GAME_ALREADY_OVER`.
   - `InfrastructureError`: `ENGINE_CRASH`, `ENGINE_TIMEOUT`, `FILE_IO_ERROR`, `CORRUPTED_SNAPSHOT`.
3. **Graceful Presentation Mapping:** React presentation components map typed error codes to contextual UI responses (e.g. invalid move -> square shake animation; engine crash -> reload worker button toast) without crashing or displaying raw stack traces.
4. **Rust / Tauri IPC Mapping:** Rust Tauri commands return `Result<T, String>` where errors are converted to standardized error codes before crossing the IPC bridge.

## 3. Considered Alternatives & Rejected Rationale

### Alternative A: Standard JavaScript Exceptions (`throw new Error(...)`)
- **Description:** Throwing standard exceptions and relying on `try / catch` blocks.
- **Why Rejected:** Makes failure modes invisible in TypeScript function signatures, encourages unhandled exception leaks to React error boundaries, and prevents exhaustive compiler type checking for error cases.

### Alternative B: Generic Untyped Strings (`Promise<string | null>`)
- **Description:** Returning error messages as strings or `null` on failure.
- **Why Rejected:** Loses semantic structure, preventing UI components from tailoring behavior (e.g. distinguishing a file permission error from a file not found error).

## 4. Consequences & Trade-offs

- **Positive:**
  - Exhaustive compile-time safety and self-documenting APIs.
  - Zero unformatted engine panics or stack traces in the UI.
  - Predictable, testable error states across all integration tests.
- **Negative / Neutral:**
  - Requires explicit unwrapping of `Result` types in application coordinators.
