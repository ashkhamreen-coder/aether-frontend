const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const read = path => fs.readFileSync(path, 'utf8');

test('pins the Expo SDK 54 React Native TV release through the react-native alias', () => {
  const pkg = require('./package.json');
  assert.equal(pkg.dependencies['react-native'], 'npm:react-native-tvos@0.81.5-0');
});

test('TV runtime provides platform selection, D-pad events, Back, and preferred focus', () => {
  const remote = read('src/tv/useTVRemote.js');
  const runtime = read('src/tv/runtime.js');
  const shell = read('src/navigation/AppShell.js');
  const navigation = read('src/components/TVNavigation.js');
  assert.match(runtime, /Platform\.isTV/);
  assert.match(remote, /TVEventHandler/);
  assert.match(remote, /hardwareBackPress/);
  assert.match(shell, /TVNavigation/);
  assert.match(navigation, /hasTVPreferredFocus/);
  assert.match(navigation, /focused && s\.focused/);
});

test('TV cards and player expose focus and remote-compatible controls', () => {
  const card = read('src/components/ContentCard.js');
  const player = read('src/components/VideoPlayer/index.native.js');
  assert.match(card, /Platform\.isTV/);
  assert.match(card, /preferredFocus/);
  assert.match(player, /remoteAction\(event\)/);
  assert.match(player, /action==='left'/);
  assert.match(player, /action==='right'/);
  assert.match(player, /action==='playPause'/);
  assert.match(player, /playerBackAction/);
  assert.match(player, /focused&&s\.focus/);
});
