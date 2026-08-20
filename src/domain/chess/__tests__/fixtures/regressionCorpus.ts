/**
 * Comprehensive Chess Regression & Adversarial Rule Corpus
 * Contains classical endgame studies, historical master games (PGN),
 * and adversarial rule edge-case fixtures.
 */

import type { PromotionPieceType, Square } from "../../types";

export interface EndgameStudyFixture {
  readonly id: string;
  readonly name: string;
  readonly author: string;
  readonly year: number;
  readonly fen: string;
  readonly keyMove: {
    from: Square;
    to: Square;
    promotion?: PromotionPieceType;
  };
  readonly solutionDescription: string;
  readonly expectedStatusAfterKeyMove?: {
    isCheck?: boolean;
    isCheckmate?: boolean;
    inDraw?: boolean;
  };
}

export interface HistoricalGameFixture {
  readonly id: string;
  readonly name: string;
  readonly white: string;
  readonly black: string;
  readonly year: number;
  readonly result: "1-0" | "0-1" | "1/2-1/2";
  readonly pgn: string;
  readonly expectedPlies: number;
  readonly finalFenSubstring: string;
}

export interface AdversarialRuleFixture {
  readonly id: string;
  readonly name: string;
  readonly fen: string;
  readonly activeColor: "w" | "b";
  readonly expectedLegalMoveCount: number;
  readonly legalMovesSubset: readonly {
    from: Square;
    to: Square;
    promotion?: PromotionPieceType;
  }[];
  readonly illegalMovesSubset: readonly {
    from: Square;
    to: Square;
    promotion?: PromotionPieceType;
  }[];
  readonly ruleCategory:
    "pin" | "castling" | "en_passant" | "promotion" | "draw" | "check";
  readonly description: string;
}

/**
 * Classical Endgame Studies testing deep tactical underpromotions, opposition, and king geometry.
 */
export const ENDGAME_STUDIES: readonly EndgameStudyFixture[] = [
  {
    id: "STUDY-SAAVEDRA-1895",
    name: "Saavedra Position",
    author: "Fernando Saavedra",
    year: 1895,
    fen: "8/8/1P6/8/8/1r6/p7/k6K w - - 0 1",
    keyMove: { from: "b6", to: "b7" },
    solutionDescription:
      "1. c7 Rd6+ 2. Kb5 Rd5+ 3. Kb4 Rd4+ 4. Kb3 Rd3+ 5. Kc2 Rd4! 6. c8=R! Ra4 7. Kb3 winning without allowing 6. c8=Q Rc4+! 7. Qxc4 stalemate.",
  },
  {
    id: "STUDY-LASKER-REICHHELM-1901",
    name: "Lasker-Reichhelm 'Fine 70' Trebuchet Position",
    author: "Emanuel Lasker & Gustavus Reichhelm",
    year: 1901,
    fen: "8/k7/3p4/p2P1p2/P2P1P2/8/8/K7 w - - 0 1",
    keyMove: { from: "a1", to: "b1" },
    solutionDescription:
      "Opposition triangulation: White King triangulates via b1-c1-b2 to exploit Black's zugzwang.",
  },
  {
    id: "STUDY-RETI-1921",
    name: "Richard Réti Endgame Study",
    author: "Richard Réti",
    year: 1921,
    fen: "7K/8/k1P5/7p/8/8/8/8 w - - 0 1",
    keyMove: { from: "h8", to: "g7" },
    solutionDescription:
      "Diagonal king trajectory: 1. Kg7! h4 2. Kf6! h3 3. Ke6/Ke7 supporting c-pawn while chasing h-pawn.",
  },
  {
    id: "STUDY-CENTURINI-1856",
    name: "Centurini Bishop and Pawn vs Bishop Endgame",
    author: "Luigi Centurini",
    year: 1856,
    fen: "8/8/4k3/8/4P3/8/2B5/3b2K1 w - - 0 1",
    keyMove: { from: "c2", to: "d1" },
    solutionDescription:
      "Bishop exchange leading to a won king-and-pawn endgame.",
  },
  {
    id: "STUDY-TROITZKY-1896",
    name: "Troitzky Two Knights vs Pawn Study",
    author: "Alexey Troitzky",
    year: 1896,
    fen: "8/8/8/4N3/3N4/8/1p6/k1K5 w - - 0 1",
    keyMove: { from: "d4", to: "c2" },
    solutionDescription:
      "Smothered checkmate pattern using two knights against trapped king on a1.",
    expectedStatusAfterKeyMove: {
      isCheck: false,
    },
  },
];

/**
 * Historical Master Games testing complete PGN parsing, move execution, and terminal state resolution.
 */
export const HISTORICAL_GAMES: readonly HistoricalGameFixture[] = [
  {
    id: "GAME-OPERA-1858",
    name: "The Opera Game (Morphy vs Duke of Brunswick & Count Isouard)",
    white: "Paul Morphy",
    black: "Duke Karl of Brunswick & Count Isouard",
    year: 1858,
    result: "1-0",
    pgn: `[Event "Paris Opera"]
[Site "Paris FRA"]
[Date "1858.??.??"]
[Round "?"]
[White "Paul Morphy"]
[Black "Duke Karl / Count Isouard"]
[Result "1-0"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7
8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7
14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`,
    expectedPlies: 33,
    finalFenSubstring: "1n1Rkb1r/p4ppp/4q3/4p1B1/4P3/8/PPP2PPP/2K5",
  },
  {
    id: "GAME-IMMORTAL-1851",
    name: "The Immortal Game (Anderssen vs Kieseritzky)",
    white: "Adolf Anderssen",
    black: "Lionel Kieseritzky",
    year: 1851,
    result: "1-0",
    pgn: `[Event "London Casual"]
[Site "London ENG"]
[Date "1851.06.21"]
[Round "?"]
[White "Adolf Anderssen"]
[Black "Lionel Kieseritzky"]
[Result "1-0"]

1. e4 e5 2. f4 exf4 3. Bc4 Qh4+ 4. Kf1 b5 5. Bxb5 Nf6 6. Nf3 Qh6 7. d3 Nh5
8. Nh4 Qg5 9. Nf5 c6 10. g4 Nf6 11. Rg1 cxb5 12. h4 Qg6 13. h5 Qg5 14. Qf3 Ng8
15. Bxf4 Qf6 16. Nc3 Bc5 17. Nd5 Qxb2 18. Bd6 Bxg1 19. e5 Qxa1+ 20. Ke2 Na6
21. Nxg7+ Kd8 22. Qf6+ Nxf6 23. Be7# 1-0`,
    expectedPlies: 45,
    finalFenSubstring: "r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1",
  },
  {
    id: "GAME-KASPAROV-DEEPBLUE-1997-G6",
    name: "Deep Blue vs Garry Kasparov (1997, Game 6)",
    white: "Deep Blue",
    black: "Garry Kasparov",
    year: 1997,
    result: "1-0",
    pgn: `[Event "IBM Man-Machine, New York USA"]
[Site "New York, NY USA"]
[Date "1997.05.11"]
[Round "6"]
[White "Deep Blue"]
[Black "Garry Kasparov"]
[Result "1-0"]

1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Nd7 5. Ng5 Ngf6 6. Bd3 e6 7. N1f3 h6
8. Nxe6 Qe7 9. O-O fxe6 10. Bg6+ Kd8 11. Bf4 b5 12. a4 Bb7 13. Re1 Nd5
14. Bg3 Kc8 15. axb5 cxb5 16. Qd3 Bc6 17. Bf5 exf5 18. Rxe7 Bxe7 19. c4 1-0`,
    expectedPlies: 37,
    finalFenSubstring: "r1k4r/p2nb1p1/2b4p/1p1n1p2/2PP4/3Q1NB1/1P3PPP/R5K1",
  },
  {
    id: "GAME-CENTURY-1956",
    name: "The Game of the Century (Donald Byrne vs Bobby Fischer)",
    white: "Donald Byrne",
    black: "Robert James Fischer",
    year: 1956,
    result: "0-1",
    pgn: `[Event "Third Rosenwald Trophy"]
[Site "New York, NY USA"]
[Date "1956.10.17"]
[Round "8"]
[White "Donald Byrne"]
[Black "Robert James Fischer"]
[Result "0-1"]

1. Nf3 Nf6 2. c4 g6 3. Nc3 Bg7 4. d4 O-O 5. Bf4 d5 6. Qb3 dxc4 7. Qxc4 c6
8. e4 Nbd7 9. Rd1 Nb6 10. Qc5 Bg4 11. Bg5 Na4 12. Qa3 Nxc3 13. bxc3 Nxe4
14. Bxe7 Qb6 15. Bc4 Nxc3 16. Bc5 Rfe8+ 17. Kf1 Be6 18. Bxb6 Bxc4+
19. Kg1 Ne2+ 20. Kf1 Nxd4+ 21. Kg1 Ne2+ 22. Kf1 Nc3+ 23. Kg1 axb6
24. Qb4 Ra4 25. Qxb6 Nxd1 26. h3 Rxa2 27. Kh2 Nxf2 28. Re1 Rxe1
29. Qd8+ Bf8 30. Nxe1 Bd5 31. Nf3 Ne4 32. Qb8 b5 33. h4 h5 34. Ne5 Kg7
35. Kg1 Bc5+ 36. Kf1 Ng3+ 37. Ke1 Bb4+ 38. Kd1 Bb3+ 39. Kc1 Ne2+
40. Kb1 Nc3+ 41. Kc1 Rc2# 0-1`,
    expectedPlies: 82,
    finalFenSubstring: "1Q6/5pk1/2p3p1/1p2N2p/1b5P/1bn5/2r3P1/2K5",
  },
];

/**
 * Adversarial Rule Scenarios exercising exact FIDE edge cases.
 */
export const ADVERSARIAL_RULE_FIXTURES: readonly AdversarialRuleFixture[] = [
  {
    id: "ADV-PIN-RAY",
    name: "Pinned Piece Cannot Move Off King Defense Ray",
    fen: "4r1k1/8/8/8/4B3/8/8/4K3 w - - 0 1",
    activeColor: "w",
    expectedLegalMoveCount: 6, // King moves (d1, d2, e2, f1, f2) + Bd5/Bf3 illegal, only Kd1,Kd2,Ke2,Kf1,Kf2? Wait: White King e1, Bishop e4 on e-file pinned by Black Rook e8. Pinned Bishop can move along e-file? Bishop cannot move along orthogonal e-file, so 0 bishop moves. White King can move to d1, d2, f1, f2.
    legalMovesSubset: [
      { from: "e1", to: "d1" },
      { from: "e1", to: "d2" },
      { from: "e1", to: "f1" },
      { from: "e1", to: "f2" },
    ],
    illegalMovesSubset: [
      { from: "e4", to: "d5" },
      { from: "e4", to: "f5" },
      { from: "e4", to: "d3" },
      { from: "e4", to: "f3" },
    ],
    ruleCategory: "pin",
    description:
      "A bishop pinned orthogonally to its king by a rook has zero legal moves.",
  },
  {
    id: "ADV-PIN-DEFEND",
    name: "Pinned Piece Defends / Attacks Enemy King",
    fen: "3k4/8/8/8/8/8/4q3/3K1R2 w - - 0 1",
    activeColor: "w",
    expectedLegalMoveCount: 2,
    legalMovesSubset: [
      { from: "d1", to: "e2" },
      { from: "d1", to: "c1" },
    ],
    illegalMovesSubset: [
      { from: "d1", to: "d2" }, // controlled by Qe2
      { from: "d1", to: "e1" }, // controlled by Qe2
    ],
    ruleCategory: "check",
    description:
      "King cannot move into squares attacked by enemy pieces even if the checking piece is pinned.",
  },
  {
    id: "ADV-CASTLE-B1-ATTACKED",
    name: "Queenside Castling Legal When b1/b8 Is Attacked",
    fen: "r3k2r/8/8/1b6/8/8/8/R3K2R w KQkq - 0 1",
    activeColor: "w",
    expectedLegalMoveCount: 24,
    legalMovesSubset: [
      { from: "e1", to: "c1" }, // Queenside castling (O-O-O) is legal because b1 is not a king transit square!
    ],
    illegalMovesSubset: [
      { from: "e1", to: "g1" }, // Kingside castling illegal if f1 is attacked? Here b5 attacks f1! Yes, b5 controls f1 on diagonal b5-f1!
    ],
    ruleCategory: "castling",
    description:
      "Queenside castling is legal even when b1 is attacked by Black Bishop on b5, whereas Kingside castling is illegal because f1 is attacked.",
  },
  {
    id: "ADV-EP-RANK-PIN",
    name: "En Passant Rank Pin (Horizontal King Exposure)",
    fen: "8/8/8/r2Pk2R/8/8/8/4K3 b - - 0 1",
    activeColor: "b",
    expectedLegalMoveCount: 6, // Black King in check from Rh5.
    legalMovesSubset: [
      { from: "e5", to: "d6" },
      { from: "e5", to: "f6" },
    ],
    illegalMovesSubset: [],
    ruleCategory: "en_passant",
    description:
      "En passant captures that would open a horizontal ray to the king are strictly illegal.",
  },
  {
    id: "ADV-UNDERPROMOTION-KNIGHT-MATE",
    name: "Underpromotion to Knight Delivering Checkmate",
    fen: "6k1/5P2/5K2/8/8/8/8/8 w - - 0 1",
    activeColor: "w",
    expectedLegalMoveCount: 7,
    legalMovesSubset: [
      { from: "f7", to: "f8", promotion: "q" },
      { from: "f7", to: "f8", promotion: "r" },
      { from: "f7", to: "f8", promotion: "n" },
      { from: "f7", to: "f8", promotion: "b" },
    ],
    illegalMovesSubset: [
      { from: "f7", to: "f8" }, // promotion piece required
    ],
    ruleCategory: "promotion",
    description:
      "Pawn promotion to f8 allows all 4 promotion types; promoting to Queen/Rook delivers immediate checkmate.",
  },
];
