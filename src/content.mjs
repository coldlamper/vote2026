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

export function validateContent(data) {
  if (!data?.site || !Array.isArray(data.sources) || !Array.isArray(data.races) || !Array.isArray(data.candidates)) {
    throw new Error('Election content must include site, sources, races and candidates');
  }
  required(data.site.title, 'site title');
  required(data.site.reviewedAt, 'site reviewedAt');
  const sourceIds = unique(data.sources, 'source');
  const raceIds = unique(data.races, 'race');
  unique(data.candidates, 'candidate');

  for (const source of data.sources) {
    required(source.title, `source ${source.id} title`);
    required(source.publisher, `source ${source.id} publisher`);
    required(source.reviewedAt, `source ${source.id} reviewedAt`);
    let url;
    try { url = new URL(source.url); } catch { throw new Error(`Source ${source.id} must have an HTTP URL`); }
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error(`Source ${source.id} must have an HTTP URL`);
  }

  const checkSources = (ids = [], label) => {
    for (const id of ids) if (!sourceIds.has(id)) throw new Error(`${label} references unknown source ${id}`);
  };
  for (const race of data.races) {
    required(race.name, `race ${race.id} name`);
    if (!Number.isInteger(race.voteFor) || race.voteFor < 1) throw new Error(`race ${race.id} voteFor must be positive`);
    checkSources(race.sourceIds, `race ${race.id}`);
  }
  for (const candidate of data.candidates) {
    required(candidate.name, `candidate ${candidate.id} name`);
    required(candidate.reviewedAt, `candidate ${candidate.id} reviewedAt`);
    if (!raceIds.has(candidate.raceId)) throw new Error(`Candidate ${candidate.id} has unknown race ${candidate.raceId}`);
    checkSources(candidate.sourceIds, `candidate ${candidate.id}`);
    for (const item of [...(candidate.biography || []), ...(candidate.positions || []), ...(candidate.record || [])]) {
      required(item.text, `candidate ${candidate.id} claim text`);
      checkSources(item.sourceIds, `candidate ${candidate.id} claim`);
    }
    if (candidate.photo) {
      required(candidate.photo.path, `candidate ${candidate.id} photo path`);
      required(candidate.photo.credit, `candidate ${candidate.id} photo credit`);
      required(candidate.photo.sourceUrl, `candidate ${candidate.id} photo sourceUrl`);
      required(candidate.photo.reuseBasis, `candidate ${candidate.id} photo reuseBasis`);
    }
  }
  return true;
}
