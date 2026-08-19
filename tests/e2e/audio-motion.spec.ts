import { test, expect } from "@playwright/test";

/**
 * Phase 09 · Sprint 03: Audio and Motion Polish E2E Test Suite
 * Reference: docs/testing/test_cases_catalog_P09_S03.md (TC-SET-01 to TC-SET-04, TC-E2E-01)
 */

test.describe("ChessForge Audio and Motion Settings & Interactions (Phase 09 · Sprint 03)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("TC-SET-01 to TC-SET-04: Audio and Motion settings section allows auditioning sound cues and toggling settings", async ({
    page,
  }) => {
    // Open Settings Modal
    const settingsBtn = page.getByTestId("btn-open-settings");
    await settingsBtn.click();

    const modal = page.getByTestId("settings-modal");
    await expect(modal).toBeVisible();

    // Switch to Audio & Motion tab
    const audioTab = page.getByTestId("tab-audio-motion");
    await audioTab.click();

    const audioSection = page.getByTestId("settings-section-audio-motion");
    await expect(audioSection).toBeVisible();

    // Check sound enabled switch
    const soundSwitch = page.getByTestId("switch-sound");
    await expect(soundSwitch).toHaveAttribute("aria-checked", "true");

    // Check audition buttons are enabled
    const moveAuditionBtn = page.getByTestId("btn-test-sound-move");
    await expect(moveAuditionBtn).toBeEnabled();
    await moveAuditionBtn.click();

    const captureAuditionBtn = page.getByTestId("btn-test-sound-capture");
    await expect(captureAuditionBtn).toBeEnabled();
    await captureAuditionBtn.click();

    const checkAuditionBtn = page.getByTestId("btn-test-sound-check");
    await expect(checkAuditionBtn).toBeEnabled();
    await checkAuditionBtn.click();

    // Toggle sound off
    await soundSwitch.click();
    await expect(soundSwitch).toHaveAttribute("aria-checked", "false");
    await expect(page.getByTestId("volume-value-badge")).toHaveText("Muted");
    await expect(moveAuditionBtn).toBeDisabled();

    // Toggle sound back on
    await soundSwitch.click();
    await expect(soundSwitch).toHaveAttribute("aria-checked", "true");
    await expect(moveAuditionBtn).toBeEnabled();

    // Test volume slider
    const volumeSlider = page.getByTestId("slider-volume");
    await volumeSlider.fill("60");
    await expect(page.getByTestId("volume-value-badge")).toHaveText("60%");

    // Test reduced motion toggle
    const reducedMotionSwitch = page.getByTestId("switch-reduced-motion");
    await expect(reducedMotionSwitch).toHaveAttribute("aria-checked", "false");
    await reducedMotionSwitch.click();
    await expect(reducedMotionSwitch).toHaveAttribute("aria-checked", "true");

    // Close settings modal
    const closeBtn = page.getByTestId("btn-close-settings");
    await closeBtn.click();
    await expect(modal).not.toBeVisible();

    // Verify board wrapper reflects reduced motion class
    const boardWrapper = page.getByTestId("chess-board-wrapper");
    await expect(boardWrapper).toHaveClass(/reduced-motion/);
  });

  test("TC-E2E-01: Move execution with sound and motion completes cleanly", async ({
    page,
  }) => {
    // Play 1. e4 e5 2. Nf3 Nc6
    await page.getByTestId("board-square-e2").click();
    await page.getByTestId("board-square-e4").click();

    await expect(page.getByTestId("board-square-e4")).toHaveClass(
      /is-last-move-to/
    );

    await page.getByTestId("board-square-e7").click();
    await page.getByTestId("board-square-e5").click();

    await expect(page.getByTestId("board-square-e5")).toHaveClass(
      /is-last-move-to/
    );

    await page.getByTestId("board-square-g1").click();
    await page.getByTestId("board-square-f3").click();

    await expect(page.getByTestId("board-square-f3")).toHaveClass(
      /is-last-move-to/
    );
  });
});
