const CATEGORY_CONFIG = Object.freeze([
  { title: 'Mythic India', aliases: ['mythic india', 'indian mythology', 'mythology india'] },
  { title: 'Epics Reimagined', aliases: ['epics reimagined', 'reimagined epics', 'indian epics'] },
  { title: 'Devas & Asuras', aliases: ['devas asuras', 'devas and asuras', 'deva asura'] },
  { title: 'Legends of Shakti', aliases: ['legends of shakti', 'shakti', 'devi mythology'] },
  { title: 'Regional Folklore', aliases: ['regional folklore', 'indian folklore', 'folklore mystery'] },
  { title: 'Cosmic Mysteries', aliases: ['cosmic mysteries', 'cosmic mythology', 'cosmic epic'] },
  { title: 'Mythology Meets Science Fiction', aliases: ['mythology meets science fiction', 'mythology inspired science fiction', 'mythological science fiction'] },
  { title: 'AI Music and Mantras', aliases: ['ai music and mantras', 'mantra', 'devotional ai music'] },
  { title: 'Generative Sacred Art', aliases: ['generative sacred art', 'sacred art', 'spiritual generative art'] },
]);

function normalizeTaxonomy(value) {
  return String(value || '').normalize('NFKD').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();
}

function taxonomyValues(content) {
  const tags = Array.isArray(content?.tags) ? content.tags : [];
  const categories = Array.isArray(content?.categories) ? content.categories : [];
  return [content?.category, content?.genre, ...tags, ...categories].map(normalizeTaxonomy).filter(Boolean);
}

function getEditorialRail(content, categoryConfig) {
  const accepted = [categoryConfig.title, ...(categoryConfig.aliases || [])].map(normalizeTaxonomy);
  return taxonomyValues(content).some(value => accepted.includes(value));
}

function isPublishedPublicApproved(content) {
  return content?.status === 'published' && content?.moderationStatus === 'approved' && content?.visibility === 'public';
}

function isMythologyContent(content) {
  return CATEGORY_CONFIG.some(config => getEditorialRail(content, config));
}

function selectHeroes(content, previews = []) {
  const featured = content.filter(item => item?.featured === true && isPublishedPublicApproved(item));
  const mythology = featured.filter(isMythologyContent);
  return mythology.length ? mythology.slice(0, 5) : featured.length ? featured.slice(0, 5) : previews.slice(0, 5);
}

module.exports = { CATEGORY_CONFIG, getEditorialRail, isMythologyContent, normalizeTaxonomy, selectHeroes };
