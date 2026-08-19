# Architecture Specification: Visual Regression & UX Review

**Sprint:** Phase 09 · Sprint 06  
**Document:** `docs/architecture/visual_regression_and_ux_review_specification.md`  
**Status:** Approved  
**Author:** Chess Domain Architect & Dev Architect

---

## 1. Executive Summary & Design Vision

ChessForge is designed as a premier, local-first Windows 10/11 desktop chess application. The visual presentation balances grandmaster clarity with modern desktop aesthetics:

- **Board Dominance:** The $8 \times 8$ chessboard is the visual centerpiece, maintaining an exact $1:1$ aspect ratio across all display resolutions and Windows scaling factors ($100\%, 125\%, 150\%$).
- **Non-Color-Only Indicators:** Every critical game state (check, legal moves, capture opportunities, active turn) communicates via distinct geometries, icons, borders, and ARIA announcements in addition to color tokens.
- **Visual Stability:** Zero layout shifts (CLS $< 0.01$), non-blocking 60fps animations, instant fallback states, and accessible high-contrast themes.

---

## 2. Visual Regression & State Specifications

### 2.1 Core Board & Interaction States (`REQ-VIS`)

| Requirement ID   | State / Feature                      | Visual Specification                                                                                                                                                                                  | Invariant / Acceptance Rule                                                                                                                       |
| :--------------- | :----------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`REQ-VIS-01`** | **Board Normal State**               | Starting FEN position rendered with $8 \times 8$ alternating light/dark squares. Coordinates $a$–$h$ and $1$–$8$ displayed cleanly on board edges with crisp contrast.                                | Board maintains $1:1$ aspect ratio. Pieces are vertically and horizontally centered in each square. Clocks and player panels align symmetrically. |
| **`REQ-VIS-02`** | **Piece Selected & Move Indicators** | Selected piece square highlights with accent border/ring. Destination squares render centered translucent dots for quiet moves and corner halos for captures.                                         | Target indicators do not obstruct underlying pieces. Hovering interactive squares renders subtle elevation/highlight.                             |
| **`REQ-VIS-03`** | **In-Check Visual Cue**              | King in check square highlights with a crimson glow (`--color-check-glow`) accompanied by an alert icon and ARIA announcement.                                                                        | Check indication is immediately obvious without requiring move history inspection; distinct from normal selection.                                |
| **`REQ-VIS-04`** | **Game Over Modal / Banner**         | Checkmate, stalemate, draw, or resignation triggers an elevated result card with clear outcome headline ("Checkmate - White Wins", "Draw by Stalemate") and primary CTA ("New Game", "Analyze").      | Modal does not obscure the final board position completely; backdrop overlay allows inspecting the mating board configuration.                    |
| **`REQ-VIS-05`** | **Board Themes Palette Fidelity**    | 5 distinct themes: Classic (Green/Buff), Wood (Walnut/Maple), Slate (Navy/Steel), Modern (Dark/Light Charcoal), High Contrast (Monochrome Black/White).                                               | All board themes satisfy WCAG AA $\ge 4.5:1$ contrast ratio for square coordinates and piece visibility.                                          |
| **`REQ-VIS-06`** | **Piece Sets Scalability**           | 5 piece sets: Standard (Neo SVG), Alpha (Modern flat), Classic (Traditional vector), Wood (Grain shaded), High Contrast (Bold glyphs).                                                                | Vector SVGs scale losslessly from $32\text{px}$ to $128\text{px}$ without blur, pixelation, or clipping.                                          |
| **`REQ-VIS-07`** | **Modal Dialogs Consistency**        | Modals (New Game, Settings, FEN/PGN, Confirmations) share uniform design language: backdrop blur (`backdrop-filter: blur(4px)`), centered positioning, prominent close button, accessible focus trap. | Modals fit comfortably on $1024 \times 768$ viewports with vertical scrolling if content exceeds viewport height.                                 |
| **`REQ-VIS-08`** | **Error & Loading Indicators**       | Engine thinking pulses softly; engine error banner mounts above board with amber/red border and retry actions; empty move history displays helpful prompt.                                            | No raw exception text or unstyled blank states. Layout remains stable when banners mount/unmount.                                                 |

---

## 3. Windows Viewport & Scaling Specifications (`REQ-SCALE`)

| Requirement ID     | Display / Scaling Target             | Resolution Profile                      | Layout Strategy                                                                                                                                  |
| :----------------- | :----------------------------------- | :-------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| **`REQ-SCALE-01`** | **Compact Windows Displays**         | $1024 \times 768$ (100% scaling)        | Side panels adapt cleanly with condensed padding; chessboard scales to fit height with zero horizontal scrollbars.                               |
| **`REQ-SCALE-02`** | **Standard Laptops (125% DPI)**      | $1280 \times 800$ to $1366 \times 768$  | Default dual-column layout: dominant board left/center, player panels, clocks, and move history on right.                                        |
| **`REQ-SCALE-03`** | **Full HD Displays (100%-150% DPI)** | $1536 \times 864$ to $1920 \times 1080$ | Generous board container, maximum piece fidelity, full move history with captured piece trays and evaluation bar.                                |
| **`REQ-SCALE-04`** | **Window Resize Dynamism**           | Continuous resize event                 | Board element uses CSS `min(calc(100vh - 120px), calc(100vw - 380px))` or flex constraint to resize smoothly without flickering or layout jumps. |

---

## 4. User Experience & Accessibility Invariants (`REQ-UX`)

| Requirement ID  | Area                                | UX Standard                                                                                                                                                                             |
| :-------------- | :---------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`REQ-UX-01`** | **Keyboard Focus Visibility**       | Interactive elements (squares, buttons, inputs, tabs) display a $2\text{px}$ solid high-contrast focus outline with $2\text{px}$ offset when navigated via keyboard (`:focus-visible`). |
| **`REQ-UX-02`** | **Reduced Motion Behavior**         | When `reducedMotion` is enabled, piece slide animations transition instantly ($0\text{ms}$), pulse effects are static, and modal zoom animations are disabled.                          |
| **`REQ-UX-03`** | **Audio / Visual Harmony**          | Move sounds play synchronously with visual move commitment; sound mute toggle immediately silences Web Audio API synth without UI lag.                                                  |
| **`REQ-UX-04`** | **High Contrast Mode**              | High contrast mode enforces `#FFFFFF` / `#000000` borders on all active interactive surfaces, distinct patterns for move hints, and $7:1+$ text contrast.                               |
| **`REQ-UX-05`** | **Visual Artifact Reproducibility** | Playwright visual tests and DOM layout checks execute deterministically in headless Chromium across test runs.                                                                          |

---

## 5. Architectural Boundaries & Compliance

1. **Presentation Separation:** Visual tokens (`src/theme/tokens.ts`, CSS custom properties) drive all styling. No hardcoded inline hex colors in UI component logic.
2. **Domain Isolation:** Chess rules, move validation, and game state logic remain strictly within `src/domain/chess/` and application services.
3. **Local-First Privacy:** All visual assets (SVG piece sets, fonts, audio synth) are bundled locally. Zero external CDN calls or remote web fonts.
