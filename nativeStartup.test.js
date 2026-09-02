const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const test = require('node:test');

test('complete app tree first-renders on Android without triggering AppErrorBoundary', () => {
  const output = execFileSync(process.execPath, [path.join(__dirname, 'scripts/native-startup-render.cjs')], { encoding: 'utf8' });
  assert.deepEqual(JSON.parse(output), { platform: 'android', boundaryTriggered: false, startupRendered: true });
});
