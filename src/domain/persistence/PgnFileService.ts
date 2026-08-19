/**
 * PgnFileService
 * Safe desktop and web platform file I/O and clipboard adapter for PGN data.
 * Adheres strictly to the local-first mandate (zero network/telemetry, sandboxed client execution).
 */

import {
  ok,
  err,
  createPersistenceError,
  type Result,
  type PersistenceError,
} from "./errors";

export interface PgnFileServiceOptions {
  readonly defaultFilenamePrefix?: string;
}

export class PgnFileService {
  private readonly defaultPrefix: string;

  public constructor(options: PgnFileServiceOptions = {}) {
    this.defaultPrefix = options.defaultFilenamePrefix ?? "chessforge_game";
  }

  /**
   * Generates a sanitized default filename for PGN export based on players and timestamp.
   */
  public generateDefaultFilename(
    whiteName?: string,
    blackName?: string,
    date: Date = new Date()
  ): string {
    const sanitize = (str?: string) =>
      (str ?? "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "_")
        .replace(/^_+|_+$/g, "") || "player";

    const w = sanitize(whiteName);
    const b = sanitize(blackName);

    const pad = (n: number) => n.toString().padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const mins = pad(date.getMinutes());
    const secs = pad(date.getSeconds());
    const timestamp = `${year}${month}${day}_${hours}${mins}${secs}`;

    return `${this.defaultPrefix}_${w}_vs_${b}_${timestamp}.pgn`;
  }

  /**
   * Triggers a safe local file download of the PGN content using standard Web Blob APIs.
   */
  public downloadPgnFile(filename: string, content: string): boolean {
    try {
      if (typeof window === "undefined" || typeof document === "undefined") {
        return false;
      }

      const safeFilename = filename.endsWith(".pgn")
        ? filename
        : `${filename}.pgn`;
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = safeFilename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      // Clean up after execution
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Reads raw PGN text from a user-selected File object safely.
   */
  public async readPgnFile(
    file: File
  ): Promise<Result<string, PersistenceError>> {
    if (!file) {
      return err(
        createPersistenceError(
          "READ_FAILED",
          "No file provided for PGN import."
        )
      );
    }

    // Guard against excessively large files (> 2 MB)
    const MAX_PGN_BYTES = 2 * 1024 * 1024;
    if (file.size > MAX_PGN_BYTES) {
      return err(
        createPersistenceError(
          "VALIDATION_FAILED",
          `PGN file size (${(file.size / 1024).toFixed(1)} KB) exceeds maximum allowed limit (2 MB).`
        )
      );
    }

    try {
      let text = "";
      if (typeof file.text === "function") {
        text = await file.text();
      } else {
        // Fallback to FileReader if file.text() is unavailable
        text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result ?? ""));
          reader.onerror = () =>
            reject(reader.error ?? new Error("Failed to read file."));
          reader.readAsText(file);
        });
      }

      if (!text.trim()) {
        return err(
          createPersistenceError(
            "VALIDATION_FAILED",
            "The selected PGN file is empty."
          )
        );
      }

      return ok(text);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to read PGN file.";
      return err(
        createPersistenceError("READ_FAILED", msg, { originalError: e })
      );
    }
  }

  /**
   * Copies PGN string to the system clipboard using navigator.clipboard with fallback.
   */
  public async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(text);
        return true;
      }

      // Fallback for environments where clipboard API is restricted
      if (typeof document !== "undefined") {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textarea);
        return successful;
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Reads PGN string from clipboard if available and permitted.
   */
  public async readFromClipboard(): Promise<string | null> {
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.readText === "function"
      ) {
        const text = await navigator.clipboard.readText();
        return text || null;
      }
      return null;
    } catch {
      return null;
    }
  }
}
