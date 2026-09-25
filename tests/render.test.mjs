import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderHome, renderCandidate } from '../src/render.mjs';

const fixture = JSON.parse(await readFile(new URL('../data/election.json', import.meta.url)));

test('home renders election scope, lookup, races, candidates and referenda', () => {
  const html = renderHome(fixture);
  assert.match(html, /Carolina Beach Votes 2026/);
  assert.match(html, /vt\.ncsbe\.gov\/RegLkup/);
  assert.match(html, /U\.S\. Senate/);
  assert.match(html, /Michael Dublin/);
  assert.match(html, /School bonds/);
  assert.match(html, /Skip to candidate guide/);
  assert.match(html, /class="candidate-details"/);
  assert.match(html, /Age/);
  assert.match(html, /What a yes vote does/);
  assert.doesNotMatch(html, /overflow-x:auto/);
  assert.match(html, /class="candidate-top"/);
  assert.match(html, /class="candidate-details"/);
  assert.ok(html.indexOf('>Roy Cooper<') < html.indexOf('>Democratic<'));
});

test('candidate page has back link, positions and sources', () => {
  const candidate = fixture.candidates.find((item) => item.id === 'roy-cooper');
  const html = renderCandidate(fixture, candidate);
  assert.match(html, /\.\.\/\.\.\/index\.html#us-senate/);
  assert.match(html, /Health care/);
  assert.match(html, /Sources/);
  assert.match(html, /roycooper\.com/);
});

test('rendering escapes candidate-controlled text', () => {
  const data = structuredClone(fixture);
  const candidate = structuredClone(data.candidates[0]);
  candidate.name = 'A & B <Example>';
  const html = renderCandidate(data, candidate);
  assert.match(html, /A &amp; B &lt;Example&gt;/);
  assert.doesNotMatch(html, /<Example>/);
});

test('candidate without a photo receives an initials portrait', () => {
  const candidate = fixture.candidates.find((item) => item.id === 'maad-abu-ghazalah');
  const html = renderCandidate(fixture, candidate);
  assert.match(html, /class="portrait-fallback"/);
  assert.match(html, />MA</);
});

test('fallback initials are escaped', () => {
  const candidate = structuredClone(fixture.candidates[0]);
  candidate.name = '<script> Example';
  delete candidate.photo;
  const html = renderCandidate(fixture, candidate);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;E/);
});

test('voting dates cite the official election source', () => {
  const html = renderHome(fixture);
  const schedule = html.slice(html.indexOf('class="schedule"'), html.indexOf('class="race-nav"'));
  assert.match(schedule, /New Hanover County Board of Elections/);
});

test('home orders candidates alphabetically within each race', () => {
  const html = renderHome(fixture);
  const senate = html.slice(html.indexOf('id="us-senate"'), html.indexOf('id="us-house-7"'));
  assert.ok(senate.indexOf('Michael Dublin') < senate.indexOf('Roy Cooper'));
  assert.ok(senate.indexOf('Roy Cooper') < senate.indexOf('Shannon W. Bray'));
});

test('race navigation scrolls with the page on mobile', async () => {
  const css = await readFile(new URL('../public/styles.css', import.meta.url), 'utf8');
  const raceNavRules = css.match(/\.race-nav\{[^}]*\}/g) || [];
  assert.ok(raceNavRules.some((rule) => /position:static/.test(rule)));
});
