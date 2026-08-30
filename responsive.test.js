const test = require('node:test');
const assert = require('node:assert/strict');
const { getResponsiveState } = require('./responsive');

test('uses deliberate responsive ranges at every boundary', () => {
  assert.deepEqual(getResponsiveState(389), { compactPhone:true, phone:true, tablet:false, desktop:false, wideDesktop:false });
  assert.deepEqual(getResponsiveState(390), { compactPhone:false, phone:true, tablet:false, desktop:false, wideDesktop:false });
  assert.deepEqual(getResponsiveState(768), { compactPhone:false, phone:false, tablet:true, desktop:false, wideDesktop:false });
  assert.deepEqual(getResponsiveState(1024), { compactPhone:false, phone:false, tablet:false, desktop:true, wideDesktop:false });
  assert.equal(getResponsiveState(1440).wideDesktop, true);
});
