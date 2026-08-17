#!/usr/bin/env node
/**
 * ChessForge Sprint Automation Orchestrator
 *
 * Coordinates end-to-end multi-agent agile sprint execution across Phases 01 to 11.
 * Supports sprint status tracking, autonomous prompt generation, quality gate verification,
 * automated GitHub PR creation, PR auto-merging, and phase release tagging.
 */

import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";

const WORKSPACE_ROOT = process.cwd();

// Complete 64-Sprint Master Inventory
export const SPRINT_REGISTRY = [
  // Phase 01: Product & Architecture (5 sprints)
  {
    id: "P01-S01",
    phase: "01",
    sprint: "01",
    name: "Product Requirements Baseline",
    file: "P01-S01-product-requirements-baseline.md",
    isPhaseEnd: false,
  },
  {
    id: "P01-S02",
    phase: "01",
    sprint: "02",
    name: "UX Journeys & Information Architecture",
    file: "P01-S02-ux-journeys-and-information-architecture.md",
    isPhaseEnd: false,
  },
  {
    id: "P01-S03",
    phase: "01",
    sprint: "03",
    name: "Architecture & Module Boundaries",
    file: "P01-S03-architecture-and-module-boundaries.md",
    isPhaseEnd: false,
  },
  {
    id: "P01-S04",
    phase: "01",
    sprint: "04",
    name: "Security & Permissions Model",
    file: "P01-S04-security-and-permissions-model.md",
    isPhaseEnd: false,
  },
  {
    id: "P01-S05",
    phase: "01",
    sprint: "05",
    name: "Testing & Agent Operating Contract",
    file: "P01-S05-testing-and-agent-operating-contract.md",
    isPhaseEnd: true,
  },

  // Phase 02: Project Bootstrap (5 sprints)
  {
    id: "P02-S01",
    phase: "02",
    sprint: "01",
    name: "Repository & Tauri Bootstrap",
    file: "P02-S01-repository-and-tauri-bootstrap.md",
    isPhaseEnd: false,
  },
  {
    id: "P02-S02",
    phase: "02",
    sprint: "02",
    name: "Developer Tooling & Code Quality",
    file: "P02-S02-developer-tooling-and-code-quality.md",
    isPhaseEnd: false,
  },
  {
    id: "P02-S03",
    phase: "02",
    sprint: "03",
    name: "Playwright & E2E Foundation",
    file: "P02-S03-playwright-and-e2e-foundation.md",
    isPhaseEnd: false,
  },
  {
    id: "P02-S04",
    phase: "02",
    sprint: "04",
    name: "GitHub Actions Baseline",
    file: "P02-S04-github-actions-baseline.md",
    isPhaseEnd: false,
  },
  {
    id: "P02-S05",
    phase: "02",
    sprint: "05",
    name: "Workspace & Agent Guardrails",
    file: "P02-S05-antigravity-workspace-and-agent-guardrails.md",
    isPhaseEnd: true,
  },

  // Phase 03: Chess Domain (7 sprints)
  {
    id: "P03-S01",
    phase: "03",
    sprint: "01",
    name: "Chess Domain Types & Adapter Contract",
    file: "P03-S01-chess-domain-types-and-adapter-contract.md",
    isPhaseEnd: false,
  },
  {
    id: "P03-S02",
    phase: "03",
    sprint: "02",
    name: "Legal Move Execution",
    file: "P03-S02-legal-move-execution.md",
    isPhaseEnd: false,
  },
  {
    id: "P03-S03",
    phase: "03",
    sprint: "03",
    name: "Special Moves",
    file: "P03-S03-special-moves.md",
    isPhaseEnd: false,
  },
  {
    id: "P03-S04",
    phase: "03",
    sprint: "04",
    name: "Game Status & Draw Rules",
    file: "P03-S04-game-status-and-draw-rules.md",
    isPhaseEnd: false,
  },
  {
    id: "P03-S05",
    phase: "03",
    sprint: "05",
    name: "FEN Import Export",
    file: "P03-S05-fen-import-export.md",
    isPhaseEnd: false,
  },
  {
    id: "P03-S06",
    phase: "03",
    sprint: "06",
    name: "PGN Import Export",
    file: "P03-S06-pgn-import-export.md",
    isPhaseEnd: false,
  },
  {
    id: "P03-S07",
    phase: "03",
    sprint: "07",
    name: "Domain Regression & Property Testing",
    file: "P03-S07-domain-regression-and-property-testing.md",
    isPhaseEnd: true,
  },

  // Phase 04: Board UI (6 sprints)
  {
    id: "P04-S01",
    phase: "04",
    sprint: "01",
    name: "Board Layout & Coordinate System",
    file: "P04-S01-board-layout-and-coordinate-system.md",
    isPhaseEnd: false,
  },
  {
    id: "P04-S02",
    phase: "04",
    sprint: "02",
    name: "Piece Rendering & SVGs",
    file: "P04-S02-piece-rendering.md",
    isPhaseEnd: false,
  },
  {
    id: "P04-S03",
    phase: "04",
    sprint: "03",
    name: "Selection & Legal Move Interaction",
    file: "P04-S03-selection-and-legal-move-interaction.md",
    isPhaseEnd: false,
  },
  {
    id: "P04-S04",
    phase: "04",
    sprint: "04",
    name: "Move Animation & Last Move State",
    file: "P04-S04-move-animation-and-last-move-state.md",
    isPhaseEnd: false,
  },
  {
    id: "P04-S05",
    phase: "04",
    sprint: "05",
    name: "Check & Promotion UI Dialogs",
    file: "P04-S05-check-and-promotion-ui.md",
    isPhaseEnd: false,
  },
  {
    id: "P04-S06",
    phase: "04",
    sprint: "06",
    name: "Board Accessibility & Visual States",
    file: "P04-S06-board-accessibility-and-visual-states.md",
    isPhaseEnd: true,
  },

  // Phase 05: Game System (6 sprints)
  {
    id: "P05-S01",
    phase: "05",
    sprint: "01",
    name: "Game Session State",
    file: "P05-S01-game-session-state.md",
    isPhaseEnd: false,
  },
  {
    id: "P05-S02",
    phase: "05",
    sprint: "02",
    name: "New Game & Player Configuration",
    file: "P05-S02-new-game-and-player-configuration.md",
    isPhaseEnd: false,
  },
  {
    id: "P05-S03",
    phase: "05",
    sprint: "03",
    name: "Move History & Captured Pieces",
    file: "P05-S03-move-history-and-captured-pieces.md",
    isPhaseEnd: false,
  },
  {
    id: "P05-S04",
    phase: "05",
    sprint: "04",
    name: "Undo, Restart & Resign Flows",
    file: "P05-S04-undo-restart-and-resign.md",
    isPhaseEnd: false,
  },
  {
    id: "P05-S05",
    phase: "05",
    sprint: "05",
    name: "Draw Flow & Game Result",
    file: "P05-S05-draw-flow-and-game-result.md",
    isPhaseEnd: false,
  },
  {
    id: "P05-S06",
    phase: "05",
    sprint: "06",
    name: "Human vs Human End-to-End",
    file: "P05-S06-human-vs-human-end-to-end.md",
    isPhaseEnd: true,
  },

  // Phase 06: Stockfish AI (6 sprints)
  {
    id: "P06-S01",
    phase: "06",
    sprint: "01",
    name: "Engine Abstraction & Worker Contract",
    file: "P06-S01-engine-abstraction-and-worker-contract.md",
    isPhaseEnd: false,
  },
  {
    id: "P06-S02",
    phase: "06",
    sprint: "02",
    name: "Stockfish WASM Worker Integration",
    file: "P06-S02-stockfish-wasm-worker-integration.md",
    isPhaseEnd: false,
  },
  {
    id: "P06-S03",
    phase: "06",
    sprint: "03",
    name: "Engine Position Synchronization",
    file: "P06-S03-engine-position-synchronization.md",
    isPhaseEnd: false,
  },
  {
    id: "P06-S04",
    phase: "06",
    sprint: "04",
    name: "Engine Difficulty & Thinking Policy",
    file: "P06-S04-engine-difficulty-and-thinking-policy.md",
    isPhaseEnd: false,
  },
  {
    id: "P06-S05",
    phase: "06",
    sprint: "05",
    name: "Human vs Computer Game Flow",
    file: "P06-S05-human-vs-computer-game-flow.md",
    isPhaseEnd: false,
  },
  {
    id: "P06-S06",
    phase: "06",
    sprint: "06",
    name: "Engine Failure Recovery & Safeguards",
    file: "P06-S06-engine-failure-recovery.md",
    isPhaseEnd: true,
  },

  // Phase 07: Clocks & Game Modes (4 sprints)
  {
    id: "P07-S01",
    phase: "07",
    sprint: "01",
    name: "Clock Domain Model & Fischer Increments",
    file: "P07-S01-clock-domain-model.md",
    isPhaseEnd: false,
  },
  {
    id: "P07-S02",
    phase: "07",
    sprint: "02",
    name: "Clock UI & Time Control Presets",
    file: "P07-S02-clock-ui-and-presets.md",
    isPhaseEnd: false,
  },
  {
    id: "P07-S03",
    phase: "07",
    sprint: "03",
    name: "Clock Integration & Timeout Detection",
    file: "P07-S03-clock-integration-and-timeout.md",
    isPhaseEnd: false,
  },
  {
    id: "P07-S04",
    phase: "07",
    sprint: "04",
    name: "AI & Clock Integration",
    file: "P07-S04-ai-and-clock-integration.md",
    isPhaseEnd: true,
  },

  // Phase 08: Persistence & Settings (6 sprints)
  {
    id: "P08-S01",
    phase: "08",
    sprint: "01",
    name: "Persistence Abstraction & Versioned State",
    file: "P08-S01-persistence-abstraction-and-versioned-state.md",
    isPhaseEnd: false,
  },
  {
    id: "P08-S02",
    phase: "08",
    sprint: "02",
    name: "Automatic Game Recovery",
    file: "P08-S02-automatic-game-recovery.md",
    isPhaseEnd: false,
  },
  {
    id: "P08-S03",
    phase: "08",
    sprint: "03",
    name: "PGN Export & Import UI",
    file: "P08-S03-pgn-export-and-import-ui.md",
    isPhaseEnd: false,
  },
  {
    id: "P08-S04",
    phase: "08",
    sprint: "04",
    name: "FEN Workflow & Board Setup UI",
    file: "P08-S04-fen-workflow.md",
    isPhaseEnd: false,
  },
  {
    id: "P08-S05",
    phase: "08",
    sprint: "05",
    name: "Settings Model & Local Storage",
    file: "P08-S05-settings-model-and-storage.md",
    isPhaseEnd: false,
  },
  {
    id: "P08-S06",
    phase: "08",
    sprint: "06",
    name: "Settings UI & Customization Panel",
    file: "P08-S06-settings-ui.md",
    isPhaseEnd: true,
  },

  // Phase 09: UX & Accessibility (6 sprints)
  {
    id: "P09-S01",
    phase: "09",
    sprint: "01",
    name: "Design Tokens & Glassmorphic Visual System",
    file: "P09-S01-design-tokens-and-visual-system.md",
    isPhaseEnd: false,
  },
  {
    id: "P09-S02",
    phase: "09",
    sprint: "02",
    name: "Board Themes & Custom Piece Sets",
    file: "P09-S02-board-themes-and-piece-sets.md",
    isPhaseEnd: false,
  },
  {
    id: "P09-S03",
    phase: "09",
    sprint: "03",
    name: "Audio Feedback & Motion Polish",
    file: "P09-S03-audio-and-motion-polish.md",
    isPhaseEnd: false,
  },
  {
    id: "P09-S04",
    phase: "09",
    sprint: "04",
    name: "Keyboard Navigation & WCAG Accessibility",
    file: "P09-S04-keyboard-and-accessibility-completion.md",
    isPhaseEnd: false,
  },
  {
    id: "P09-S05",
    phase: "09",
    sprint: "05",
    name: "Error, Loading & Empty States",
    file: "P09-S05-error-loading-and-empty-states.md",
    isPhaseEnd: false,
  },
  {
    id: "P09-S06",
    phase: "09",
    sprint: "06",
    name: "Visual Regression & UX Review",
    file: "P09-S06-visual-regression-and-ux-review.md",
    isPhaseEnd: true,
  },

  // Phase 10: Quality Engineering & Release Candidate (7 sprints)
  {
    id: "P10-S01",
    phase: "10",
    sprint: "01",
    name: "QA Inventory & Traceability Matrix",
    file: "P10-S01-qa-inventory-and-traceability.md",
    isPhaseEnd: false,
  },
  {
    id: "P10-S02",
    phase: "10",
    sprint: "02",
    name: "Chess Regression Hardening",
    file: "P10-S02-chess-regression-hardening.md",
    isPhaseEnd: false,
  },
  {
    id: "P10-S03",
    phase: "10",
    sprint: "03",
    name: "Property & Mutation Testing",
    file: "P10-S03-property-and-mutation-testing.md",
    isPhaseEnd: false,
  },
  {
    id: "P10-S04",
    phase: "10",
    sprint: "04",
    name: "End-to-End Release Test Suite",
    file: "P10-S04-end-to-end-release-suite.md",
    isPhaseEnd: false,
  },
  {
    id: "P10-S05",
    phase: "10",
    sprint: "05",
    name: "Performance, Memory & Reliability",
    file: "P10-S05-performance-and-reliability.md",
    isPhaseEnd: false,
  },
  {
    id: "P10-S06",
    phase: "10",
    sprint: "06",
    name: "Security & Tauri Dependency Audit",
    file: "P10-S06-security-and-dependency-audit.md",
    isPhaseEnd: false,
  },
  {
    id: "P10-S07",
    phase: "10",
    sprint: "07",
    name: "Release Candidate Build Validation",
    file: "P10-S07-release-candidate-build-and-clean-machine-validation.md",
    isPhaseEnd: true,
  },

  // Phase 11: Windows Release (6 sprints)
  {
    id: "P11-S01",
    phase: "11",
    sprint: "01",
    name: "Release Versioning & Changelog",
    file: "P11-S01-release-versioning-and-changelog.md",
    isPhaseEnd: false,
  },
  {
    id: "P11-S02",
    phase: "11",
    sprint: "02",
    name: "Windows Installer & NSIS Packaging",
    file: "P11-S02-windows-installer-and-packaging.md",
    isPhaseEnd: false,
  },
  {
    id: "P11-S03",
    phase: "11",
    sprint: "03",
    name: "Code Signing & Release Security",
    file: "P11-S03-code-signing-and-release-security.md",
    isPhaseEnd: false,
  },
  {
    id: "P11-S04",
    phase: "11",
    sprint: "04",
    name: "Release Automation & Checksums",
    file: "P11-S04-release-automation-and-checksums.md",
    isPhaseEnd: false,
  },
  {
    id: "P11-S05",
    phase: "11",
    sprint: "05",
    name: "Upgrade & Uninstall Validation",
    file: "P11-S05-upgrade-and-uninstall-validation.md",
    isPhaseEnd: false,
  },
  {
    id: "P11-S06",
    phase: "11",
    sprint: "06",
    name: "v1.0 Release & Post-Release Baseline",
    file: "P11-S06-v1-0-release-and-post-release-baseline.md",
    isPhaseEnd: true,
  },
];

// Execute Shell Command Helper
function run(command, options = {}) {
  try {
    return execSync(command, {
      cwd: WORKSPACE_ROOT,
      encoding: "utf-8",
      stdio: options.silent ? "pipe" : "inherit",
      ...options,
    });
  } catch (err) {
    if (!options.allowFailure) {
      console.error(`\n❌ Command Failed: ${command}`);
      throw err;
    }
    return null;
  }
}

// Generate Persona-Ready Prompt
export function generateSprintPrompt(sprint) {
  const branchName = `feature/p${sprint.phase.toLowerCase()}-s${sprint.sprint.toLowerCase()}-${sprint.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const tagInstruction = sprint.isPhaseEnd
    ? `\n9. **Phase Tagging (DO)**: Since ${sprint.id} is the final sprint of Phase ${sprint.phase}, after merging to 'main', checkout 'main', pull latest, create tag 'v0.${parseInt(sprint.phase, 10)}.0' and create GitHub release via 'gh release create v0.${parseInt(sprint.phase, 10)}.0 --title "v0.${parseInt(sprint.phase, 10)}.0: Phase ${sprint.phase} Complete"'.`
    : "";

  return `/goal start sprint # Phase ${sprint.phase} · Sprint ${sprint.sprint}: ${sprint.name} using scrum master persona

Follow the Universal Operating Contract in AGENTS.md strictly:
1. **Scrum Master (SM)**: Read planning/sprints/${sprint.file} and planning/phases/${sprint.phase}-phase-*.md. Initialize task breakdown in task.md, verify dependencies. Checkout branch '${branchName}'.
2. **Chess Domain / Architecture (CDA/SDE)**: Review domain invariants, UI architecture, and layout specifications.
3. **SDET Architect (SDET)**: Author pre-implementation Test Cases Catalog (docs/testing/test_cases_catalog_P${sprint.phase}_S${sprint.sprint}.md).
4. **Dev Architect & Senior SDE (SDE)**: Implement production code, UI components, and unit/integration tests on branch '${branchName}'.
5. **Security Officer (SEC)**: Conduct Desktop & Capability Security Audit.
6. **SDET Architect (SDET)**: Run complete test suite and quality gates (100% Green, 0 skips: npm run lint, npm run typecheck, npm run format:check, npm test, npm run test:e2e, npm run build).
7. **Product Owner (PO)**: Conduct Acceptance Review and approve release.
8. **DevOps Engineer (DO)**: Author PR documentation (docs/pull_requests/pr_P${sprint.phase}_S${sprint.sprint}_*.md), commit atomic changes, push to origin, create GitHub PR via 'gh pr create', and auto-merge to 'main' via 'gh pr merge --squash --delete-branch --auto || gh pr merge --squash --delete-branch'.${tagInstruction}`;
}

// Check Sprint Status
export function getSprintStatus() {
  // Sprints up to P03-S07 are completed
  const completedCutoffIndex = SPRINT_REGISTRY.findIndex(
    (s) => s.id === "P03-S07"
  );
  return SPRINT_REGISTRY.map((s, idx) => ({
    ...s,
    completed: idx <= completedCutoffIndex,
    isNext: idx === completedCutoffIndex + 1,
  }));
}

// CLI Command Handlers
const [, , command, targetSprintId] = process.argv;

if (command === "status" || !command) {
  console.log("\n======================================================");
  console.log("♟️  ChessForge Sprint Lifecycle & Automation Status");
  console.log("======================================================\n");
  const statuses = getSprintStatus();
  for (const s of statuses) {
    const mark = s.completed
      ? "✅ [COMPLETED]"
      : s.isNext
        ? "👉 [NEXT UP]   "
        : "⏳ [PLANNED]   ";
    console.log(
      `${mark} Phase ${s.phase} · Sprint ${s.sprint} (${s.id}): ${s.name}`
    );
  }
  const next = statuses.find((s) => s.isNext);
  console.log("\n------------------------------------------------------");
  console.log(
    `🎯 Next Sprint to Execute: Phase ${next.phase} · Sprint ${next.sprint} (${next.id}): ${next.name}`
  );
  console.log(
    `💡 To generate the exact kickoff prompt for the next chat, run:`
  );
  console.log(`   node scripts/sprint_orchestrator.mjs prompt ${next.id}`);
  console.log("------------------------------------------------------\n");
} else if (command === "prompt") {
  const sprintId = targetSprintId || "P04-S01";
  const sprint = SPRINT_REGISTRY.find(
    (s) => s.id.toLowerCase() === sprintId.toLowerCase()
  );
  if (!sprint) {
    console.error(`❌ Unknown Sprint ID: ${sprintId}`);
    process.exit(1);
  }
  console.log("\n======================================================");
  console.log(`📋 Antigravity Chat Prompt for ${sprint.id}: ${sprint.name}`);
  console.log("======================================================\n");
  console.log(generateSprintPrompt(sprint));
  console.log("\n======================================================");
  console.log(
    "👉 Copy the prompt above and paste it into a fresh Antigravity chat!"
  );
  console.log("======================================================\n");
} else if (command === "verify-gates") {
  console.log("\n🛡️  Executing Complete Quality Gate Pipeline...");
  run("npm run lint");
  run("npm run typecheck");
  run("npm run format:check");
  run("npm test");
  run("npm run test:e2e");
  run("npm run build");
  console.log("\n✅ 100% Green Quality Gates Passed!");
} else if (command === "auto-merge") {
  console.log("\n🚀 Auto-merging open PR and syncing main branch...");
  run(
    "gh pr merge --squash --delete-branch --auto || gh pr merge --squash --delete-branch"
  );
  run("git checkout main");
  run("git pull origin main");
  console.log("\n✅ PR merged and main branch synchronized.");
} else if (command === "tag-phase") {
  const phaseNum = targetSprintId || "03";
  const tagName = `v0.${parseInt(phaseNum, 10)}.0`;
  console.log(
    `\n🏷️ Creating Git and GitHub Release Tag ${tagName} for Phase ${phaseNum}...`
  );
  run(
    `git tag -a ${tagName} -m "Release ${tagName}: Phase ${phaseNum} Complete"`
  );
  run(`git push origin ${tagName}`);
  run(
    `gh release create ${tagName} --title "${tagName}: Phase ${phaseNum} Complete" --notes "Phase ${phaseNum} milestone automatically verified and released."`
  );
  console.log(`\n🎉 Release ${tagName} successfully published!`);
}
