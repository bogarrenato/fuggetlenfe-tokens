/*
  Offline snapshot source.

  Reads a committed Figma Variables API payload from disk. This is the
  `Fallback 1` layer documented in the platform README: when the live Variables
  API is unreachable (or when the token cannot read Variables on a non-Enterprise
  plan), the sync reads the last known-good export and regenerates identical
  downstream artifacts.

  The snapshot is written automatically after a successful live Variables API
  call, so the first successful sync by an operator with Enterprise access
  bootstraps this fallback for every subsequent CI run.
*/

import { readFile, stat } from 'node:fs/promises';

export class SnapshotMissingError extends Error {
  constructor(path) {
    super(
      `Figma snapshot not found at ${path}. Run an authenticated variables-api sync first (with a token that can read Variables) to bootstrap the snapshot, or copy one in from a trusted source.`
    );
    this.name = 'SnapshotMissingError';
    this.path = path;
  }
}

export class SnapshotParseError extends Error {
  constructor(path, cause) {
    super(`Figma snapshot at ${path} is not valid JSON: ${cause?.message ?? cause}.`);
    this.name = 'SnapshotParseError';
    this.path = path;
    this.cause = cause;
  }
}

export async function loadFromSnapshot({ path }) {
  if (!path) {
    throw new Error('loadFromSnapshot requires a path.');
  }

  let stats;
  try {
    stats = await stat(path);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      throw new SnapshotMissingError(path);
    }
    throw error;
  }

  const raw = await readFile(path, 'utf8');

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new SnapshotParseError(path, error);
  }

  // A snapshot is either the raw variables-api response (new shape produced by
  // the orchestrator) or the legacy direct payload. Accept both.
  const variablePayload = parsed?.variablePayload ?? parsed;

  return {
    variablePayload,
    source: {
      strategy: 'snapshot',
      snapshotPath: path,
      snapshotCapturedAt: parsed?.capturedAt ?? parsed?.source?.fetchedAt ?? null,
      snapshotSize: stats.size,
      snapshotMtime: stats.mtime.toISOString()
    }
  };
}
