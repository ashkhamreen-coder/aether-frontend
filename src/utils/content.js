export const TECHNICAL_TEST_TITLE = 'Player Test — Cloudinary Sample';
export function arrayFrom(payload, key) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data?.[key])) return payload.data[key];
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}
export function idOf(item) { return item?.id || item?._id || item?.contentId; }
export function isTechnicalTest(item) { return item?.title === TECHNICAL_TEST_TITLE; }
export function normalizeRows(payload) {
  const seen = new Set();
  const priority=['continue watching','top 10','trending','popular in','new releases','recently added','top picks','films','series','shorts','mythology','ai cinema','science fiction','animation','ai music','regional','because you watched','coming soon'];
  const rows=arrayFrom(payload, 'rows').filter(row => row && typeof row === 'object').map((row, index) => ({ ...row, id:row.id || `row-${index}`, items:arrayFrom(row, 'items').filter(item => {
    const id=idOf(item); if (!id || isTechnicalTest(item) || seen.has(`${index - 1}:${id}`)) return false;
    seen.add(`${index}:${id}`); return true;
  }) })).filter(row => row.items.length);
  return rows.sort((a,b)=>{const rank=row=>{const title=String(row.title||'').toLowerCase(),i=priority.findIndex(key=>title.includes(key));return i<0?priority.length:i};return rank(a)-rank(b)});
}
