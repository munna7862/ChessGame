import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FenFileService } from "../FenFileService";

describe("FenFileService Unit Tests (Phase 08 · Sprint 04)", () => {
  let service: FenFileService;

  beforeEach(() => {
    service = new FenFileService();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("TC-FEN-UI-01: generates sanitized default filenames for FEN export", () => {
    const fixedDate = new Date(2026, 7, 19, 14, 30, 0); // 2026-08-19 14:30:00
    const defaultFilename = service.generateDefaultFilename(
      undefined,
      fixedDate
    );
    expect(defaultFilename).toBe("chessforge_position_20260819_143000.fen");

    const customFilename = service.generateDefaultFilename(
      "Lucena Position!",
      fixedDate
    );
    expect(customFilename).toBe(
      "chessforge_position_lucena_position_20260819_143000.fen"
    );
  });

  it("TC-FEN-UI-02: copies FEN string to navigator clipboard", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const result = await service.copyToClipboard(fen);

    expect(result).toBe(true);
    expect(writeTextMock).toHaveBeenCalledWith(fen);
  });

  it("TC-FEN-UI-02 (clipboard read): reads FEN from navigator clipboard", async () => {
    const fen = "1K6/1P1k4/8/8/8/8/r7/2R5 w - - 0 1";
    const readTextMock = vi.fn().mockResolvedValue(fen);
    Object.assign(navigator, {
      clipboard: {
        readText: readTextMock,
      },
    });

    const readFen = await service.readFromClipboard();
    expect(readFen).toBe(fen);
    expect(readTextMock).toHaveBeenCalled();
  });

  it("TC-FEN-UI-02 (clipboard read error): returns null when clipboard access fails or is denied", async () => {
    const readTextMock = vi
      .fn()
      .mockRejectedValue(new Error("Permission denied"));
    Object.assign(navigator, {
      clipboard: {
        readText: readTextMock,
      },
    });

    const readFen = await service.readFromClipboard();
    expect(readFen).toBeNull();
  });

  it("TC-FEN-UI-03: triggers safe local FEN file download using Web Blob API", () => {
    const mockCreateObjectURL = vi.fn().mockReturnValue("blob:mock-fen-url");
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

    const fen = "8/2b5/8/4k3/8/8/2B1K3/8 w - - 0 1";
    const success = service.downloadFenFile("endgame_position", fen);

    expect(success).toBe(true);
    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(appendChildSpy).toHaveBeenCalledTimes(1);
    expect(removeChildSpy).toHaveBeenCalledTimes(1);
    expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-fen-url");
  });
});
