export function normalizeVersion(rawVersion?: string): string;
export function parseReleaseNotes(
  markdownContent: string,
  targetVersion: string
): string;
export function extractReleaseNotesFromFile(
  filePath: string,
  targetVersion: string
): string;
