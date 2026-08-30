const test = require('node:test');
const assert = require('node:assert/strict');
const { CATEGORY_CONFIG, getEditorialRail, selectHeroes } = require('./editorial');

test('maps rails from normalized backend taxonomy and never array position', () => {
  const mythic = CATEGORY_CONFIG[0];
  assert.equal(getEditorialRail({ category: ' Indian-Mythology ' }, mythic), true);
  assert.equal(getEditorialRail({ title: 'Neon Requiem', genre: 'science fiction' }, mythic), false);
});

test('prioritises approved public featured mythology then general content', () => {
  const general = { id:'general', featured:true, status:'published', moderationStatus:'approved', visibility:'public', category:'drama' };
  const mythology = { ...general, id:'myth', tags:['Shakti'] };
  assert.deepEqual(selectHeroes([general, mythology]).map(x => x.id), ['myth']);
  assert.deepEqual(selectHeroes([general]).map(x => x.id), ['general']);
});
