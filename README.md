# Carolina Beach Votes 2026

A nonpartisan guide to the November 3, 2026 ballot for Carolina Beach precinct FP08 in New Hanover County, North Carolina.

## Run locally

Requires Node.js 22 or newer. There are no third-party runtime dependencies.

```sh
npm test
npm run build
npm run check
```

Serve the generated `dist` directory with any static web server.

## Update the guide

Election content lives in `data/election.json`. Each factual claim links to one or more entries in the `sources` collection. Keep campaign statements, public records and missing-information notices distinct. Candidate lists and voting dates must be checked against the North Carolina State Board of Elections and New Hanover County before publication.

Candidate images may be added through a candidate's `photo` object only when the source, credit and reuse basis are documented. When those fields are absent, the site renders an initials fallback.

The generator validates IDs, source references, review dates, candidate-to-race relationships and URL schemes before writing output. The output checker then verifies every local link, fragment and asset.

Research scope and known limitations are documented in `docs/research/coverage.md`. The approved design and implementation plan are under `docs/superpowers/`.

## Publishing

Pushes to `main` run the test, build and output checks before deploying `dist` to GitHub Pages. The repository Pages source must be set to GitHub Actions.

This project does not endorse, rank or score candidates and is not affiliated with a candidate, party or election office.
