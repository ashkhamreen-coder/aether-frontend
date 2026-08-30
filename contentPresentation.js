const TECHNICAL_TEST_TITLE = 'Player Test — Cloudinary Sample';
function idOf(item) { return item?.id || item?._id || item?.contentId; }
function isTechnicalTest(item) { return item?.title === TECHNICAL_TEST_TITLE; }
function visibleRows(rows) { return (Array.isArray(rows) ? rows : []).map(row => ({...row,items:(Array.isArray(row.items)?row.items:[]).filter(item=>idOf(item)&&!isTechnicalTest(item))})).filter(row=>row.items.length); }
function displayedRank(row,item){return row?.displayRanking===true&&Number.isInteger(item?.rank)?item.rank:null}
module.exports={TECHNICAL_TEST_TITLE,isTechnicalTest,visibleRows,displayedRank};
