import { test, expect } from "@playwright/test";

/**
 * Phase 05 · Sprint 02: New Game and Player Configuration
 * E2E test suite validating New Game modal, player configuration, active player panels, and clean game session resets.
 * Reference: docs/testing/test_cases_catalog_P05_S02.md (TC-NG-01 to TC-NG-15)
 */

test.describe("ChessForge New Game & Player Configuration E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("TC-NG-01 & TC-NG-13: should display active player panels on initial launch", async ({
    page,
  }) => {
    const whitePanel = page.getByTestId("player-panel-w");
    const blackPanel = page.getByTestId("player-panel-b");

    await expect(whitePanel).toBeVisible();
    await expect(blackPanel).toBeVisible();

    await expect(page.getByTestId("player-name-w")).toHaveText("White");
    await expect(page.getByTestId("player-name-b")).toHaveText("Black");
    await expect(page.getByTestId("player-type-w")).toHaveText("Human");
  });

  test("TC-NG-02 & TC-NG-03: should open New Game dialog, customize player names, and start game", async ({
    page,
  }) => {
    // Open New Game modal
    const newGameBtn = page.getByTestId("btn-reset-game");
    await newGameBtn.click();

    const modal = page.getByTestId("new-game-modal");
    await expect(modal).toBeVisible();
    await expect(page.getByText("New Game Setup")).toBeVisible();

    // Input custom player names
    const p1Input = page.getByTestId("input-player1-name");
    const p2Input = page.getByTestId("input-player2-name");

    await p1Input.fill("Kasparov");
    await p2Input.fill("Deep Blue");

    // Submit
    const submitBtn = page.getByTestId("btn-submit-new-game");
    await submitBtn.click();

    // Modal closed
    await expect(modal).not.toBeVisible();

    // Player panels updated
    await expect(page.getByTestId("player-name-w")).toHaveText("Kasparov");
    await expect(page.getByTestId("player-name-b")).toHaveText("Deep Blue");
  });

  test("TC-NG-04: should configure playing as Black and flip board orientation", async ({
    page,
  }) => {
    await page.getByTestId("btn-reset-game").click();

    const blackColorBtn = page.getByTestId("color-choice-black");
    await blackColorBtn.click();

    await page.getByTestId("btn-submit-new-game").click();

    // Board orientation set to Black ('b')
    const board = page.getByTestId("chess-board");
    await expect(board).toHaveAttribute("data-orientation", "b");
  });

  test("TC-NG-12: should cancel New Game dialog without modifying current game", async ({
    page,
  }) => {
    // Play move e2 -> e4
    await page.getByTestId("board-square-e2").click();
    await page.getByTestId("board-square-e4").click();

    await expect(page.getByTestId("last-move-indicator")).toContainText(
      "e2 → e4"
    );

    // Open modal and cancel
    await page.getByTestId("btn-reset-game").click();
    await expect(page.getByTestId("new-game-modal")).toBeVisible();

    await page.getByTestId("btn-cancel-new-game").click();
    await expect(page.getByTestId("new-game-modal")).not.toBeVisible();

    // Move is still on board
    await expect(page.getByTestId("last-move-indicator")).toContainText(
      "e2 → e4"
    );
  });
});
