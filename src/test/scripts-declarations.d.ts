declare module "*/release_checksums.mjs" {
  export interface ChecksumEntry {
    filePath: string;
    filename: string;
    hash: string;
    line: string;
  }

  export interface ChecksumResult {
    entries: ChecksumEntry[];
    content: string;
  }

  export interface ChecksumVerifyDetail {
    filename: string;
    expected: string;
    actual?: string;
    status: "OK" | "FAILED" | "MISSING";
  }

  export interface ChecksumVerifyResult {
    total: number;
    passed: number;
    failed: number;
    missing: number;
    details: ChecksumVerifyDetail[];
  }

  export interface GenerateChecksumsOptions {
    extensions?: string[];
    useBasename?: boolean;
  }

  export function calculateFileHash(filePath: string): string;
  export function formatChecksumLine(hash: string, filename: string): string;
  export function scanReleaseFiles(
    dirPath: string,
    extensions?: string[]
  ): string[];
  export function generateChecksums(
    dirPath: string,
    options?: GenerateChecksumsOptions
  ): ChecksumResult;
  export function writeChecksumsFile(outputPath: string, content: string): void;
  export function verifyChecksumsFile(
    checksumFilePath: string,
    baseDir: string
  ): ChecksumVerifyResult;
}

declare module "*/extract_release_notes.mjs" {
  export function normalizeVersion(rawVersion?: string): string;
  export function parseReleaseNotes(
    markdownContent: string,
    targetVersion: string
  ): string;
  export function extractReleaseNotesFromFile(
    filePath: string,
    targetVersion: string
  ): string;
}
