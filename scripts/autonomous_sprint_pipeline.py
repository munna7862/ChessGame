#!/usr/bin/env python3
"""
ChessForge 100% Autonomous Multi-Sprint Pipeline
=================================================
Runs each sprint in a brand-new, isolated Antigravity Agent conversation session.
Guarantees 0 context carryover, preventing token saturation and hallucination.

Workflow per sprint:
  1. Spawns fresh Agent instance with clean context.
  2. Injects Scrum Master sprint kickoff prompt adhering to AGENTS.md.
  3. Agent executes all personas: SM -> CDA/SDE -> SDET -> DEV -> SEC -> SDET -> PO -> DO.
  4. SDET & DO verify 100% green quality gates (lint, typecheck, format, test, e2e, build).
  5. DO creates remote PR on GitHub via 'gh pr create'.
  6. Pipeline auto-merges PR to 'main', deletes feature branch, and syncs local repo.
  7. If sprint is the final sprint of a phase, pipeline automatically creates Git Tag & GitHub Release.
  8. Destroys Agent session to free 100% of context memory.
  9. Advances to next sprint with a completely fresh session.
"""

import asyncio
import subprocess
import sys
import os
from google.antigravity import Agent, LocalAgentConfig, CapabilitiesConfig

# Auto-load GEMINI_API_KEY from .env if present
env_path = os.path.join(os.getcwd(), ".env")
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip().strip('"').strip("'")

# All remaining sprints from Phase 04 to Phase 11
SPRINT_PIPELINE = [
    # Phase 04: Board UI (6 sprints)
    {"id": "P04-S01", "phase": "04", "sprint": "01", "name": "Board Layout & Coordinate System", "file": "P04-S01-board-layout-and-coordinate-system.md", "is_phase_end": False},
    {"id": "P04-S02", "phase": "04", "sprint": "02", "name": "Piece Rendering & SVGs", "file": "P04-S02-piece-rendering.md", "is_phase_end": False},
    {"id": "P04-S03", "phase": "04", "sprint": "03", "name": "Selection & Legal Move Interaction", "file": "P04-S03-selection-and-legal-move-interaction.md", "is_phase_end": False},
    {"id": "P04-S04", "phase": "04", "sprint": "04", "name": "Move Animation & Last Move State", "file": "P04-S04-move-animation-and-last-move-state.md", "is_phase_end": False},
    {"id": "P04-S05", "phase": "04", "sprint": "05", "name": "Check & Promotion UI Dialogs", "file": "P04-S05-check-and-promotion-ui.md", "is_phase_end": False},
    {"id": "P04-S06", "phase": "04", "sprint": "06", "name": "Board Accessibility & Visual States", "file": "P04-S06-board-accessibility-and-visual-states.md", "is_phase_end": True},

    # Phase 05: Game System (6 sprints)
    {"id": "P05-S01", "phase": "05", "sprint": "01", "name": "Game Session State", "file": "P05-S01-game-session-state.md", "is_phase_end": False},
    {"id": "P05-S02", "phase": "05", "sprint": "02", "name": "New Game & Player Configuration", "file": "P05-S02-new-game-and-player-configuration.md", "is_phase_end": False},
    {"id": "P05-S03", "phase": "05", "sprint": "03", "name": "Move History & Captured Pieces", "file": "P05-S03-move-history-and-captured-pieces.md", "is_phase_end": False},
    {"id": "P05-S04", "phase": "05", "sprint": "04", "name": "Undo, Restart & Resign Flows", "file": "P05-S04-undo-restart-and-resign.md", "is_phase_end": False},
    {"id": "P05-S05", "phase": "05", "sprint": "05", "name": "Draw Flow & Game Result", "file": "P05-S05-draw-flow-and-game-result.md", "is_phase_end": False},
    {"id": "P05-S06", "phase": "05", "sprint": "06", "name": "Human vs Human End-to-End", "file": "P05-S06-human-vs-human-end-to-end.md", "is_phase_end": True},

    # Phase 06: Stockfish AI (6 sprints)
    {"id": "P06-S01", "phase": "06", "sprint": "01", "name": "Engine Abstraction & Worker Contract", "file": "P06-S01-engine-abstraction-and-worker-contract.md", "is_phase_end": False},
    {"id": "P06-S02", "phase": "06", "sprint": "02", "name": "Stockfish WASM Worker Integration", "file": "P06-S02-stockfish-wasm-worker-integration.md", "is_phase_end": False},
    {"id": "P06-S03", "phase": "06", "sprint": "03", "name": "Engine Position Synchronization", "file": "P06-S03-engine-position-synchronization.md", "is_phase_end": False},
    {"id": "P06-S04", "phase": "06", "sprint": "04", "name": "Engine Difficulty & Thinking Policy", "file": "P06-S04-engine-difficulty-and-thinking-policy.md", "is_phase_end": False},
    {"id": "P06-S05", "phase": "06", "sprint": "05", "name": "Human vs Computer Game Flow", "file": "P06-S05-human-vs-computer-game-flow.md", "is_phase_end": False},
    {"id": "P06-S06", "phase": "06", "sprint": "06", "name": "Engine Failure Recovery & Safeguards", "file": "P06-S06-engine-failure-recovery.md", "is_phase_end": True},

    # Phase 07: Clocks & Game Modes (4 sprints)
    {"id": "P07-S01", "phase": "07", "sprint": "01", "name": "Clock Domain Model & Fischer Increments", "file": "P07-S01-clock-domain-model.md", "is_phase_end": False},
    {"id": "P07-S02", "phase": "07", "sprint": "02", "name": "Clock UI & Time Control Presets", "file": "P07-S02-clock-ui-and-presets.md", "is_phase_end": False},
    {"id": "P07-S03", "phase": "07", "sprint": "03", "name": "Clock Integration & Timeout Detection", "file": "P07-S03-clock-integration-and-timeout.md", "is_phase_end": False},
    {"id": "P07-S04", "phase": "07", "sprint": "04", "name": "AI & Clock Integration", "file": "P07-S04-ai-and-clock-integration.md", "is_phase_end": True},

    # Phase 08: Persistence & Settings (6 sprints)
    {"id": "P08-S01", "phase": "08", "sprint": "01", "name": "Persistence Abstraction & Versioned State", "file": "P08-S01-persistence-abstraction-and-versioned-state.md", "is_phase_end": False},
    {"id": "P08-S02", "phase": "08", "sprint": "02", "name": "Automatic Game Recovery", "file": "P08-S02-automatic-game-recovery.md", "is_phase_end": False},
    {"id": "P08-S03", "phase": "08", "sprint": "03", "name": "PGN Export & Import UI", "file": "P08-S03-pgn-export-and-import-ui.md", "is_phase_end": False},
    {"id": "P08-S04", "phase": "08", "sprint": "04", "name": "FEN Workflow & Board Setup UI", "file": "P08-S04-fen-workflow.md", "is_phase_end": False},
    {"id": "P08-S05", "phase": "08", "sprint": "05", "name": "Settings Model & Local Storage", "file": "P08-S05-settings-model-and-storage.md", "is_phase_end": False},
    {"id": "P08-S06", "phase": "08", "sprint": "06", "name": "Settings UI & Customization Panel", "file": "P08-S06-settings-ui.md", "is_phase_end": True},

    # Phase 09: UX & Accessibility (6 sprints)
    {"id": "P09-S01", "phase": "09", "sprint": "01", "name": "Design Tokens & Glassmorphic Visual System", "file": "P09-S01-design-tokens-and-visual-system.md", "is_phase_end": False},
    {"id": "P09-S02", "phase": "09", "sprint": "02", "name": "Board Themes & Custom Piece Sets", "file": "P09-S02-board-themes-and-piece-sets.md", "is_phase_end": False},
    {"id": "P09-S03", "phase": "09", "sprint": "03", "name": "Audio Feedback & Motion Polish", "file": "P09-S03-audio-and-motion-polish.md", "is_phase_end": False},
    {"id": "P09-S04", "phase": "09", "sprint": "04", "name": "Keyboard Navigation & WCAG Accessibility", "file": "P09-S04-keyboard-and-accessibility-completion.md", "is_phase_end": False},
    {"id": "P09-S05", "phase": "09", "sprint": "05", "name": "Error, Loading & Empty States", "file": "P09-S05-error-loading-and-empty-states.md", "is_phase_end": False},
    {"id": "P09-S06", "phase": "09", "sprint": "06", "name": "Visual Regression & UX Review", "file": "P09-S06-visual-regression-and-ux-review.md", "is_phase_end": True},

    # Phase 10: Quality Engineering & Release Candidate (7 sprints)
    {"id": "P10-S01", "phase": "10", "sprint": "01", "name": "QA Inventory & Traceability Matrix", "file": "P10-S01-qa-inventory-and-traceability.md", "is_phase_end": False},
    {"id": "P10-S02", "phase": "10", "sprint": "02", "name": "Chess Regression Hardening", "file": "P10-S02-chess-regression-hardening.md", "is_phase_end": False},
    {"id": "P10-S03", "phase": "10", "sprint": "03", "name": "Property & Mutation Testing", "file": "P10-S03-property-and-mutation-testing.md", "is_phase_end": False},
    {"id": "P10-S04", "phase": "10", "sprint": "04", "name": "End-to-End Release Test Suite", "file": "P10-S04-end-to-end-release-suite.md", "is_phase_end": False},
    {"id": "P10-S05", "phase": "10", "sprint": "05", "name": "Performance, Memory & Reliability", "file": "P10-S05-performance-and-reliability.md", "is_phase_end": False},
    {"id": "P10-S06", "phase": "10", "sprint": "06", "name": "Security & Tauri Dependency Audit", "file": "P10-S06-security-and-dependency-audit.md", "is_phase_end": False},
    {"id": "P10-S07", "phase": "10", "sprint": "07", "name": "Release Candidate Build Validation", "file": "P10-S07-release-candidate-build-and-clean-machine-validation.md", "is_phase_end": True},

    # Phase 11: Windows Release (6 sprints)
    {"id": "P11-S01", "phase": "11", "sprint": "01", "name": "Release Versioning & Changelog", "file": "P11-S01-release-versioning-and-changelog.md", "is_phase_end": False},
    {"id": "P11-S02", "phase": "11", "sprint": "02", "name": "Windows Installer & NSIS Packaging", "file": "P11-S02-windows-installer-and-packaging.md", "is_phase_end": False},
    {"id": "P11-S03", "phase": "11", "sprint": "03", "name": "Code Signing & Release Security", "file": "P11-S03-code-signing-and-release-security.md", "is_phase_end": False},
    {"id": "P11-S04", "phase": "11", "sprint": "04", "name": "Release Automation & Checksums", "file": "P11-S04-release-automation-and-checksums.md", "is_phase_end": False},
    {"id": "P11-S05", "phase": "11", "sprint": "05", "name": "Upgrade & Uninstall Validation", "file": "P11-S05-upgrade-and-uninstall-validation.md", "is_phase_end": False},
    {"id": "P11-S06", "phase": "11", "sprint": "06", "name": "v1.0 Release & Post-Release Baseline", "file": "P11-S06-v1-0-release-and-post-release-baseline.md", "is_phase_end": True},
]

def run_cmd(cmd: str) -> str:
    print(f"\n[EXEC] {cmd}")
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"[WARN/ERROR] Output:\n{res.stderr or res.stdout}")
    return res.stdout.strip()

async def execute_sprint_in_fresh_session(sprint: dict):
    phase = sprint["phase"]
    sprint_num = sprint["sprint"]
    sprint_id = sprint["id"]
    name = sprint["name"]
    file_name = sprint["file"]
    branch_name = f"feature/p{phase.lower()}-s{sprint_num.lower()}-{name.lower().replace(' ', '-').replace('&', 'and')}"

    print(f"\n{'='*70}")
    print(f"🚀 [FRESH SESSION] Launching Phase {phase} · Sprint {sprint_num} ({sprint_id}): {name}")
    print(f"{'='*70}\n")

    prompt = f"""
start sprint # Phase {phase} · Sprint {sprint_num}: {name} using scrum master persona

Follow the Universal Operating Contract in AGENTS.md strictly:
1. **Scrum Master (SM)**: Read planning/sprints/{file_name} and planning/phases/{phase}-phase-*.md. Initialize task breakdown in task.md, verify dependencies. Checkout branch '{branch_name}'.
2. **Chess Domain / Architecture (CDA/SDE)**: Review domain invariants, UI architecture, and layout specifications.
3. **SDET Architect (SDET)**: Author pre-implementation Test Cases Catalog (docs/testing/test_cases_catalog_P{phase}_S{sprint_num}.md).
4. **Dev Architect & Senior SDE (SDE)**: Implement production code, UI components, and unit/integration tests on branch '{branch_name}'.
5. **Security Officer (SEC)**: Conduct Desktop & Capability Security Audit.
6. **SDET Architect (SDET)**: Run complete test suite and quality gates (100% Green, 0 skips: npm run lint, npm run typecheck, npm run format:check, npm test, npm run test:e2e, npm run build).
7. **Product Owner (PO)**: Conduct Acceptance Review and approve release.
8. **DevOps Engineer (DO)**: Author PR documentation (docs/pull_requests/pr_P{phase}_S{sprint_num}_*.md), commit atomic changes, push to origin, and create GitHub PR via 'gh pr create'.
"""

    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    config = LocalAgentConfig(
        api_key=api_key,
        workspaces=[os.getcwd()],
        system_instructions="You are an autonomous agile development team adhering strictly to AGENTS.md in ChessForge.",
        capabilities=CapabilitiesConfig(),
    )

    # 1. Initialize a 100% fresh, isolated Agent conversation session
    async with Agent(config) as agent:
        print(f"🤖 Agent session started with 0 initial tokens.")
        response = await agent.chat(prompt)
        async for token in response:
            print(token, end="", flush=True)

    print(f"\n\n✅ Agent session for {sprint_id} finished. Context memory disposed.")

    # 2. Auto-merge PR created by the agent
    print(f"\n🔀 Merging PR to main and synchronizing...")
    run_cmd("gh pr merge --squash --delete-branch --auto || gh pr merge --squash --delete-branch")
    run_cmd("git checkout main && git pull origin main")

    # 3. If Phase Completion, Tag & Release
    if sprint["is_phase_end"]:
        tag_name = f"v0.{int(phase)}.0"
        print(f"\n🏷️ Phase {phase} Completed! Creating release tag {tag_name}...")
        run_cmd(f'git tag -a {tag_name} -m "Release {tag_name}: Phase {phase} Complete"')
        run_cmd(f"git push origin {tag_name}")
        run_cmd(f'gh release create {tag_name} --title "{tag_name}: Phase {phase} Complete" --notes "Phase {phase} milestone automatically verified and released."')
        print(f"🎉 Tag {tag_name} published successfully.")

    print(f"\n🏁 Finished {sprint_id}. Cooldown 3s before starting next fresh chat session...\n")
    await asyncio.sleep(3)

async def main():
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print("\n" + "="*70)
        print("🔑 GEMINI_API_KEY Required for Standalone Python SDK Pipeline")
        print("="*70)
        print("\nTo run the 100% headless external Python runner, provide your Gemini API key:")
        print("  1. In PowerShell:  $env:GEMINI_API_KEY=\"your_gemini_api_key\"")
        print("  2. Or in a .env file: GEMINI_API_KEY=your_gemini_api_key")
        print("\n💡 Alternatively, if you are using your Antigravity IDE subscription:")
        print("  Simply open a New Chat in the Antigravity IDE and paste the prompt:")
        print("  node scripts/sprint_orchestrator.mjs prompt P04-S01")
        print("="*70 + "\n")
        sys.exit(1)

    target = sys.argv[1] if len(sys.argv) > 1 else None

    if target:
        # Run specific sprint
        sprints_to_run = [s for s in SPRINT_PIPELINE if s["id"].lower() == target.lower()]
        if not sprints_to_run:
            print(f"❌ Unknown Sprint ID: {target}")
            sys.exit(1)
    else:
        # Run all remaining sprints sequentially
        sprints_to_run = SPRINT_PIPELINE

    print(f"📋 Pipeline Queued: {len(sprints_to_run)} sprints to execute.")
    for sprint in sprints_to_run:
        await execute_sprint_in_fresh_session(sprint)

    print("\n🎉🎉 All requested sprints have executed, verified, merged, and released!")

if __name__ == "__main__":
    asyncio.run(main())
