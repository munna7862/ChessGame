import { describe, it, expect } from "vitest";
import { DESIGN_TOKENS, getBoardThemeTokens, cssVar } from "../tokens";
import type { BoardThemeId } from "../types";

describe("Design Tokens Unit Tests (Phase 09 · Sprint 01)", () => {
  describe("Spacing Tokens Scale (TC-TOK-01)", () => {
    it("defines 4px grid spacing steps from 0 to 16 correctly", () => {
      expect(DESIGN_TOKENS.spacing["0"]).toBe("0px");
      expect(DESIGN_TOKENS.spacing["1"]).toBe("0.25rem");
      expect(DESIGN_TOKENS.spacing["2"]).toBe("0.5rem");
      expect(DESIGN_TOKENS.spacing["3"]).toBe("0.75rem");
      expect(DESIGN_TOKENS.spacing["4"]).toBe("1rem");
      expect(DESIGN_TOKENS.spacing["5"]).toBe("1.25rem");
      expect(DESIGN_TOKENS.spacing["6"]).toBe("1.5rem");
      expect(DESIGN_TOKENS.spacing["8"]).toBe("2rem");
      expect(DESIGN_TOKENS.spacing["10"]).toBe("2.5rem");
      expect(DESIGN_TOKENS.spacing["12"]).toBe("3rem");
      expect(DESIGN_TOKENS.spacing["16"]).toBe("4rem");
    });

    it("has immutable spacing object", () => {
      expect(Object.isFrozen(DESIGN_TOKENS.spacing)).toBe(true);
    });
  });

  describe("Typography Tokens (TC-TOK-02, TC-TOK-03)", () => {
    it("defines sans and mono fallback font stacks", () => {
      expect(DESIGN_TOKENS.typography.fonts.sans).toContain("Segoe UI");
      expect(DESIGN_TOKENS.typography.fonts.sans).toContain("Roboto");
      expect(DESIGN_TOKENS.typography.fonts.mono).toContain("ui-monospace");
      expect(DESIGN_TOKENS.typography.fonts.mono).toContain("Consolas");
    });

    it("defines font size scale in increasing rem units", () => {
      const { sizes } = DESIGN_TOKENS.typography;
      expect(sizes.xs).toBe("0.75rem");
      expect(sizes.sm).toBe("0.8125rem");
      expect(sizes.base).toBe("0.875rem");
      expect(sizes.md).toBe("1rem");
      expect(sizes.lg).toBe("1.125rem");
      expect(sizes.xl).toBe("1.25rem");
      expect(sizes["2xl"]).toBe("1.5rem");
      expect(sizes["3xl"]).toBe("1.875rem");
      expect(sizes["4xl"]).toBe("2.25rem");
    });

    it("defines numeric font weights", () => {
      const { weights } = DESIGN_TOKENS.typography;
      expect(weights.regular).toBe(400);
      expect(weights.medium).toBe(500);
      expect(weights.semibold).toBe(600);
      expect(weights.bold).toBe(700);
    });

    it("defines line heights and letter tracking steps", () => {
      const { leading, tracking } = DESIGN_TOKENS.typography;
      expect(leading.tight).toBe(1.25);
      expect(leading.normal).toBe(1.5);
      expect(tracking.tight).toBe("-0.025em");
      expect(tracking.wider).toBe("0.05em");
    });
  });

  describe("Surfaces & Elevation Tokens (TC-TOK-04, TC-TOK-05)", () => {
    it("defines complete 5-tier surface hierarchy", () => {
      const { surfaces } = DESIGN_TOKENS;
      expect(surfaces.base).toBe("#0f172a");
      expect(surfaces.raised).toBe("#1e293b");
      expect(surfaces.card).toContain("rgba(30, 41, 59");
      expect(surfaces.dialog).toBe("#1e293b");
      expect(surfaces.sunken).toContain("rgba(15, 23, 42");
      expect(surfaces.accent).toBe("#334155");
    });

    it("defines text hierarchy tokens", () => {
      const { surfaces } = DESIGN_TOKENS;
      expect(surfaces.textPrimary).toBe("#f8fafc");
      expect(surfaces.textSecondary).toBe("#94a3b8");
      expect(surfaces.textMuted).toBe("#64748b");
      expect(surfaces.textInverse).toBe("#0f172a");
    });

    it("defines elevation shadow levels", () => {
      const { elevations } = DESIGN_TOKENS;
      expect(elevations.sm).toBeDefined();
      expect(elevations.md).toBeDefined();
      expect(elevations.lg).toBeDefined();
      expect(elevations.xl).toBeDefined();
      expect(elevations.glass).toBeDefined();
      expect(elevations.board).toBeDefined();
    });
  });

  describe("Border & Radius Tokens (TC-TOK-06, TC-TOK-07)", () => {
    it("defines border radius scale from none to full", () => {
      const { radii } = DESIGN_TOKENS.borders;
      expect(radii.none).toBe("0px");
      expect(radii.xs).toBe("4px");
      expect(radii.sm).toBe("6px");
      expect(radii.md).toBe("10px");
      expect(radii.lg).toBe("16px");
      expect(radii.xl).toBe("24px");
      expect(radii.full).toBe("9999px");
    });

    it("defines border widths and color levels", () => {
      const { widths, colors } = DESIGN_TOKENS.borders;
      expect(widths.thin).toBe("1px");
      expect(widths.medium).toBe("2px");
      expect(widths.thick).toBe("4px");
      expect(colors.subtle).toBeDefined();
      expect(colors.default).toBeDefined();
      expect(colors.strong).toBeDefined();
      expect(colors.interactive).toBeDefined();
    });
  });

  describe("Semantic Status Tokens (TC-TOK-08, TC-TOK-09)", () => {
    it("defines success, warning, danger, and info color groups", () => {
      const { semantics } = DESIGN_TOKENS;
      expect(semantics.success.color).toBe("#34d399");
      expect(semantics.warning.color).toBe("#fbbf24");
      expect(semantics.danger.color).toBe("#f87171");
      expect(semantics.info.color).toBe("#38bdf8");

      expect(semantics.success.bg).toBeDefined();
      expect(semantics.warning.border).toBeDefined();
    });
  });

  describe("Board Themes & Helper Accessors (TC-TOK-10 to TC-TOK-14)", () => {
    const themeIds: BoardThemeId[] = ["classic", "wood", "slate", "ocean"];

    it.each(themeIds)(
      'provides valid theme tokens for "%s" board theme',
      (themeId) => {
        const theme = DESIGN_TOKENS.boardThemes[themeId];
        expect(theme).toBeDefined();
        expect(theme.boardBg).toBeTruthy();
        expect(theme.boardBorder).toBeTruthy();
        expect(theme.squareLightBg).toBeTruthy();
        expect(theme.squareLightText).toBeTruthy();
        expect(theme.squareDarkBg).toBeTruthy();
        expect(theme.squareDarkText).toBeTruthy();
      }
    );

    it("getBoardThemeTokens returns theme tokens and falls back to classic", () => {
      const woodTokens = getBoardThemeTokens("wood");
      expect(woodTokens.squareLightBg).toBe("#f0d9b5");

      // @ts-expect-error test fallback for unknown key
      const fallbackTokens = getBoardThemeTokens("non_existent");
      expect(fallbackTokens).toEqual(DESIGN_TOKENS.boardThemes.classic);
    });

    it("cssVar helper formats css variable expressions correctly", () => {
      expect(cssVar("--surface-base")).toBe("var(--surface-base)");
      expect(cssVar("accent-cyan")).toBe("var(--accent-cyan)");
    });
  });
});
