# E2E Stable Test Identifiers Policy

**Status:** Approved Standard  
**Owner:** SDET Architect & Dev Architect  
**Applies To:** Presentation Layer (React 19), UI Components, E2E Test Suites (`tests/e2e/`)

---

## 1. Objective & Principles

End-to-end tests for ChessForge validate critical user journeys across the desktop webview interface. To ensure automated tests remain resilient to styling changes, refactorings, and design updates, the following **Stable Test Identifiers Policy** governs all DOM selectors across the codebase:

1. **Explicit Test Attributes:** All testable interactive elements, status indicators, chess board squares, pieces, and container regions must use explicit `data-testid` attributes.
2. **Never Bind to CSS / Styling Classes:** Tests must never locate elements using CSS styling classes (e.g. `.metric-value`, `.hero-title`, Tailwind/utility classes) because styling is subject to visual redesigns.
3. **Semantic Hierarchy & Naming Convention:** Test IDs must follow a deterministic kebab-case naming scheme:
   $$\text{data-testid} = \text{"[domain/component]-[element]-[qualifier]"}$$

---

## 2. Naming Conventions Catalog

| Category                    | Format Pattern                            | Examples                                                                | Description                                                  |
| :-------------------------- | :---------------------------------------- | :---------------------------------------------------------------------- | :----------------------------------------------------------- |
| **Application & Shell**     | `app-[element]`                           | `chessforge-app`, `app-header`, `app-title`, `app-brand`, `app-version` | Root container and desktop window layout elements.           |
| **Header & Status**         | `header-[element]`, `status-badge-[type]` | `header-brand`, `status-badge`, `engine-status-badge`                   | Application bar and system status indicators.                |
| **Chess Board & Squares**   | `board-square-[file][rank]`               | `board-square-e4`, `board-square-a1`, `board-square-h8`                 | Individual chessboard squares for drag/drop and click moves. |
| **Chess Pieces**            | `piece-[color]-[type]-[square]`           | `piece-w-pawn-e2`, `piece-b-knight-f6`, `piece-w-king-e1`               | Rendered piece elements with dynamic square coordinates.     |
| **Clocks & Timers**         | `clock-[color]`                           | `clock-white`, `clock-black`, `clock-white-time`, `clock-black-time`    | Fischer chess clocks and timing containers.                  |
| **Move History & Notation** | `move-list`, `move-item-[ply]`            | `move-list-container`, `move-item-1`, `move-item-2`                     | SAN move history list and individual plies.                  |
| **Modals & Dialogs**        | `modal-[name]`, `modal-[name]-[action]`   | `modal-promotion`, `modal-promotion-queen`, `modal-game-over`           | Pawn promotion dialogs, game-over alerts, settings modals.   |
| **Action Controls**         | `btn-[action]`, `toggle-[action]`         | `btn-new-game`, `btn-flip-board`, `btn-undo-move`, `btn-export-pgn`     | Buttons and user action controls.                            |

---

## 3. Playwright Locator Best Practices

When authoring E2E tests in `tests/e2e/`:

```typescript
// ✅ RECOMMENDED: Using Playwright getByTestId locator
const appTitle = page.getByTestId("app-title");
await expect(appTitle).toHaveText("ChessForge");

const engineBadge = page.getByTestId("engine-status-badge");
await expect(engineBadge).toBeVisible();

// ✅ RECOMMENDED: Semantic role locators when matching accessible roles
const newGameBtn = page.getByRole("button", { name: /new game/i });

// ❌ FORBIDDEN: Brittle CSS selectors
const title = page.locator(".hero-card > h1.hero-title"); // Brittle!
const badge = page.locator("div.app-container > header > div:nth-child(2)"); // Brittle!
```

---

## 4. Enforcement & Quality Gate

- All new UI components must be instrumented with `data-testid` during development.
- SDET review checks PR diffs for compliance with this policy before test sign-off.
