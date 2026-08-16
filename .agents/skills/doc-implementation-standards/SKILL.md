---
name: doc-implementation-standards
description: Enforces documentation standards for all completed features across Tauri IPC contracts, engine protocols, storage schemas, and walkthroughs.
---

# Universal Documentation Implementation Standards for ChessForge

Every completed feature must be thoroughly documented in the repository **`docs/`** directory before a pull request can be merged or a sprint story closed.

---

### 1. Mandatory Repository Artifacts

When a feature is marked as complete, the following artifacts MUST be updated or generated within the repository:

#### A. IPC & Engine Contracts (`docs/ipc/` and `docs/engine/`)
Every new or modified Tauri IPC command or WebWorker protocol message MUST be committed with explicit specifications:
* **Command / Message Name:** IPC method name or WebWorker action type.
* **Payload Specification:** TypeScript and Rust types with runtime Zod/Serde schema definitions.
* **Response & Event Mapping:** Expected return types, event emissions, and error codes.
* **Example Invocations:** Clear code examples demonstrating frontend-to-Rust or frontend-to-Stockfish interaction.

#### B. Storage & State Schemas (`docs/storage/`)
All persisted state structures (settings, game sessions, saved PGNs) must be documented:
* **Schema Definition:** TypeScript types and JSON structural examples.
* **Versioning & Migrations:** Explicit version tags and fallback defaults for backward compatibility.

#### C. Testing Proof & Test Cases Catalog (`docs/testing/`)
* **Test Catalog (`docs/testing/test_cases_catalog_P<XX>_S<YY>.md`):** Complete catalogue covering positive, negative, and edge test scenarios.
* **Verification Proof:** Execution logs showing 100% green test passes.

#### D. Walkthrough & Release Proof (`walkthrough.md`)
A user-facing document created in the workspace artifacts summarizing the architectural changes, UI screenshots/GIFs, testing proof, and verification instructions.

---

### 2. Technical Best Practices
* **Language Tags:** Keep markdown clean and readable with exact language tags for code blocks (`typescript`, `rust`, `json`, `bash`).
* **Architectural Visualization:** Embed native **Mermaid.js** diagrams to visually map state flows, turn lifecycles, or WebWorker message exchanges.