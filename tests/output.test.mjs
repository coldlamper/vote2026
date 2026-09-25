import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { checkOutput } from '../scripts/check-output.mjs';

test('accepts valid directory links and fragment targets', async () => {
  const root = await mkdtemp(join(tmpdir(), 'vote-output-'));
  await mkdir(join(root, 'candidate'));
  await writeFile(join(root, 'index.html'), '<a href="candidate/index.html#bio">Profile</a>');
  await writeFile(join(root, 'candidate', 'index.html'), '<h1 id="bio">Bio</h1><link rel="stylesheet" href="../styles.css">');
  await writeFile(join(root, 'styles.css'), 'body{}');
  assert.deepEqual(await checkOutput(root), { files: 3, links: 2 });
});

test('accepts a file URL as the output root', async () => {
  const root = await mkdtemp(join(tmpdir(), 'vote-output-'));
  await writeFile(join(root, 'index.html'), '<h1>Guide</h1>');
  assert.deepEqual(await checkOutput(pathToFileURL(`${root}/`)), { files: 1, links: 0 });
});

test('rejects a missing local asset', async () => {
  const root = await mkdtemp(join(tmpdir(), 'vote-output-'));
  await writeFile(join(root, 'index.html'), '<img src="missing.jpg" alt="">');
  await assert.rejects(() => checkOutput(root), /missing local target/i);
});

test('rejects a missing fragment target', async () => {
  const root = await mkdtemp(join(tmpdir(), 'vote-output-'));
  await writeFile(join(root, 'index.html'), '<a href="#missing">Jump</a>');
  await assert.rejects(() => checkOutput(root), /missing fragment/i);
});

test('rejects links that escape the generated site', async () => {
  const root = await mkdtemp(join(tmpdir(), 'vote-output-'));
  await writeFile(join(root, 'index.html'), '<a href="../secret.txt">Bad</a>');
  await assert.rejects(() => checkOutput(root), /escapes generated site/i);
});
