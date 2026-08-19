/**
 * Strongly-Typed Immutable Design Tokens for ChessForge
 * Phase 09 · Sprint 01
 */

import type {
  DesignTokens,
  BoardThemeId,
  BoardThemeTokenValues,
} from "./types";

export const DESIGN_TOKENS: DesignTokens = Object.freeze({
  spacing: Object.freeze({
    "0": "0px",
    "1": "0.25rem",
    "2": "0.5rem",
    "3": "0.75rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "8": "2rem",
    "10": "2.5rem",
    "12": "3rem",
    "16": "4rem",
  }),

  typography: Object.freeze({
    fonts: Object.freeze({
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    }),
    sizes: Object.freeze({
      xs: "0.75rem",
      sm: "0.8125rem",
      base: "0.875rem",
      md: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    }),
    weights: Object.freeze({
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    }),
    leading: Object.freeze({
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
    }),
    tracking: Object.freeze({
      tight: "-0.025em",
      normal: "0em",
      wide: "0.025em",
      wider: "0.05em",
    }),
  }),

  surfaces: Object.freeze({
    base: "#0f172a",
    raised: "#1e293b",
    card: "rgba(30, 41, 59, 0.75)",
    dialog: "#1e293b",
    sunken: "rgba(15, 23, 42, 0.6)",
    accent: "#334155",
    textPrimary: "#f8fafc",
    textSecondary: "#94a3b8",
    textMuted: "#64748b",
    textInverse: "#0f172a",
  }),

  elevations: Object.freeze({
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.25)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.25)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)",
    glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
    board:
      "0 20px 25px -5px rgba(0, 0, 0, 0.55), 0 8px 10px -6px rgba(0, 0, 0, 0.45)",
  }),

  borders: Object.freeze({
    radii: Object.freeze({
      none: "0px",
      xs: "4px",
      sm: "6px",
      md: "10px",
      lg: "16px",
      xl: "24px",
      full: "9999px",
    }),
    widths: Object.freeze({
      thin: "1px",
      medium: "2px",
      thick: "4px",
    }),
    colors: Object.freeze({
      subtle: "rgba(148, 163, 184, 0.1)",
      default: "rgba(148, 163, 184, 0.2)",
      strong: "rgba(148, 163, 184, 0.35)",
      interactive: "rgba(56, 189, 248, 0.4)",
    }),
  }),

  semantics: Object.freeze({
    success: Object.freeze({
      color: "#34d399",
      bg: "rgba(52, 211, 153, 0.15)",
      border: "rgba(52, 211, 153, 0.35)",
    }),
    warning: Object.freeze({
      color: "#fbbf24",
      bg: "rgba(251, 191, 36, 0.15)",
      border: "rgba(251, 191, 36, 0.35)",
    }),
    danger: Object.freeze({
      color: "#f87171",
      bg: "rgba(239, 68, 68, 0.2)",
      border: "rgba(239, 68, 68, 0.4)",
    }),
    info: Object.freeze({
      color: "#38bdf8",
      bg: "rgba(56, 189, 248, 0.15)",
      border: "rgba(56, 189, 248, 0.35)",
    }),
  }),

  boardThemes: Object.freeze({
    classic: Object.freeze({
      boardBg: "#1e293b",
      boardBorder: "#334155",
      squareLightBg: "#e2e8f0",
      squareLightText: "#475569",
      squareDarkBg: "#64748b",
      squareDarkText: "#cbd5e1",
    }),
    wood: Object.freeze({
      boardBg: "#38220f",
      boardBorder: "#5c3818",
      squareLightBg: "#f0d9b5",
      squareLightText: "#8c6747",
      squareDarkBg: "#b58863",
      squareDarkText: "#f0d9b5",
    }),
    slate: Object.freeze({
      boardBg: "#0f172a",
      boardBorder: "#1e293b",
      squareLightBg: "#cbd5e1",
      squareLightText: "#334155",
      squareDarkBg: "#475569",
      squareDarkText: "#94a3b8",
    }),
    ocean: Object.freeze({
      boardBg: "#0c2340",
      boardBorder: "#164e63",
      squareLightBg: "#cbe4f9",
      squareLightText: "#155e75",
      squareDarkBg: "#2e5b88",
      squareDarkText: "#e0f2fe",
    }),
  }),
});

/**
 * Accessor helper to retrieve board theme token values by Theme ID
 */
export function getBoardThemeTokens(
  themeId: BoardThemeId
): BoardThemeTokenValues {
  return (
    DESIGN_TOKENS.boardThemes[themeId] ?? DESIGN_TOKENS.boardThemes.classic
  );
}

/**
 * CSS Variable accessor helper generating standard var(--name) strings
 */
export function cssVar(tokenName: string): string {
  return `var(--${tokenName.replace(/^--/, "")})`;
}
