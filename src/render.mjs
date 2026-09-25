const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const initials = (name) => name.replace(/\([^)]*\)/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');
const sourceMap = (data) => new Map(data.sources.map((source) => [source.id, source]));

function citations(ids, sources) {
  return (ids || []).map((id) => {
    const source = sources.get(id);
    return `<a class="citation" href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.publisher)}</a>`;
  }).join(' ');
}

function portrait(candidate, prefix = '', showCredit = false) {
  if (candidate.photo) {
    const image = `<img class="portrait" src="${prefix}${escapeHtml(candidate.photo.path)}" alt="Portrait of ${escapeHtml(candidate.name)}">`;
    return showCredit ? `<figure class="profile-photo">${image}<figcaption>${escapeHtml(candidate.photo.credit)} · <a href="${escapeHtml(candidate.photo.sourceUrl)}">${escapeHtml(candidate.photo.reuseBasis)}</a></figcaption></figure>` : image;
  }
  return `<div class="portrait-fallback" aria-label="No verified photo available for ${escapeHtml(candidate.name)}">${escapeHtml(initials(candidate.name))}</div>`;
}

function frame({title, description, body, depth = 0}) {
  const prefix = depth ? '../../' : './';
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}">
<link rel="icon" href="${prefix}favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="${prefix}styles.css"></head>
<body><a class="skip-link" href="#main">Skip to candidate guide</a>${body}</body></html>`;
}

export function renderHome(data) {
  const sources = sourceMap(data);
  const races = data.races.map((race) => {
    const candidates = data.candidates.filter((candidate) => candidate.raceId === race.id).sort((a,b) => a.name.localeCompare(b.name));
    const cards = candidates.map((candidate) => `<article class="candidate-card">
      <div class="card-link">
        ${portrait(candidate)}<div><p class="party">${escapeHtml(candidate.party)}</p><h3>${escapeHtml(candidate.name)}</h3><p class="candidate-detail"><strong>Age:</strong> ${escapeHtml(candidate.age || 'Not publicly verified')}</p><p>${escapeHtml(candidate.summary)}</p><div class="candidate-detail"><h4>Background</h4>${(candidate.biography || []).map((item) => `<p>${escapeHtml(item.text)} ${citations(item.sourceIds, sources)}</p>`).join('')}<h4>Key positions</h4>${(candidate.positions || []).map((item) => `<p><strong>${escapeHtml(item.topic)}:</strong> ${escapeHtml(item.text)} ${citations(item.sourceIds, sources)}</p>`).join('')}${candidate.record?.length ? `<h4>Public record</h4><ul>${candidate.record.map((item) => `<li>${escapeHtml(item.text)} ${citations(item.sourceIds, sources)}</li>`).join('')}</ul>` : ''}</div><a class="read-more" href="candidates/${candidate.id}/index.html">Open full source list</a></div>
      </div></article>`).join('');
    return `<section class="race" id="${race.id}"><div class="race-heading"><div><p class="level">${escapeHtml(race.level)}</p><h2>${escapeHtml(race.name)}</h2><p>${escapeHtml(race.description)}</p></div><p class="vote-for">Vote for ${race.voteFor === 1 ? 'one' : race.voteFor}</p></div><div class="candidate-grid">${cards}</div><p class="race-sources">Ballot evidence: ${citations(race.sourceIds, sources)}</p></section>`;
  }).join('');
  const nav = data.races.map((race) => `<a href="#${race.id}">${escapeHtml(race.name)}</a>`).join('');
  const referenda = data.referenda.map((item) => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p><div class="referendum-detail"><h4>What a yes vote does</h4><p>${escapeHtml(item.yes || item.summary)}</p><h4>What a no vote does</h4><p>${escapeHtml(item.no || 'Leaves the current law unchanged.')}</p><h4>Context</h4><p>${escapeHtml(item.context || 'Review the official ballot wording before voting.')}</p></div><p>${citations(item.sourceIds, sources)}</p></article>`).join('');
  const voting = data.voting.map((item) => `<div><dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.value)}</dd><small>${citations(item.sourceIds, sources)}</small></div>`).join('');
  const body = `<header class="masthead"><div class="masthead-inner"><a class="brand" href="./index.html"><span class="brand-mark">CB</span><span>Carolina Beach Votes</span></a><a class="lookup top" href="${escapeHtml(data.site.ballotLookupUrl)}" target="_blank" rel="noopener">Check your ballot</a></div></header>
  <main id="main"><section class="intro"><div><p class="kicker">Nonpartisan voter guide · ${escapeHtml(data.site.ballotStyle)}</p><h1>Know what’s on your Carolina Beach ballot.</h1><p class="dek">Every candidate and question on the November 3 ballot for precinct FP08, with sourced profiles and plain-language context.</p></div><div class="date-card"><span>Election Day</span><strong>Nov. 3</strong><small>Polls 6:30 a.m.–7:30 p.m.</small></div></section>
  <div class="notice"><strong>Before you vote</strong><p>${escapeHtml(data.site.notice)}</p><a class="lookup" href="${escapeHtml(data.site.ballotLookupUrl)}" target="_blank" rel="noopener">Open official voter lookup</a></div>
  <section class="schedule"><h2>Key dates</h2><dl>${voting}</dl></section>
  <nav class="race-nav" aria-label="Jump to a race"><p>Jump to a race</p><div>${nav}</div></nav>
  <div class="guide">${races}</div>
  <section class="referenda" id="referenda"><p class="level">Ballot questions</p><h2>Four decisions beyond the candidates</h2><div class="referenda-grid">${referenda}</div></section>
  <section class="method" id="method"><h2>How this guide was made</h2><p>Candidates are listed alphabetically within each race. Campaign claims are labeled and linked to their sources; public records are kept distinct. When reliable position information was not found, the profile says so. No endorsement, rating or inferred position is included.</p><p>Initials appear where a consistently licensed candidate photograph was not available. They are a placeholder, not a comment on the candidate.</p><p>Coverage reviewed ${escapeHtml(data.site.reviewedAt)}. <a href="https://www.ncsbe.gov/results-data/candidate-lists">See official candidate lists</a>.</p></section></main>
  <footer><p>Carolina Beach Votes 2026 is an independent informational project. It is not affiliated with a candidate, party or election office.</p></footer>`;
  return frame({title:data.site.title, description:data.site.description, body});
}

export function renderCandidate(data, candidate) {
  const sources = sourceMap(data);
  const race = data.races.find((item) => item.id === candidate.raceId);
  const claims = (candidate.positions || []).map((item) => `<article class="position ${item.kind === 'not-found' ? 'limited' : ''}"><h3>${escapeHtml(item.topic)}</h3><p>${escapeHtml(item.text)}</p><p>${citations(item.sourceIds, sources)}</p></article>`).join('');
  const bio = (candidate.biography || []).map((item) => `<p>${escapeHtml(item.text)} ${citations(item.sourceIds, sources)}</p>`).join('');
  const record = (candidate.record || []).map((item) => `<li>${escapeHtml(item.text)} ${citations(item.sourceIds, sources)}</li>`).join('');
  const used = [...new Set([...(candidate.sourceIds || []), ...(candidate.biography || []).flatMap(x=>x.sourceIds), ...(candidate.positions || []).flatMap(x=>x.sourceIds), ...(candidate.record || []).flatMap(x=>x.sourceIds)])];
  const sourceList = used.map((id) => { const s=sources.get(id); return `<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.title)}</a><span>${escapeHtml(s.publisher)} · reviewed ${escapeHtml(s.reviewedAt)}</span></li>`; }).join('');
  const body = `<header class="masthead"><div class="masthead-inner"><a class="brand" href="../../index.html"><span class="brand-mark">CB</span><span>Carolina Beach Votes</span></a></div></header>
  <main id="main" class="profile"><a class="back" href="../../index.html#${race.id}">Back to ${escapeHtml(race.name)}</a>
  <section class="profile-hero">${portrait(candidate, '../../', true)}<div><p class="party">${escapeHtml(candidate.party)} · ${escapeHtml(race.name)}</p><h1>${escapeHtml(candidate.name)}</h1><p class="dek">${escapeHtml(candidate.summary)}</p><p class="reviewed">Information reviewed ${escapeHtml(candidate.reviewedAt)}</p></div></section>
  <div class="profile-layout"><div><section><h2>Background</h2>${bio}</section><section><h2>Positions and record</h2><div class="positions">${claims}</div>${record ? `<h2>Public record</h2><ul>${record}</ul>` : ''}</section></div>
  <aside><h2>About this race</h2><p>${escapeHtml(race.description)}</p><p><strong>You may vote for ${race.voteFor === 1 ? 'one' : race.voteFor}.</strong></p><a class="lookup" href="${escapeHtml(data.site.ballotLookupUrl)}" target="_blank" rel="noopener">Confirm your ballot</a></aside></div>
  <section class="sources"><h2>Sources</h2><ol>${sourceList}</ol></section></main>
  <footer><p>This guide summarizes attributed public information and does not endorse candidates.</p></footer>`;
  return frame({title:`${candidate.name} | ${data.site.title}`, description:`A sourced profile of ${candidate.name}, candidate for ${race.name}.`, body, depth:2});
}
