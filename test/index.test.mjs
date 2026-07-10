import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import HookNotifier from '../dist/index.js';

// Capture fetch calls; each test resets `calls` and the canned response.
const calls = [];
let response;

const resetFetch = (body = { status: 'ok', id: 42 }, ok = true, status = 200) => {
  calls.length = 0;
  response = { ok, status, text: async () => JSON.stringify(body) };
};

globalThis.fetch = async (url, init) => {
  calls.push({ url, init });
  return response;
};

test('notify() posts JSON to the hook URL and returns the result', async () => {
  resetFetch();
  const hn = new HookNotifier({ identifier: 1671532023880, key: 'long-frost' });
  const res = await hn.notify({ object: 'Hello', body: 'World' });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://hooknotifier.com/1671532023880/long-frost');
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(calls[0].init.body), { object: 'Hello', body: 'World' });
  assert.deepEqual(res, { status: 'ok', id: 42 });
});

test('constructor validates identifier and key', () => {
  assert.throws(() => new HookNotifier({ key: 'k' }), /identifier required/);
  assert.throws(() => new HookNotifier({ identifier: 1 }), /key required/);
});

test('notify() rejects without object or body', async () => {
  resetFetch();
  const hn = new HookNotifier({ identifier: 1, key: 'k' });
  await assert.rejects(hn.notify({ body: 'no title' }), /object required/);
  await assert.rejects(hn.notify({ object: 'no body' }), /body required/);
  assert.equal(calls.length, 0);
});

test('constructor defaults merge into notify(), call-level values win', async () => {
  resetFetch();
  const hn = new HookNotifier({
    identifier: 1,
    key: 'k',
    defaults: { tags: 'ci', priority: 'high', sound: false },
  });
  await hn.notify({ object: 'Build', body: 'ok', priority: 'critical' });

  const sent = JSON.parse(calls[0].init.body);
  assert.equal(sent.tags, 'ci');
  assert.equal(sent.priority, 'critical');
  assert.equal(sent.sound, false);
});

test('tags array joins to a comma string, Date becomes ISO', async () => {
  resetFetch();
  const hn = new HookNotifier({ identifier: 1, key: 'k' });
  const when = new Date('2026-07-11T10:00:00.000Z');
  await hn.notify({ object: 'o', body: 'b', tags: ['alerts', 'deploys'], at: when });

  const sent = JSON.parse(calls[0].init.body);
  assert.equal(sent.tags, 'alerts,deploys');
  assert.equal(sent.at, '2026-07-11T10:00:00.000Z');
});

test('update() PUTs to /{id} with only the passed fields', async () => {
  resetFetch();
  const hn = new HookNotifier({ identifier: 1, key: 'k', defaults: { tags: 'ci' } });
  await hn.update(42, { body: 'progress 80%' });

  assert.equal(calls[0].url, 'https://hooknotifier.com/1/k/42');
  assert.equal(calls[0].init.method, 'PUT');
  assert.deepEqual(JSON.parse(calls[0].init.body), { body: 'progress 80%' });
});

test('API errors surface as thrown errors', async () => {
  resetFetch({ data: null, error: { status: 400, message: 'wrong identifiers.' } }, false, 400);
  const hn = new HookNotifier({ identifier: 1, key: 'bad' });
  await assert.rejects(hn.notify({ object: 'o', body: 'b' }), /wrong identifiers/);
});

test('static one-shot helper works', async () => {
  resetFetch();
  const res = await HookNotifier.notify({ identifier: 9, key: 'k', object: 'o', body: 'b', priority: 'low' });
  assert.equal(calls[0].url, 'https://hooknotifier.com/9/k');
  assert.deepEqual(JSON.parse(calls[0].init.body), { object: 'o', body: 'b', priority: 'low' });
  assert.deepEqual(res, { status: 'ok', id: 42 });
});

test('sendNotification() is a working 1.x alias', async () => {
  resetFetch();
  const hn = new HookNotifier({ identifier: 1, key: 'k' });
  const res = await hn.sendNotification({ object: 'o', body: 'b' });
  assert.deepEqual(res, { status: 'ok', id: 42 });
});

test('custom endpoint override (trailing slash tolerated)', async () => {
  resetFetch();
  const hn = new HookNotifier({ identifier: 1, key: 'k', endpoint: 'http://localhost:3000/' });
  await hn.notify({ object: 'o', body: 'b' });
  assert.equal(calls[0].url, 'http://localhost:3000/1/k');
});

test('CJS require() returns the class directly, like v1', () => {
  const require = createRequire(import.meta.url);
  const HN = require('../dist/index.cjs');
  assert.equal(typeof HN, 'function');
  const hn = new HN({ identifier: 1, key: 'k' });
  assert.equal(typeof hn.notify, 'function');
  assert.equal(typeof hn.sendNotification, 'function');
});
