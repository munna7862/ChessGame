import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PgnFileService } from "../PgnFileService";

describe("PgnFileService (TC-PGN-UI-01 to TC-PGN-UI-04)", () => {
  let service: PgnFileService;

  beforeEach(() => {
    service = new PgnFileService();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("generateDefaultFilename", () => {
    it("generates formatted filename with player names and timestamp", () => {
      const fixedDate = new Date(2026, 7, 19, 14, 30, 45); // 2026-08-19 14:30:45
      const filename = service.generateDefaultFilename(
        "Magnus Carlsen",
        "Hikaru Nakamura",
        fixedDate
      );
      expect(filename).toBe(
        "chessforge_game_magnus_carlsen_vs_hikaru_nakamura_20260819_143045.pgn"
      );
    });

    it("falls back gracefully when player names are undefined or empty", () => {
      const fixedDate = new Date(2026, 0, 1, 12, 0, 0);
      const filename = service.generateDefaultFilename(
        "",
        undefined,
        fixedDate
      );
      expect(filename).toBe(
        "chessforge_game_player_vs_player_20260101_120000.pgn"
      );
    });
  });

  describe("downloadPgnFile (TC-PGN-UI-03)", () => {
    it("creates an anchor element, sets download filename, and clicks it", () => {
      const mockCreateObjectURL = vi.fn().mockReturnValue("blob:mock-url");
      const mockRevokeObjectURL = vi.fn();
      globalThis.URL.createObjectURL = mockCreateObjectURL;
      globalThis.URL.revokeObjectURL = mockRevokeObjectURL;

      const clickSpy = vi.fn();
      const appendChildSpy = vi.spyOn(document.body, "appendChild");
      const removeChildSpy = vi.spyOn(document.body, "removeChild");

      const origCreateElement = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation(
        (tagName: string) => {
          const el = origCreateElement(tagName);
          if (tagName === "a") {
            el.click = clickSpy;
          }
          return el;
        }
      );

      const pgnContent = '[Event "Test"]\n\n1. e4 e5 *';
      const success = service.downloadPgnFile("test_game.pgn", pgnContent);

      expect(success).toBe(true);
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(appendChildSpy).toHaveBeenCalledTimes(1);
      expect(removeChildSpy).toHaveBeenCalledTimes(1);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });

    it("appends .pgn extension if omitted", () => {
      const mockCreateObjectURL = vi.fn().mockReturnValue("blob:mock-url");
      const mockRevokeObjectURL = vi.fn();
      globalThis.URL.createObjectURL = mockCreateObjectURL;
      globalThis.URL.revokeObjectURL = mockRevokeObjectURL;

      let createdAnchor: HTMLAnchorElement | null = null;
      const origCreateElement = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation(
        (tagName: string) => {
          const el = origCreateElement(tagName);
          if (tagName === "a") {
            createdAnchor = el as HTMLAnchorElement;
            el.click = vi.fn();
          }
          return el;
        }
      );

      service.downloadPgnFile("my_game", "1. d4 *");
      expect((createdAnchor as HTMLAnchorElement | null)?.download).toBe(
        "my_game.pgn"
      );
    });
  });

  describe("readPgnFile (TC-PGN-UI-10)", () => {
    it("reads valid text from a File successfully", async () => {
      const pgnContent =
        '[Event "Match"]\n[White "Alice"]\n[Black "Bob"]\n\n1. e4 e5 2. Nf3 Nc6 1-0';
      const file = new File([pgnContent], "game.pgn", { type: "text/plain" });

      const res = await service.readPgnFile(file);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data).toBe(pgnContent);
      }
    });

    it("rejects empty files with descriptive validation error", async () => {
      const file = new File(["   "], "empty.pgn", { type: "text/plain" });
      const res = await service.readPgnFile(file);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("VALIDATION_FAILED");
        expect(res.error.message).toContain("empty");
      }
    });

    it("rejects excessively large files (> 2 MB)", async () => {
      const largeData = new Uint8Array(2.5 * 1024 * 1024);
      const file = new File([largeData], "huge.pgn", { type: "text/plain" });

      const res = await service.readPgnFile(file);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.code).toBe("VALIDATION_FAILED");
        expect(res.error.message).toContain("exceeds maximum allowed limit");
      }
    });
  });

  describe("copyToClipboard (TC-PGN-UI-04)", () => {
    it("copies text using navigator.clipboard when available", async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      const success = await service.copyToClipboard("1. e4 e5 *");
      expect(success).toBe(true);
      expect(writeTextMock).toHaveBeenCalledWith("1. e4 e5 *");
    });
  });
});
