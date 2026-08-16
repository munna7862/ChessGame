# ChessForge

> **ChessForge** is a high-performance, 100% local-first Windows desktop chess application engineered with **Tauri v2**, **React 19**, **TypeScript**, and **Stockfish WASM**.

---

## 1. Architectural Highlights & Mandates

- **100% Local-First:** Runs entirely offline on Windows. Zero cloud backends, zero external microservices, zero telemetry, and zero remote tracking.
- **Strict Resource Guardrails:** Designed for a lightweight desktop footprint ($< 150\text{ MB}$ total application memory) and a 60 FPS rendering frame budget.
- **Decoupled Architecture:** Strict unidirectional dependency flow:
  $$\text{Presentation (React 19)} \longrightarrow \text{Application Service} \longrightarrow \text{Domain} \longrightarrow \text{Chess Library Adapter}$$
- **Engine as Advisor:** Stockfish engine runs asynchronously in a dedicated WebWorker communicating via UCI. The domain is the sole authority for move legality.

---

## 2. Windows Development Prerequisites

Before developing or building ChessForge on Windows 10/11, ensure the following prerequisites are installed:

1. **Node.js**: `v20.x` LTS or `v24.x` (Recommended). Verify with `node -v` and `npm -v`.
2. **Rust & Cargo Toolchain**:
   - Install `rustup` from [https://rustup.rs](https://rustup.rs).
   - Install the MSVC toolchain: `rustup default stable-x86_64-pc-windows-msvc`.
3. **C++ Build Tools**:
   - Visual Studio 2022 C++ Build Tools (with "Desktop development with C++" workload selected).
4. **Microsoft Edge WebView2**: Pre-installed on modern Windows 10 and Windows 11 systems.

---

## 3. Quickstart & Clean Checkout Instructions

### 3.1 Install Dependencies

```powershell
npm install
```

### 3.2 Frontend Development Server

Start the local Vite development server with Hot Module Replacement (HMR):

```powershell
npm run dev
```

The frontend will be accessible at `http://localhost:1420`.

### 3.3 Execute Automated Unit & Property Tests (Vitest)

Run the Vitest test runner across domain, component, and property-based test suites (Tiers 1-4):

```powershell
npm run test
```

To run tests with watch mode or coverage:

```powershell
npm run test:watch
npm run test:coverage
```

### 3.4 Execute End-to-End Tests (Playwright)

Run the Tier 5 E2E browser/webview automation suite:

```powershell
# Run all E2E tests headlessly
npm run test:e2e

# Run E2E tests in interactive UI mode
npm run test:e2e:ui

# View the generated HTML test execution report
npm run test:e2e:report
```

For locator policies and diagnostics, see the [Playwright & E2E Testing Guide](file:///c:/Workspace/ChessGame/docs/guides/e2e_testing_guide.md) and [E2E Stable Test Identifiers Policy](file:///c:/Workspace/ChessGame/docs/testing/e2e_identifiers_policy.md).

### 3.5 Code Quality, Linting & Formatting

```powershell
# Run ESLint across all TypeScript and React source files
npm run lint

# Auto-fix fixable ESLint violations
npm run lint:fix

# Check formatting conformity with Prettier
npm run format:check

# Auto-format all project files with Prettier
npm run format
```

For detailed conventions and rules, see the [Developer Tooling and Code Quality Guide](file:///c:/Workspace/ChessGame/docs/guides/developer_tooling.md).

### 3.6 Typecheck & Production Frontend Build

```powershell
# Strict TypeScript compilation check (0 errors)
npm run typecheck

# Production Vite bundle to dist/
npm run build
```

### 3.7 Launch Desktop Shell (Tauri v2)

Run the native Windows desktop application shell:

```powershell
npm run tauri dev
```

Build the optimized Windows production executable:

```powershell
npm run tauri build
```

---

## 4. Repository Structure

```text
ChessGame/
├── .agents/                 # Multi-agent agile rules, skills, and personas
├── docs/                    # Architectural blueprints, testing strategies, security models
│   ├── architecture.md      # System architecture & decoupled domain design
│   ├── security-model.md    # Tauri IPC capabilities, CSP, and threat model
│   └── testing-strategy.md  # 6-tier test pyramid & golden FEN fixtures
├── planning/                # Project roadmap and granular sprint specs
├── src/                     # React 19 frontend application
│   ├── components/          # Reusable UI components & presentation layer
│   ├── test/                # Testing harnesses & mocks
│   ├── App.tsx              # Root desktop layout
│   ├── main.tsx             # React DOM entrypoint
│   └── index.css            # Design tokens & dark theme styling
├── src-tauri/               # Tauri v2 native desktop application shell
│   ├── capabilities/        # Least-privilege IPC capability manifests
│   ├── src/                 # Rust entrypoint and native window lifecycle
│   ├── Cargo.toml           # Rust dependencies
│   └── tauri.conf.json      # Tauri v2 window and security configuration
├── package.json             # NPM package scripts & dependencies
├── tsconfig.json            # Strict TypeScript configuration
├── vite.config.ts           # Vite bundler & Vitest test runner config
└── task.md                  # Active sprint task tracking & agile handoffs
```

---

## 5. Agile Quality Gates & Anti-Bypass Standards

All contributions must strictly satisfy the sprint **Definition of Done (DoD)**:

- 100% Green test automation (Vitest unit, component, property tests).
- Zero TypeScript compiler errors (`tsc --noEmit`).
- Zero linter/compiler suppression flags (`it.skip`, `@ts-ignore`, `eslint-disable`).
- Least-privilege capability verification for native desktop APIs.
- Clean pull request created on an isolated `feature/*` branch.
