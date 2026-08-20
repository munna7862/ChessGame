/**
 * ChessForge Release Notes Extractor
 * Extracts version-specific release notes from RELEASE_NOTES.md or CHANGELOG.md
 * for automated GitHub Release body publication.
 */

import fs from "node:fs";
import path from "node:path";

/**
 * Normalizes a version string by stripping leading 'v' or 'release/'.
 * @param {string} rawVersion - Version string (e.g. 'v1.0.0', '1.0.0', 'refs/tags/v1.0.0').
 * @returns {string} - Clean version number (e.g. '1.0.0').
 */
export function normalizeVersion(rawVersion) {
  if (!rawVersion) return "1.0.0";
  let cleaned = rawVersion.trim();
  cleaned = cleaned.replace(/^refs\/tags\//i, "");
  cleaned = cleaned.replace(/^v(?=\d)/i, "");
  return cleaned;
}

/**
 * Extracts release notes content for a target version from markdown.
 * @param {string} markdownContent - Raw markdown text.
 * @param {string} targetVersion - Target semantic version (e.g. '1.0.0').
 * @returns {string} - Extracted markdown section.
 */
export function parseReleaseNotes(markdownContent, targetVersion) {
  const cleanVer = normalizeVersion(targetVersion);
  const lines = markdownContent.split(/\r?\n/);

  // Attempt 1: Look for exact version header match, e.g. `# ChessForge v1.0.0 Release Notes` or `## [1.0.0]` or `## 1.0.0`
  const versionRegex = new RegExp(
    `(^|\\s|\\[|v)${cleanVer.replace(/\./g, "\\.")}(\\]|\\s|$|-)`,
    "i"
  );

  let capturing = false;
  let capturedLines = [];
  let headerLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);

    if (headerMatch) {
      const level = headerMatch[1].length;
      const title = headerMatch[2];

      if (capturing) {
        // If we hit another header of same or higher level, stop capturing (except subheaders of top-level document)
        if (level <= headerLevel) {
          break;
        }
      }

      if (!capturing && versionRegex.test(title)) {
        capturing = true;
        headerLevel = level;
        capturedLines.push(line);
        continue;
      }
    }

    if (capturing) {
      capturedLines.push(line);
    }
  }

  if (capturedLines.length > 0) {
    return capturedLines.join("\n").trim();
  }

  // Fallback: If no version header matched, return the entire document or executive summary
  return markdownContent.trim();
}

/**
 * Extracts release notes from file path.
 * @param {string} filePath - Path to markdown file.
 * @param {string} targetVersion - Target version string.
 * @returns {string} - Extracted release notes text.
 */
export function extractReleaseNotesFromFile(filePath, targetVersion) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Release notes file not found: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf8");
  return parseReleaseNotes(content, targetVersion);
}

// CLI Execution Support
const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(
      new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/i, "$1")
    );

if (isDirectRun || process.argv.includes("--run-cli")) {
  const args = process.argv.slice(2);
  let filePath = "RELEASE_NOTES.md";
  let version = "1.0.0";
  let outputPath = "";
  let help = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--file" && args[i + 1]) filePath = args[++i];
    else if ((args[i] === "--version" || args[i] === "--tag") && args[i + 1])
      version = args[++i];
    else if (args[i] === "--output" && args[i + 1]) outputPath = args[++i];
    else if (args[i] === "--help" || args[i] === "-h") help = true;
  }

  if (help) {
    console.log(`
ChessForge Release Notes Extractor
Usage:
  node scripts/extract_release_notes.mjs [--file <path>] [--version <ver>] [--output <path>]
`);
    process.exit(0);
  }

  try {
    const notes = extractReleaseNotesFromFile(filePath, version);
    if (outputPath) {
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(outputPath, notes, "utf8");
      console.log(
        `Successfully wrote extracted release notes for v${normalizeVersion(version)} to ${outputPath}`
      );
    } else {
      console.log(notes);
    }
  } catch (err) {
    console.error(`Error extracting release notes: ${err.message}`);
    process.exit(1);
  }
}
