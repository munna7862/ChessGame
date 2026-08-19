# ChessForge Architecture Specification: Settings UI

**Phase 08 · Sprint 06**  
**Document Version:** 1.0.0  
**Status:** APPROVED  
**Author:** Chess Domain Architect & Dev Architect

---

## 1. Overview & Architectural Goals

The Settings UI provides an accessible, responsive, and intuitive interface for configuring visual board appearance, piece styling, gameplay assistance cues, sound/motion behavior, and chess engine difficulty.

In alignment with the ChessForge architecture:

1. **Unidirectional State Flow:** The Settings UI interacts purely through the reactive `useSettings()` hook and `SettingsService` domain layer. It does not manipulate `localStorage` or disk persistence directly.
2. **Instant Reactivity:** Changes take effect immediately across all active UI components (Board, Pieces, Engine Coordinator, Sound, Animation) without requiring application reload.
3. **Accessibility First:** Full keyboard navigation, ARIA modal attributes (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`), focus trapping, high-contrast support, and screen reader announcements.
4. **Resilient Reset Flow:** Safe confirmation flow before restoring all settings to default values.

---

## 2. Requirements & Functional Contract

| Requirement ID     | Area                          | Description                                                                                                                                                                  |
| :----------------- | :---------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`REQ-SETUI-01`** | **Dialog Architecture**       | Modal dialog with header, category tabs (Appearance, Gameplay, Audio & Motion, Engine), content panel, and footer actions. Supports Escape key and backdrop click dismissal. |
| **`REQ-SETUI-02`** | **Board Theme Selector**      | Visual selection for board themes (`classic`, `wood`, `slate`, `ocean`) featuring mini preview squares and active state indicator.                                           |
| **`REQ-SETUI-03`** | **Piece Set Selector**        | Visual selection for piece sets (`standard`, `classic`, `modern`) featuring sample piece previews.                                                                           |
| **`REQ-SETUI-04`** | **Board & Assist Toggles**    | Toggles for Board Coordinates (`showCoordinates`), Legal Move Indicators (`showLegalMoves`), and Last Move Highlighting (`showLastMove`).                                    |
| **`REQ-SETUI-05`** | **Audio & Volume Controls**   | Master sound toggle (`soundEnabled`) and granular volume slider (`volume`: 0–100%) with accessible numeric value and mute state.                                             |
| **`REQ-SETUI-06`** | **Motion & Animation**        | Reduced Motion toggle (`reducedMotion`) synced with system `prefers-reduced-motion` and board animation speed overrides.                                                     |
| **`REQ-SETUI-07`** | **Engine & Play Preferences** | Engine difficulty level selector (`engineDifficulty`: 1–8 with title/Elo badges) and Auto-Queen promotion toggle (`autoQueen`).                                              |
| **`REQ-SETUI-08`** | **Reset to Defaults**         | "Reset to Defaults" button opening a confirmation prompt, restoring domain defaults via `resetSettings()`.                                                                   |

---

## 3. UI Component Hierarchy

```
src/features/settings/
├── components/
│   ├── SettingsModal.tsx            // Primary dialog container with tab navigation & header
│   ├── SettingsModal.css            // Dialog styles, layout, glassmorphism, responsive grid
│   ├── AppearanceSettingsSection.tsx // Board theme & piece set visual selectors
│   ├── GameplaySettingsSection.tsx   // Coordinates, move highlights, last move, auto-queen
│   ├── AudioMotionSettingsSection.tsx// Sound toggle, volume slider, reduced motion
│   ├── EngineSettingsSection.tsx     // Stockfish difficulty slider, Elo badges, depth info
│   └── ResetSettingsConfirmModal.tsx // Safety confirmation dialog before wiping settings
├── SettingsContext.tsx              // Reactive context provider (useSyncExternalStore)
├── useSettings.ts                   // Consumer hook
├── settingsContextInstance.ts       // Context instance & types
└── index.ts                         // Public exports
```

---

## 4. Theme & Visual Style Token Contracts

### 4.1 Board Themes

| Theme ID  | Light Square Color         | Dark Square Color       | Border / Accent |
| :-------- | :------------------------- | :---------------------- | :-------------- |
| `classic` | `#e2e8f0` (Slate 200)      | `#64748b` (Slate 500)   | `#334155`       |
| `wood`    | `#f0d9b5` (Warm Cream)     | `#b58863` (Oak Wood)    | `#8c6747`       |
| `slate`   | `#cbd5e1` (Light Slate)    | `#475569` (Dark Slate)  | `#1e293b`       |
| `ocean`   | `#cbe4f9` (Light Nautical) | `#2e5b88` (Deep Marine) | `#1b3a57`       |

### 4.2 Piece Sets

| Set ID     | Description                      | Style Characteristics                |
| :--------- | :------------------------------- | :----------------------------------- |
| `standard` | ChessForge Standard Vector SVGs  | Clean modern FIDE vector silhouettes |
| `classic`  | Traditional Staunton Vector SVGs | High-detail traditional outlines     |
| `modern`   | Minimalist Geometric Vector SVGs | Contemporary streamlined geometry    |

---

## 5. Header Launch & Keyboard Trapping

1. **Header Integration:** A dedicated "Settings" button (`btn-open-settings`) in `Header.tsx` opens the modal.
2. **Focus Management:**
   - On open: Focus moves to the close button or active category tab.
   - On close: Focus returns to the trigger button that launched the modal.
   - Escape key immediately closes the modal.
   - Backdrop click closes the modal.

---

## 6. Verification & Quality Gates

- **Unit / Component Tests:** All tabs, inputs, sliders, toggles, and reset flows verified via React Testing Library with 100% assertion coverage.
- **Persistence Verification:** Modifying any setting in the modal persists the updated value through `SettingsService` and verifies that reopening preserves values.
- **Invariants:** Reset returns all values strictly equal to `DEFAULT_PERSISTED_SETTINGS`.
