---
name: dev-coding-standards
description: Universal coding standards, type safety rules, Tauri IPC patterns, and state integrity guidelines for the ChessForge desktop application.
---

# Universal Dev Coding Standards for ChessForge

When writing production code for **ChessForge**, the following standards must be applied to guarantee 60fps UI performance, strict type safety, clean domain architecture, and crash-resilient desktop stability across **TypeScript (React/Vite)**, **Rust (Tauri v2)**, and **WebWorker (Stockfish WASM)**.

---

### 1. Strict Typing & Boundary Schema Validation

* **Zero Untyped Data (`any` strictly forbidden):**
  * In TypeScript: Run in `strict: true` mode. The `any` type is strictly prohibited; use `unknown` with explicit type narrowing guards (`typeof`, `instanceof`, or custom type predicates).
  * In Rust: Enforce strict type safety, exhaustiveness in `match` expressions, and avoid unchecked `unwrap()` in production code; use structured error handling (`Result<T, AppError>`).
* **Runtime Schema Validation at Boundaries:**
  * Validate all data crossing boundaries (Tauri IPC invocations, WebWorker messages, local storage / settings JSON, FEN/PGN string parsing) using **Zod** in TypeScript and **Serde** in Rust:

```typescript
import { z } from "zod";

export const MovePayloadSchema = z.object({
  from: z.string().regex(/^[a-h][1-8]$/),
  to: z.string().regex(/^[a-h][1-8]$/),
  promotion: z.enum(["q", "r", "b", "n"]).optional(),
});

export type MovePayload = z.infer<typeof MovePayloadSchema>;
```

---

### 2. Clean Architecture & IPC / Worker Contracts

* **Domain Layer Decoupling:**
  * The Chess Domain (game rules, move generation, FEN/PGN parser, clock timer logic) must remain completely decoupled from React UI components. Domain logic must be pure, synchronous/deterministic, and unit-testable in isolation.
* **Unified IPC & Error Response Format:**
  * Never throw unhandled exceptions across the Tauri IPC boundary or WebWorker bridge. All commands must return standardized result structures:

```typescript
export interface CommandResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
```

* **WebWorker & Engine Offloading:**
  * CPU-intensive tasks (Stockfish WASM evaluation, deep move analysis) must execute exclusively inside dedicated WebWorkers to guarantee the main UI thread never drops below 60fps.
* **Structured UI State Management:**
  * Utilize immutable state updates (Zustand or React context + reducers). Prevent state mutations during render cycles.

---

### 3. File Persistence & State Integrity

* **Atomic File Storage:**
  * Ensure game autosaves, settings modifications, and PGN exports write atomically (using temporary write + rename or Tauri plugin store) to prevent file corruption during sudden system shutdowns.
* **Schema Versioning:**
  * All persisted configuration and saved game states must include a `version: number` field with defined migration paths.

---

### 4. SOLID Design & Desktop UI Performance

* **Single Responsibility Principle (SRP):** Components, hooks, and domain modules must have a single clear concern (e.g. Board renderer vs Move validator vs Clock controller).
* **React Render Optimization:** Memoize heavy board/piece components (`React.memo`, `useMemo`, `useCallback`) to avoid redundant re-renders on clock ticks.
* **Accessible & Responsive:** Support keyboard navigation, high-contrast themes, and fluid resizing across Windows desktop resolutions.