import { test, expect } from "@playwright/test";

test.describe("FEN Workflow E2E (Phase 08 · Sprint 04)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[data-testid="chessforge-app"]');
  });

  test("opens FEN dialog and displays active board position", async ({
    page,
  }) => {
    // Open FEN modal
    await page.click('[data-testid="btn-fen-workflow"]');
    await expect(page.locator('[data-testid="fen-modal"]')).toBeVisible();

    // Verify current FEN display
    const currentFen = page.locator('[data-testid="current-fen-display"]');
    await expect(currentFen).toContainText(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    );

    // Close modal
    await page.click('[data-testid="btn-close-fen-modal"]');
    await expect(page.locator('[data-testid="fen-modal"]')).not.toBeVisible();
  });

  test("loads a FEN preset position into the active board session", async ({
    page,
  }) => {
    // Open FEN modal
    await page.click('[data-testid="btn-fen-workflow"]');
    await expect(page.locator('[data-testid="fen-modal"]')).toBeVisible();

    // Click Lucena Position preset
    await page.click('[data-testid="btn-preset-lucena"]');

    // Verify textarea has Lucena FEN
    const textarea = page.locator('[data-testid="fen-input-textarea"]');
    await expect(textarea).toHaveValue("1K6/1P1k4/8/8/8/8/r7/2R5 w - - 0 1");

    // Click Load into Game
    await page.click('[data-testid="btn-load-fen"]');
    await expect(page.locator('[data-testid="fen-modal"]')).not.toBeVisible();

    // Verify White turn indicator
    await expect(page.locator('[data-testid="turn-indicator"]')).toHaveText(
      "White to move"
    );
  });

  test("rejects invalid FEN string and disables action buttons", async ({
    page,
  }) => {
    // Make move e2->e4 first
    await page.click('[data-testid="board-square-e2"]');
    await page.click('[data-testid="board-square-e4"]');

    // Open FEN modal
    await page.click('[data-testid="btn-fen-workflow"]');
    await expect(page.locator('[data-testid="fen-modal"]')).toBeVisible();

    // Fill invalid FEN
    await page.fill(
      '[data-testid="fen-input-textarea"]',
      "invalid-fen-string-not-enough-tokens"
    );

    // Verify validation error card and disabled buttons
    await expect(
      page.locator('[data-testid="fen-validation-card"]')
    ).toHaveClass(/fen-status-card--invalid/);
    await expect(page.locator('[data-testid="btn-load-fen"]')).toBeDisabled();
    await expect(
      page.locator('[data-testid="btn-start-game-fen"]')
    ).toBeDisabled();

    // Cancel modal
    await page.click('[data-testid="btn-cancel-fen-modal"]');
    await expect(page.locator('[data-testid="fen-modal"]')).not.toBeVisible();

    // Verify original game remains untouched
    await expect(
      page.locator('[data-testid="last-move-indicator"]')
    ).toContainText("Last: e2 → e4");
  });
});
