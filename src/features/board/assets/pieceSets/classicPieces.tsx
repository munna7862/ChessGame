import React from "react";
import type { PieceSvgProps } from "../pieceSvgs";

/* -------------------------------------------------------------------------
 * Staunton Classic Piece Set (European Woodcraft Heritage)
 * ------------------------------------------------------------------------- */

export const ClassicWhitePawnSvg: React.FC<PieceSvgProps> = (props) => (
  <svg viewBox="0 0 45 45" width="100%" height="100%" {...props}>
    <g
      fill="#ffffff"
      stroke="#1e293b"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Head */}
      <circle cx="22.5" cy="11.5" r="4.5" />
      {/* Collar */}
      <path d="M 17 17.5 C 19 16.5 26 16.5 28 17.5 L 26.5 19.5 L 18.5 19.5 Z" />
      {/* Body */}
      <path d="M 18.5 19.5 C 17 25 15.5 29 13.5 34 L 31.5 34 C 29.5 29 28 25 26.5 19.5 Z" />
      {/* Base */}
      <path d="M 11 34 L 34 34 L 35.5 38.5 L 9.5 38.5 Z" />
      <path d="M 8 38.5 L 37 38.5" strokeWidth="1.5" />
    </g>
  </svg>
);

export const ClassicBlackPawnSvg: React.FC<PieceSvgProps> = (props) => (
  <svg viewBox="0 0 45 45" width="100%" height="100%" {...props}>
    <g
      fill="#1e293b"
      stroke="#ffffff"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="22.5" cy="11.5" r="4.5" />
      <path d="M 17 17.5 C 19 16.5 26 16.5 28 17.5 L 26.5 19.5 L 18.5 19.5 Z" />
      <path d="M 18.5 19.5 C 17 25 15.5 29 13.5 34 L 31.5 34 C 29.5 29 28 25 26.5 19.5 Z" />
      <path d="M 11 34 L 34 34 L 35.5 38.5 L 9.5 38.5 Z" />
      <path d="M 8 38.5 L 37 38.5" stroke="#ffffff" strokeWidth="1.2" />
    </g>
  </svg>
);

export const ClassicWhiteKnightSvg: React.FC<PieceSvgProps> = (props) => (
  <svg viewBox="0 0 45 45" width="100%" height="100%" {...props}>
    <g
      fill="#ffffff"
      stroke="#1e293b"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Knight profile */}
      <path d="M 22 8 C 24 6 28 7 30 11 C 32 15 35 19 36 34 L 14 34 C 14 27 18 26 18 20 C 15 22 13 25 10 26 C 9 25 8 23 8 22 C 8 20 12 12 15 10 C 16 7 19 8 22 8 Z" />
      {/* Mane curves */}
      <path
        d="M 25 9 C 27 12 30 15 31 19"
        fill="none"
        stroke="#1e293b"
        strokeWidth="1.2"
      />
      <path
        d="M 28 15 C 30 18 32 22 33 26"
        fill="none"
        stroke="#1e293b"
        strokeWidth="1.2"
      />
      {/* Eye & Nostril */}
      <circle cx="13.5" cy="18.5" r="1.2" fill="#1e293b" stroke="none" />
      <circle cx="9.5" cy="23.5" r="0.8" fill="#1e293b" stroke="none" />
      {/* Base */}
      <path d="M 11 34 L 37 34 L 38.5 38.5 L 9.5 38.5 Z" />
      <path d="M 8 38.5 L 40 38.5" strokeWidth="1.5" />
    </g>
  </svg>
);

export const ClassicBlackKnightSvg: React.FC<PieceSvgProps> = (props) => (
  <svg viewBox="0 0 45 45" width="100%" height="100%" {...props}>
    <g
      fill="#1e293b"
      stroke="#ffffff"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M 22 8 C 24 6 28 7 30 11 C 32 15 35 19 36 34 L 14 34 C 14 27 18 26 18 20 C 15 22 13 25 10 26 C 9 25 8 23 8 22 C 8 20 12 12 15 10 C 16 7 19 8 22 8 Z" />
      <path
        d="M 25 9 C 27 12 30 15 31 19"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.2"
      />
      <path
        d="M 28 15 C 30 18 32 22 33 26"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.2"
      />
      <circle cx="13.5" cy="18.5" r="1.2" fill="#ffffff" stroke="none" />
      <circle cx="9.5" cy="23.5" r="0.8" fill="#ffffff" stroke="none" />
      <path d="M 11 34 L 37 34 L 38.5 38.5 L 9.5 38.5 Z" />
      <path d="M 8 38.5 L 40 38.5" stroke="#ffffff" strokeWidth="1.2" />
    </g>
  </svg>
);

export const ClassicWhiteBishopSvg: React.FC<PieceSvgProps> = (props) => (
  <svg viewBox="0 0 45 45" width="100%" height="100%" {...props}>
    <g
      fill="#ffffff"
      stroke="#1e293b"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Top pearl */}
      <circle cx="22.5" cy="6.5" r="2" />
      {/* Miter head */}
      <path d="M 22.5 9 C 17 9 14 15 15 23 C 16 27 18 29 22.5 30 C 27 29 29 27 30 23 C 31 15 28 9 22.5 9 Z" />
      {/* Miter cut */}
      <path
        d="M 20 12 L 27 19"
        fill="none"
        stroke="#1e293b"
        strokeWidth="1.8"
      />
      {/* Collar */}
      <path d="M 16 30 L 29 30 L 30 33 L 15 33 Z" />
      {/* Body & Base */}
      <path d="M 15 33 L 30 33 L 34 37 L 11 37 Z" />
      <path d="M 9 37 L 36 37 L 37.5 40 L 7.5 40 Z" />
    </g>
  </svg>
);

export const ClassicBlackBishopSvg: React.FC<PieceSvgProps> = (props) => (
  <svg viewBox="0 0 45 45" width="100%" height="100%" {...props}>
    <g
      fill="#1e293b"
      stroke="#ffffff"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="22.5" cy="6.5" r="2" />
      <path d="M 22.5 9 C 17 9 14 15 15 23 C 16 27 18 29 22.5 30 C 27 29 29 27 30 23 C 31 15 28 9 22.5 9 Z" />
      <path
        d="M 20 12 L 27 19"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.6"
      />
      <path d="M 16 30 L 29 30 L 30 33 L 15 33 Z" />
      <path d="M 15 33 L 30 33 L 34 37 L 11 37 Z" />
      <path d="M 9 37 L 36 37 L 37.5 40 L 7.5 40 Z" />
    </g>
  </svg>
);

export const ClassicWhiteRookSvg: React.FC<PieceSvgProps> = (props) => (
  <svg viewBox="0 0 45 45" width="100%" height="100%" {...props}>
    <g
      fill="#ffffff"
      stroke="#1e293b"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Battlements */}
      <path d="M 11 11 L 11 17 L 15 17 L 15 13 L 20 13 L 20 17 L 25 17 L 25 13 L 30 13 L 30 17 L 34 17 L 34 11 Z" />
      {/* Cornice */}
      <path d="M 12 17 L 33 17 L 31 21 L 14 21 Z" />
      {/* Tower trunk */}
      <path d="M 15 21 L 30 21 L 29 33 L 16 33 Z" />
      {/* Plinth & Base */}
      <path d="M 13 33 L 32 33 L 34.5 38 L 10.5 38 Z" />
      <path d="M 8.5 38 L 36.5 38 L 38 40.5 L 7 40.5 Z" />
    </g>
  </svg>
);

export const ClassicBlackRookSvg: React.FC<PieceSvgProps> = (props) => (
  <svg viewBox="0 0 45 45" width="100%" height="100%" {...props}>
    <g
      fill="#1e293b"
      stroke="#ffffff"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M 11 11 L 11 17 L 15 17 L 15 13 L 20 13 L 20 17 L 25 17 L 25 13 L 30 13 L 30 17 L 34 17 L 34 11 Z" />
      <path d="M 12 17 L 33 17 L 31 21 L 14 21 Z" />
      <path d="M 15 21 L 30 21 L 29 33 L 16 33 Z" />
      <path d="M 13 33 L 32 33 L 34.5 38 L 10.5 38 Z" />
      <path d="M 8.5 38 L 36.5 38 L 38 40.5 L 7 40.5 Z" />
    </g>
  </svg>
);

export const ClassicWhiteQueenSvg: React.FC<PieceSvgProps> = (props) => (
  <svg viewBox="0 0 45 45" width="100%" height="100%" {...props}>
    <g
      fill="#ffffff"
      stroke="#1e293b"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Crown pearls */}
      <circle cx="8" cy="11" r="1.8" />
      <circle cx="15" cy="8" r="1.8" />
      <circle cx="22.5" cy="6.5" r="2.2" />
      <circle cx="30" cy="8" r="1.8" />
      <circle cx="37" cy="11" r="1.8" />
      {/* Coronet petals */}
      <path d="M 8 13 L 12 25 L 15 10 L 19 24 L 22.5 9 L 26 24 L 30 10 L 33 25 L 37 13 L 34 27 L 11 27 Z" />
      {/* Waist */}
      <path d="M 13 27 L 32 27 L 30 32 L 15 32 Z" />
      {/* Robe body */}
      <path d="M 15 32 L 30 32 L 34 37 L 11 37 Z" />
      {/* Base */}
      <path d="M 9 37 L 36 37 L 38 40.5 L 7 40.5 Z" />
    </g>
  </svg>
);

export const ClassicBlackQueenSvg: React.FC<PieceSvgProps> = (props) => (
  <svg viewBox="0 0 45 45" width="100%" height="100%" {...props}>
    <g
      fill="#1e293b"
      stroke="#ffffff"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="11" r="1.8" />
      <circle cx="15" cy="8" r="1.8" />
      <circle cx="22.5" cy="6.5" r="2.2" />
      <circle cx="30" cy="8" r="1.8" />
      <circle cx="37" cy="11" r="1.8" />
      <path d="M 8 13 L 12 25 L 15 10 L 19 24 L 22.5 9 L 26 24 L 30 10 L 33 25 L 37 13 L 34 27 L 11 27 Z" />
      <path d="M 13 27 L 32 27 L 30 32 L 15 32 Z" />
      <path d="M 15 32 L 30 32 L 34 37 L 11 37 Z" />
      <path d="M 9 37 L 36 37 L 38 40.5 L 7 40.5 Z" />
    </g>
  </svg>
);

export const ClassicWhiteKingSvg: React.FC<PieceSvgProps> = (props) => (
  <svg viewBox="0 0 45 45" width="100%" height="100%" {...props}>
    <g
      fill="#ffffff"
      stroke="#1e293b"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Royal Cross */}
      <path d="M 22.5 4 L 22.5 10" strokeWidth="2" />
      <path d="M 19.5 6.5 L 25.5 6.5" strokeWidth="2" />
      {/* Crown Dome & Arches */}
      <path d="M 22.5 10 C 16 10 13 14 13 19 C 13 24 16 26 22.5 27 C 29 26 32 24 32 19 C 32 14 29 10 22.5 10 Z" />
      {/* Ermine band */}
      <path d="M 14 27 L 31 27 L 29.5 32 L 15.5 32 Z" />
      {/* Robe trunk */}
      <path d="M 15.5 32 L 29.5 32 L 34 37 L 11 37 Z" />
      {/* Pedestal Base */}
      <path d="M 9 37 L 36 37 L 38.5 40.5 L 6.5 40.5 Z" />
    </g>
  </svg>
);

export const ClassicBlackKingSvg: React.FC<PieceSvgProps> = (props) => (
  <svg viewBox="0 0 45 45" width="100%" height="100%" {...props}>
    <g
      fill="#1e293b"
      stroke="#ffffff"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M 22.5 4 L 22.5 10" stroke="#ffffff" strokeWidth="1.8" />
      <path d="M 19.5 6.5 L 25.5 6.5" stroke="#ffffff" strokeWidth="1.8" />
      <path d="M 22.5 10 C 16 10 13 14 13 19 C 13 24 16 26 22.5 27 C 29 26 32 24 32 19 C 32 14 29 10 22.5 10 Z" />
      <path d="M 14 27 L 31 27 L 29.5 32 L 15.5 32 Z" />
      <path d="M 15.5 32 L 29.5 32 L 34 37 L 11 37 Z" />
      <path d="M 9 37 L 36 37 L 38.5 40.5 L 6.5 40.5 Z" />
    </g>
  </svg>
);
