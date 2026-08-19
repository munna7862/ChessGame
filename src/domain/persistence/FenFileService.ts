/**
 * FenFileService
 * Safe desktop and web platform file I/O and clipboard adapter for FEN data.
 * Adheres strictly to the local-first mandate (zero network/telemetry, sandboxed client execution).
 */

export interface FenFileServiceOptions {
  readonly defaultFilenamePrefix?: string;
}

export class FenFileService {
  private readonly defaultPrefix: string;

  public constructor(options: FenFileServiceOptions = {}) {
    this.defaultPrefix = options.defaultFilenamePrefix ?? "chessforge_position";
  }

  /**
   * Generates a sanitized default filename for FEN export.
   */
  public generateDefaultFilename(
    customSuffix?: string,
    date: Date = new Date()
  ): string {
    const sanitize = (str?: string) =>
      (str ?? "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "_")
        .replace(/^_+|_+$/g, "");

    const suffix = sanitize(customSuffix);

    const pad = (n: number) => n.toString().padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const mins = pad(date.getMinutes());
    const secs = pad(date.getSeconds());
    const timestamp = `${year}${month}${day}_${hours}${mins}${secs}`;

    return suffix
      ? `${this.defaultPrefix}_${suffix}_${timestamp}.fen`
      : `${this.defaultPrefix}_${timestamp}.fen`;
  }

  /**
   * Triggers a safe local file download of the FEN content using standard Web Blob APIs.
   */
  public downloadFenFile(filename: string, fenContent: string): boolean {
    try {
      if (typeof window === "undefined" || typeof document === "undefined") {
        return false;
      }

      const safeFilename = filename.endsWith(".fen")
        ? filename
        : `${filename}.fen`;
      const blob = new Blob([fenContent.trim()], {
        type: "text/plain;charset=utf-8",
      });
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
   * Copies FEN string to the system clipboard using navigator.clipboard with fallback.
   */
  public async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(text.trim());
        return true;
      }

      // Fallback for environments where clipboard API is restricted
      if (typeof document !== "undefined") {
        const textarea = document.createElement("textarea");
        textarea.value = text.trim();
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
   * Reads FEN string from clipboard if available and permitted.
   */
  public async readFromClipboard(): Promise<string | null> {
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.readText === "function"
      ) {
        const text = await navigator.clipboard.readText();
        return text ? text.trim() : null;
      }
      return null;
    } catch {
      return null;
    }
  }
}
