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

test('rejects an unsafe ballot lookup url', () => {
  const data = structuredClone(fixture);
  data.site.ballotLookupUrl = 'javascript:alert(1)';
  assert.throws(() => validateContent(data), /ballotLookupUrl.*HTTP/i);
});

test('rejects unsafe photo paths and source urls', () => {
  const data = structuredClone(fixture);
  data.candidates[0].photo = {path:'../secret.jpg', credit:'Test', sourceUrl:'javascript:bad', reuseBasis:'Test'};
  assert.throws(() => validateContent(data), /photo path/i);
  data.candidates[0].photo.path = 'photos/test.jpg';
  assert.throws(() => validateContent(data), /photo sourceUrl.*HTTP/i);
});

test('rejects incomplete race and candidate fields', () => {
  const data = structuredClone(fixture);
  delete data.races[0].description;
  assert.throws(() => validateContent(data), /description/i);
  const data2 = structuredClone(fixture);
  delete data2.candidates[0].summary;
  assert.throws(() => validateContent(data2), /summary/i);
});

test('rejects unknown position kinds and voting source references', () => {
  const data = structuredClone(fixture);
  data.candidates[0].positions[0].kind = 'guess';
  assert.throws(() => validateContent(data), /position kind/i);
  const data2 = structuredClone(fixture);
  data2.voting[0].sourceIds = ['unknown'];
  assert.throws(() => validateContent(data2), /unknown source/i);
});
