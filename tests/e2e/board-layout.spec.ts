import { test, expect } from "@playwright/test";

/**
 * Phase 04 · Sprint 01: Board Layout and Coordinate System E2E Suite
 * Reference: docs/testing/test_cases_catalog_P04_S01.md (TC-BOARD-25)
 */

test.describe("ChessForge Board Layout & Coordinate System (Phase 04 · Sprint 01)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("TC-BOARD-25: renders chess board with all 64 squares and stable test IDs", async ({
    page,
  }) => {
    const board = page.getByTestId("chess-board");
    await expect(board).toBeVisible();
    await expect(board).toHaveAttribute("data-orientation", "w");

    // Verify key corner squares
    await expect(page.getByTestId("board-square-a1")).toBeVisible();
    await expect(page.getByTestId("board-square-h1")).toBeVisible();
    await expect(page.getByTestId("board-square-a8")).toBeVisible();
    await expect(page.getByTestId("board-square-h8")).toBeVisible();
    await expect(page.getByTestId("board-square-e4")).toBeVisible();

    // Verify coordinates
    await expect(page.getByTestId("board-coordinates-ranks")).toBeVisible();
    await expect(page.getByTestId("board-coordinates-files")).toBeVisible();
    await expect(page.getByTestId("coordinate-rank-8")).toBeVisible();
    await expect(page.getByTestId("coordinate-file-a")).toBeVisible();
  });

  test("should flip board orientation between White and Black perspectives", async ({
    page,
  }) => {
    const flipButton = page.getByTestId("btn-flip-board");
    await expect(flipButton).toBeVisible();
    await expect(flipButton).toContainText("White");

    const board = page.getByTestId("chess-board");
    await expect(board).toHaveAttribute("data-orientation", "w");

    // Click flip button to switch to Black perspective
    await flipButton.click();
    await expect(flipButton).toContainText("Black");
    await expect(board).toHaveAttribute("data-orientation", "b");

    // Click flip button again to return to White perspective
    await flipButton.click();
    await expect(flipButton).toContainText("White");
    await expect(board).toHaveAttribute("data-orientation", "w");
  });

  test("should handle square interaction and update selection indicator", async ({
    page,
  }) => {
    const squareE2 = page.getByTestId("board-square-e2");
    await expect(squareE2).toBeVisible();

    await squareE2.click();

    const indicator = page.getByTestId("selected-square-indicator");
    await expect(indicator).toBeVisible();
    await expect(indicator).toContainText("Selected: e2");
  });
});
