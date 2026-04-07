import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildGeneratedArtifacts,
  buildTokensFromVariablePayload
} from '../src/sync-core.mjs';

const FIGMA_FILE_KEY = 'scEvsCrwxBBllYGMaz4vKH';
const FIGMA_TOKEN = process.env.FIGMA_TOKEN ?? process.env.FIGMA_OAUTH_TOKEN;

if (!FIGMA_TOKEN) {
  console.error('Missing FIGMA_TOKEN or FIGMA_OAUTH_TOKEN environment variable.');
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tokensDir = path.join(repoRoot, 'src');
const brandStylesDir = path.join(repoRoot, 'brand-styles', 'src');

const variablePayload = await fetchLocalVariables(FIGMA_FILE_KEY, FIGMA_TOKEN);
const tokens = buildTokensFromVariablePayload(variablePayload, {
  figmaFileKey: FIGMA_FILE_KEY,
  syncedAt: new Date().toISOString()
});
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

console.log(`Synced Figma variables to ${tokensDir}`);
console.log(`Generated official brand packs in ${brandStylesDir}`);

async function fetchLocalVariables(figmaFileKey, figmaToken) {
  const response = await fetch(`https://api.figma.com/v1/files/${figmaFileKey}/variables/local`, {
    headers: {
      'X-Figma-Token': figmaToken
    }
  });

  const responseBody = await response.text();
  let parsedPayload;

  try {
    parsedPayload = JSON.parse(responseBody);
  } catch {
    parsedPayload = null;
  }

  if (!response.ok) {
    const errorMessage =
      parsedPayload?.message ??
      `Figma variables fetch failed with ${response.status} ${response.statusText}.`;

    if (
      response.status === 403 &&
      typeof errorMessage === 'string' &&
      errorMessage.includes('file_variables:read')
    ) {
      throw new Error(
        'The provided Figma token cannot read Variables. Create a token with the "file_variables:read" scope and rerun pnpm figma:sync.'
      );
    }

    throw new Error(errorMessage);
  }

  return parsedPayload;
}
