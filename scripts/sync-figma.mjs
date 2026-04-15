/*
  Token sync orchestrator.

  This is the only CLI entry point for regenerating the published token contract
  and the official brand packs. It is intentionally thin:

    1. Load the Figma Source Manifest (`src/figma-source-manifest.json`) to
       pin which file + captured snapshot the sync is aligned to.
    2. Pick a source — `variables-api` (default) or `snapshot` — via the
       FIGMA_SOURCE env var. This is what makes the pipeline runnable on
       non-Enterprise Figma plans: the snapshot source needs no network access.
    3. Hand the resulting variablePayload to the pure `buildTokensFromVariablePayload`
       core, which is covered by unit tests and does all of the semantic
       resolution work.
    4. Persist the generated artifacts under src/ and brand-styles/src/.
    5. On a successful variables-api call, also write tokens/figma-snapshot.json
       so subsequent CI runs can regenerate from the snapshot without requiring
       the Enterprise-gated scope.

  Adding a new source is a matter of dropping a module into src/sources/ and
  wiring it into the switch below. Keep all parsing/resolution logic out of
  this file — it belongs in src/sync-core.mjs.
*/

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildGeneratedArtifacts,
  buildTokensFromVariablePayload
} from '../src/sync-core.mjs';
import {
  loadFromVariablesApi,
  VariablesApiAuthError,
  VariablesApiResponseError
} from '../src/sources/variables-api.mjs';
import { loadFromSnapshot, SnapshotMissingError } from '../src/sources/snapshot.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tokensDir = path.join(repoRoot, 'src');
const brandStylesDir = path.join(repoRoot, 'brand-styles', 'src');
const snapshotPath = path.join(repoRoot, 'tokens', 'figma-snapshot.json');
const manifestPath = path.join(repoRoot, 'src', 'figma-source-manifest.json');

const manifest = await loadManifest(manifestPath);
const figmaFileKey = manifest?.figma?.fileKey ?? process.env.FIGMA_FILE_KEY;

if (!figmaFileKey) {
  console.error(
    'Could not determine the Figma file key. Ensure src/figma-source-manifest.json has figma.fileKey set, or export FIGMA_FILE_KEY.'
  );
  process.exit(1);
}

const selectedSource = (process.env.FIGMA_SOURCE ?? 'variables-api').toLowerCase();

let sourceResult;
try {
  sourceResult = await runSource(selectedSource);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const tokens = buildTokensFromVariablePayload(sourceResult.variablePayload, {
  figmaFileKey,
  syncedAt: new Date().toISOString()
});

tokens.meta.source = {
  ...tokens.meta.source,
  ...sourceResult.source,
  manifest: manifest
    ? {
        fileKey: manifest.figma?.fileKey,
        fileVersion: manifest.figma?.fileVersion,
        capturedAt: manifest.figma?.capturedAt,
        version: manifest.version
      }
    : null
};

const generatedArtifacts = buildGeneratedArtifacts(tokens);

await mkdir(tokensDir, { recursive: true });
await mkdir(brandStylesDir, { recursive: true });

await writeFile(path.join(tokensDir, 'tokens.json'), generatedArtifacts.tokensJson);
await writeFile(path.join(tokensDir, 'contract.css'), generatedArtifacts.contractCss);
await writeFile(path.join(tokensDir, 'figma-preset.css'), generatedArtifacts.figmaPresetCss);
await writeFile(path.join(tokensDir, 'theme.css'), generatedArtifacts.themeCss);
await writeFile(path.join(tokensDir, 'index.js'), generatedArtifacts.indexJs);
await writeFile(path.join(tokensDir, 'index.d.ts'), generatedArtifacts.indexTypes);

for (const [fileName, stylesheetContent] of Object.entries(generatedArtifacts.brandStyles)) {
  await writeFile(path.join(brandStylesDir, fileName), stylesheetContent);
}

if (sourceResult.source.strategy === 'variables-api') {
  await mkdir(path.dirname(snapshotPath), { recursive: true });
  const snapshotRecord = {
    capturedAt: sourceResult.source.fetchedAt,
    figmaFileKey,
    note:
      'Snapshot of the Figma /v1/files/:key/variables/local response. Consumed by src/sources/snapshot.mjs when FIGMA_SOURCE=snapshot. Regenerated automatically on every successful variables-api sync.',
    variablePayload: sourceResult.variablePayload
  };
  await writeFile(snapshotPath, `${JSON.stringify(snapshotRecord, null, 2)}\n`);
  console.log(`Wrote Figma snapshot fallback to ${snapshotPath}`);
}

console.log(`Synced Figma variables to ${tokensDir} via source: ${sourceResult.source.strategy}`);
console.log(`Generated official brand packs in ${brandStylesDir}`);

async function runSource(sourceName) {
  switch (sourceName) {
    case 'variables-api': {
      const token = process.env.FIGMA_TOKEN ?? process.env.FIGMA_OAUTH_TOKEN;
      try {
        return await loadFromVariablesApi({ fileKey: figmaFileKey, token });
      } catch (error) {
        if (error instanceof VariablesApiAuthError) {
          throw new Error(
            `${error.message}\n\nHint: FIGMA_SOURCE=snapshot will regenerate identical artifacts from tokens/figma-snapshot.json without requiring any Figma credentials.`
          );
        }
        if (error instanceof VariablesApiResponseError) {
          throw new Error(
            `Variables API request failed (${error.status ?? 'unknown status'}): ${error.message}\n\nHint: FIGMA_SOURCE=snapshot is the offline fallback.`
          );
        }
        throw error;
      }
    }
    case 'snapshot': {
      try {
        return await loadFromSnapshot({ path: snapshotPath });
      } catch (error) {
        if (error instanceof SnapshotMissingError) {
          throw new Error(
            `${error.message}\n\nHint: run FIGMA_SOURCE=variables-api FIGMA_TOKEN=... npm run figma:sync once with a token that can read Variables to bootstrap the snapshot.`
          );
        }
        throw error;
      }
    }
    default:
      throw new Error(
        `Unknown FIGMA_SOURCE="${sourceName}". Valid values: variables-api (default), snapshot.`
      );
  }
}

async function loadManifest(manifestFilePath) {
  try {
    const raw = await readFile(manifestFilePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}
