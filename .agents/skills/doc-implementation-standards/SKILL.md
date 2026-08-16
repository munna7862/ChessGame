---
name: doc-implementation-standards
description: Enforces documentation standards for all completed features across API contracts, environment configs, schemas, and walkthroughs.
---

# Universal Documentation Implementation Standards

Every completed feature must be thoroughly documented in the repository **`docs/`** directory before a pull request can be merged or a sprint story closed.

---

### 1. Mandatory Repository Artifacts

When a feature is marked as complete, the following artifacts MUST be updated or generated within the repository:

#### A. API Contracts (`docs/api/sprint_X_api_contracts.md`)
Every new or modified route or interface MUST be committed to `docs/api/`. The API contract must explicitly outline:
* **Endpoint Details:** HTTP Method/protocol, absolute path, and authentication/authorization requirements.
* **Request Specifications:** Complete validation schemas for headers, query parameters, and body payloads.
* **Response Mapping:** Exact JSON response structures for both success (2xx) and failure (4xx/5xx) states with explicit HTTP status codes.
* **Example Payloads:** Copy-pasteable examples for requests and responses.

#### B. Environment Configuration (`.env.example`)
* **Zero Missing Variables:** Any newly introduced environment variables must be immediately appended to `.env.example` with fallback defaults or clear instructions.
* **Inline Explanations:** Include a descriptive comment above the variable explaining its purpose, data type, and usage.

#### C. Database & Schema Updates (`docs/db/`)
All schema migrations and model changes must be recorded:
* **Structural Delta:** List new tables, modified columns, foreign key constraints, and cascading rules.
* **Vector & Memory Indices:** If adding specific vector search capabilities, explicitly state the embedding dimensions and distance metric used.

#### D. Walkthrough & Release Proof (`walkthrough.md`)
A user-facing document created in the root/artifacts of the feature branch summarizing the changes, testing proof, and verification instructions.

---

### 2. Technical Best Practices
* **Language Tags:** Keep markdown clean and readable with exact language tags for code blocks (`python`, `typescript`, `json`, `bash`, `yaml`).
* **Architectural Visualization:** Embed native **Mermaid.js** diagrams to visually map state mutations or asynchronous event flows.