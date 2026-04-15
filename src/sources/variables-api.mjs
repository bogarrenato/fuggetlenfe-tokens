/*
  Figma Variables API source.

  Wraps the `/v1/files/:key/variables/local` endpoint. Requires a Figma token
  with the `file_variables:read` scope. That scope is currently Enterprise-gated,
  so the orchestrator treats a 403 on this source as expected and falls back to
  the committed snapshot source — the sync is designed to remain operational
  even on non-Enterprise Figma plans.

  Keep this module network-only. Do not add parsing or token-building logic here;
  that belongs in `src/sync-core.mjs` and must remain pure for test parity.
*/

export class VariablesApiAuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'VariablesApiAuthError';
    this.kind = 'auth';
  }
}

export class VariablesApiResponseError extends Error {
  constructor(message, { status } = {}) {
    super(message);
    this.name = 'VariablesApiResponseError';
    this.kind = 'response';
    this.status = status;
  }
}

export async function loadFromVariablesApi({ fileKey, token, fetchImpl = fetch }) {
  if (!fileKey) {
    throw new Error('loadFromVariablesApi requires a Figma file key.');
  }
  if (!token) {
    throw new VariablesApiAuthError(
      'Missing Figma token. Set FIGMA_TOKEN (with file_variables:read scope) or switch to FIGMA_SOURCE=snapshot.'
    );
  }

  const response = await fetchImpl(`https://api.figma.com/v1/files/${fileKey}/variables/local`, {
    headers: { 'X-Figma-Token': token }
  });

  const responseText = await response.text();
  let parsedPayload;
  try {
    parsedPayload = JSON.parse(responseText);
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
      throw new VariablesApiAuthError(
        'The provided Figma token cannot read Variables. The file_variables:read scope is Enterprise-gated. Switch to FIGMA_SOURCE=snapshot to generate tokens from the committed fallback.'
      );
    }

    throw new VariablesApiResponseError(errorMessage, { status: response.status });
  }

  return {
    variablePayload: parsedPayload,
    source: {
      strategy: 'variables-api',
      fetchedAt: new Date().toISOString()
    }
  };
}
