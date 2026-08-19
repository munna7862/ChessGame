# Architecture & Technical Specification: Board Themes & Piece Sets

**Sprint:** Phase 09 · Sprint 02  
**Feature:** Board Themes and Piece Sets Visual Subsystem  
**Status:** Approved  
**Author:** Chess Domain Architect & Dev Architect

---

## 1. Executive Summary & Objective

ChessForge requires a highly polished, fully customizable, yet strictly decoupled board appearance subsystem. The objective of Phase 09 · Sprint 02 is to enable seamless visual switching between distinct board color themes and piece vector art styles without mutating or impacting authoritative chess domain logic, legal move generation, coordinate orientation, or desktop performance.

---

## 2. Requirements & Invariants

### 2.1 Functional Requirements

- **REQ-THM-01 (Multi-Theme Palette):** Provide at least 4 distinct, professionally balanced board themes (`classic`, `wood`, `slate`, `ocean`, `emerald`, `midnight`). Each theme defines explicit CSS variables for `board-bg`, `board-border`, `square-light-bg`, `square-light-text`, `square-dark-bg`, and `square-dark-text`.
- **REQ-THM-02 (Multi-Set Vector Artistry):** Provide 3 distinct vector piece sets (`standard`, `classic`, `modern`):
  - `standard`: FIDE tournament standard silhouette vector suite.
  - `classic`: Traditional Staunton heritage vector suite with detailed crown, miter, knight mane, and crenellated rook battlements.
  - `modern`: Neo minimalist geometric vector suite with sleek contours and modern desktop elegance.
- **REQ-THM-03 (Immediate Theme & Set Application):** Theme and piece set updates must apply immediately to all active board surfaces, square grids, promotion dialogs, and captured piece trays with zero layout shift or board re-initialization lag.
- **REQ-THM-04 (Persistent User Selection):** Board theme and piece set preferences must be persisted through `SettingsService` and `localStorage`, restoring reliably on initial application boot.
- **REQ-THM-05 (Piece Recognizability Invariant):** All 12 chess pieces (6 white, 6 black) across all 3 piece sets must remain immediately identifiable and distinguishable by rank and color under any supported theme.
- **REQ-THM-06 (State Indicator Preservation):** Board themes must not obscure or degrade legal state indicators (selection highlight, last move highlight, capture ring, quiet move dot, check badge, checkmate ring, focus ring).
- **REQ-THM-07 (Interactive Settings Preview):** The Appearance settings modal must display visual previews of all themes (mini 2x2 board swatch) and piece sets (sample glyphs / preview piece icons) with clear active badges and accessible ARIA radio controls.
- **REQ-THM-08 (Decoupled Zero-Cost Isolation):** Piece set rendering and theme token classes must operate strictly within the UI layer, consuming only pure immutable domain models (`Piece`, `Square`, `Color`, `PieceType`) without injecting presentation state into the chess engine.

---

## 3. Board Themes Color Palette & Contrast Specs

| Theme ID   | Name             | Light Square Bg | Dark Square Bg | Board Frame Bg | Border    | Intended Aesthetic              |
| :--------- | :--------------- | :-------------- | :------------- | :------------- | :-------- | :------------------------------ |
| `classic`  | Classic Slate    | `#e2e8f0`       | `#64748b`      | `#1e293b`      | `#334155` | Balanced modern slate off-white |
| `wood`     | Warm Walnut      | `#f0d9b5`       | `#b58863`      | `#38220f`      | `#5c3818` | Natural wood grain warmth       |
| `slate`    | Matte Charcoal   | `#cbd5e1`       | `#475569`      | `#0f172a`      | `#1e293b` | Low-glare focus palette         |
| `ocean`    | Pacific Navy     | `#cbe4f9`       | `#2e5b88`      | `#0c2340`      | `#164e63` | Crisp nautical blue             |
| `emerald`  | Tournament Green | `#eeeed2`       | `#769656`      | `#1a2e16`      | `#2c4426` | Standard tournament green       |
| `midnight` | Obsidian Indigo  | `#e2e8f0`       | `#334155`      | `#0b0f19`      | `#1e1b4b` | Deep dark mode contrast         |

---

## 4. Vector Piece Set Architecture

```
src/features/board/assets/
├── pieceSets/
│   ├── standard/        # FIDE tournament vector set
│   ├── classic/         # Staunton heritage vector set
│   └── modern/          # Neo geometric vector set
├── pieceSvgMap.ts       # Unified typed PieceSet -> Color -> PieceType SVG registry
└── pieceSvgs.tsx        # Standard fallback / legacy exports
```

Each piece component receives:

- Vector `viewBox="0 0 45 45"`
- Responsive width/height `100%`
- Explicit fill/stroke contrast outlines ensuring 100% legibility against both light and dark squares in all themes.
