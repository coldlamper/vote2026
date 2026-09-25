# Carolina Beach Votes 2026 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a sourced, accessible 2026 voter guide for Carolina Beach on coldlamper's GitHub Pages.

**Architecture:** A dependency-free Node.js generator reads structured election content and renders a static home page and individual candidate pages. Shared templates and CSS provide consistent presentation; GitHub Actions validates, builds, and publishes the generated directory.

**Tech Stack:** Node.js 22, ES modules, HTML, CSS, Node's built-in test runner, GitHub Pages.

**Spec:** ../specs/2026-09-25-carolina-beach-votes-design.md

## Global constraints

- Cover the November 3, 2026 general election.
- Establish the actual roster from current official candidate lists and sample ballots before authoring profiles.
- Do not infer a position from party membership, an endorsement, or silence.
- Never generate candidate likenesses.
- Do not request, collect, or store a reader's address or registration information.
- Body copy is at least 16px.
- Content and navigation work without client-side JavaScript.
- Candidate content is reviewed manually; no recurring automation is part of this scope.
- Publish to GitHub Pages under coldlamper; do not use Sites hosting.

## Review focus

1. A county ballot contains districts outside Carolina Beach: reconcile districts before including races.
2. A candidate has sparse sources or no reusable photo: show the precise gap without implying a political position.
3. A reader opens a profile directly under /vote2026/: links, CSS, and portraits must resolve.
4. A name or source contains HTML-significant characters: escape all text and validate external URL schemes.
5. A reader uses a narrow phone, keyboard, or enlarged text: preserve navigation, focus visibility, and readable content.

## File structure and interfaces

- `data/election.json`: election metadata, races, candidates, sources, voting facts, and photo credits.
- `docs/research/coverage.md`: ballot and district reconciliation, research limitations, and editorial review record.
- `src/content.mjs`: exports `validateContent(data)`; throws on invalid content.
- `src/render.mjs`: exports `renderHome(data)` and `renderCandidate(data, candidate)`; returns escaped HTML strings.
- `scripts/build.mjs`: validates content, copies public assets, and writes `dist/index.html` plus `dist/candidates/<id>/index.html`.
- `scripts/check-output.mjs`: checks every generated local link, fragment target, and referenced asset.
- `public/styles.css`, `public/favicon.svg`, `public/photos/`: presentation and documented photographs.
- `tests/content.test.mjs`, `tests/render.test.mjs`: meaningful content-integrity and output tests.
- `package.json`: commands `test`, `build`, and `check` using Node only.
- `.github/workflows/pages.yml`: test, build, output check, artifact upload, and Pages deployment.
- `README.md`: update instructions, local commands, publishing details, and editorial standards.
- `.gitignore`: exclude generated output and local temporary files.

Content contract: sources have `id`, `title`, `publisher`, `url`, and `reviewedAt`; races have `id`, `name`, `level`, `description`, `voteFor`, and `sourceIds`; candidates have `id`, `raceId`, `name`, `party`, `summary`, `biography`, `positions`, `record`, `sourceIds`, `reviewedAt`, and optional `photo`. Each position has `topic`, `text`, `kind` (campaign-statement, public-record, or not-found), and `sourceIds`. A photo has `path`, `credit`, `sourceUrl`, and `reuseBasis`. Any factual biography or record item has text and source references. Missing incumbency evidence is represented by omitting an incumbency claim.

## Task 1: Establish ballot coverage and research candidate content

**Files:** `data/election.json`, `docs/research/coverage.md`, `public/photos/`.

**Consumes:** Approved spec and official election publications.
**Produces:** Content matching the contract above, with a reconciled roster and authentic credited photographs.

- [ ] Open https://www.nhcgov.com/1076/2026-General-Election and inspect the published sample ballots. Establish the ballot styles and current legislative districts applicable to Carolina Beach using county maps or official precinct assignments.
- [ ] Compare those ballots with https://www.ncsbe.gov/results-data/candidate-lists. Record every applicable race, candidate, party, seat count, uncontested race, and referendum. Record source dates and resolve any discrepancy before claiming full coverage.
- [ ] Write the coverage record with a table of applicable offices, official ballot evidence, and candidate names. Explicitly explain the exclusion of regular municipal races based on the county's term schedule, while checking for special elections.
- [ ] Research each candidate using campaign issue pages, official biographies, legislative records, the state judicial voter guide, and reputable reporting where needed. Write original summaries with claim-level citations and consistent topic headings within each race.
- [ ] Locate real portraits and record source, credit, and reuse basis. Use an initials fallback only where a usable portrait cannot be obtained; document the limitation.
- [ ] Verify voting deadlines and official ballot lookup links. Avoid copying personal candidate contact or residential details from the filing data.
- [ ] Review coverage by comparing the final candidate IDs and race IDs against the independently recorded ballot table. Check every candidate for substantive biography and sourced positions or explicit source gaps.
- [ ] Commit only curated content, credited assets, and research notes.

## Task 2: Validate content and generate accessible pages

**Files:** `package.json`, `.gitignore`, `src/content.mjs`, `src/render.mjs`, `scripts/build.mjs`, `tests/content.test.mjs`, `tests/render.test.mjs`.

**Consumes:** `data/election.json`.
**Produces:** `dist/index.html` and `dist/candidates/<id>/index.html` with working relative links.

- [ ] Write content tests first using the real content as a valid fixture; clone it for mutations. Include duplicate IDs, unknown race IDs, unknown source IDs, unsafe source URLs, and absent required review dates. Example test:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateContent } from '../src/content.mjs';
const fixture = JSON.parse(readFileSync(new URL('../data/election.json', import.meta.url)));
test('rejects a candidate assigned to an unknown race', () => {
  const data = structuredClone(fixture);
  data.candidates[0].raceId = 'missing-race';
  assert.throws(() => validateContent(data), /race/i);
});
```

- [ ] Run `node --test` and confirm these tests fail because validation is not implemented.
- [ ] Implement `validateContent(data)` with unique ID sets, source and race referential checks, required field checks, HTTP/HTTPS source URL validation, safe path IDs, and photo credit/reuse requirements. Permit explicit source gaps without treating them as supported factual claims.
- [ ] Write render tests that require escaping, candidate source links, headings, the official ballot lookup, profile back-links, and initials fallbacks. Include a cloned candidate named `A & B <Example>` and assert output contains `A &amp; B &lt;Example&gt;` rather than unescaped markup.
- [ ] Run render tests to confirm failure before implementing the templates.
- [ ] Implement shared page framing and the two render functions. Home assets use `./`; profile assets use `../../`. Render every profile's sources beside the relevant claims, with an accessible source list. Generate static race navigation and alphabetical candidate ordering.
- [ ] Implement the build entry point: validate before writing, generate only into `dist`, and copy public assets. Configure scripts as `test: node --test`, `build: node scripts/build.mjs`, and `check: node scripts/check-output.mjs`.
- [ ] Run tests and build. Check generated HTML includes full content without JavaScript. Commit the validated generator.

## Task 3: Apply the visual design and verify the reading experience

**Files:** `public/styles.css`, `public/favicon.svg`, `src/render.mjs`, `scripts/check-output.mjs`.

**Consumes:** Complete static page output and portrait assets.
**Produces:** Responsive, keyboard-accessible guide with verified local navigation.

- [ ] Apply these design tokens: navy `#142D45`, teal `#087F83`, white `#FFFFFF`, cool background `#F2F7FA`, muted text `#4B6374`, and border `#CFDEE7`. Use a readable sans-serif stack with consistent heading and body scales. Confirm contrast for actual text combinations.
- [ ] Build a compact coastal civic masthead, clear race navigation, and portrait-led candidate summaries. Use large candidate names, restrained borders, and varied spacing rather than decoration. Keep the first race visible near the top.
- [ ] Style profiles for readable line lengths, visible citation links, consistent issue headings, and clearly attributed public records. Add focus indicators and a skip link.
- [ ] Add narrow-screen layouts and a simple site-specific SVG favicon. Keep cards readable at 320px and 200% text enlargement; avoid fixed text-container heights.
- [ ] Implement the output checker using filesystem traversal and URL resolution against a dummy `/vote2026/` origin. Check all local href/src targets, directory index resolution, and fragment IDs; reject paths escaping the generated site.
- [ ] Test the checker against a temporarily broken local image reference and confirm failure, then restore the valid reference and confirm success.
- [ ] Start a local server and inspect home and candidate pages in the browser. Capture desktop and phone screenshots, verify keyboard navigation, check long names and sparse-source profiles, and test a direct profile URL.
- [ ] Fix defects found in visual or link checks, then rerun affected checks. Commit the finished presentation.

## Task 4: Review, publish, and confirm the live website

**Files:** `.github/workflows/pages.yml`, `README.md`, research notes if corrections are needed.

**Consumes:** Passing tests, built site, verified content, and coldlamper's existing GitHub authentication.
**Produces:** Public GitHub Pages URL and maintainable repository.

- [ ] Write README instructions: `npm test`, `npm run build`, `npm run check`; explain content fields, citation updates, photo credits, and the manual review process.
- [ ] Configure GitHub Actions with checkout, Node 22 setup, tests, build, output check, `actions/configure-pages`, `actions/upload-pages-artifact` using `dist`, and `actions/deploy-pages`. Grant only content-read, pages-write, and id-token-write permissions needed for deployment.
- [ ] Perform a final independent review of content coverage, political neutrality, date accuracy, photo attribution, project-path navigation, and workflow configuration. Correct material findings and rerun the relevant checks.
- [ ] Check `coldlamper/vote2026` again before creation. If absent, create a public repository from this checkout; if present, inspect its contents before integration. Push the completed commits without force-pushing.
- [ ] Enable GitHub Pages with Actions as its build source. Trigger or observe the deployment, inspect failures if any, and fix their causes.
- [ ] Read the actual Pages URL from GitHub. Fetch the live home page, a candidate profile, CSS, and a portrait; confirm successful responses and correct content. Open the live guide for the user.
- [ ] Deliver the live URL and repository link, disclose actual remaining source/photo limitations, and state that candidate content reflects its displayed review dates.

## Proposed execution

Implement in this session. The content, templates, and visual checks are closely related, so keeping implementation together is efficient. A fresh final reviewer should check the completed work before publication. The writing-plans workflow requires the user to review this plan and confirm the execution approach before implementation.
