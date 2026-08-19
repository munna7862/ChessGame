import { describe, it, expect } from "vitest";
import { DESIGN_TOKENS, getBoardThemeTokens } from "../tokens";
import type { BoardThemeId } from "../types";

/**
 * Calculates relative luminance according to WCAG 2.1 specs
 */
function getLuminance(hexColor: string): number {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const sRGB = [r, g, b].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  const sR = sRGB[0] ?? 0;
  const sG = sRGB[1] ?? 0;
  const sB = sRGB[2] ?? 0;

  return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
}

/**
 * Calculates contrast ratio between two hex colors (1:1 to 21:1)
 */
function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

describe("Board Themes & Contrast Invariants (TC-THM-01, TC-THM-02)", () => {
  const ALL_THEME_IDS: readonly BoardThemeId[] = [
    "classic",
    "wood",
    "slate",
    "ocean",
    "emerald",
    "midnight",
  ];

  it("defines all 6 board themes in DESIGN_TOKENS", () => {
    for (const themeId of ALL_THEME_IDS) {
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

  it("retrieves theme tokens with getBoardThemeTokens helper", () => {
    const emerald = getBoardThemeTokens("emerald");
    expect(emerald.squareLightBg).toBe("#eeeed2");
    expect(emerald.squareDarkBg).toBe("#769656");

    const fallback = getBoardThemeTokens(
      "non_existent" as unknown as BoardThemeId
    );
    expect(fallback).toEqual(DESIGN_TOKENS.boardThemes.classic);
  });

  it("verifies contrast ratio between light and dark squares is distinguishable (>= 1.8:1)", () => {
    for (const themeId of ALL_THEME_IDS) {
      const theme = DESIGN_TOKENS.boardThemes[themeId];
      const ratio = getContrastRatio(theme.squareLightBg, theme.squareDarkBg);

      // Light and dark squares must have distinct contrast
      expect(ratio).toBeGreaterThanOrEqual(1.8);
    }
  });

  it("verifies coordinate text color has sufficient contrast against its square background", () => {
    for (const themeId of ALL_THEME_IDS) {
      const theme = DESIGN_TOKENS.boardThemes[themeId];

      const lightSquareTextRatio = getContrastRatio(
        theme.squareLightBg,
        theme.squareLightText
      );
      expect(lightSquareTextRatio).toBeGreaterThanOrEqual(2.0);

      const darkSquareTextRatio = getContrastRatio(
        theme.squareDarkBg,
        theme.squareDarkText
      );
      expect(darkSquareTextRatio).toBeGreaterThanOrEqual(2.0);
    }
  });
});
