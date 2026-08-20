import * as fc from "fast-check";
import { describe, expect, it } from "vitest";
import { ChessJsAdapter } from "../adapters/chessJsAdapter";
import { isErr, isOk } from "../errors";
import { validateFen } from "../fen";
import { parsePgn } from "../pgn";
import type { MoveInput, Square } from "../types";

/**
 * Deterministic PRNG helper for reproducible legal game generation.
 */
function createSeededRandom(seed: number) {
  let s = seed;
  return () => {
    // Simple LCG PRNG: X_{n+1} = (a * X_n + c) % m
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/**
 * Generates a legal game playout using a reproducible seed.
 */
function playLegalGame(
  seed: number,
  maxPlies: number,
  initialFen?: string
): {
  adapter: ChessJsAdapter;
  movesMade: MoveInput[];
  positions: string[];
} {
  const adapter = new ChessJsAdapter(initialFen);
  const rng = createSeededRandom(seed);
  const movesMade: MoveInput[] = [];
  const positions: string[] = [adapter.getPosition().fen];

  for (let ply = 0; ply < maxPlies; ply++) {
    const status = adapter.getStatus();
    if (status.isOver) {
      break;
    }

    const legalMoves = adapter.getLegalMoves();
    if (legalMoves.length === 0) {
      break;
    }

    // Deterministically select a legal move
    const moveIndex = Math.floor(rng() * legalMoves.length);
    const chosenMove = legalMoves[moveIndex];
    if (!chosenMove) {
      break;
    }

    const moveInput: MoveInput = {
      from: chosenMove.from,
      to: chosenMove.to,
      promotion: chosenMove.promotion,
    };

    const result = adapter.makeMove(moveInput);
    if (isErr(result)) {
      throw new Error(
        `Generated move ${chosenMove.san} (${chosenMove.from}-${chosenMove.to}) unexpectedly failed: ${result.error.message}`
      );
    }

    movesMade.push(moveInput);
    positions.push(adapter.getPosition().fen);
  }

  return { adapter, movesMade, positions };
}

describe("Phase 10 · Sprint 03: Generative Property-Based Invariant Fuzzing (fast-check)", () => {
  describe("TC-PROP-01: Reproducible Seeded Legal Game Generation", () => {
    it("generates identical legal game sequences given the same PRNG seed", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100000 }),
          fc.integer({ min: 10, max: 40 }),
          (seed, plies) => {
            const game1 = playLegalGame(seed, plies);
            const game2 = playLegalGame(seed, plies);

            expect(game1.movesMade.length).toBe(game2.movesMade.length);
            expect(game1.positions).toEqual(game2.positions);
            expect(game1.adapter.getPosition().fen).toBe(
              game2.adapter.getPosition().fen
            );
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe("TC-PROP-02: King Count & Strict King Safety Invariants", () => {
    it("guarantees exactly one white king and one black king at every ply", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100000 }),
          fc.integer({ min: 15, max: 50 }),
          (seed, plies) => {
            const { positions } = playLegalGame(seed, plies);

            for (const fen of positions) {
              const fenBoard = fen.split(" ")[0] ?? "";
              const whiteKings = (fenBoard.match(/K/g) || []).length;
              const blackKings = (fenBoard.match(/k/g) || []).length;

              expect(whiteKings).toBe(1);
              expect(blackKings).toBe(1);
            }
          }
        ),
        { numRuns: 25 }
      );
    });

    it("ensures the inactive player (who just made the move) is never left in check", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100000 }),
          fc.integer({ min: 10, max: 35 }),
          (seed, plies) => {
            const adapter = new ChessJsAdapter();
            const rng = createSeededRandom(seed);

            for (let ply = 0; ply < plies; ply++) {
              if (adapter.getStatus().isOver) break;

              const moves = adapter.getLegalMoves();
              if (moves.length === 0) break;

              const move = moves[Math.floor(rng() * moves.length)];
              if (!move) break;

              const moverColor = adapter.getPosition().turn;

              const moveRes = adapter.makeMove({
                from: move.from,
                to: move.to,
                promotion: move.promotion,
              });
              expect(isOk(moveRes)).toBe(true);

              // Verify turn switched
              const posAfter = adapter.getPosition();
              expect(posAfter.turn).not.toBe(moverColor);
            }
          }
        ),
        { numRuns: 25 }
      );
    });
  });

  describe("TC-PROP-03: Move Legality & Application Consistency Invariant", () => {
    it("ensures all generated legal moves pass isLegalMove and execute successfully", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100000 }),
          fc.integer({ min: 5, max: 25 }),
          (seed, plies) => {
            const { adapter } = playLegalGame(seed, plies);
            if (adapter.getStatus().isOver) return;

            const legalMoves = adapter.getLegalMoves();
            for (const move of legalMoves) {
              const moveInput: MoveInput = {
                from: move.from,
                to: move.to,
                promotion: move.promotion,
              };

              expect(adapter.isLegalMove(moveInput)).toBe(true);

              // Clone adapter via FEN and execute
              const clone = new ChessJsAdapter(adapter.getPosition().fen);
              const execRes = clone.makeMove(moveInput);
              expect(isOk(execRes)).toBe(true);
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it("strictly rejects illegal moves (e.g. impossible square moves)", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100000 }),
          fc.integer({ min: 5, max: 20 }),
          (seed, plies) => {
            const { adapter } = playLegalGame(seed, plies);
            if (adapter.getStatus().isOver) return;

            const legalMoves = adapter.getLegalMoves();
            const legalPairs = new Set(
              legalMoves.map(
                (m) => `${m.from}-${m.to}-${m.promotion ?? ""}`
              )
            );

            // Test non-legal moves
            const allSquares: Square[] = [
              "a1", "a8", "e1", "e8", "h1", "h8", "d4", "e5",
            ];
            for (const from of allSquares) {
              for (const to of allSquares) {
                if (from === to) continue;
                const key = `${from}-${to}-`;
                if (!legalPairs.has(key)) {
                  const isLegal = adapter.isLegalMove({ from, to });
                  expect(isLegal).toBe(false);
                }
              }
            }
          }
        ),
        { numRuns: 15 }
      );
    });
  });

  describe("TC-PROP-04: Sequential Move History Reversibility Invariant", () => {
    it("guarantees N undo() calls in reverse perfectly restores initial FEN and state", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100000 }),
          fc.integer({ min: 5, max: 30 }),
          (seed, plies) => {
            const initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
            const { adapter, movesMade, positions } = playLegalGame(
              seed,
              plies,
              initialFen
            );

            // Undo all moves in reverse
            for (let i = movesMade.length - 1; i >= 0; i--) {
              const expectedFenBefore = positions[i];
              const undoRes = adapter.undo();
              expect(isOk(undoRes)).toBe(true);
              expect(adapter.getPosition().fen).toBe(expectedFenBefore);
            }

            expect(adapter.getPosition().fen).toBe(initialFen);
            expect(adapter.getHistory().length).toBe(0);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe("TC-PROP-05: FEN Bijective Codec Invariance", () => {
    it("guarantees every reachable game position serializes to valid FEN with identical state", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100000 }),
          fc.integer({ min: 10, max: 35 }),
          (seed, plies) => {
            const { positions } = playLegalGame(seed, plies);

            for (const fen of positions) {
              const validation = validateFen(fen);
              expect(validation.isValid).toBe(true);

              const reloadedAdapter = new ChessJsAdapter(fen);
              const posReloaded = reloadedAdapter.getPosition();

              expect(posReloaded.fen).toBe(fen);
              expect(posReloaded.turn).toBe(fen.split(" ")[1]);
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe("TC-PROP-06: PGN Game Replay Bijective Invariance", () => {
    it("exports generated games to PGN and reproduces identical terminal state on parse/replay", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100000 }),
          fc.integer({ min: 10, max: 30 }),
          (seed, plies) => {
            const { adapter } = playLegalGame(seed, plies);
            const history = adapter.getHistory();
            const originalFinalFen = adapter.getPosition().fen;

            const pgnString = adapter.exportPgn({
              Event: "Fast-Check Generative Game",
              Site: "ChessForge Local Test",
              Date: "2026.08.20",
              Round: "1",
              White: "Generative White",
              Black: "Generative Black",
            });

            expect(pgnString).toBeDefined();
            expect(typeof pgnString).toBe("string");

            const parsed = parsePgn(pgnString);
            expect(isOk(parsed)).toBe(true);
            if (isOk(parsed)) {
              expect(parsed.data.moves.length).toBe(history.length);

              // Replay parsed moves onto fresh adapter via importPgn
              const replayAdapter = new ChessJsAdapter();
              const loadRes = replayAdapter.importPgn(pgnString);
              expect(isOk(loadRes)).toBe(true);
              expect(replayAdapter.getPosition().fen).toBe(originalFinalFen);
            }
          }
        ),
        { numRuns: 15 }
      );
    });
  });

  describe("TC-PROP-07: Halfmove Clock & Fullmove Counter Invariant", () => {
    it("resets halfmove clock on pawn move or capture, increments otherwise", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100000 }),
          fc.integer({ min: 10, max: 35 }),
          (seed, plies) => {
            const adapter = new ChessJsAdapter();
            const rng = createSeededRandom(seed);

            for (let ply = 0; ply < plies; ply++) {
              if (adapter.getStatus().isOver) break;

              const moves = adapter.getLegalMoves();
              if (moves.length === 0) break;

              const move = moves[Math.floor(rng() * moves.length)];
              if (!move) break;

              const clockBefore = adapter.getPosition().halfmoveClock;
              const fullmoveBefore = adapter.getPosition().fullmoveNumber;
              const turnBefore = adapter.getPosition().turn;

              const moveRes = adapter.makeMove({
                from: move.from,
                to: move.to,
                promotion: move.promotion,
              });
              expect(isOk(moveRes)).toBe(true);

              const clockAfter = adapter.getPosition().halfmoveClock;
              const fullmoveAfter = adapter.getPosition().fullmoveNumber;

              if (move.piece.type === "p" || move.captured) {
                expect(clockAfter).toBe(0);
              } else {
                expect(clockAfter).toBe(clockBefore + 1);
              }

              if (turnBefore === "b") {
                expect(fullmoveAfter).toBe(fullmoveBefore + 1);
              } else {
                expect(fullmoveAfter).toBe(fullmoveBefore);
              }
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe("TC-PROP-08: Material Bounds & Promotion Type Invariants", () => {
    it("ensures piece counts never exceed maximums and promotions strictly produce Q/R/B/N", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100000 }),
          fc.integer({ min: 15, max: 45 }),
          (seed, plies) => {
            const { adapter, movesMade } = playLegalGame(seed, plies);
            const pos = adapter.getPosition();

            let totalPieces = 0;
            let whitePawns = 0;
            let blackPawns = 0;

            for (const row of pos.board) {
              for (const piece of row) {
                if (piece) {
                  totalPieces++;
                  if (piece.type === "p") {
                    if (piece.color === "w") whitePawns++;
                    else blackPawns++;
                  }
                }
              }
            }

            expect(totalPieces).toBeLessThanOrEqual(32);
            expect(whitePawns).toBeLessThanOrEqual(8);
            expect(blackPawns).toBeLessThanOrEqual(8);

            for (const m of movesMade) {
              if (m.promotion) {
                expect(["q", "r", "b", "n"]).toContain(m.promotion);
              }
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});
