import { test, expect } from "@playwright/test";

/**
 * Phase 04 · Sprint 03: Selection and Legal Move Interaction E2E Suite
 * Reference: docs/testing/test_cases_catalog_P04_S03.md (TC-SEL-22)
 */

test.describe("ChessForge Selection & Legal Move Interaction (Phase 04 · Sprint 03)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("TC-SEL-22: selecting piece highlights legal destinations and executing move updates turn", async ({
    page,
  }) => {
    const turnIndicator = page.getByTestId("turn-indicator");
    await expect(turnIndicator).toContainText("White to move");

    // Click White pawn on e2
    const squareE2 = page.getByTestId("board-square-e2");
    await squareE2.click();

    // Verify selection state
    await expect(squareE2).toHaveClass(/is-selected/);
    await expect(squareE2).toHaveAttribute("aria-selected", "true");

    const selectedIndicator = page.getByTestId("selected-square-indicator");
    await expect(selectedIndicator).toBeVisible();
    await expect(selectedIndicator).toContainText("Selected: e2 (2 moves)");

    // Verify legal target dots
    const targetE3 = page.getByTestId("legal-target-e3");
    const targetE4 = page.getByTestId("legal-target-e4");
    await expect(targetE3).toBeVisible();
    await expect(targetE4).toBeVisible();

    // Click legal target e4
    const squareE4 = page.getByTestId("board-square-e4");
    await squareE4.click();

    // Verify move execution and turn change
    await expect(turnIndicator).toContainText("Black to move");
    await expect(selectedIndicator).not.toBeVisible();
    await expect(squareE4.locator("[data-testid='piece-wp']")).toBeVisible();
    await expect(squareE2.locator("[data-testid='piece-wp']")).toHaveCount(0);
  });

  test("switching selection between friendly pieces updates legal targets cleanly", async ({
    page,
  }) => {
    // Click White pawn on e2
    const squareE2 = page.getByTestId("board-square-e2");
    await squareE2.click();
    await expect(squareE2).toHaveClass(/is-selected/);
    await expect(page.getByTestId("legal-target-e4")).toBeVisible();

    // Click White knight on b1
    const squareB1 = page.getByTestId("board-square-b1");
    await squareB1.click();
    await expect(squareB1).toHaveClass(/is-selected/);
    await expect(squareE2).not.toHaveClass(/is-selected/);
    await expect(page.getByTestId("legal-target-a3")).toBeVisible();
    await expect(page.getByTestId("legal-target-c3")).toBeVisible();
    await expect(page.getByTestId("legal-target-e4")).not.toBeVisible();
  });

  test("clicking empty non-legal square clears selection", async ({ page }) => {
    const squareE2 = page.getByTestId("board-square-e2");
    await squareE2.click();
    await expect(squareE2).toHaveClass(/is-selected/);

    // Click empty square a4
    const squareA4 = page.getByTestId("board-square-a4");
    await squareA4.click();

    await expect(squareE2).not.toHaveClass(/is-selected/);
    await expect(
      page.getByTestId("selected-square-indicator")
    ).not.toBeVisible();
  });
});
