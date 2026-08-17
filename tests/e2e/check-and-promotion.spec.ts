import { test, expect } from "@playwright/test";

/**
 * Phase 04 · Sprint 05: Check and Promotion UI E2E Suite
 * Reference: docs/testing/test_cases_catalog_P04_S05.md (TC-PROM-01 to TC-PROM-21)
 */

test.describe("ChessForge Check & Checkmate UI (Phase 04 · Sprint 05)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("TC-PROM-01, TC-PROM-03: delivers checkmate and displays checkmate indicator badge and status", async ({
    page,
  }) => {
    // 1. f3
    await page.getByTestId("board-square-f2").click();
    await page.getByTestId("board-square-f3").click();

    // 1... e5
    await page.getByTestId("board-square-e7").click();
    await page.getByTestId("board-square-e5").click();

    // 2. g4
    await page.getByTestId("board-square-g2").click();
    await page.getByTestId("board-square-g4").click();

    // 2... Qh4#
    await page.getByTestId("board-square-d8").click();
    await page.getByTestId("board-square-h4").click();

    // Verify Checkmate status badge in header/bar
    const checkmateBadge = page.getByTestId("checkmate-indicator");
    await expect(checkmateBadge).toBeVisible();
    await expect(checkmateBadge).toContainText("Checkmate! Black wins");

    // Verify White King square on e1 has checkmate styling and indicator badge
    const squareE1 = page.getByTestId("board-square-e1");
    await expect(squareE1).toHaveClass(/is-check/);
    await expect(squareE1).toHaveClass(/is-checkmate/);
    await expect(squareE1).toHaveAttribute("data-is-check", "true");
    await expect(squareE1).toHaveAttribute("data-is-checkmate", "true");

    const indicatorBadge = page.getByTestId("checkmate-indicator-e1");
    await expect(indicatorBadge).toBeVisible();
  });
});
