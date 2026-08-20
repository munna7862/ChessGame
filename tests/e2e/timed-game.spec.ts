import { test, expect } from "@playwright/test";

/**
 * Phase 10 · Sprint 04: End-to-End Release Suite
 * Timed Game & Fischer Clocks E2E Suite
 * Reference: docs/testing/test_cases_catalog_P10_S04.md (TC-E2E-12)
 */

test.describe("ChessForge Timed Game & Fischer Clocks E2E Workflow (TC-E2E-12)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[data-testid="chessforge-app"]');
  });

  test("should start timed match with Rapid preset and alternate active clock on moves", async ({
    page,
  }) => {
    // 1. Open New Game Modal
    await page.getByTestId("btn-reset-game").click();
    await expect(page.getByTestId("new-game-modal")).toBeVisible();

    // 2. Select Rapid 10+0 preset
    const presetBtn = page.getByTestId("preset-10---0--rapid-");
    await expect(presetBtn).toBeVisible();
    await presetBtn.click();

    // 3. Start Game
    await page.getByTestId("btn-submit-new-game").click();
    await expect(page.getByTestId("new-game-modal")).not.toBeVisible();

    // 4. Verify clocks are rendered with initial time (10:00)
    const whiteClock = page.getByTestId("clock-display-w");
    const blackClock = page.getByTestId("clock-display-b");

    await expect(whiteClock).toBeVisible();
    await expect(blackClock).toBeVisible();
    await expect(whiteClock).toHaveAttribute("data-untimed", "false");
    await expect(blackClock).toHaveAttribute("data-untimed", "false");

    const whiteTime = page.getByTestId("clock-time-w");
    const blackTime = page.getByTestId("clock-time-b");

    await expect(whiteTime).toContainText("10:00");
    await expect(blackTime).toContainText("10:00");

    // 5. White plays 1. e4 -> clock starts for Black
    await page.getByTestId("board-square-e2").click();
    await page.getByTestId("board-square-e4").click();

    // 6. Turn switches: Black clock becomes active
    await expect(page.getByTestId("clock-active-badge-b")).toBeVisible();
    await expect(page.getByTestId("clock-active-badge-w")).not.toBeVisible();

    // 7. Black plays 1... e5 -> clock switches to White
    await page.getByTestId("board-square-e7").click();
    await page.getByTestId("board-square-e5").click();

    // 8. Turn switches back: White clock active
    await expect(page.getByTestId("clock-active-badge-w")).toBeVisible();
    await expect(page.getByTestId("clock-active-badge-b")).not.toBeVisible();
  });

  test("should display untimed badge and infinite symbol in untimed mode", async ({
    page,
  }) => {
    // Starting fresh game in default untimed mode
    const whiteClock = page.getByTestId("clock-display-w");
    const blackClock = page.getByTestId("clock-display-b");

    await expect(whiteClock).toHaveAttribute("data-untimed", "true");
    await expect(blackClock).toHaveAttribute("data-untimed", "true");

    await expect(page.getByTestId("clock-untimed-badge-w")).toBeVisible();
    await expect(page.getByTestId("clock-untimed-badge-b")).toBeVisible();

    await expect(page.getByTestId("clock-time-w")).toHaveText("∞");
    await expect(page.getByTestId("clock-time-b")).toHaveText("∞");
  });

  test("should configure custom time control with base minutes and increment", async ({
    page,
  }) => {
    await page.getByTestId("btn-reset-game").click();
    await expect(page.getByTestId("new-game-modal")).toBeVisible();

    // Toggle custom time control
    await page.getByTestId("toggle-custom-time-control").click();
    await expect(page.getByTestId("custom-time-inputs-panel")).toBeVisible();

    // Set custom 5 minutes, 3 seconds increment
    const minInput = page.getByTestId("input-custom-minutes");
    const incInput = page.getByTestId("input-custom-increment");

    await minInput.fill("5");
    await incInput.fill("3");

    await expect(page.getByTestId("selected-tc-summary")).toContainText(
      "5 + 3"
    );

    // Start custom timed game
    await page.getByTestId("btn-submit-new-game").click();
    await expect(page.getByTestId("new-game-modal")).not.toBeVisible();

    // Verify clocks initialized to 5:00
    await expect(page.getByTestId("clock-time-w")).toContainText("5:00");
    await expect(page.getByTestId("clock-time-b")).toContainText("5:00");
  });
});
