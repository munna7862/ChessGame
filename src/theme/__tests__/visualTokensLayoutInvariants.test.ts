import { describe, it, expect } from "vitest";
import { DESIGN_TOKENS, getBoardThemeTokens, cssVar } from "../tokens";
import type { BoardThemeId } from "../types";

/**
 * Visual Design Tokens & Layout Invariants Suite
 * Reference: docs/architecture/visual_regression_and_ux_review_specification.md
 * Reference: docs/testing/test_cases_catalog_P09_S06.md (TC-UX-01 to TC-UX-05)
 */
describe("Visual Design Tokens & Layout Invariants Suite", () => {
  it("TC-UX-01: verifies DESIGN_TOKENS object is frozen and immutable", () => {
    expect(Object.isFrozen(DESIGN_TOKENS)).toBe(true);
    expect(Object.isFrozen(DESIGN_TOKENS.spacing)).toBe(true);
    expect(Object.isFrozen(DESIGN_TOKENS.typography)).toBe(true);
    expect(Object.isFrozen(DESIGN_TOKENS.surfaces)).toBe(true);
    expect(Object.isFrozen(DESIGN_TOKENS.elevations)).toBe(true);
    expect(Object.isFrozen(DESIGN_TOKENS.borders)).toBe(true);
    expect(Object.isFrozen(DESIGN_TOKENS.semantics)).toBe(true);
    expect(Object.isFrozen(DESIGN_TOKENS.boardThemes)).toBe(true);
  });

  it("TC-UX-02: verifies all 6 board themes define complete and non-empty color values", () => {
    const requiredThemes: BoardThemeId[] = [
      "classic",
      "wood",
      "slate",
      "ocean",
      "emerald",
      "midnight",
    ];

    for (const themeId of requiredThemes) {
      const theme = DESIGN_TOKENS.boardThemes[themeId];
      expect(theme).toBeDefined();
      expect(theme.boardBg).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(theme.boardBorder).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(theme.squareLightBg).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(theme.squareLightText).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(theme.squareDarkBg).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(theme.squareDarkText).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("TC-UX-03: verifies getBoardThemeTokens returns valid theme or falls back to classic", () => {
    const classicTokens = getBoardThemeTokens("classic");
    expect(classicTokens.boardBg).toBe("#1e293b");

    const woodTokens = getBoardThemeTokens("wood");
    expect(woodTokens.boardBg).toBe("#38220f");

    // Invalid fallback
    const fallbackTokens = getBoardThemeTokens(
      "non_existent" as unknown as BoardThemeId
    );
    expect(fallbackTokens).toEqual(classicTokens);
  });

  it("TC-UX-04: verifies cssVar helper correctly formats CSS custom property strings", () => {
    expect(cssVar("accent-cyan")).toBe("var(--accent-cyan)");
    expect(cssVar("--accent-cyan")).toBe("var(--accent-cyan)");
    expect(cssVar("bg-card")).toBe("var(--bg-card)");
  });

  it("TC-UX-05: verifies semantic status tokens contain matching color, background, and border definitions", () => {
    const statuses = ["success", "warning", "danger", "info"] as const;

    for (const status of statuses) {
      const group = DESIGN_TOKENS.semantics[status];
      expect(group).toBeDefined();
      expect(group.color).toBeTruthy();
      expect(group.bg).toBeTruthy();
      expect(group.border).toBeTruthy();
    }
  });
});
