import { test, expect } from "@playwright/test";

/**
 * Phase 08 · Sprint 02: Automatic Game Recovery E2E
 * Validates state persistence across reload, recovery dialog prompt, continue workflow, and discard workflow.
 */

test.describe("Automatic Game Recovery E2E (Phase 08 · Sprint 02)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("should persist active game on move, display recovery modal on reload, and restore game on continue", async ({
    page,
  }) => {
    // 1. Play 1. e4
    await page.getByTestId("board-square-e2").click();
    await page.getByTestId("board-square-e4").click();
    await expect(page.getByTestId("turn-indicator")).toHaveText(
      "Black to move"
    );

    // 2. Simulate application restart by reloading page
    await page.reload();

    // 3. Game recovery modal should appear
    const recoveryModal = page.getByTestId("game-recovery-modal");
    await expect(recoveryModal).toBeVisible();
    await expect(page.getByTestId("recovery-modal-title")).toHaveText(
      "Resume Previous Game?"
    );
    await expect(page.getByTestId("recovery-move-count")).toHaveText(
      "1 move played"
    );
    await expect(page.getByTestId("recovery-turn")).toHaveText("Black to move");

    // 4. Click "Continue Game"
    await page.getByTestId("btn-continue-game").click();
    await expect(recoveryModal).not.toBeVisible();

    // 5. Verify board position and move history are restored
    await expect(page.getByTestId("turn-indicator")).toHaveText(
      "Black to move"
    );
    await expect(page.getByTestId("last-move-indicator")).toHaveText(
      "Last: e2 → e4 (e4)"
    );
    await expect(
      page.getByTestId("board-square-e4").locator("[data-testid='piece-wp']")
    ).toBeVisible();
  });

  test("should discard saved game when Discard button is clicked and leave fresh board", async ({
    page,
  }) => {
    // 1. Play 1. e4
    await page.getByTestId("board-square-e2").click();
    await page.getByTestId("board-square-e4").click();
    await expect(page.getByTestId("turn-indicator")).toHaveText(
      "Black to move"
    );

    // 2. Reload page
    await page.reload();

    // 3. Recovery modal should appear
    const recoveryModal = page.getByTestId("game-recovery-modal");
    await expect(recoveryModal).toBeVisible();

    // 4. Click "Discard / Start Fresh"
    await page.getByTestId("btn-discard-game").click();
    await expect(recoveryModal).not.toBeVisible();

    // 5. Verify board is reset to starting position (White to move, 0 moves)
    await expect(page.getByTestId("turn-indicator")).toHaveText(
      "White to move"
    );
    await expect(page.getByTestId("last-move-indicator")).not.toBeVisible();

    // 6. Reloading again should NOT show recovery modal
    await page.reload();
    await expect(page.getByTestId("game-recovery-modal")).not.toBeVisible();
  });
});
