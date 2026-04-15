import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  loadFromVariablesApi,
  VariablesApiAuthError,
  VariablesApiResponseError
} from '../src/sources/variables-api.mjs';
import {
  loadFromSnapshot,
  SnapshotMissingError,
  SnapshotParseError
} from '../src/sources/snapshot.mjs';

test('loadFromVariablesApi throws VariablesApiAuthError when the token is missing', async () => {
  await assert.rejects(
    () => loadFromVariablesApi({ fileKey: 'abc', token: '' }),
    VariablesApiAuthError
  );
});

test('loadFromVariablesApi surfaces the Enterprise scope gate as an auth error', async () => {
  const stubFetch = async () =>
    new Response(
      JSON.stringify({
        status: 403,
        message: 'Invalid scope(s): file_variables:read. The token requires the scope.'
      }),
      { status: 403, statusText: 'Forbidden' }
    );

  await assert.rejects(
    () => loadFromVariablesApi({ fileKey: 'abc', token: 'figd_xxx', fetchImpl: stubFetch }),
    (error) => error instanceof VariablesApiAuthError && /Enterprise-gated/.test(error.message)
  );
});

test('loadFromVariablesApi surfaces non-auth failures as VariablesApiResponseError', async () => {
  const stubFetch = async () =>
    new Response(JSON.stringify({ message: 'Temporarily unavailable.' }), {
      status: 503,
      statusText: 'Service Unavailable'
    });

  await assert.rejects(
    () => loadFromVariablesApi({ fileKey: 'abc', token: 'figd_xxx', fetchImpl: stubFetch }),
    (error) => error instanceof VariablesApiResponseError && error.status === 503
  );
});

test('loadFromVariablesApi returns a variablePayload + source record on success', async () => {
  const payload = { meta: { variables: {}, variableCollections: {} } };
  const stubFetch = async () =>
    new Response(JSON.stringify(payload), { status: 200, statusText: 'OK' });

  const result = await loadFromVariablesApi({
    fileKey: 'abc',
    token: 'figd_xxx',
    fetchImpl: stubFetch
  });

  assert.deepEqual(result.variablePayload, payload);
  assert.equal(result.source.strategy, 'variables-api');
  assert.match(result.source.fetchedAt, /\d{4}-\d{2}-\d{2}T/);
});

test('loadFromSnapshot reads a committed snapshot and unwraps the variablePayload', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'ff-snapshot-'));
  try {
    const snapshotFile = path.join(dir, 'figma-snapshot.json');
    const record = {
      capturedAt: '2026-04-15T00:00:00.000Z',
      variablePayload: { meta: { variables: {}, variableCollections: {} } }
    };
    await writeFile(snapshotFile, JSON.stringify(record));

    const result = await loadFromSnapshot({ path: snapshotFile });
    assert.deepEqual(result.variablePayload, record.variablePayload);
    assert.equal(result.source.strategy, 'snapshot');
    assert.equal(result.source.snapshotCapturedAt, record.capturedAt);
    assert.equal(result.source.snapshotPath, snapshotFile);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('loadFromSnapshot accepts a raw legacy payload shape without the variablePayload wrapper', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'ff-snapshot-'));
  try {
    const snapshotFile = path.join(dir, 'figma-snapshot.json');
    const rawPayload = { meta: { variables: {}, variableCollections: {} } };
    await writeFile(snapshotFile, JSON.stringify(rawPayload));

    const result = await loadFromSnapshot({ path: snapshotFile });
    assert.deepEqual(result.variablePayload, rawPayload);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('loadFromSnapshot throws SnapshotMissingError when the file is absent', async () => {
  await assert.rejects(
    () => loadFromSnapshot({ path: '/nonexistent/path/figma-snapshot.json' }),
    SnapshotMissingError
  );
});

test('loadFromSnapshot throws SnapshotParseError on invalid JSON', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'ff-snapshot-'));
  try {
    const snapshotFile = path.join(dir, 'figma-snapshot.json');
    await writeFile(snapshotFile, 'not valid json');

    await assert.rejects(() => loadFromSnapshot({ path: snapshotFile }), SnapshotParseError);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
