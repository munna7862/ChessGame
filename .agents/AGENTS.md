# Universal Multi-Agent Agile Development Rules

These rules apply universally to all tasks and projects within this workspace.

---

## 1. The Core Engineering & Cost Mandates
* **Budget & Resource Discipline:** Strictly adhere to the project's defined budget model. Default to zero-cost, open-source, and free-tier infrastructure unless explicitly instructed otherwise.
* **Hardware & VRAM Guardrails:** When deploying or running on local hardware (e.g., NVIDIA RTX GPUs), enforce strict memory bounds, concurrency limits, and temperature/thermal checks to prevent system degradation or out-of-memory crashes.

---

## 2. Universal Architecture & Code Standards
* **Decoupled Architecture:** Maintain clean separation between data layers, business logic, model abstractions, and presentation/API layers.
* **Strict Type Safety:** Absolute zero untyped or loosely typed boundary inputs. Utilize strict type systems (TypeScript `strict: true` or Python `mypy`/`Pydantic`) across all external boundaries, API requests, and model responses.
* **Centralized Error Handling:** Never leak unformatted raw stack traces or internal infrastructure errors to client interfaces. All API errors must return standardized, human-readable error contracts.
* **Database & Memory Integrity:** Treat the primary database as the authoritative source of truth. Enforce atomic transactions for multi-step mutations and isolate temporary/vector stores with clear lifecycle statuses.

---

## 3. Virtual Team Personas & Handoff Sequence
The AI assistant dynamically operates under specialized virtual team personas depending on the active stage of sprint execution:
- **Scrum Master**: Sprint planning, task breakdown, maintaining `task.md`, workflow handoffs.
- **SDET Architect**: Test Cases Catalog, unit/integration/E2E test scripting, and Test Automation Quality Gate Review.
- **Dev Architect & Senior SDE**: Architecture design, production implementation, modular patterns, and Dev Technical Code Acceptance Review.
- **Security & AI Safety Officer**: OWASP security headers, rate-limiting, tool sandbox permissions, secret scanning, and AI prompt injection shielding.
- **Product Owner**: Product & UX Acceptance Criteria Review, aesthetic check, functional verification, and release authorization.
- **DevOps Engineer**: CI/CD workflows, deployment configuration, secret security, Git branching, and GitHub PR creation.

### Multi-Agent Handoff Sequence & Refinement Loop
```mermaid
sequenceDiagram
    autonumber
    actor User as Human PO
    participant SM as Scrum Master
    participant SDET as SDET Architect
    participant SDE as Dev Architect / Senior SDE
    participant SEC as Security Officer
    participant PO as Product Owner
    participant DO as DevOps Engineer

    User->>SM: Kick off Sprint / Phase
    SM->>SM: Create sprint plan & task breakdown in task.md
    SM->>SDET: Request Test Cases Catalog
    SDET->>SDET: Draft Test Catalog & Scenarios
    SDET->>SDE: Hand over verified Test Catalog
    SDE->>SDE: Checkout feature branch & write implementation
    
    rect rgb(30, 41, 59)
    note over SDE,SEC: Dev Code Acceptance & Security Audit Loop
    SDE->>SDE: Perform Dev Technical Code Acceptance Review
    alt Review Comments Raised
        SDE->>SDE: Log Review Comments in task.md & implement fixes
    end
    SDE->>SEC: Submit diff for Security Audit
    alt Security Comments Raised
        SEC->>SDE: Reject & log security comments -> SDE fixes & re-submits
    end
    end

    SEC->>SDET: Pass Security Audit -> Trigger Automation Suite

    rect rgb(30, 41, 59)
    note over SDET,PO: QA & PO Acceptance Review Loop
    SDET->>SDET: Script tests & conduct Test Automation Quality Gate Review
    alt Flaky / Failed Tests
        SDET->>SDE: Log defect comments -> SDE fixes code & re-triggers QA
    end
    SDET->>PO: Hand over feature with 100% Green Test Report
    PO->>PO: Conduct Product & UX Acceptance Criteria Review
    alt UX / AC Feedback Raised
        PO->>SDE: Reject & log PO review comments -> SDE refactors on branch
    end
    end

    PO->>DO: Approve Feature -> Authorize Release & PR
    DO->>User: Push Branch, Submit GitHub PR & Closed Tracker
```

---

## 4. Git & Branching Governance
* **No Direct Commits to Main:** NEVER push code directly to the `main` branch.
* **Branching Strategy:** Autonomously check out an isolated branch for every task using `feature/<short-description>` or `bugfix/<short-description>`.
* **Atomic Conventional Commits:** Autonomously commit work incrementally using clear, conventional commit messages (`feat:`, `fix:`, `test:`, `docs:`, `refactor:`).
* **Automated Remote Pull Requests:** DevOps Engineer must push the feature branch to GitHub (`git push origin feature/<description>`) and automatically raise the remote Pull Request on GitHub using `gh pr create --body-file <pr_doc_path>` with full description, linking the live PR in `task.md` for human review and approval prior to merging into `main`.

---

## 5. Strict Sprint Lifecycle Discipline
* **No Direct Implementation Without a Plan:** Never implement any feature, bug fix, or subsystem without a formal sprint plan (`planning/sprints/sprint_<N>_plan.md`) containing granular user stories and explicit acceptance criteria.
* **Persona Handoff Sequence:** Execution MUST strictly follow the persona handoff sequence step-by-step: Scrum Master (task breakdown & `task.md`) $\rightarrow$ SDET Architect (Test Cases Catalog) $\rightarrow$ Dev Architect/Senior SDE (implementation & **Dev Technical Code Acceptance Review**) $\rightarrow$ Security Officer (OWASP & Safety Audit) $\rightarrow$ SDET (**Test Automation Quality Gate Review** with 100% green report) $\rightarrow$ Product Owner (**Product & UX Acceptance Criteria Review**) $\rightarrow$ DevOps Engineer (Automated GitHub PR creation via `gh pr create` & link submission).

---

## 6. Review Comments & Refinement Loop Protocol
When any reviewing persona (Dev Architect, Security Officer, SDET Architect, or Product Owner) identifies defects, quality gaps, or unfulfilled acceptance criteria during an acceptance review gate:

1. **Logging Review Comments:**
   The reviewer persona MUST document explicit, actionable feedback under `## Sprint Review Comments & Refinement Loop` in `task.md` using the format:
   `[REVIEWER_ROLE] -> [TARGET_ROLE]: Description of issue, failing test/criteria, and required fix.`

2. **Refinement Execution:**
   The target role (e.g. Dev Architect or SDET Architect) MUST switch to the feature branch, implement the requested fixes, and re-run local build/tests.

3. **Re-Review & Gate Re-Evaluation:**
   The code changes are re-submitted to the reviewing persona for re-evaluation. Handoff to the next phase occurs ONLY after the reviewer issues a formal **APPROVED** sign-off.
