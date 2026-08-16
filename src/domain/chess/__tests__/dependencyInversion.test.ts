import fs from "fs";
import path from "path";
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { ChessJsAdapter } from "../adapters/chessJsAdapter";
import { isOk } from "../errors";

describe("Chess Domain: Architectural Boundaries & Dependency Inversion (TC-DOM-13, TC-DOM-14)", () => {
  const domainDir = path.resolve(__dirname, "..");

  function getTsFiles(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== "__tests__") {
        files.push(...getTsFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith(".ts")) {
        files.push(fullPath);
      }
    }
    return files;
  }

  it("TC-DOM-13: domain source files have ZERO dependencies on React, DOM, or Tauri", () => {
    const domainFiles = getTsFiles(domainDir);
    expect(domainFiles.length).toBeGreaterThan(0);

    const forbiddenImports = [
      "react",
      "react-dom",
      "@tauri-apps",
      "document.",
      "window.",
    ];

    for (const file of domainFiles) {
      const content = fs.readFileSync(file, "utf-8");
      for (const forbidden of forbiddenImports) {
        expect(
          content.includes(`from '${forbidden}'`) ||
            content.includes(`from "${forbidden}"`) ||
            content.includes(`require('${forbidden}')`),
          `Forbidden import '${forbidden}' detected in ${file}`
        ).toBe(false);
      }
    }
  });

  it("TC-DOM-14: third-party chess.js is strictly encapsulated within adapters directory", () => {
    const domainFiles = getTsFiles(domainDir);
    const adapterFile = path.resolve(
      domainDir,
      "adapters",
      "chessJsAdapter.ts"
    );

    for (const file of domainFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const hasChessJsImport =
        content.includes("from 'chess.js'") ||
        content.includes('from "chess.js"');

      if (path.normalize(file) === path.normalize(adapterFile)) {
        expect(
          hasChessJsImport,
          "chessJsAdapter.ts MUST encapsulate chess.js"
        ).toBe(true);
      } else {
        expect(
          hasChessJsImport,
          `Leaked chess.js import detected in non-adapter file: ${file}`
        ).toBe(false);
      }
    }
  });

  it("TC-DOM-15: Property-based invariant fuzzing: King presence and turn alternation", () => {
    // Generate randomized games up to 20 plies and assert invariants
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 50 }), {
          minLength: 1,
          maxLength: 20,
        }),
        (moveIndices) => {
          const adapter = new ChessJsAdapter();

          for (const index of moveIndices) {
            if (adapter.getStatus().isOver) {
              break;
            }

            const currentTurn = adapter.getPosition().turn;
            const legalMoves = adapter.getLegalMoves();
            if (legalMoves.length === 0) {
              break;
            }

            const chosenMove = legalMoves[index % legalMoves.length];
            if (!chosenMove) {
              break;
            }
            const result = adapter.makeMove({
              from: chosenMove.from,
              to: chosenMove.to,
              promotion: chosenMove.promotion,
            });

            expect(result.success).toBe(true);
            if (isOk(result)) {
              const pos = adapter.getPosition();

              // Invariant 1: Exactly 1 white king and 1 black king on board
              let whiteKings = 0;
              let blackKings = 0;
              for (const row of pos.board) {
                for (const piece of row) {
                  if (piece?.type === "k") {
                    if (piece.color === "w") whiteKings++;
                    if (piece.color === "b") blackKings++;
                  }
                }
              }
              expect(whiteKings).toBe(1);
              expect(blackKings).toBe(1);

              // Invariant 2: Turn alternates unless game is over
              if (!adapter.getStatus().isOver) {
                expect(pos.turn).toBe(currentTurn === "w" ? "b" : "w");
              }
            }
          }
        }
      ),
      { numRuns: 25 }
    );
  });
});
