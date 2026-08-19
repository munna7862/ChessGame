/**
 * Strongly-Typed Design Token Definitions for ChessForge
 * Phase 09 · Sprint 01
 */

export interface SpacingTokens {
  readonly "0": string;
  readonly "1": string;
  readonly "2": string;
  readonly "3": string;
  readonly "4": string;
  readonly "5": string;
  readonly "6": string;
  readonly "8": string;
  readonly "10": string;
  readonly "12": string;
  readonly "16": string;
}

export interface TypographyTokens {
  readonly fonts: {
    readonly sans: string;
    readonly mono: string;
  };
  readonly sizes: {
    readonly xs: string;
    readonly sm: string;
    readonly base: string;
    readonly md: string;
    readonly lg: string;
    readonly xl: string;
    readonly "2xl": string;
    readonly "3xl": string;
    readonly "4xl": string;
  };
  readonly weights: {
    readonly regular: number;
    readonly medium: number;
    readonly semibold: number;
    readonly bold: number;
  };
  readonly leading: {
    readonly none: number;
    readonly tight: number;
    readonly snug: number;
    readonly normal: number;
    readonly relaxed: number;
  };
  readonly tracking: {
    readonly tight: string;
    readonly normal: string;
    readonly wide: string;
    readonly wider: string;
  };
}

export interface SurfaceTokens {
  readonly base: string;
  readonly raised: string;
  readonly card: string;
  readonly dialog: string;
  readonly sunken: string;
  readonly accent: string;
  readonly textPrimary: string;
  readonly textSecondary: string;
  readonly textMuted: string;
  readonly textInverse: string;
}

export interface ElevationTokens {
  readonly sm: string;
  readonly md: string;
  readonly lg: string;
  readonly xl: string;
  readonly glass: string;
  readonly board: string;
}

export interface BorderTokens {
  readonly radii: {
    readonly none: string;
    readonly xs: string;
    readonly sm: string;
    readonly md: string;
    readonly lg: string;
    readonly xl: string;
    readonly full: string;
  };
  readonly widths: {
    readonly thin: string;
    readonly medium: string;
    readonly thick: string;
  };
  readonly colors: {
    readonly subtle: string;
    readonly default: string;
    readonly strong: string;
    readonly interactive: string;
  };
}

export interface SemanticStatusTokenGroup {
  readonly color: string;
  readonly bg: string;
  readonly border: string;
}

export interface SemanticStatusTokens {
  readonly success: SemanticStatusTokenGroup;
  readonly warning: SemanticStatusTokenGroup;
  readonly danger: SemanticStatusTokenGroup;
  readonly info: SemanticStatusTokenGroup;
}

export interface BoardThemeTokenValues {
  readonly boardBg: string;
  readonly boardBorder: string;
  readonly squareLightBg: string;
  readonly squareLightText: string;
  readonly squareDarkBg: string;
  readonly squareDarkText: string;
}

export type BoardThemeId = "classic" | "wood" | "slate" | "ocean";

export interface DesignTokens {
  readonly spacing: SpacingTokens;
  readonly typography: TypographyTokens;
  readonly surfaces: SurfaceTokens;
  readonly elevations: ElevationTokens;
  readonly borders: BorderTokens;
  readonly semantics: SemanticStatusTokens;
  readonly boardThemes: Record<BoardThemeId, BoardThemeTokenValues>;
}
