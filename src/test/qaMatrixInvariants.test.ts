import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("QA Matrix & Requirements Traceability Invariants (Phase 10 · Sprint 01)", () => {
  const qaMatrixPath = path.resolve(__dirname, "../../docs/qa-matrix.md");
  const testCasesCatalogPath = path.resolve(
    __dirname,
    "../../docs/testing/test_cases_catalog_P10_S01.md"
  );

  it("TC-QA-01 & TC-QA-06: verifies that docs/qa-matrix.md exists and contains all required sections", () => {
    expect(fs.existsSync(qaMatrixPath)).toBe(true);
    const content = fs.readFileSync(qaMatrixPath, "utf-8");

    expect(content).toContain(
      "# ChessForge QA Inventory and Traceability Matrix"
    );
    expect(content).toContain(
      "## 1. Executive Summary & Test Inventory Dashboard"
    );
    expect(content).toContain("## 2. Requirements Traceability Matrix (RTM)");
    expect(content).toContain("## 3. Untested Requirements & Gap Analysis");
    expect(content).toContain(
      "## 4. Duplicate Test Analysis & Test Optimization"
    );
    expect(content).toContain("## 5. Dedicated Manual Risk Assessment Matrix");
    expect(content).toContain("## 6. Critical-Path Smoke Suite Specification");
    expect(content).toContain("## 7. Quality Gate Approval & Sign-Off");
  });

  it("TC-QA-02: verifies that all core requirement categories are enumerated in the RTM", () => {
    const content = fs.readFileSync(qaMatrixPath, "utf-8");

    const expectedReqCategories = [
      "REQ-DOM-01",
      "REQ-DOM-02",
      "REQ-DOM-03",
      "REQ-DOM-04",
      "REQ-DOM-05",
      "REQ-DOM-06",
      "REQ-DOM-07",
      "REQ-DOM-08",
      "REQ-DOM-09",
      "REQ-DOM-10",
      "REQ-DOM-11",
      "REQ-DOM-12",
      "REQ-DOM-13",
      "REQ-ENG-01",
      "REQ-ENG-02",
      "REQ-ENG-03",
      "REQ-ENG-04",
      "REQ-ENG-05",
      "REQ-ENG-06",
      "REQ-ENG-07",
      "REQ-ENG-08",
      "REQ-CLK-01",
      "REQ-CLK-02",
      "REQ-CLK-03",
      "REQ-CLK-04",
      "REQ-CLK-05",
      "REQ-CLK-06",
      "REQ-PERS-01",
      "REQ-PERS-02",
      "REQ-PERS-03",
      "REQ-PERS-04",
      "REQ-PERS-05",
      "REQ-PERS-06",
      "REQ-PERS-07",
      "REQ-PERS-08",
      "REQ-UI-01",
      "REQ-UI-02",
      "REQ-UI-03",
      "REQ-UI-04",
      "REQ-UI-05",
      "REQ-UI-06",
      "REQ-UI-07",
      "REQ-UI-08",
      "REQ-UI-09",
      "REQ-UI-10",
      "REQ-A11Y-01",
      "REQ-A11Y-02",
      "REQ-A11Y-03",
      "REQ-A11Y-04",
      "REQ-A11Y-05",
      "REQ-A11Y-06",
      "REQ-SEC-01",
      "REQ-SEC-02",
      "REQ-SEC-03",
      "REQ-SEC-04",
      "REQ-SEC-05",
      "REQ-SEC-06",
    ];

    for (const req of expectedReqCategories) {
      expect(content).toContain(req);
    }
  });

  it("TC-QA-07: verifies that all 10 Critical-Path Smoke Tests are specified", () => {
    const content = fs.readFileSync(qaMatrixPath, "utf-8");

    for (let i = 1; i <= 10; i++) {
      const smokeId = `SMOKE-${i.toString().padStart(2, "0")}`;
      expect(content).toContain(smokeId);
    }
  });

  it("TC-QA-05: verifies that all 4 Dedicated Manual Risks are documented with mitigations", () => {
    const content = fs.readFileSync(qaMatrixPath, "utf-8");

    for (let i = 1; i <= 4; i++) {
      const riskId = `RISK-${i.toString().padStart(2, "0")}`;
      expect(content).toContain(riskId);
    }
  });

  it("TC-QA-08: verifies that docs/testing/test_cases_catalog_P10_S01.md exists and contains TC-QA-01 to TC-QA-08", () => {
    expect(fs.existsSync(testCasesCatalogPath)).toBe(true);
    const content = fs.readFileSync(testCasesCatalogPath, "utf-8");

    for (let i = 1; i <= 8; i++) {
      const tcId = `TC-QA-${i.toString().padStart(2, "0")}`;
      expect(content).toContain(tcId);
    }
  });
});
