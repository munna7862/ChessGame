---
name: dev-coding-standards
description: Universal coding standards, type safety rules, API patterns, and database integrity guidelines applicable to any production project.
---

# Universal Dev Coding Standards

When writing production code, the following standards must be applied to guarantee performance, strict type safety, clean architecture, and maintainability across any stack (Python, TypeScript/Node.js, Go, Rust).

---

### 1. Strict Typing & Boundary Schema Validation

* **Zero Implicit Any / Untyped Data:**
  * In TypeScript: Run in `strict: true` mode. The `any` type is strictly forbidden; use `unknown` with explicit type narrowing guards (`typeof`, `instanceof`, custom type guards).
  * In Python: Utilize strict type annotations (`mypy` / Python 3.10+ types). Forbid untyped `dict` payloads across core boundaries.
* **Runtime Schema Validation at Boundaries:**
  * Validate all data entering or leaving the system (HTTP payloads, environment variables, LLM JSON responses, database records) using robust schema validation libraries (**Pydantic** in Python or **Zod** in TypeScript):

```python
from pydantic import BaseModel, Field
import uuid

class ModelResponseSchema(BaseModel):
    id: uuid.UUID
    summary: str = Field(..., min_length=10)
    confidence: float = Field(..., ge=0.0, le=1.0)
```

---

### 2. Clean API Architecture & Centralized Error Handling

* **Unified Error Response Format:** Never throw unmapped, raw internal exceptions or stack traces to clients. All API responses must follow a structured contract:

```json
{
  "success": false,
  "error": "Human-readable error description explaining the failure state.",
  "code": "ERROR_CODE_STRING",
  "statusCode": 400
}
```

* **Asynchronous Control Flow:** Avoid nested callback chains or unhandled promises. Always use clear `async/await` syntax with structured `try/catch` or `try/except` error management.
* **Structured Logging:** Utilize structured logging (e.g. `pino` in Node.js, `loguru` / standard `logging` in Python). Never log credentials, API keys, or PII.

---

### 3. Database Operations & Data Integrity

* **Type-Safe Query Construction:** Execute queries through established ORM / query builders (SQLAlchemy/SQLModel in Python, Drizzle/Prisma in TypeScript) rather than raw string concatenation.
* **Atomic Transactions:** Wrap multi-step mutations in atomic isolation transactions. If any step fails, the entire transaction must roll back cleanly:

```python
async with async_session() as session:
    async with session.begin():
        session.add(new_agent)
        session.add(new_memory)
```

---

### 4. Code Architecture & SOLID Design Principles

* **Single Responsibility Principle (SRP):** Functions and modules must execute exactly one logical task. If a handler exceeds 30–50 lines of code, extract business logic into isolated service classes or utility functions.
* **Don't Repeat Yourself (DRY):** Isolate recurring patterns—such as exponential backoff retry wrappers, token stream decoders, and hashing utilities—into shared, testable modules.
* **Dependency Inversion (DIP):** Depend on abstractions (interfaces / abstract base classes) rather than concrete implementations, enabling effortless testing and mocking.