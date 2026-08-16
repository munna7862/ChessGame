# ADR-002: Tauri v2 + React 19 + TypeScript Desktop Stack

**Status:** Accepted  
**Date:** 2026-08-16  
**Author:** Dev Architect & Senior SDE  
**Deciders:** Dev Architect, Security Officer, Product Owner, DevOps Engineer  

---

## 1. Context & Problem Statement

ChessForge is targeted as a modern, responsive, zero-cost Windows 10/11 desktop chess application. The desktop foundation must provide:
1. Native Windows look and feel with window management, menu integration, and native file dialogs.
2. Ultra-lightweight resource footprint (CPU, RAM, installer bundle size).
3. 60fps piece rendering and smooth move animations.
4. Robust local security with least-privilege capability scoping.

## 2. Decision

We choose **Tauri v2 (Rust)** combined with **React 19, TypeScript, and Vite** as the desktop application platform:
1. **Frontend:** React 19 with Vite for ultra-fast HMR, modular component architecture, and modern CSS variable-based design tokens.
2. **Backend / Host:** Tauri v2 in Rust managing the Windows WebView2 runtime, native window frame, clipboard, and scoped filesystem operations (`.pgn`, `.fen`).
3. **Communication:** Typed Tauri IPC commands using Serde serialization in Rust and Zod runtime schema validation in TypeScript.

## 3. Considered Alternatives & Rejected Rationale

### Alternative A: Electron (Chromium + Node.js)
- **Description:** Traditional cross-platform desktop framework bundling Chromium and Node.js.
- **Why Rejected:** High baseline memory consumption (> 180MB RAM idle vs < 40MB for Tauri with WebView2), bloated installer sizes (> 80MB vs < 5MB for Tauri MSI/NSIS), and larger attack surface from bundled Node.js.

### Alternative B: Native C# / WPF / WinUI 3
- **Description:** Windows-native desktop application using .NET 8 / WinUI 3.
- **Why Rejected:** Limits portability, slows down UI rapid iteration for complex board animations and styling, and has a smaller open-source ecosystem for chess visualization and Stockfish WASM compilation.

### Alternative C: Pure Web Application / PWA
- **Description:** Deploying purely as a hosted website or Progressive Web App.
- **Why Rejected:** Fails the local-first desktop mandate; cannot provide seamless native file system integration, offline installer delivery, or native Windows window frame styling without browser chrome.

## 4. Consequences & Trade-offs

- **Positive:**
  - Microscopic executable footprint (< 10MB installer) and negligible idle memory (< 50MB RAM).
  - Modern web styling flexibility (Vanilla CSS + design tokens) combined with Rust native security.
  - Granular security capability files (`capabilities/default.json`).
- **Negative / Neutral:**
  - Requires Windows WebView2 runtime (pre-installed on Windows 10/11 by default).
