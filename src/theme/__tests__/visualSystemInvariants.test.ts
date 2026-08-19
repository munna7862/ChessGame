import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { DESIGN_TOKENS } from "../tokens";

describe("Visual System & CSS Invariants (Phase 09 · Sprint 01)", () => {
  const tokensCssPath = path.resolve(__dirname, "../tokens.css");
  const tokensCssContent = fs.readFileSync(tokensCssPath, "utf-8");

  it("declares all defined spacing custom properties in tokens.css (TC-TOK-15)", () => {
    Object.keys(DESIGN_TOKENS.spacing).forEach((key) => {
      const varName = `--space-${key}`;
      expect(tokensCssContent).toContain(varName);
    });
  });

  it("declares all defined typography custom properties in tokens.css (TC-TOK-15)", () => {
    expect(tokensCssContent).toContain("--font-sans");
    expect(tokensCssContent).toContain("--font-mono");
    expect(tokensCssContent).toContain("--text-xs");
    expect(tokensCssContent).toContain("--text-sm");
    expect(tokensCssContent).toContain("--text-base");
    expect(tokensCssContent).toContain("--text-md");
    expect(tokensCssContent).toContain("--text-lg");
    expect(tokensCssContent).toContain("--text-xl");
    expect(tokensCssContent).toContain("--text-2xl");
    expect(tokensCssContent).toContain("--text-3xl");
    expect(tokensCssContent).toContain("--text-4xl");
  });

  it("declares all surface and text custom properties in tokens.css (TC-TOK-15)", () => {
    expect(tokensCssContent).toContain("--surface-base");
    expect(tokensCssContent).toContain("--surface-raised");
    expect(tokensCssContent).toContain("--surface-card");
    expect(tokensCssContent).toContain("--surface-dialog");
    expect(tokensCssContent).toContain("--surface-sunken");
    expect(tokensCssContent).toContain("--surface-accent");
    expect(tokensCssContent).toContain("--text-primary");
    expect(tokensCssContent).toContain("--text-secondary");
    expect(tokensCssContent).toContain("--text-muted");
    expect(tokensCssContent).toContain("--text-inverse");
  });

  it("declares all radius and border custom properties in tokens.css (TC-TOK-15)", () => {
    expect(tokensCssContent).toContain("--radius-none");
    expect(tokensCssContent).toContain("--radius-xs");
    expect(tokensCssContent).toContain("--radius-sm");
    expect(tokensCssContent).toContain("--radius-md");
    expect(tokensCssContent).toContain("--radius-lg");
    expect(tokensCssContent).toContain("--radius-xl");
    expect(tokensCssContent).toContain("--radius-full");

    expect(tokensCssContent).toContain("--border-width-thin");
    expect(tokensCssContent).toContain("--border-width-medium");
    expect(tokensCssContent).toContain("--border-width-thick");
    expect(tokensCssContent).toContain("--border-subtle");
    expect(tokensCssContent).toContain("--border-default");
    expect(tokensCssContent).toContain("--border-strong");
    expect(tokensCssContent).toContain("--border-interactive");
  });

  it("declares all semantic status colors in tokens.css (TC-TOK-15)", () => {
    expect(tokensCssContent).toContain("--color-success");
    expect(tokensCssContent).toContain("--color-warning");
    expect(tokensCssContent).toContain("--color-danger");
    expect(tokensCssContent).toContain("--color-info");
  });

  it("declares all board themes in tokens.css with [data-board-theme] selectors (TC-TOK-15)", () => {
    expect(tokensCssContent).toContain('[data-board-theme="classic"]');
    expect(tokensCssContent).toContain('[data-board-theme="wood"]');
    expect(tokensCssContent).toContain('[data-board-theme="slate"]');
    expect(tokensCssContent).toContain('[data-board-theme="ocean"]');
  });

  it("includes focus ring and accessibility tokens in tokens.css (TC-TOK-16)", () => {
    expect(tokensCssContent).toContain("--focus-ring");
    expect(tokensCssContent).toContain("--focus-ring-offset");
    expect(tokensCssContent).toContain("--state-disabled-opacity");
  });

  it("ensures index.css imports theme tokens (TC-TOK-16)", () => {
    const indexCssPath = path.resolve(__dirname, "../../index.css");
    const indexCssContent = fs.readFileSync(indexCssPath, "utf-8");
    expect(indexCssContent).toContain('@import "./theme/tokens.css";');
  });
});
