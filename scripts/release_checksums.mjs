#!/usr/bin/env node
/**
 * ChessForge Release Checksums Utility
 * Computes, formats, and verifies SHA-256 checksums for release distribution packages.
 * Standard format: <lowercase_sha256_hash>  <filename> (GNU coreutils compatible)
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Calculates SHA-256 hash of a file synchronously.
 * @param {string} filePath - Path to file.
 * @returns {string} - Lowercase 64-character hex hash.
 */
export function calculateFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto
    .createHash("sha256")
    .update(fileBuffer)
    .digest("hex")
    .toLowerCase();
}

/**
 * Formats a single checksum line.
 * @param {string} hash - SHA-256 hash.
 * @param {string} filename - Base filename or relative path.
 * @returns {string} - Formatted line.
 */
export function formatChecksumLine(hash, filename) {
  return `${hash}  ${filename}`;
}

/**
 * Scans a directory recursively for release bundle files.
 * @param {string} dirPath - Directory to scan.
 * @param {string[]} [extensions=['.exe', '.msi', '.zip', '.tar.gz']] - Target file extensions.
 * @returns {string[]} - List of absolute file paths found.
 */
export function scanReleaseFiles(
  dirPath,
  extensions = [".exe", ".msi", ".zip", ".tar.gz"]
) {
  const results = [];
  if (!fs.existsSync(dirPath)) {
    return results;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...scanReleaseFiles(fullPath, extensions));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      // Skip checksums file itself
      if (entry.name === "checksums.txt" || entry.name.endsWith(".sha256")) {
        continue;
      }
      if (extensions.length === 0 || extensions.includes(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

/**
 * Generates SHA-256 checksums for all release files in a directory.
 * @param {string} dirPath - Source directory.
 * @param {object} [options] - Configuration options.
 * @param {string[]} [options.extensions] - Target extensions.
 * @param {boolean} [options.useBasename=true] - Use only filename in line vs relative path.
 * @returns {{ entries: Array<{ filePath: string, filename: string, hash: string, line: string }>, content: string }}
 */
export function generateChecksums(dirPath, options = {}) {
  const extensions = options.extensions || [".exe", ".msi", ".zip", ".tar.gz"];
  const useBasename = options.useBasename !== false;
  const files = scanReleaseFiles(dirPath, extensions);

  // Sort files for deterministic output
  files.sort((a, b) => a.localeCompare(b));

  const entries = files.map((file) => {
    const hash = calculateFileHash(file);
    const filename = useBasename
      ? path.basename(file)
      : path.relative(dirPath, file).replace(/\\/g, "/");
    const line = formatChecksumLine(hash, filename);
    return { filePath: file, filename, hash, line };
  });

  const content =
    entries.map((e) => e.line).join("\n") + (entries.length > 0 ? "\n" : "");
  return { entries, content };
}

/**
 * Writes formatted checksums content to a file.
 * @param {string} outputPath - Target file path.
 * @param {string} content - Checksum content string.
 */
export function writeChecksumsFile(outputPath, content) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, content, "utf8");
}

/**
 * Parses and verifies a checksums.txt file against files in a target directory.
 * @param {string} checksumFilePath - Path to checksums.txt.
 * @param {string} baseDir - Directory where target files reside.
 * @returns {{ total: number, passed: number, failed: number, missing: number, details: Array<{ filename: string, expected: string, actual?: string, status: 'OK' | 'FAILED' | 'MISSING' }> }}
 */
export function verifyChecksumsFile(checksumFilePath, baseDir) {
  if (!fs.existsSync(checksumFilePath)) {
    throw new Error(`Checksum file not found: ${checksumFilePath}`);
  }

  const rawContent = fs.readFileSync(checksumFilePath, "utf8");
  const lines = rawContent.split(/\r?\n/).filter((l) => l.trim().length > 0);

  const details = [];
  let passed = 0;
  let failed = 0;
  let missing = 0;

  for (const line of lines) {
    // Standard format: <hash>  <filename> or <hash> *<filename>
    const match = line.match(/^([a-fA-F0-9]{64})\s+[*]?(.+)$/);
    if (!match) {
      continue;
    }

    const expectedHash = match[1].toLowerCase();
    const filename = match[2].trim();

    // Look for file directly in baseDir or recursively
    let targetPath = path.join(baseDir, filename);
    if (!fs.existsSync(targetPath)) {
      // Check recursive scan if not found at root
      const candidates = scanReleaseFiles(baseDir, []).filter(
        (f) => path.basename(f) === filename
      );
      if (candidates.length > 0) {
        targetPath = candidates[0];
      }
    }

    if (!fs.existsSync(targetPath)) {
      missing++;
      details.push({ filename, expected: expectedHash, status: "MISSING" });
    } else {
      const actualHash = calculateFileHash(targetPath);
      if (actualHash === expectedHash) {
        passed++;
        details.push({
          filename,
          expected: expectedHash,
          actual: actualHash,
          status: "OK",
        });
      } else {
        failed++;
        details.push({
          filename,
          expected: expectedHash,
          actual: actualHash,
          status: "FAILED",
        });
      }
    }
  }

  return {
    total: details.length,
    passed,
    failed,
    missing,
    details,
  };
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
  let dir = "";
  let output = "";
  let verifyFile = "";
  let help = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--dir" && args[i + 1]) dir = args[++i];
    else if (args[i] === "--output" && args[i + 1]) output = args[++i];
    else if (args[i] === "--verify" && args[i + 1]) verifyFile = args[++i];
    else if (args[i] === "--help" || args[i] === "-h") help = true;
  }

  if (help || (!dir && !verifyFile)) {
    console.log(`
ChessForge Release Checksums Tool
Usage:
  Generate: node scripts/release_checksums.mjs --dir <bundle_dir> [--output <output_path>]
  Verify:   node scripts/release_checksums.mjs --verify <checksums_path> --dir <bundle_dir>
`);
    process.exit(0);
  }

  if (verifyFile) {
    const targetDir = dir || path.dirname(verifyFile);
    console.log(
      `Verifying checksums in ${verifyFile} against directory ${targetDir}...`
    );
    const result = verifyChecksumsFile(verifyFile, targetDir);
    for (const item of result.details) {
      console.log(`  [${item.status}] ${item.filename}`);
    }
    console.log(
      `Summary: Total: ${result.total}, Passed: ${result.passed}, Failed: ${result.failed}, Missing: ${result.missing}`
    );
    if (result.failed > 0 || result.missing > 0) {
      process.exit(1);
    }
  } else if (dir) {
    const outputPath = output || path.join(dir, "checksums.txt");
    console.log(`Generating SHA-256 checksums for files in ${dir}...`);
    const result = generateChecksums(dir);
    writeChecksumsFile(outputPath, result.content);
    console.log(`Wrote ${result.entries.length} checksums to ${outputPath}`);
    for (const entry of result.entries) {
      console.log(`  ${entry.line}`);
    }
  }
}
