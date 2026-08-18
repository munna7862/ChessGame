import { describe, it, expect, beforeEach } from "vitest";
import {
  EngineDiagnosticsLogger,
  engineDiagnostics,
} from "../engineDiagnostics";

describe("EngineDiagnosticsLogger (TC-EFR-09)", () => {
  let logger: EngineDiagnosticsLogger;

  beforeEach(() => {
    logger = new EngineDiagnosticsLogger(10);
    engineDiagnostics.clearLogs();
  });

  it("logs diagnostic events with timestamp, id, and details", () => {
    const event = logger.log("WORKER_CRASH", "WebWorker crashed unexpectedly", {
      workerId: 1,
      exitCode: -1,
    });

    expect(event.id).toContain("diag-");
    expect(event.type).toBe("WORKER_CRASH");
    expect(event.message).toBe("WebWorker crashed unexpectedly");
    expect(event.details).toEqual({ workerId: 1, exitCode: -1 });
    expect(new Date(event.timestamp).getTime()).toBeGreaterThan(0);

    const logs = logger.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toBe(event);
  });

  it("enforces circular buffer max entries limit", () => {
    for (let i = 0; i < 15; i++) {
      logger.log("STATE_CHANGE", `Transition ${i}`);
    }

    const logs = logger.getLogs();
    expect(logs).toHaveLength(10);
    expect(logs[0]?.message).toBe("Transition 5");
    expect(logs[9]?.message).toBe("Transition 14");
  });

  it("filters logs by event type", () => {
    logger.log("WORKER_CRASH", "Crash 1");
    logger.log("STATE_CHANGE", "Ready");
    logger.log("WORKER_CRASH", "Crash 2");
    logger.log("FALLBACK_2P", "Switched to 2P");

    const crashes = logger.getLogsByType("WORKER_CRASH");
    expect(crashes).toHaveLength(2);
    expect(crashes[0]?.message).toBe("Crash 1");
    expect(crashes[1]?.message).toBe("Crash 2");
  });

  it("notifies listeners on new diagnostic events and allows unsubscription", () => {
    const received: string[] = [];
    const unsubscribe = logger.onLog((e) => {
      received.push(e.message);
    });

    logger.log("RESTART_ATTEMPT", "Restarting");
    logger.log("RESTART_SUCCESS", "Success");

    expect(received).toEqual(["Restarting", "Success"]);

    unsubscribe();
    logger.log("STATE_CHANGE", "Idle");

    expect(received).toHaveLength(2);
  });

  it("clears logs correctly", () => {
    logger.log("WORKER_ERROR", "Err");
    expect(logger.getLogs()).toHaveLength(1);
    logger.clearLogs();
    expect(logger.getLogs()).toHaveLength(0);
  });
});
