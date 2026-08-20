# ChessForge v1.0.0 Release Notes

**Release Date:** August 20, 2026  
**Product Version:** `1.0.0`  
**Target Platform:** Windows 10 / Windows 11 (x64)  
**License:** Open Source

---

## 1. Executive Summary

We are proud to announce the general availability of **ChessForge v1.0.0**, a modern, high-performance, 100% local-first chess desktop application built with **Tauri v2**, **React 19**, **TypeScript**, and an embedded **Stockfish 10 WASM** engine.

ChessForge is engineered from the ground up for chess enthusiasts, students, and serious players who demand a beautiful, responsive, privacy-respecting desktop application with zero cloud dependencies, zero telemetry, and instant startup times.

---

## 2. Key Features & Highlights

### 2.1 Pure FIDE Chess Rules Engine

- **100% FIDE Rules Compliance:** Comprehensive move generation and validation covering all standard chess rules.
- **Special Moves:** Full support for Kingside/Queenside castling, en passant captures, and pawn promotions (Queen, Rook, Bishop, Knight).
- **Automated Draw Detection:** Real-time evaluation of Stalemate, Threefold Repetition, 50-Move Rule, and Insufficient Material combinations.
- **Check & Checkmate Detection:** Instant visual notifications, audio cues, and game-over state announcements.

### 2.2 Embedded Stockfish AI Engine

- **Local WASM Worker:** Integrated Stockfish 10 WASM engine running in an isolated background WebWorker without freezing the UI.
- **8 Calibrated Skill Levels:** From Level 1 (Novice, ~800 Elo) to Level 8 (Master, ~2800+ Elo) with calibrated search depth and error rate scaling.
- **Live Evaluation Bar:** Real-time advantage score (centipawns or mate-in-N) with win-probability visual distribution.
- **Search Throttling & Fast Cancellation:** Tokenized UCI command queuing ensuring responsive cancellation when making rapid moves.

### 2.3 Fischer Dual Clocks & Game Modes

- **Game Modes:**
  - **Human vs Human:** Local pass-and-play match on a single screen.
  - **Human vs Computer:** Play as White or Black against Stockfish AI.
  - **Free Analysis Board:** Set up positions, explore variations, and analyze moves.
- **Fischer Dual Clocks:** Time controls with custom base times and increments:
  - Bullet (1+0, 2+1)
  - Blitz (3+2, 5+0)
  - Rapid (10+0, 15+10)
  - Classical (30+0)
- **Time Warnings:** Visual pulsating alerts and audio ticks when remaining time drops below 30 seconds.

### 2.4 PGN & FEN Interchange

- **PGN Export:** Complete Seven Tag Roster metadata formatting with standard algebraic notation move history.
- **PGN Import:** Clipboard and text import with resilient error handling and SAN parsing.
- **FEN Management:** Copy current position FEN to clipboard or paste custom FEN strings with instant board layout validation.
- **Interactive Move Tree:** Step forward/backward through move history, jump to specific moves, or reset to opening.

### 2.5 Modern Presentation & Sensory Polish

- **Rich Themes:** Curated board themes including Classic Wood, Midnight Blue, Charcoal Slate, and Forest Moss.
- **Sound Effects:** High-quality audio feedback for standard moves, captures, checks, game endings, and invalid moves with full volume control.
- **60 FPS Fluid Gestures:** Smooth piece dragging, target square indicators, legal move destination rings, and last-move highlights.

### 2.6 Offline-First Persistence & Recovery

- **Zero Cloud Architecture:** 100% of game states and settings persist locally to browser/app storage.
- **Zod Schema Validation:** Safe schema checking prevents application crashes from malformed persisted states.
- **Auto-Recovery:** Automatic fallback to pristine initial position if storage corruption is detected.

### 2.7 Accessibility & Usability (WCAG 2.1 AA)

- **Full Keyboard Navigation:** Tab, Enter, Space, and Arrow-key board navigation.
- **Screen Reader Announcements:** ARIA live regions announce every move, capture, check, and game result.
- **Quick Shortcuts Overlay:** Press `?` or `F1` to reveal keyboard commands.
- **High Contrast Support:** Clear visual indicators for piece focus, legal moves, and check alerts.

---

## 3. System Requirements

| Specification          | Minimum Requirement                      | Recommended                 |
| :--------------------- | :--------------------------------------- | :-------------------------- |
| **Operating System**   | Windows 10 (64-bit) Version 1903+        | Windows 11 (64-bit)         |
| **Processor**          | Dual-Core 1.5 GHz x64                    | Quad-Core 2.0 GHz+ x64      |
| **Memory (RAM)**       | 2 GB System RAM (< 150 MB App Footprint) | 4 GB+ System RAM            |
| **Storage**            | 100 MB Available Disk Space              | 250 MB Available Disk Space |
| **Display Resolution** | $800 \times 600$ minimum window size     | $1920 \times 1080$ Full HD  |
| **Network**            | **None (100% Offline)**                  | None                        |

---

## 4. Known Technical Limitations

1. **Single-Threaded Stockfish WASM:** In order to maintain strict memory bounds ($< 150\text{ MB}$) and ensure zero UI thread degradation across low-power Windows devices, the embedded Stockfish engine executes in a single-threaded WebWorker.
2. **Standard FIDE Rules Scope:** Chess variants such as Chess960 (Fischer Random), Antichess, or Crazyhouse are not supported in the v1.0.0 release.
3. **Local-Only Multiplayer:** Online multiplayer matchmaking and networked lobbies are outside the scope of ChessForge's local-first architecture.

---

## 5. Getting Started

### Launching the Application

- Install ChessForge via the Windows installer (`ChessForge-Setup-1.0.0.exe`).
- Launch ChessForge from the Desktop shortcut or Start Menu.
- Select your desired game mode (Human vs Human or Human vs Computer) and clock settings from the top toolbar to start playing immediately.

### Quick Keyboard Shortcuts

- `?` or `F1`: Open keyboard shortcuts cheat sheet.
- `Escape`: Close open dialogs or deselect active piece.
- `Arrow Left` / `Arrow Right`: Navigate backward/forward in move history.
- `Space` / `Enter`: Select active square or execute move.
