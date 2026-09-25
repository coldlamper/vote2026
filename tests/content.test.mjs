import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateContent } from '../src/content.mjs';

const fixture = JSON.parse(await readFile(new URL('../data/election.json', import.meta.url)));

test('accepts the curated election content', () => {
  assert.equal(validateContent(structuredClone(fixture)), true);
});

test('rejects duplicate candidate ids', () => {
  const data = structuredClone(fixture);
  data.candidates[1].id = data.candidates[0].id;
  assert.throws(() => validateContent(data), /duplicate candidate/i);
});

test('rejects a candidate assigned to an unknown race', () => {
  const data = structuredClone(fixture);
  data.candidates[0].raceId = 'missing-race';
  assert.throws(() => validateContent(data), /unknown race/i);
});

test('rejects unknown source references', () => {
  const data = structuredClone(fixture);
  data.candidates[0].positions[0].sourceIds = ['not-a-source'];
  assert.throws(() => validateContent(data), /unknown source/i);
});

test('rejects unsafe source urls', () => {
  const data = structuredClone(fixture);
  data.sources[0].url = 'javascript:alert(1)';
  assert.throws(() => validateContent(data), /http/i);
});

test('rejects missing candidate review dates', () => {
  const data = structuredClone(fixture);
  delete data.candidates[0].reviewedAt;
  assert.throws(() => validateContent(data), /reviewedAt/i);
});

test('rejects unsafe ids used in output paths', () => {
  const data = structuredClone(fixture);
  data.candidates[0].id = '../escape';
  assert.throws(() => validateContent(data), /safe id/i);
});
