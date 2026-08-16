/**
 * Stable Test Identifiers and Selectors for ChessForge E2E Suites
 * Reference: docs/testing/e2e_identifiers_policy.md
 */

export const TEST_IDS = {
  APP: {
    CONTAINER: "chessforge-app",
    TITLE: "app-title",
    SUBTITLE: "hero-subtitle",
  },
  HEADER: {
    CONTAINER: "app-header",
    BRAND: "app-brand",
    VERSION: "app-version",
    ENGINE_STATUS: "engine-status-badge",
  },
  METRICS: {
    GRID: "metrics-grid",
    MEMORY: "metric-memory",
    FPS: "metric-fps",
    LOCAL: "metric-local",
  },
  FEATURES: {
    LIST: "feature-list",
    TAURI: "feature-tauri",
    REACT: "feature-react",
    DOMAIN: "feature-domain",
    STOCKFISH: "feature-stockfish",
  },
} as const;
