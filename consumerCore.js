const PRIORITY_LANGUAGES = Object.freeze(['Hindi', 'English', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Marathi', 'Punjabi', 'Gujarati', 'Urdu']);
const GENRES = Object.freeze(['AI Cinema', 'Mythology and Epics', 'Science Fiction', 'Fantasy', 'Animation', 'Experimental', 'AI Music Videos', 'Horror', 'Thriller', 'Drama', 'Comedy', 'Romance', 'Documentary', 'Alternate History', 'Generative Art', 'Short Films', 'Regional Stories', 'Kids and Family']);

function list(value) { return Array.isArray(value) ? value : []; }
function contentId(item) { return String(item?.id || item?._id || item?.contentId || ''); }

function normalizeHomeRows(payload, { kids = false } = {}) {
  const source = list(payload?.rows || payload?.data?.rows || payload);
  const recentlySeen = new Set();
  return source.map((row, rowIndex) => {
    const items = list(row.items || row.content).filter(item => {
      if (!contentId(item)) return false;
      if (kids && item.maturityEligible !== true) return false;
      const key = contentId(item);
      if (rowIndex < 3 && recentlySeen.has(key)) return false;
      recentlySeen.add(key);
      return true;
    });
    return { ...row, id: row.id || `row-${rowIndex}`, title: row.title || row.name || 'Explore', items };
  }).filter(row => row.items.length > 0);
}

function popularityPresentation(item) {
  const aggregate = item?.popularity;
  if (!aggregate || aggregate.sufficientData !== true) return null;
  return {
    rank: Number.isInteger(aggregate.rank) ? aggregate.rank : null,
    movement: ['up', 'down', 'same', 'new'].includes(aggregate.movement) ? aggregate.movement : null,
    period: aggregate.period || null,
    freshness: aggregate.freshness || aggregate.updatedAt || null,
    country: aggregate.country || null,
  };
}

function validateOnboarding(step, values) {
  if (step === 'country' && !values.country) return 'Choose your country to tune availability and recommendations.';
  if (step === 'languages' && !list(values.languages).length) return 'Choose at least one content language.';
  if (step === 'subtitle' && !values.subtitleLanguage) return 'Choose a default subtitle language.';
  if (step === 'genres' && list(values.genres).length < 3) return 'Choose at least three genres, or skip for a less personalised Home.';
  return null;
}

function searchParams(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== undefined && value !== null && value !== false) params.set(key, String(value));
  });
  return params.toString();
}

function serviceState(error, elapsedMs, online = true) {
  if (!online) return 'offline';
  if (!error) return 'ready';
  return elapsedMs < 45000 ? 'waking' : 'unavailable';
}

function progressPayload(position, duration, threshold = 0.9) {
  const safeDuration = Math.max(0, Number(duration) || 0);
  const safePosition = Math.min(safeDuration, Math.max(0, Number(position) || 0));
  return { positionSeconds: safePosition, durationSeconds: safeDuration, completed: safeDuration > 0 && safePosition / safeDuration >= threshold };
}

module.exports = { GENRES, PRIORITY_LANGUAGES, normalizeHomeRows, popularityPresentation, progressPayload, searchParams, serviceState, validateOnboarding };
