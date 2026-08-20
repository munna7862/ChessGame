# Changelog

All notable changes to the **ChessForge** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-20

### Added

- **FIDE-Compliant Chess Domain Engine:**
  - Complete move generation and validation covering all standard chess rules.
  - Full support for special moves: Kingside and Queenside Castling, En Passant captures, and Pawn Promotion (Queen, Rook, Bishop, Knight).
  - Draw detection rules: Stalemate, Threefold Repetition, 50-Move Rule, and Insufficient Material (K vs K, K+B vs K, K+N vs K, K+B vs K+B same color).
  - Check and Checkmate detection with visual board state indicators.
- **Stockfish AI Integration:**
  - Embedded Stockfish 10 WASM engine running in an isolated, non-blocking WebWorker.
  - 8 calibrated difficulty levels (Level 1 Novice to Level 8 Master) with tailored search depth and skill level mappings.
  - Real-time centipawn evaluation bar with dynamic win-chance visualization and mate-in-N detection.
  - Non-blocking search cancellation with tokenized UCI protocol synchronization.
- **Modern Interactive UI & Aesthetics:**
  - React 19 desktop presentation layer with 60fps board gestures, smooth piece dragging, and target square snapping.
  - 4 curated board themes: Classic Wood, Midnight Blue, Charcoal Slate, and Forest Moss.
  - Move audio feedback system (standard moves, captures, checks, game completion, illegal move alerts) with volume controls.
  - Legal move destination dots, capture target rings, and last-move highlights.
- **Fischer Dual Clocks & Game Modes:**
  - Dual chess clocks supporting Rapid (10+0, 15+10), Blitz (3+2, 5+0), Bullet (1+0, 2+1), and Classical (30+0) presets with custom Fischer increments.
  - Millisecond-accurate countdown with low-time warning visual indicators and audio ticks.
  - Game modes: Human vs Human (Local Pass-and-Play), Human vs Computer (White or Black), and Free Analysis Board.
- **PGN & FEN Interchange:**
  - Standard PGN export with Seven Tag Roster (Event, Site, Date, Round, White, Black, Result) and move text formatting.
  - PGN file import and clipboard parsing with SAN normalization.
  - FEN import dialog with runtime syntax and board legality validation.
  - Interactive move history list with forward/backward navigation and move jumping.
- **Local-First Session Persistence:**
  - Automatic game session saving to `localStorage` with versioned schema snapshots.
  - Zod runtime schema validation protecting against corrupted or malformed persisted data.
  - Robust migration engine with automatic recovery and fallback to pristine starting position on schema mismatch.
  - Settings persistence for user preferences (theme, sound volume, coordinate display, clock presets).
- **Accessibility & Keyboard Navigation:**
  - Full WCAG 2.1 AA compliance with screen reader announcements via ARIA live regions.
  - Complete keyboard navigation with `Tab`/`Enter`/`Space` board focus and arrow-key square navigation.
  - Quick-access Keyboard Shortcuts overlay (`?` or `F1`).
  - High-contrast visual cues and reduced-motion support.
- **Quality Engineering & Verification Suite:**
  - 117 automated test files spanning 960+ unit, property-based (fast-check), and integration tests.
  - 24 Playwright end-to-end desktop scenarios covering all core user journeys.
  - Adversarial chess regression corpus and golden FEN fixture suites.
  - Performance and memory benchmarks enforcing $< 150\text{ MB}$ footprint.

### Changed

- Updated application semantic version to `1.0.0` across `package.json`, `package-lock.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`, and UI presentation badges.
- Standardized product identification as **ChessForge** (`com.chessforge.app`).

### Security

- 100% offline, local-first execution with zero external telemetry or cloud dependencies.
- Strict Content Security Policy (CSP): `default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' ipc: http://ipc.localhost;`.
- Least-privilege Tauri IPC capability allowlist restricted to core desktop window management.
- 0 vulnerabilities across all production dependencies (`npm audit` verified).

### Known Limitations

- **Single-Threaded WASM Engine:** Stockfish operates in a single-threaded WebWorker to guarantee zero UI degradation and maintain strict $< 150\text{ MB}$ memory footprint constraints on all Windows hardware.
- **Offline Local-Only Scope:** Network multiplayer and online matchmaking are intentionally omitted in v1.0.0 in adherence to the local-first desktop charter.
- **Standard FIDE Ruleset:** Specialized chess variants (e.g. Chess960 / Fischer Random, Crazyhouse, Three-Check) are not supported in the v1.0.0 release.
