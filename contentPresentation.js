const TECHNICAL_TEST_TITLE = 'Player Test — Cloudinary Sample';
const HOME_RAIL_ORDER = Object.freeze(['continue watching','top 10','trending','popular in','new releases','recently added','top picks','films','series','shorts','mythology','ai cinema','science fiction','animation','ai music','regional','because you watched','coming soon','technical playback test']);
function idOf(item) { return item?.id || item?._id || item?.contentId; }
function isTechnicalTest(item) { return item?.title === TECHNICAL_TEST_TITLE; }
function visibleRows(rows) { return (Array.isArray(rows) ? rows : []).map(row => ({...row,items:(Array.isArray(row.items)?row.items:[]).filter(item=>idOf(item)&&!isTechnicalTest(item))})).filter(row=>row.items.length); }
function displayedRank(row,item){return row?.displayRanking===true&&Number.isInteger(item?.rank)?item.rank:null}
function orderHomeRows(rows){return [...visibleRows(rows)].sort((a,b)=>{const rank=x=>{const title=String(x.title||'').toLowerCase();const found=HOME_RAIL_ORDER.findIndex(key=>title.includes(key));return found<0?HOME_RAIL_ORDER.length:found};return rank(a)-rank(b)});}
function selectFeatured(items){return (Array.isArray(items)?items:[]).find(item=>!isTechnicalTest(item)&&(item.featured===true||item.isFeatured===true))||(Array.isArray(items)?items:[]).find(item=>!isTechnicalTest(item))||null;}
function contentItems(items) { return (Array.isArray(items) ? items : []).filter(item => item && idOf(item)); }
function removeDuplicateComingSoonRows(rows) {
  const regularIds = new Set(rows.filter(row => !/^coming soon$/i.test(String(row.title || '').trim())).flatMap(row => row.items).map(idOf));
  return rows.filter(row => !/^coming soon$/i.test(String(row.title || '').trim()) || row.items.some(item => !regularIds.has(idOf(item))));
}
function homeScreenContent(state, editorialRows, editorialTitles) {
  const sourceRows = Array.isArray(state?.rows) ? state.rows : [];
  const live = removeDuplicateComingSoonRows(sourceRows
    .filter(row => row && typeof row === 'object')
    .map((row, index) => ({ ...row, id: row.id || `home-row-${index}`, items: contentItems(row.items) }))
    .filter(row => row.items.length));
  const showEditorial = live.length === 0;
  const concepts = showEditorial
    ? (Array.isArray(editorialRows) ? editorialRows : [])
      .filter(row => row && typeof row === 'object')
      .map((row, index) => ({ ...row, id: row.id || `editorial-row-${index}`, items: contentItems(row.items) }))
      .filter(row => row.items.length)
    : [];
  const candidates = [state?.hero, ...(showEditorial ? contentItems(editorialTitles) : live.flatMap(row => row.items))];
  const seen = new Set();
  const featured = contentItems(candidates).filter(item => {
    const id = idOf(item);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  }).slice(0, 5);
  return { live, concepts, featured, showEditorial };
}
module.exports={TECHNICAL_TEST_TITLE,HOME_RAIL_ORDER,isTechnicalTest,visibleRows,displayedRank,orderHomeRows,selectFeatured,contentItems,removeDuplicateComingSoonRows,homeScreenContent};
