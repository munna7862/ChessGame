import { test, expect } from "@playwright/test";

/**
 * Phase 10 · Sprint 04: End-to-End Release Suite
 * Pawn Promotion Lifecycle E2E Suite
 * Reference: docs/testing/test_cases_catalog_P10_S04.md (TC-E2E-04)
 */

test.describe("ChessForge Pawn Promotion E2E Workflow (TC-E2E-04)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[data-testid="chessforge-app"]');

    // Load custom position with White pawn on e7 ready to promote to e8
    await page.click('[data-testid="btn-fen-workflow"]');
    await expect(page.locator('[data-testid="fen-modal"]')).toBeVisible();

    await page.fill(
      '[data-testid="fen-input-textarea"]',
      "k7/4P3/8/8/8/8/8/4K3 w - - 0 1"
    );
    await page.click('[data-testid="btn-load-fen"]');
    await expect(page.locator('[data-testid="fen-modal"]')).not.toBeVisible();
  });

  test("should open promotion dialog when pawn advances to 8th rank and promote to Queen", async ({
    page,
  }) => {
    // White pawn on e7 moves to e8
    await page.click('[data-testid="board-square-e7"]');
    await page.click('[data-testid="board-square-e8"]');

    // Verify promotion modal appears with all 4 piece options
    const dialog = page.locator('[data-testid="promotion-dialog"]');
    await expect(dialog).toBeVisible();
    await expect(
      page.locator('[data-testid="promotion-choice-q"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="promotion-choice-r"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="promotion-choice-b"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="promotion-choice-n"]')
    ).toBeVisible();

    // Select Queen
    await page.click('[data-testid="promotion-choice-q"]');
    await expect(dialog).not.toBeVisible();

    // Verify promoted White Queen exists on e8
    const squareE8 = page.locator('[data-testid="board-square-e8"]');
    await expect(squareE8.locator('[data-testid="piece-wq"]')).toBeVisible();

    // Verify turn advanced to Black
    await expect(page.locator('[data-testid="turn-indicator"]')).toHaveText(
      "Black to move"
    );
  });

  test("should support underpromotion to Knight", async ({ page }) => {
    // Move e7 -> e8
    await page.click('[data-testid="board-square-e7"]');
    await page.click('[data-testid="board-square-e8"]');

    const dialog = page.locator('[data-testid="promotion-dialog"]');
    await expect(dialog).toBeVisible();

    // Choose Knight
    await page.click('[data-testid="promotion-choice-n"]');
    await expect(dialog).not.toBeVisible();

    // Verify promoted White Knight on e8
    const squareE8 = page.locator('[data-testid="board-square-e8"]');
    await expect(squareE8.locator('[data-testid="piece-wn"]')).toBeVisible();
  });

  test("should cancel promotion and retain pawn on 7th rank when cancel button is clicked", async ({
    page,
  }) => {
    // Move e7 -> e8
    await page.click('[data-testid="board-square-e7"]');
    await page.click('[data-testid="board-square-e8"]');

    const dialog = page.locator('[data-testid="promotion-dialog"]');
    await expect(dialog).toBeVisible();

    // Click cancel button
    await page.click('[data-testid="promotion-cancel-btn"]');
    await expect(dialog).not.toBeVisible();

    // Pawn remains on e7, e8 remains empty, turn still White
    const squareE7 = page.locator('[data-testid="board-square-e7"]');
    await expect(squareE7.locator('[data-testid="piece-wp"]')).toBeVisible();
    await expect(page.locator('[data-testid="turn-indicator"]')).toHaveText(
      "White to move"
    );
  });

  test("should support keyboard Escape key to cancel promotion dialog", async ({
    page,
  }) => {
    // Move e7 -> e8
    await page.click('[data-testid="board-square-e7"]');
    await page.click('[data-testid="board-square-e8"]');

    const dialog = page.locator('[data-testid="promotion-dialog"]');
    await expect(dialog).toBeVisible();

    // Press Escape
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();

    // Pawn remains on e7
    await expect(
      page
        .locator('[data-testid="board-square-e7"]')
        .locator('[data-testid="piece-wp"]')
    ).toBeVisible();
  });
});
