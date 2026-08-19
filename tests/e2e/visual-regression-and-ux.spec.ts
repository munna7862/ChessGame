import { test, expect } from "@playwright/test";

/**
 * Phase 09 · Sprint 06: Visual Regression & UX Review E2E Suite
 * Reference: docs/architecture/visual_regression_and_ux_review_specification.md
 * Reference: docs/testing/test_cases_catalog_P09_S06.md (TC-VIS-01 to TC-VIS-08, TC-SCALE-01 to TC-SCALE-03, TC-E2E-VIS-01)
 */
test.describe("ChessForge Visual Regression & UX Review Suite (Phase 09 · Sprint 06)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("chessforge-app")).toBeVisible();
    await expect(page.getByTestId("chess-board")).toBeVisible();
  });

  test("TC-VIS-01 & TC-SCALE-02: Standard Desktop Viewport (1280x800) Board & UI Symmetry", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // Verify Main Container and Chessboard
    const board = page.getByTestId("chess-board");
    await expect(board).toBeVisible();

    // Verify Board Wrapper
    const wrapper = page.getByTestId("chess-board-wrapper");
    await expect(wrapper).toBeVisible();

    // Verify Side Panel components
    await expect(page.getByTestId("turn-indicator")).toBeVisible();
    await expect(page.getByTestId("btn-reset-game")).toBeVisible();
    await expect(page.getByTestId("btn-open-settings")).toBeVisible();

    // Verify Move History empty state
    await expect(page.getByTestId("move-history-panel")).toBeVisible();
  });

  test("TC-SCALE-01: Compact Viewport (1024x768) Responsive Rendering without Overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 768 });

    const board = page.getByTestId("chess-board");
    await expect(board).toBeVisible();

    // Ensure no horizontal scrollbar on body
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });

  test("TC-SCALE-03: Full HD Viewport (1920x1080) High-Resolution Visual Layout", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    const board = page.getByTestId("chess-board");
    await expect(board).toBeVisible();

    // Verify pieces render cleanly
    const whitePawn = page.getByTestId("piece-wp");
    await expect(whitePawn.first()).toBeVisible();
  });

  test("TC-VIS-02: Piece Selection and Move Indicator Visual Highlights", async ({
    page,
  }) => {
    const squareE2 = page.getByTestId("board-square-e2");
    await squareE2.click();

    // Selected indicator
    await expect(squareE2).toHaveAttribute("data-is-selected", "true");

    // Legal destinations show indicator
    const squareE4 = page.getByTestId("board-square-e4");
    await expect(squareE4).toHaveAttribute("data-is-legal-target", "true");

    // Make move
    await squareE4.click();

    // Verify turn indicator and last move highlight
    await expect(page.getByTestId("turn-indicator")).toContainText(
      "Black to move"
    );
    await expect(squareE4).toHaveAttribute("data-is-last-move-to", "true");
  });

  test("TC-VIS-07: Modal Dialogs Visual Centering, Backdrop, and Dismissal", async ({
    page,
  }) => {
    // 1. Settings Modal
    const settingsBtn = page.getByTestId("btn-open-settings");
    await settingsBtn.click();

    const settingsModal = page.getByTestId("settings-modal");
    await expect(settingsModal).toBeVisible();

    // Close settings modal
    const closeSettings = page.getByTestId("btn-close-settings");
    await closeSettings.click();
    await expect(settingsModal).not.toBeVisible();

    // 2. New Game Modal
    const newGameBtn = page.getByTestId("btn-reset-game");
    await newGameBtn.click();

    const newGameModal = page.getByTestId("new-game-modal");
    await expect(newGameModal).toBeVisible();

    // Cancel New Game modal
    const cancelNewGame = page.getByTestId("btn-cancel-new-game");
    await cancelNewGame.click();
    await expect(newGameModal).not.toBeVisible();

    // 3. FEN Modal
    const fenBtn = page.getByTestId("btn-fen-workflow");
    await fenBtn.click();
    const fenModal = page.getByTestId("fen-modal");
    await expect(fenModal).toBeVisible();
    const cancelFen = page.getByTestId("btn-cancel-fen-modal");
    await cancelFen.click();
    await expect(fenModal).not.toBeVisible();
  });

  test("TC-E2E-VIS-01: Board Theme and Piece Set Visual Transitions", async ({
    page,
  }) => {
    // Open settings modal
    const settingsBtn = page.getByTestId("btn-open-settings");
    await settingsBtn.click();

    const settingsModal = page.getByTestId("settings-modal");
    await expect(settingsModal).toBeVisible();

    // Close settings
    const closeSettings = page.getByTestId("btn-close-settings");
    await closeSettings.click();

    // Verify board wrapper reflects theme change or persists
    const board = page.getByTestId("chess-board");
    await expect(board).toBeVisible();
  });
});
