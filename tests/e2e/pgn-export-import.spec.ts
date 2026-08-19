import { test, expect } from "@playwright/test";

test.describe("PGN Export and Import E2E Workflow (Phase 08 · Sprint 03)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[data-testid="chessforge-app"]');
  });

  test("exports current game PGN with custom tags and modal actions", async ({
    page,
  }) => {
    // Make 2 moves: e2->e4, e7->e5
    await page.click('[data-testid="board-square-e2"]');
    await page.click('[data-testid="board-square-e4"]');
    await page.click('[data-testid="board-square-e7"]');
    await page.click('[data-testid="board-square-e5"]');

    // Click Export PGN
    await page.click('[data-testid="btn-export-pgn"]');
    await expect(
      page.locator('[data-testid="pgn-export-modal"]')
    ).toBeVisible();

    // Verify textarea has PGN text
    const textarea = page.locator('[data-testid="pgn-export-textarea"]');
    await expect(textarea).toBeVisible();
    const pgnValue = await textarea.inputValue();
    expect(pgnValue).toContain("1. e4 e5 *");

    // Close modal
    await page.click('[data-testid="btn-close-export-modal"]');
    await expect(
      page.locator('[data-testid="pgn-export-modal"]')
    ).not.toBeVisible();
  });

  test("imports a valid PGN and updates active game board and players", async ({
    page,
  }) => {
    // Click Import PGN
    await page.click('[data-testid="btn-import-pgn"]');
    await expect(
      page.locator('[data-testid="pgn-import-modal"]')
    ).toBeVisible();

    const samplePgn = `[Event "World Championship 2026"]
[White "Ding Liren"]
[Black "Gukesh D"]
[Result "0-1"]

1. d4 Nf6 2. c4 e6 3. Nf3 d5 0-1`;

    await page.fill('[data-testid="pgn-import-textarea"]', samplePgn);

    // Verify preview card appears
    await expect(
      page.locator('[data-testid="pgn-import-preview-card"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="preview-white-player"]')
    ).toHaveText("Ding Liren");
    await expect(
      page.locator('[data-testid="preview-black-player"]')
    ).toHaveText("Gukesh D");

    // Click Load Game
    await page.click('[data-testid="btn-confirm-import-pgn"]');
    await expect(
      page.locator('[data-testid="pgn-import-modal"]')
    ).not.toBeVisible();

    // Verify game board updated
    await expect(page.locator('[data-testid="player-name-w"]')).toHaveText(
      "Ding Liren"
    );
    await expect(page.locator('[data-testid="player-name-b"]')).toHaveText(
      "Gukesh D"
    );
  });

  test("rejects invalid PGN with error banner and leaves current game intact", async ({
    page,
  }) => {
    // Make move e2->e4
    await page.click('[data-testid="board-square-e2"]');
    await page.click('[data-testid="board-square-e4"]');

    // Click Import PGN
    await page.click('[data-testid="btn-import-pgn"]');
    await expect(
      page.locator('[data-testid="pgn-import-modal"]')
    ).toBeVisible();

    // Type invalid PGN
    await page.fill(
      '[data-testid="pgn-import-textarea"]',
      "1. e4 e5 2. InvalidMoveToken"
    );
    await expect(
      page.locator('[data-testid="pgn-import-error-banner"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="btn-confirm-import-pgn"]')
    ).toBeDisabled();

    // Cancel import
    await page.click('[data-testid="btn-cancel-import-pgn"]');
    await expect(
      page.locator('[data-testid="pgn-import-modal"]')
    ).not.toBeVisible();

    // Verify original game remains
    await expect(
      page.locator('[data-testid="last-move-indicator"]')
    ).toContainText("Last: e2 → e4");
  });
});
