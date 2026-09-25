# Carolina Beach Votes 2026 — site brief

## Purpose and approved direction

Build a modern, clean, nonpartisan voter guide for Carolina Beach, North Carolina, published on GitHub Pages under the coldlamper account. Help residents learn who is running, compare supported and opposed policies, and understand candidates' experience and relevant public records. The user approved a navy, white, and coastal teal design with real candidate portraits, browsing by race, and separate candidate profiles.

## Coverage

Cover the November 3, 2026 general election: federal, state legislative, statewide judicial, and applicable New Hanover County contests, including uncontested races. Establish the actual roster from current official candidate lists and sample ballots before authoring profiles. Confirm Carolina Beach districts from current election maps or sample ballots; a countywide list alone does not establish a resident's ballot.

The county's elected-officials page lists the next regular Carolina Beach mayor and town council elections in 2027 or 2029. Do not present those officials as 2026 municipal candidates. Check for any special election before publication. Include applicable referendums if the official ballot lists them, with plain-language descriptions and official text links.

The guide is informational, not a personalized ballot. Provide the official voter lookup prominently; do not request, collect, or store a reader's address or registration information.

## Reader experience

The home page starts with the guide title, election date, a short scope statement, verification date, and race navigation. Candidate information appears in the first useful screen rather than beneath a large promotional banner.

Group candidates by office, with a short explanation of that office and the number of seats a voter may select when verified. Use equally sized portraits and consistent summaries. Order candidates alphabetically within each race and state that ordering in the methodology.

Each candidate has a shareable profile with name, party where applicable, office, verified incumbency status, portrait credit, short biography, relevant experience, policy priorities and opposition, documented record, campaign link, source citations, and last-reviewed date. Links return readers to the relevant race.

Use the same issue headings within each race. Relevant topics may include cost of living and insurance, housing and development, coastal resilience and water quality, education, healthcare, taxes, and public safety, depending on the powers of the office and available evidence. Judicial profiles emphasize qualifications, legal experience, and documented judicial philosophy rather than assumed policy promises.

Provide voting information and an editorial-methodology section with official links. Do not add accounts, advertising, donations, endorsements, rankings, analytics, or an automatic news feed.

## Research and editorial standards

- Official election authorities establish candidate eligibility, races, dates, and voter instructions. Incumbent lists are context, not proof of candidacy.
- Candidate websites and statements support attributed descriptions of their positions. Official biographies, legislative records, and reputable reporting support experience and public-record context.
- Place citations beside substantive claims, with publisher, title, URL, and review date recorded in the content data.
- Distinguish campaign statements from voting records and independent reporting. Do not infer a position from party membership, an endorsement, or silence.
- Use clear labels such as "No position found in the sources reviewed" when necessary; do not treat missing evidence as opposition.
- Apply consistent relevance and sourcing standards to all candidates. Include controversies only when materially relevant and well documented, with dates, outcomes, and responses where available.
- Use authentic photographs from identifiable sources with documented credit and reuse basis. Prefer public-domain or appropriately licensed images. Never generate candidate likenesses. If a usable photo cannot be obtained, use an honest initials fallback and identify that limitation.
- Summarize in original language and avoid copying lengthy campaign text.
- Do not claim complete coverage until the roster is reconciled against the official ballot sources. Show any remaining source limitations explicitly.

## Visual design and accessibility

Use deep navy text and navigation, white surfaces, and coastal teal accents. Use a crisp sans-serif typeface, restrained borders, generous spacing, and consistent portrait crops. Avoid party-colored page styling that implies preference.

On desktop, use a readable race overview and candidate grid. On phones, stack profiles and keep race navigation usable without horizontal page overflow. Provide visible keyboard focus, semantic headings, descriptive link text, sufficient contrast, meaningful image alternatives, and reduced-motion support where motion is used. Body copy is at least 16px. Include a site-specific favicon and page-specific titles and descriptions.

## Implementation architecture

Use a small static site compatible with GitHub Pages. Keep structured race, candidate, and source data separate from shared templates and styling. A lightweight build generates the home page and individual candidate pages so content and navigation work without client-side JavaScript. Use JavaScript only if a specific interaction needs it.

Generate relative or configured-base-path links so the site works under a GitHub project URL. A content validation step checks unique identifiers, candidate-to-race relationships, source references, required fields, and output links. Invalid content prevents publication rather than silently creating broken profiles. Missing photos have a graceful fallback.

Keep the repository and its publishing instructions understandable for future content updates. Candidate content is reviewed manually; no recurring automation is part of this scope.

## Publishing

Use the existing authorized coldlamper GitHub authentication. Check whether coldlamper/vote2026 exists before creating or selecting a repository, and inspect it before making changes if it exists. Publish the completed site using GitHub Pages and a reproducible deployment workflow. Determine the final URL from GitHub's Pages configuration rather than assuming it. The user has requested publication; no separate routine publishing permission is needed.

## Validation and completion

Before publishing, reconcile the candidate roster and district coverage with official sources, review every profile for unsupported claims, verify photo credits, and check voting dates against current official guidance. Test page generation, required content, internal links, direct profile access, and project-path assets. Inspect the rendered site at phone and desktop sizes, including keyboard navigation and photo fallbacks.

After deployment, confirm the live home page and representative profiles load successfully. Deliver the public URL, repository link, and a concise description of any real research or image limitations. Do not describe a draft or partial roster as a finished comprehensive guide.

## Initial official sources

- North Carolina candidate lists: https://www.ncsbe.gov/results-data/candidate-lists
- North Carolina election information: https://www.ncsbe.gov/voting/upcoming-election
- New Hanover County elected officials and term schedules: https://www.nhcgov.com/1021/Elected-Officials
- Official voter lookup: https://vt.ncsbe.gov/RegLkup/

These sources were inspected during planning on September 25, 2026. The full candidate roster and profile research are implementation deliverables, not assertions made by this brief.
