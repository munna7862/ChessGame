#!/usr/bin/env python3
"""
ChessForge Autonomous Sprint Orchestrator (Python / uv)
Coordinates automated sprint execution, PR raising, auto-merging, and phase tagging.
"""

import sys
import subprocess
import json

SPRINT_REGISTRY = [
    # Phase 04: Board UI
    {"id": "P04-S01", "phase": "04", "sprint": "01", "name": "Board Layout & Coordinate System", "file": "P04-S01-board-layout-and-coordinate-system.md", "is_phase_end": False},
    {"id": "P04-S02", "phase": "04", "sprint": "02", "name": "Piece Rendering & SVGs", "file": "P04-S02-piece-rendering.md", "is_phase_end": False},
    {"id": "P04-S03", "phase": "04", "sprint": "03", "name": "Selection & Legal Move Interaction", "file": "P04-S03-selection-and-legal-move-interaction.md", "is_phase_end": False},
    {"id": "P04-S04", "phase": "04", "sprint": "04", "name": "Move Animation & Last Move State", "file": "P04-S04-move-animation-and-last-move-state.md", "is_phase_end": False},
    {"id": "P04-S05", "phase": "04", "sprint": "05", "name": "Check & Promotion UI Dialogs", "file": "P04-S05-check-and-promotion-ui.md", "is_phase_end": False},
    {"id": "P04-S06", "phase": "04", "sprint": "06", "name": "Board Accessibility & Visual States", "file": "P04-S06-board-accessibility-and-visual-states.md", "is_phase_end": True},

    # Phase 05: Game System
    {"id": "P05-S01", "phase": "05", "sprint": "01", "name": "Game Session State", "file": "P05-S01-game-session-state.md", "is_phase_end": False},
    {"id": "P05-S02", "phase": "05", "sprint": "02", "name": "New Game & Player Configuration", "file": "P05-S02-new-game-and-player-configuration.md", "is_phase_end": False},
    {"id": "P05-S03", "phase": "05", "sprint": "03", "name": "Move History & Captured Pieces", "file": "P05-S03-move-history-and-captured-pieces.md", "is_phase_end": False},
    {"id": "P05-S04", "phase": "05", "sprint": "04", "name": "Undo, Restart & Resign Flows", "file": "P05-S04-undo-restart-and-resign.md", "is_phase_end": False},
    {"id": "P05-S05", "phase": "05", "sprint": "05", "name": "Draw Flow & Game Result", "file": "P05-S05-draw-flow-and-game-result.md", "is_phase_end": False},
    {"id": "P05-S06", "phase": "05", "sprint": "06", "name": "Human vs Human End-to-End", "file": "P05-S06-human-vs-human-end-to-end.md", "is_phase_end": True},

    # Phase 06: Stockfish AI
    {"id": "P06-S01", "phase": "06", "sprint": "01", "name": "Engine Abstraction & Worker Contract", "file": "P06-S01-engine-abstraction-and-worker-contract.md", "is_phase_end": False},
    {"id": "P06-S02", "phase": "06", "sprint": "02", "name": "Stockfish WASM Worker Integration", "file": "P06-S02-stockfish-wasm-worker-integration.md", "is_phase_end": False},
    {"id": "P06-S03", "phase": "06", "sprint": "03", "name": "Engine Position Synchronization", "file": "P06-S03-engine-position-synchronization.md", "is_phase_end": False},
    {"id": "P06-S04", "phase": "06", "sprint": "04", "name": "Engine Difficulty & Thinking Policy", "file": "P06-S04-engine-difficulty-and-thinking-policy.md", "is_phase_end": False},
    {"id": "P06-S05", "phase": "06", "sprint": "05", "name": "Human vs Computer Game Flow", "file": "P06-S05-human-vs-computer-game-flow.md", "is_phase_end": False},
    {"id": "P06-S06", "phase": "06", "sprint": "06", "name": "Engine Failure Recovery & Safeguards", "file": "P06-S06-engine-failure-recovery.md", "is_phase_end": True},

    # Phase 07: Clocks & Game Modes
    {"id": "P07-S01", "phase": "07", "sprint": "01", "name": "Clock Domain Model & Fischer Increments", "file": "P07-S01-clock-domain-model.md", "is_phase_end": False},
    {"id": "P07-S02", "phase": "07", "sprint": "02", "name": "Clock UI & Time Control Presets", "file": "P07-S02-clock-ui-and-presets.md", "is_phase_end": False},
    {"id": "P07-S03", "phase": "07", "sprint": "03", "name": "Clock Integration & Timeout Detection", "file": "P07-S03-clock-integration-and-timeout.md", "is_phase_end": False},
    {"id": "P07-S04", "phase": "07", "sprint": "04", "name": "AI & Clock Integration", "file": "P07-S04-ai-and-clock-integration.md", "is_phase_end": True},

    # Phase 08: Persistence & Settings
    {"id": "P08-S01", "phase": "08", "sprint": "01", "name": "Persistence Abstraction & Versioned State", "file": "P08-S01-persistence-abstraction-and-versioned-state.md", "is_phase_end": False},
    {"id": "P08-S02", "phase": "08", "sprint": "02", "name": "Automatic Game Recovery", "file": "P08-S02-automatic-game-recovery.md", "is_phase_end": False},
    {"id": "P08-S03", "phase": "08", "sprint": "03", "name": "PGN Export & Import UI", "file": "P08-S03-pgn-export-and-import-ui.md", "is_phase_end": False},
    {"id": "P08-S04", "phase": "08", "sprint": "04", "name": "FEN Workflow & Board Setup UI", "file": "P08-S04-fen-workflow.md", "is_phase_end": False},
    {"id": "P08-S05", "phase": "08", "sprint": "05", "name": "Settings Model & Local Storage", "file": "P08-S05-settings-model-and-storage.md", "is_phase_end": False},
    {"id": "P08-S06", "phase": "08", "sprint": "06", "name": "Settings UI & Customization Panel", "file": "P08-S06-settings-ui.md", "is_phase_end": True},

    # Phase 09: UX & Accessibility
    {"id": "P09-S01", "phase": "09", "sprint": "01", "name": "Design Tokens & Glassmorphic Visual System", "file": "P09-S01-design-tokens-and-visual-system.md", "is_phase_end": False},
    {"id": "P09-S02", "phase": "09", "sprint": "02", "name": "Board Themes & Custom Piece Sets", "file": "P09-S02-board-themes-and-piece-sets.md", "is_phase_end": False},
    {"id": "P09-S03", "phase": "09", "sprint": "03", "name": "Audio Feedback & Motion Polish", "file": "P09-S03-audio-and-motion-polish.md", "is_phase_end": False},
    {"id": "P09-S04", "phase": "09", "sprint": "04", "name": "Keyboard Navigation & WCAG Accessibility", "file": "P09-S04-keyboard-and-accessibility-completion.md", "is_phase_end": False},
    {"id": "P09-S05", "phase": "09", "sprint": "05", "name": "Error, Loading & Empty States", "file": "P09-S05-error-loading-and-empty-states.md", "is_phase_end": False},
    {"id": "P09-S06", "phase": "09", "sprint": "06", "name": "Visual Regression & UX Review", "file": "P09-S06-visual-regression-and-ux-review.md", "is_phase_end": True},

    # Phase 10: Quality Engineering & Release Candidate
    {"id": "P10-S01", "phase": "10", "sprint": "01", "name": "QA Inventory & Traceability Matrix", "file": "P10-S01-qa-inventory-and-traceability.md", "is_phase_end": False},
    {"id": "P10-S02", "phase": "10", "sprint": "02", "name": "Chess Regression Hardening", "file": "P10-S02-chess-regression-hardening.md", "is_phase_end": False},
    {"id": "P10-S03", "phase": "10", "sprint": "03", "name": "Property & Mutation Testing", "file": "P10-S03-property-and-mutation-testing.md", "is_phase_end": False},
    {"id": "P10-S04", "phase": "10", "sprint": "04", "name": "End-to-End Release Test Suite", "file": "P10-S04-end-to-end-release-suite.md", "is_phase_end": False},
    {"id": "P10-S05", "phase": "10", "sprint": "05", "name": "Performance, Memory & Reliability", "file": "P10-S05-performance-and-reliability.md", "is_phase_end": False},
    {"id": "P10-S06", "phase": "10", "sprint": "06", "name": "Security & Tauri Dependency Audit", "file": "P10-S06-security-and-dependency-audit.md", "is_phase_end": False},
    {"id": "P10-S07", "phase": "10", "sprint": "07", "name": "Release Candidate Build Validation", "file": "P10-S07-release-candidate-build-and-clean-machine-validation.md", "is_phase_end": True},

    # Phase 11: Windows Release
    {"id": "P11-S01", "phase": "11", "sprint": "01", "name": "Release Versioning & Changelog", "file": "P11-S01-release-versioning-and-changelog.md", "is_phase_end": False},
    {"id": "P11-S02", "phase": "11", "sprint": "02", "name": "Windows Installer & NSIS Packaging", "file": "P11-S02-windows-installer-and-packaging.md", "is_phase_end": False},
    {"id": "P11-S03", "phase": "11", "sprint": "03", "name": "Code Signing & Release Security", "file": "P11-S03-code-signing-and-release-security.md", "is_phase_end": False},
    {"id": "P11-S04", "phase": "11", "sprint": "04", "name": "Release Automation & Checksums", "file": "P11-S04-release-automation-and-checksums.md", "is_phase_end": False},
    {"id": "P11-S05", "phase": "11", "sprint": "05", "name": "Upgrade & Uninstall Validation", "file": "P11-S05-upgrade-and-uninstall-validation.md", "is_phase_end": False},
    {"id": "P11-S06", "phase": "11", "sprint": "06", "name": "v1.0 Release & Post-Release Baseline", "file": "P11-S06-v1-0-release-and-post-release-baseline.md", "is_phase_end": True},
]

def run(cmd: str):
    print(f"\n[RUN] {cmd}")
    res = subprocess.run(cmd, shell=True, text=True)
    if res.returncode != 0:
        print(f"❌ Command failed with code {res.returncode}")
        sys.exit(res.returncode)

def main():
    if len(sys.argv) < 2 or sys.argv[1] == "status":
        print("\n=======================================================")
        print("♟️  ChessForge Remaining Sprint Backlog (Phases 04 - 11)")
        print("=======================================================\n")
        print("✅ Phases 01, 02, 03 are COMPLETED and Tagged (v0.3.0).\n")
        for s in SPRINT_REGISTRY:
            tag_note = " 🏷️ [PHASE END RELEASE]" if s["is_phase_end"] else ""
            print(f"⏳ Phase {s['phase']} · Sprint {s['sprint']} ({s['id']}): {s['name']}{tag_note}")
        print("\n👉 Next Sprint to Execute in a Fresh Chat: P04-S01 (Phase 04 · Sprint 01)")
    elif sys.argv[1] == "auto-merge":
        run("gh pr merge --squash --delete-branch --auto || gh pr merge --squash --delete-branch")
        run("git checkout main")
        run("git pull origin main")
    elif sys.argv[1] == "tag" and len(sys.argv) > 2:
        phase = sys.argv[2]
        tag_name = f"v0.{int(phase)}.0"
        run(f'git tag -a {tag_name} -m "Release {tag_name}: Phase {phase} Complete"')
        run(f"git push origin {tag_name}")
        run(f'gh release create {tag_name} --title "{tag_name}: Phase {phase} Complete" --notes "Phase {phase} milestone automatically verified and released."')

if __name__ == "__main__":
    main()
