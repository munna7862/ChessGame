import { describe, it, expect } from "vitest";
import {
  TIME_CONTROL_PRESETS,
  getTimeControlCategory,
  createTimeControl,
  formatTimeControl,
  formatTimeRemaining,
} from "../timeControl";

describe("TimeControl Presets, Categorization & Formatting (TC-CLK-01, TC-CLK-02, TC-CLK-04, TC-CLK-05)", () => {
  it("TC-CLK-01: validates all standard presets and their expected classifications", () => {
    expect(TIME_CONTROL_PRESETS.length).toBeGreaterThanOrEqual(11);

    const preset1_0 = TIME_CONTROL_PRESETS.find((p) =>
      p.label?.includes("1 + 0")
    );
    expect(preset1_0).toBeDefined();
    expect(preset1_0?.type).toBe("bullet");
    expect(preset1_0?.initialMs).toBe(60000);
    expect(preset1_0?.incrementMs).toBe(0);

    const preset2_1 = TIME_CONTROL_PRESETS.find((p) =>
      p.label?.includes("2 + 1")
    );
    expect(preset2_1).toBeDefined();
    expect(preset2_1?.type).toBe("bullet");
    expect(preset2_1?.initialMs).toBe(120000);
    expect(preset2_1?.incrementMs).toBe(1000);

    const preset3_0 = TIME_CONTROL_PRESETS.find((p) =>
      p.label?.includes("3 + 0")
    );
    expect(preset3_0?.type).toBe("blitz");

    const preset3_2 = TIME_CONTROL_PRESETS.find((p) =>
      p.label?.includes("3 + 2")
    );
    expect(preset3_2?.type).toBe("blitz");

    const preset5_0 = TIME_CONTROL_PRESETS.find((p) =>
      p.label?.includes("5 + 0")
    );
    expect(preset5_0?.type).toBe("blitz");

    const preset5_3 = TIME_CONTROL_PRESETS.find((p) =>
      p.label?.includes("5 + 3")
    );
    expect(preset5_3?.type).toBe("blitz");

    const preset10_0 = TIME_CONTROL_PRESETS.find((p) =>
      p.label?.includes("10 + 0")
    );
    expect(preset10_0?.type).toBe("rapid");

    const preset10_5 = TIME_CONTROL_PRESETS.find((p) =>
      p.label?.includes("10 + 5")
    );
    expect(preset10_5?.type).toBe("rapid");

    const preset15_10 = TIME_CONTROL_PRESETS.find((p) =>
      p.label?.includes("15 + 10")
    );
    expect(preset15_10?.type).toBe("rapid");

    const preset30_0 = TIME_CONTROL_PRESETS.find((p) =>
      p.label?.includes("30 + 0")
    );
    expect(preset30_0?.type).toBe("classical");

    const unlimited = TIME_CONTROL_PRESETS.find((p) => p.type === "none");
    expect(unlimited?.initialMs).toBe(0);
  });

  it("TC-CLK-02: creates custom time controls and safely handles bounds", () => {
    const customValid = createTimeControl(7, 4, "7 + 4 custom");
    expect(customValid.initialMs).toBe(7 * 60 * 1000);
    expect(customValid.incrementMs).toBe(4 * 1000);
    expect(customValid.label).toBe("7 + 4 custom");
    expect(customValid.type).toBe("blitz"); // 7 min + 40*4s (160s = 2.66m) = 9.66m -> blitz

    const customNegative = createTimeControl(-5, -2);
    expect(customNegative.type).toBe("none");
    expect(customNegative.initialMs).toBe(0);
    expect(customNegative.incrementMs).toBe(0);

    const customZero = createTimeControl(0, 0);
    expect(customZero.type).toBe("none");
  });

  it("TC-CLK-04: formats time remaining strings accurately across thresholds", () => {
    // Normal minute:second format (> 10s default threshold)
    expect(formatTimeRemaining(180000)).toBe("3:00");
    expect(formatTimeRemaining(65000)).toBe("1:05");
    expect(formatTimeRemaining(60000)).toBe("1:00");
    expect(formatTimeRemaining(12000)).toBe("0:12");

    // Tenths of a second format (< 10s default threshold)
    expect(formatTimeRemaining(9400)).toBe("0:09.4");
    expect(formatTimeRemaining(420)).toBe("0:00.4");
    expect(formatTimeRemaining(0)).toBe("0:00.0");

    // Hours format (>= 1 hour)
    expect(formatTimeRemaining(3661000)).toBe("1:01:01");
    expect(formatTimeRemaining(7200000)).toBe("2:00:00");

    // Custom threshold option
    expect(formatTimeRemaining(5000, { showTenthsBelowMs: 0 })).toBe("0:05");
  });

  it("TC-CLK-05: categorizes time controls accurately based on estimated game duration", () => {
    // Bullet: < 3 min
    expect(getTimeControlCategory(60 * 1000, 0)).toBe("bullet");
    expect(getTimeControlCategory(2 * 60 * 1000, 1000)).toBe("bullet"); // 2m + 40s = 2m40s < 3m

    // Blitz: 3 to < 10 min
    expect(getTimeControlCategory(3 * 60 * 1000, 0)).toBe("blitz");
    expect(getTimeControlCategory(3 * 60 * 1000, 2000)).toBe("blitz"); // 3m + 80s = 4m20s
    expect(getTimeControlCategory(5 * 60 * 1000, 3000)).toBe("blitz"); // 5m + 120s = 7m

    // Rapid: 10 to < 30 min
    expect(getTimeControlCategory(10 * 60 * 1000, 0)).toBe("rapid");
    expect(getTimeControlCategory(10 * 60 * 1000, 5000)).toBe("rapid"); // 10m + 200s = 13m20s
    expect(getTimeControlCategory(15 * 60 * 1000, 10000)).toBe("rapid"); // 15m + 400s = 21m40s

    // Classical: >= 30 min
    expect(getTimeControlCategory(30 * 60 * 1000, 0)).toBe("classical");
    expect(getTimeControlCategory(60 * 60 * 1000, 30000)).toBe("classical");
  });

  it("formats time control labels correctly via formatTimeControl", () => {
    expect(
      formatTimeControl({ type: "blitz", initialMs: 300000, incrementMs: 3000 })
    ).toBe("5 + 3");
    expect(
      formatTimeControl({ type: "none", initialMs: 0, incrementMs: 0 })
    ).toBe("Unlimited");
  });
});
