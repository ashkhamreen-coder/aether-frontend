const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const source = fs.readFileSync('src/tv/runtime.js', 'utf8')
  .replace("import { Platform } from 'react-native';", 'const Platform = { isTV: true };')
  .replaceAll('export const ', 'const ')
  .replaceAll('export function ', 'function ')
  + '\nmodule.exports={isTVDevice,TV_SAFE_AREA,remoteAction,createRemoteGate,playerBackAction};';
const moduleShim = { exports: {} };
new Function('module', source)(moduleShim);
const runtime = moduleShim.exports;

test('normalizes Android TV D-pad, select, media, and back events', () => {
  assert.equal(runtime.isTVDevice, true);
  assert.deepEqual(['up','down','left','right'].map(eventType => runtime.remoteAction({eventType})), ['up','down','left','right']);
  assert.equal(runtime.remoteAction({eventType:'longSelect'}), 'select');
  assert.equal(runtime.remoteAction({eventType:'pause'}), 'playPause');
  assert.equal(runtime.remoteAction({eventType:'menu'}), 'back');
  assert.equal(runtime.remoteAction({eventType:'unknown'}), null);
});

test('rapid repeated actions are gated without blocking distinct D-pad actions', () => {
  const accept = runtime.createRemoteGate(280);
  assert.equal(accept('select', 1000), true);
  assert.equal(accept('select', 1100), false);
  assert.equal(accept('right', 1101), true);
  assert.equal(accept('right', 1400), true);
});

test('player Back hides controls before leaving playback', () => {
  assert.equal(runtime.playerBackAction(true), 'hide-controls');
  assert.equal(runtime.playerBackAction(false), 'close-player');
  assert.ok(runtime.TV_SAFE_AREA.horizontal >= 48);
});
