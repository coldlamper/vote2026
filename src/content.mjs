const safeId = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function required(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} is required`);
}

function unique(items, kind) {
  const ids = new Set();
  for (const item of items) {
    required(item.id, `${kind} id`);
    if (!safeId.test(item.id)) throw new Error(`${kind} must use a safe id: ${item.id}`);
    if (ids.has(item.id)) throw new Error(`Duplicate ${kind} id: ${item.id}`);
    ids.add(item.id);
  }
  return ids;
}

function httpUrl(value, label) {
  let url;
  try { url = new URL(value); } catch { throw new Error(`${label} must have an HTTP URL`); }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error(`${label} must have an HTTP URL`);
}

export function validateContent(data) {
  if (!data?.site || !Array.isArray(data.sources) || !Array.isArray(data.races) || !Array.isArray(data.candidates)) {
    throw new Error('Election content must include site, sources, races and candidates');
  }
  required(data.site.title, 'site title');
  required(data.site.reviewedAt, 'site reviewedAt');
  httpUrl(data.site.ballotLookupUrl, 'site ballotLookupUrl');
  const sourceIds = unique(data.sources, 'source');
  const raceIds = unique(data.races, 'race');
  unique(data.candidates, 'candidate');

  for (const source of data.sources) {
    required(source.title, `source ${source.id} title`);
    required(source.publisher, `source ${source.id} publisher`);
    required(source.reviewedAt, `source ${source.id} reviewedAt`);
    httpUrl(source.url, `Source ${source.id}`);
  }

  const checkSources = (ids = [], label) => {
    for (const id of ids) if (!sourceIds.has(id)) throw new Error(`${label} references unknown source ${id}`);
  };
  for (const race of data.races) {
    required(race.name, `race ${race.id} name`);
    required(race.level, `race ${race.id} level`);
    required(race.description, `race ${race.id} description`);
    if (!Number.isInteger(race.voteFor) || race.voteFor < 1) throw new Error(`race ${race.id} voteFor must be positive`);
    checkSources(race.sourceIds, `race ${race.id}`);
  }
  for (const candidate of data.candidates) {
    required(candidate.name, `candidate ${candidate.id} name`);
    required(candidate.party, `candidate ${candidate.id} party`);
    required(candidate.summary, `candidate ${candidate.id} summary`);
    required(candidate.reviewedAt, `candidate ${candidate.id} reviewedAt`);
    if (!raceIds.has(candidate.raceId)) throw new Error(`Candidate ${candidate.id} has unknown race ${candidate.raceId}`);
    checkSources(candidate.sourceIds, `candidate ${candidate.id}`);
    for (const field of ['biography', 'positions', 'record']) if (!Array.isArray(candidate[field])) throw new Error(`candidate ${candidate.id} ${field} must be an array`);
    for (const position of candidate.positions) if (!['campaign-statement','public-record','not-found'].includes(position.kind)) throw new Error(`candidate ${candidate.id} has invalid position kind`);
    for (const item of [...candidate.biography, ...candidate.positions, ...candidate.record]) {
      required(item.text, `candidate ${candidate.id} claim text`);
      checkSources(item.sourceIds, `candidate ${candidate.id} claim`);
    }
    if (candidate.photo) {
      required(candidate.photo.path, `candidate ${candidate.id} photo path`);
      required(candidate.photo.credit, `candidate ${candidate.id} photo credit`);
      required(candidate.photo.sourceUrl, `candidate ${candidate.id} photo sourceUrl`);
      required(candidate.photo.reuseBasis, `candidate ${candidate.id} photo reuseBasis`);
      if (!/^photos\/[a-z0-9][a-z0-9._-]*$/i.test(candidate.photo.path)) throw new Error(`candidate ${candidate.id} photo path must stay under photos`);
      httpUrl(candidate.photo.sourceUrl, `candidate ${candidate.id} photo sourceUrl`);
    }
  }
  if (!Array.isArray(data.referenda) || !Array.isArray(data.voting)) throw new Error('referenda and voting must be arrays');
  for (const item of data.referenda) { required(item.title, 'referendum title'); required(item.summary, 'referendum summary'); checkSources(item.sourceIds, `referendum ${item.title}`); }
  for (const item of data.voting) { required(item.label, 'voting label'); required(item.value, 'voting value'); checkSources(item.sourceIds, `voting ${item.label}`); }
  return true;
}
