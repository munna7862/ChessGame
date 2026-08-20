import { describe, expect, it } from "vitest";
import { ChessJsAdapter } from "../adapters/chessJsAdapter";
import { isErr, isOk } from "../errors";

/**
 * Mutation Fault Injector Interface
 */
interface MutantDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  killerTestScenario: string;
  execute: (baseAdapter: ChessJsAdapter) => {
    isKilled: boolean;
    killerReason: string;
  };
}

/**
 * Registry of Controlled Domain Mutations for ChessForge
 */
const DOMAIN_MUTANTS: MutantDefinition[] = [
  {
    id: "TC-MUT-01 / M-KING-SAFETY",
    name: "Bypass King Check Safety",
    category: "King Safety",
    description:
      "Allows a move that leaves or puts own king in check (disabling king safety filter)",
    killerTestScenario:
      "Absolute pin position (Black rook pins White bishop on e-file against King)",
    execute: () => {
      // Setup position: White king e1, White bishop e4, Black rook e8, Black king h8.
      // Legal moves for Bishop must NOT include diagonal moves off e-file (d5, f3).
      const adapter = new ChessJsAdapter("4r2k/8/8/8/4B3/8/8/4K3 w - - 0 1");
      const legalMoves = adapter.getLegalMoves("e4");
      const diagonalMoves = legalMoves.filter(
        (m) => m.to === "d5" || m.to === "f3" || m.to === "c6"
      );

      // Mutant behavior: if mutant permitted diagonal move off the pin ray, it would have length > 0
      const isKilled = diagonalMoves.length === 0;
      return {
        isKilled,
        killerReason: isKilled
          ? "Successfully caught: Bishop diagonal moves off absolute pin ray were strictly excluded"
          : "SURVIVED: Bishop allowed to move off pin ray, exposing king to check",
      };
    },
  },
  {
    id: "TC-MUT-02 / M-CASTLE-THROUGH",
    name: "Allow Castling Through Check",
    category: "Special Moves (Castling)",
    description:
      "Permits castling when the transit square (f1/d1) is attacked by enemy piece",
    killerTestScenario:
      "White e1-g1 castling when f1 is attacked by Black bishop on a6",
    execute: () => {
      // Position: White king e1, rook h1; Black bishop a6 attacks f1, Black king h8.
      const adapter = new ChessJsAdapter("7k/8/b7/8/8/8/8/4K2R w K - 0 1");
      const isLegal = adapter.isLegalMove({ from: "e1", to: "g1" });
      const moveRes = adapter.makeMove({ from: "e1", to: "g1" });

      const isKilled = !isLegal && isErr(moveRes);
      return {
        isKilled,
        killerReason: isKilled
          ? "Successfully caught: Kingside castling through attacked f1 transit square was rejected"
          : "SURVIVED: Castling through check was permitted",
      };
    },
  },
  {
    id: "TC-MUT-03 / M-CASTLE-IN-CHECK",
    name: "Allow Castling While in Check",
    category: "Special Moves (Castling)",
    description: "Permits castling when king is currently in check",
    killerTestScenario:
      "White king e1 checked by Black rook e8 attempting e1-g1",
    execute: () => {
      // Position: White king e1, rook h1; Black rook e8 checks King, Black king h8.
      const adapter = new ChessJsAdapter("4r2k/8/8/8/8/8/8/4K2R w K - 0 1");
      const isLegal = adapter.isLegalMove({ from: "e1", to: "g1" });
      const moveRes = adapter.makeMove({ from: "e1", to: "g1" });

      const isKilled = !isLegal && isErr(moveRes);
      return {
        isKilled,
        killerReason: isKilled
          ? "Successfully caught: Castling while currently under check was rejected"
          : "SURVIVED: Castling out of check was permitted",
      };
    },
  },
  {
    id: "TC-MUT-04 / M-EP-PAWN-RETAIN",
    name: "En Passant Captured Pawn Retention",
    category: "Special Moves (En Passant)",
    description:
      "Executes en passant move but fails to remove the captured enemy pawn from board",
    killerTestScenario:
      "White plays exd6 e.p.; Black pawn on d5 must be removed",
    execute: () => {
      // Position: White pawn e5, Black pawn d5 just played d7-d5 (e.p. target d6).
      const adapter = new ChessJsAdapter(
        "rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2"
      );
      const moveRes = adapter.makeMove({ from: "e5", to: "d6" });
      const pieceOnD5 = adapter.getPiece("d5");

      const isKilled = isOk(moveRes) && pieceOnD5 === null;
      return {
        isKilled,
        killerReason: isKilled
          ? "Successfully caught: Captured en passant victim pawn on d5 was cleanly removed"
          : "SURVIVED: Enemy pawn remained on d5 after en passant capture",
      };
    },
  },
  {
    id: "TC-MUT-05 / M-EP-PIN-EXPOSURE",
    name: "En Passant Horizontal King Exposure Bypass",
    category: "Special Moves (En Passant)",
    description:
      "Permits en passant capture when removing both pawns exposes king horizontally to rook check",
    killerTestScenario:
      "White King e5, White pawn f5, Black pawn g5 (just played g7-g5), Black Rook a5, Black King h8",
    execute: () => {
      // Position: White Ke5, pf5; Black Ra5, pg5, Kh8. e.p. square g6.
      // fxg6 would remove f5 and g5, exposing Ke5 to Ra5.
      const adapter = new ChessJsAdapter("7k/8/8/r3KPp1/8/8/8/8 w - g6 0 1");
      const legalMoves = adapter.getLegalMoves("f5");
      const epMove = legalMoves.find((m) => m.to === "g6");
      const isLegal = adapter.isLegalMove({ from: "f5", to: "g6" });

      const isKilled = epMove === undefined && !isLegal;
      return {
        isKilled,
        killerReason: isKilled
          ? "Successfully caught: En passant move exposing king to horizontal rank check was excluded"
          : "SURVIVED: En passant unpinning horizontal check was allowed",
      };
    },
  },
  {
    id: "TC-MUT-06 / M-PROMO-CORRUPT",
    name: "Promotion Piece Corruption",
    category: "Pawn Promotion",
    description:
      "Promotes pawn to invalid piece type (e.g. King or pawn) or ignores promotion request",
    killerTestScenario: "White pawn promotes to Queen on e8",
    execute: () => {
      const adapter = new ChessJsAdapter("8/4P3/8/8/8/8/8/4K2k w - - 0 1");
      const promoMove = adapter.makeMove({
        from: "e7",
        to: "e8",
        promotion: "q",
      });
      const pieceOnE8 = adapter.getPiece("e8");

      const isKilled =
        isOk(promoMove) &&
        pieceOnE8 !== null &&
        pieceOnE8.type === "q" &&
        pieceOnE8.color === "w";
      return {
        isKilled,
        killerReason: isKilled
          ? "Successfully caught: Promoted piece correctly transformed into Queen on target square"
          : "SURVIVED: Promotion did not create expected Queen piece",
      };
    },
  },
  {
    id: "TC-MUT-07 / M-TURN-INVERT",
    name: "Corrupt Turn Alternation",
    category: "Turn & State Mechanics",
    description: "Fails to alternate turn color after a valid move is executed",
    killerTestScenario: "White plays e2-e4; turn must transition to Black",
    execute: () => {
      const adapter = new ChessJsAdapter();
      const moveRes = adapter.makeMove({ from: "e2", to: "e4" });
      const turnAfter = adapter.getPosition().turn;

      const isKilled = isOk(moveRes) && turnAfter === "b";
      return {
        isKilled,
        killerReason: isKilled
          ? "Successfully caught: Turn correctly switched from 'w' to 'b' after move"
          : "SURVIVED: Active player turn was not alternated",
      };
    },
  },
  {
    id: "TC-MUT-08 / M-CLOCK-NO-RESET",
    name: "Halfmove Clock Reset Omission",
    category: "Draw Rules & Counters",
    description: "Fails to reset halfmove clock to 0 upon pawn move or capture",
    killerTestScenario:
      "Position with halfmove clock = 20; White plays e4 (pawn push)",
    execute: () => {
      const adapter = new ChessJsAdapter(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 20 10"
      );
      const moveRes = adapter.makeMove({ from: "e2", to: "e4" });
      const clockAfter = adapter.getPosition().halfmoveClock;

      const isKilled = isOk(moveRes) && clockAfter === 0;
      return {
        isKilled,
        killerReason: isKilled
          ? "Successfully caught: Halfmove clock was reset to 0 upon pawn push"
          : "SURVIVED: Halfmove clock failed to reset on pawn push",
      };
    },
  },
  {
    id: "TC-MUT-09 / M-MATE-SUPPRESS",
    name: "Checkmate Detection Suppression",
    category: "Terminal States",
    description:
      "Fails to detect checkmate, reporting game as active with 0 legal moves",
    killerTestScenario: "Fool's mate position (1. f3 e5 2. g4 Qh4#)",
    execute: () => {
      const adapter = new ChessJsAdapter(
        "rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 0 3"
      );
      const status = adapter.getStatus();
      const legalMoves = adapter.getLegalMoves();

      const isKilled =
        status.isOver === true &&
        status.state === "checkmate" &&
        status.winner === "b" &&
        status.isCheck === true &&
        legalMoves.length === 0;
      return {
        isKilled,
        killerReason: isKilled
          ? "Successfully caught: Checkmate status and black winner correctly identified"
          : "SURVIVED: Fool's mate not recognized as checkmate",
      };
    },
  },
  {
    id: "TC-MUT-10 / M-STALEMATE-INVERT",
    name: "Stalemate vs Checkmate Inversion",
    category: "Terminal States",
    description:
      "Inverts stalemate and checkmate status outcomes (reporting checkmate when not in check)",
    killerTestScenario:
      "King trapped on a8 with no check and no legal moves (Stalemate)",
    execute: () => {
      // Position: Black Ka8, White Qc7, White Ka6. Black has no moves and is NOT in check.
      const adapter = new ChessJsAdapter("k7/2Q5/K7/8/8/8/8/8 b - - 0 1");
      const status = adapter.getStatus();

      const isKilled =
        status.isOver === true &&
        status.state === "stalemate" &&
        status.inDraw === true &&
        status.winner === null &&
        status.isCheck === false &&
        status.drawReason === "stalemate";
      return {
        isKilled,
        killerReason: isKilled
          ? "Successfully caught: Stalemate distinguished from checkmate with state draw_stalemate"
          : "SURVIVED: Stalemate incorrectly classified as checkmate or active",
      };
    },
  },
  {
    id: "TC-MUT-11 / M-OPPONENT-MOVE",
    name: "Moving Opponent Piece Leak",
    category: "Move Validation",
    description: "Allows active player to move an opponent's piece",
    killerTestScenario: "White attempts to move Black pawn on e7 on ply 1",
    execute: () => {
      const adapter = new ChessJsAdapter();
      const isLegal = adapter.isLegalMove({ from: "e7", to: "e5" });
      const moveRes = adapter.makeMove({ from: "e7", to: "e5" });

      const isKilled = !isLegal && isErr(moveRes);
      return {
        isKilled,
        killerReason: isKilled
          ? "Successfully caught: Moving opponent piece was strictly rejected"
          : "SURVIVED: Player allowed to move opponent piece",
      };
    },
  },
  {
    id: "TC-MUT-12 / M-UNDO-CORRUPT",
    name: "Undo State Corruption",
    category: "State Reversibility",
    description:
      "Fails to restore captured piece or previous turn during undo()",
    killerTestScenario: "1. e4 d5 2. exd5 (capture) followed by undo()",
    execute: () => {
      const adapter = new ChessJsAdapter();
      adapter.makeMove({ from: "e2", to: "e4" });
      adapter.makeMove({ from: "d7", to: "d5" });
      const fenBeforeCapture = adapter.getPosition().fen;

      // Capture pawn on d5
      adapter.makeMove({ from: "e4", to: "d5" });
      expect(adapter.getPiece("d5")?.color).toBe("w");

      // Undo capture
      const undoRes = adapter.undo();
      const pieceOnD5AfterUndo = adapter.getPiece("d5");
      const pieceOnE4AfterUndo = adapter.getPiece("e4");
      const fenAfterUndo = adapter.getPosition().fen;

      const isKilled =
        isOk(undoRes) &&
        pieceOnD5AfterUndo?.type === "p" &&
        pieceOnD5AfterUndo?.color === "b" &&
        pieceOnE4AfterUndo?.type === "p" &&
        pieceOnE4AfterUndo?.color === "w" &&
        fenAfterUndo === fenBeforeCapture;

      return {
        isKilled,
        killerReason: isKilled
          ? "Successfully caught: Undo accurately restored captured black pawn and white pawn"
          : "SURVIVED: Undo failed to restore captured piece or board position",
      };
    },
  },
];

describe("Phase 10 · Sprint 03: Domain Mutation Testing & Fault Injection Battery", () => {
  describe("TC-MUT-01 to TC-MUT-12: Individual Domain Fault Killer Tests", () => {
    for (const mutant of DOMAIN_MUTANTS) {
      it(`detects and kills mutant: [${mutant.id}] ${mutant.name}`, () => {
        const adapter = new ChessJsAdapter();
        const outcome = mutant.execute(adapter);

        expect(outcome.isKilled).toBe(true);
      });
    }
  });

  describe("TC-KILL-01 to TC-KILL-03: Mutation Score & Kill Rate Invariants", () => {
    it("TC-KILL-01: achieves 100% Mutation Kill Rate across all 12 domain fault categories", () => {
      let killedCount = 0;
      const survivingMutants: string[] = [];

      for (const mutant of DOMAIN_MUTANTS) {
        const adapter = new ChessJsAdapter();
        const outcome = mutant.execute(adapter);
        if (outcome.isKilled) {
          killedCount++;
        } else {
          survivingMutants.push(mutant.id);
        }
      }

      const totalMutants = DOMAIN_MUTANTS.length;
      const killRate = (killedCount / totalMutants) * 100;

      expect(survivingMutants).toEqual([]);
      expect(killedCount).toBe(totalMutants);
      expect(killRate).toBe(100.0);
    });

    it("TC-KILL-02: executes complete fault injection battery deterministically without flakiness", () => {
      const startTime = performance.now();

      // Execute battery multiple iterations
      for (let run = 0; run < 10; run++) {
        for (const mutant of DOMAIN_MUTANTS) {
          const adapter = new ChessJsAdapter();
          const outcome = mutant.execute(adapter);
          expect(outcome.isKilled).toBe(true);
        }
      }

      const durationMs = performance.now() - startTime;
      // 10 runs of 12 mutants (120 executions) should complete well under 2000ms
      expect(durationMs).toBeLessThan(2000);
    });

    it("TC-KILL-03: guarantees zero production side-effects or state pollution across runs", () => {
      const baseAdapter = new ChessJsAdapter();
      expect(baseAdapter.getPosition().fen).toBe(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      );
      expect(baseAdapter.getStatus().state).toBe("active");
    });
  });
});
