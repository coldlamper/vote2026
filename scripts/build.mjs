import { readFile, rm, mkdir, writeFile, cp } from 'node:fs/promises';
import { validateContent } from '../src/content.mjs';
import { renderHome, renderCandidate } from '../src/render.mjs';

const root = new URL('../', import.meta.url);
const data = JSON.parse(await readFile(new URL('data/election.json', root)));
validateContent(data);
const dist = new URL('dist/', root);
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(new URL('public/', root), dist, { recursive: true });
await writeFile(new URL('index.html', dist), renderHome(data));
for (const candidate of data.candidates) {
  const dir = new URL(`candidates/${candidate.id}/`, dist);
  await mkdir(dir, { recursive: true });
  await writeFile(new URL('index.html', dir), renderCandidate(data, candidate));
}
console.log(`Built 1 guide and ${data.candidates.length} candidate profiles.`);
