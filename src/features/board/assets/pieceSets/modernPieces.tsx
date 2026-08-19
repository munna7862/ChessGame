import React from "react";
import type { PieceSvgProps } from "../pieceSvgs";

/* -------------------------------------------------------------------------
 * Modern Neo Piece Set (Streamlined Geometric Vector Aesthetics)
 * ------------------------------------------------------------------------- */

export const ModernWhitePawnSvg: React.FC<PieceSvgProps> = (props) => (
  <svg viewBox="0 0 45 45" width="100%" height="100%" {...props}>
    <g
      fill="#ffffff"
      stroke="#0f172a"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="22.5" cy="13" r="5" />
      <path d="M 18 19 L 27 19 L 29 35 L 16 35 Z" />
      <rect x="13" y="35" width="19" height="4" rx="1.5" />
    </g>
  </svg>
);

export const ModernBlackPawnSvg: React.FC<PieceSvgProps> = (props) => (
  <svg viewBox="0 0 45 45" width="100%" height="100%" {...props}>
    <g
      fill="#0f172a"
      stroke="#38bdf8"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="22.5" cy="13" r="5" />
      <path d="M 18 19 L 27 19 L 29 35 L 16 35 Z" />
      <rect x="13" y="35" width="19" height="4" rx="1.5" />
    </g>
  </svg>
);

export const ModernWhiteKnightSvg: React.FC<PieceSvgProps> = (props) => (
  <svg viewBox="0 0 45 45" width="100%" height="100%" {...props}>
    <g
      fill="#ffffff"
      stroke="#0f172a"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Sleek geometric horse profile */}
      <path d="M 23 8 L 32 14 L 32 35 L 14 35 L 14 27 L 9 23 L 10 18 L 18 15 L 17 11 Z" />
      <circle cx="16" cy="18" r="1.5" fill="#0f172a" stroke="none" />
      <rect x="11" y="35" width="23" height="4" rx="1.5" />
    </g>
  </svg>
);

export const ModernBlackKnightSvg: React.FC<PieceSvgProps> = (props) => (
  <svg viewBox="0 0 45 45" width="100%" height="100%" {...props}>
    <g
      fill="#0f172a"
      stroke="#38bdf8"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M 23 8 L 32 14 L 32 35 L 14 35 L 14 27 L 9 23 L 10 18 L 18 15 L 17 11 Z" />
      <circle cx="16" cy="18" r="1.5" fill="#38bdf8" stroke="none" />
      <rect x="11" y="35" width="23" height="4" rx="1.5" />
    </g>
  </svg>
);

export const ModernWhiteBishopSvg: React.FC<PieceSvgProps> = (props) => (
  <svg viewBox="0 0 45 45" width="100%" height="100%" {...props}>
    <g
      fill="#ffffff"
      stroke="#0f172a"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="22.5" cy="7.5" r="2.5" />
      {/* Sleek oval miter */}
      <path d="M 22.5 10 C 16 10 14 18 15 26 L 30 26 C 31 18 29 10 22.5 10 Z" />
      <path d="M 18 17 L 27 21" stroke="#0f172a" strokeWidth="1.6" />
      <path d="M 17 26 L 28 26 L 30 35 L 15 35 Z" />
      <rect x="12" y="35" width="21" height="4" rx="1.5" />
    </g>
  </svg>
);

export const ModernBlackBishopSvg: React.FC<PieceSvgProps> = (props) => (
  <svg viewBox="0 0 45 45" width="100%" height="100%" {...props}>
    <g
      fill="#0f172a"
      stroke="#38bdf8"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="22.5" cy="7.5" r="2.5" />
      <path d="M 22.5 10 C 16 10 14 18 15 26 L 30 26 C 31 18 29 10 22.5 10 Z" />
      <path d="M 18 17 L 27 21" stroke="#38bdf8" strokeWidth="1.4" />
      <path d="M 17 26 L 28 26 L 30 35 L 15 35 Z" />
      <rect x="12" y="35" width="21" height="4" rx="1.5" />
    </g>
  </svg>
);

export const ModernWhiteRookSvg: React.FC<PieceSvgProps> = (props) => (
  <svg viewBox="0 0 45 45" width="100%" height="100%" {...props}>
    <g
      fill="#ffffff"
      stroke="#0f172a"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M 12 12 L 12 18 L 16 18 L 16 14 L 21 14 L 21 18 L 24 18 L 24 14 L 29 14 L 29 18 L 33 18 L 33 12 Z" />
      <path d="M 14 18 L 31 18 L 29 35 L 16 35 Z" />
      <rect x="11" y="35" width="23" height="4" rx="1.5" />
    </g>
  </svg>
);

export const ModernBlackRookSvg: React.FC<PieceSvgProps> = (props) => (
  <svg viewBox="0 0 45 45" width="100%" height="100%" {...props}>
    <g
      fill="#0f172a"
      stroke="#38bdf8"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M 12 12 L 12 18 L 16 18 L 16 14 L 21 14 L 21 18 L 24 18 L 24 14 L 29 14 L 29 18 L 33 18 L 33 12 Z" />
      <path d="M 14 18 L 31 18 L 29 35 L 16 35 Z" />
      <rect x="11" y="35" width="23" height="4" rx="1.5" />
    </g>
  </svg>
);

export const ModernWhiteQueenSvg: React.FC<PieceSvgProps> = (props) => (
  <svg viewBox="0 0 45 45" width="100%" height="100%" {...props}>
    <g
      fill="#ffffff"
      stroke="#0f172a"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="11" r="2" />
      <circle cx="22.5" cy="8" r="2.5" />
      <circle cx="35" cy="11" r="2" />
      <path d="M 10 14 L 14 26 L 22.5 12 L 31 26 L 35 14 L 32 35 L 13 35 Z" />
      <rect x="10" y="35" width="25" height="4" rx="1.5" />
    </g>
  </svg>
);

export const ModernBlackQueenSvg: React.FC<PieceSvgProps> = (props) => (
  <svg viewBox="0 0 45 45" width="100%" height="100%" {...props}>
    <g
      fill="#0f172a"
      stroke="#38bdf8"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="11" r="2" />
      <circle cx="22.5" cy="8" r="2.5" />
      <circle cx="35" cy="11" r="2" />
      <path d="M 10 14 L 14 26 L 22.5 12 L 31 26 L 35 14 L 32 35 L 13 35 Z" />
      <rect x="10" y="35" width="25" height="4" rx="1.5" />
    </g>
  </svg>
);

export const ModernWhiteKingSvg: React.FC<PieceSvgProps> = (props) => (
  <svg viewBox="0 0 45 45" width="100%" height="100%" {...props}>
    <g
      fill="#ffffff"
      stroke="#0f172a"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Modern geometric cross */}
      <path d="M 22.5 5 L 22.5 11" strokeWidth="2" />
      <path d="M 19.5 8 L 25.5 8" strokeWidth="2" />
      {/* Crown trapezoid */}
      <path d="M 15 11 L 30 11 L 33 22 L 12 22 Z" />
      {/* Body & Base */}
      <path d="M 14 22 L 31 22 L 30 35 L 15 35 Z" />
      <rect x="10" y="35" width="25" height="4" rx="1.5" />
    </g>
  </svg>
);

export const ModernBlackKingSvg: React.FC<PieceSvgProps> = (props) => (
  <svg viewBox="0 0 45 45" width="100%" height="100%" {...props}>
    <g
      fill="#0f172a"
      stroke="#38bdf8"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M 22.5 5 L 22.5 11" stroke="#38bdf8" strokeWidth="2" />
      <path d="M 19.5 8 L 25.5 8" stroke="#38bdf8" strokeWidth="2" />
      <path d="M 15 11 L 30 11 L 33 22 L 12 22 Z" />
      <path d="M 14 22 L 31 22 L 30 35 L 15 35 Z" />
      <rect x="10" y="35" width="25" height="4" rx="1.5" />
    </g>
  </svg>
);
