/**
 * Local-First Engine Diagnostics & Telemetry Logging.
 * Adheres strictly to the Desktop Operating Contract (zero external network traffic).
 */

export type EngineDiagnosticEventType =
  | "WORKER_ERROR"
  | "WORKER_CRASH"
  | "STATE_CHANGE"
  | "RESTART_ATTEMPT"
  | "RESTART_SUCCESS"
  | "RESTART_FAILED"
  | "FALLBACK_2P"
  | "SEARCH_CANCELLED"
  | "SEARCH_TIMEOUT";

export interface EngineDiagnosticEvent {
  readonly id: string;
  readonly timestamp: string;
  readonly type: EngineDiagnosticEventType;
  readonly message: string;
  readonly details?: Record<string, unknown> | undefined;
}

export class EngineDiagnosticsLogger {
  private readonly maxEntries: number;
  private readonly entries: EngineDiagnosticEvent[] = [];
  private readonly listeners = new Set<
    (event: EngineDiagnosticEvent) => void
  >();
  private counter = 0;

  constructor(maxEntries = 100) {
    this.maxEntries = maxEntries;
  }

  public log(
    type: EngineDiagnosticEventType,
    message: string,
    details?: Record<string, unknown>
  ): EngineDiagnosticEvent {
    const event: EngineDiagnosticEvent = {
      id: `diag-${++this.counter}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type,
      message,
      ...(details ? { details } : {}),
    };

    this.entries.push(event);
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch {
        // Prevent listener failures from interfering with diagnostics
      }
    }

    return event;
  }

  public getLogs(): readonly EngineDiagnosticEvent[] {
    return [...this.entries];
  }

  public getLogsByType(
    type: EngineDiagnosticEventType
  ): readonly EngineDiagnosticEvent[] {
    return this.entries.filter((e) => e.type === type);
  }

  public clearLogs(): void {
    this.entries.length = 0;
  }

  public onLog(listener: (event: EngineDiagnosticEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const engineDiagnostics = new EngineDiagnosticsLogger();
