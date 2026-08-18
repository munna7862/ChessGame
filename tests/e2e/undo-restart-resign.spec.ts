import { test, expect } from "@playwright/test";

/**
 * Phase 05 · Sprint 04: Undo Restart and Resign
 * E2E test suite validating Move Undo, Restart confirmation workflow, Resignation flow, and Game-Over non-interactivity.
 * Reference: docs/testing/test_cases_catalog_P05_S04.md (TC-CTRL-01 to TC-CTRL-16, TC-E2E-01)
 */

test.describe("ChessForge Undo, Restart, and Resign E2E (TC-E2E-01)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("TC-CTRL-01 & TC-CTRL-02: should execute move, enable Undo button, and revert position upon undo", async ({
    page,
  }) => {
    const undoBtn = page.getByTestId("btn-undo-move");
    await expect(undoBtn).toBeDisabled();

    // Play 1. e4
    await page.getByTestId("board-square-e2").click();
    await page.getByTestId("board-square-e4").click();

    await expect(page.getByTestId("turn-indicator")).toHaveText(
      "Black to move"
    );
    await expect(undoBtn).toBeEnabled();
    await expect(page.getByTestId("last-move-indicator")).toBeVisible();

    // Click Undo
    await undoBtn.click();

    // Verify position reverted
    await expect(page.getByTestId("turn-indicator")).toHaveText(
      "White to move"
    );
    await expect(
      page.getByTestId("board-square-e2").locator("[data-testid='piece-wp']")
    ).toBeVisible();
    await expect(page.getByTestId("last-move-indicator")).not.toBeVisible();
    await expect(undoBtn).toBeDisabled();
  });

  test("TC-CTRL-08 to TC-CTRL-10: should prompt confirmation on Restart, support cancel and confirm reset", async ({
    page,
  }) => {
    // Play 1. e4
    await page.getByTestId("board-square-e2").click();
    await page.getByTestId("board-square-e4").click();

    // Click Restart
    const restartBtn = page.getByTestId("btn-restart-game");
    await restartBtn.click();

    const restartModal = page.getByTestId("restart-confirm-modal");
    await expect(restartModal).toBeVisible();
    await expect(page.getByText("Restart Game?")).toBeVisible();

    // Cancel restart
    await page.getByTestId("btn-cancel-restart").click();
    await expect(restartModal).not.toBeVisible();
    await expect(page.getByTestId("turn-indicator")).toHaveText(
      "Black to move"
    );

    // Reopen and confirm restart
    await restartBtn.click();
    await page.getByTestId("btn-confirm-restart").click();
    await expect(restartModal).not.toBeVisible();

    // Verify fresh board state
    await expect(page.getByTestId("turn-indicator")).toHaveText(
      "White to move"
    );
    await expect(page.getByTestId("last-move-indicator")).not.toBeVisible();
    await expect(page.getByTestId("btn-undo-move")).toBeDisabled();
  });

  test("TC-CTRL-11 to TC-CTRL-14: should prompt confirmation on Resign, declare winner, and disable board", async ({
    page,
  }) => {
    const resignBtn = page.getByTestId("btn-resign-game");
    await resignBtn.click();

    const resignModal = page.getByTestId("resign-confirm-modal");
    await expect(resignModal).toBeVisible();
    await expect(page.getByText("Resign Game?")).toBeVisible();

    // Cancel resignation
    await page.getByTestId("btn-cancel-resign").click();
    await expect(resignModal).not.toBeVisible();

    // Board remains interactive
    const board = page.getByTestId("chess-board");
    await expect(board).toHaveAttribute("aria-disabled", "false");

    // Reopen and confirm resignation
    await resignBtn.click();
    await page.getByTestId("btn-confirm-resign").click();
    await expect(resignModal).not.toBeVisible();

    // Resignation banner displayed
    await expect(page.getByTestId("resignation-indicator")).toHaveText(
      "White Resigned · Black Wins"
    );

    // Board is disabled
    await expect(board).toHaveAttribute("aria-disabled", "true");
    await expect(resignBtn).toBeDisabled();
    await expect(page.getByTestId("btn-undo-move")).toBeDisabled();

    // Clicks on disabled board do nothing
    await page.getByTestId("board-square-e2").click({ force: true });
    await expect(page.getByTestId("board-square-e2")).not.toHaveClass(
      /is-selected/
    );
  });
});
