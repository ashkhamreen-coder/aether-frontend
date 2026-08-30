const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { DEV_FALLBACK, getApiBaseUrl } = require('./apiConfig');

test('normalises the configured backend URL', () => assert.equal(getApiBaseUrl({ NODE_ENV:'production', EXPO_PUBLIC_API_URL:' https://api.example.com/// ' }), 'https://api.example.com'));
test('fails production without a secure configured backend', () => {
  assert.throws(() => getApiBaseUrl({ NODE_ENV:'production' }), /required/);
  assert.throws(() => getApiBaseUrl({ NODE_ENV:'production', EXPO_PUBLIC_API_URL:'http://localhost:3000' }), /HTTPS/);
});
test('uses an explicit development-only fallback', () => assert.equal(getApiBaseUrl({ NODE_ENV:'development' }), DEV_FALLBACK));
test('uses the API URL captured from the build environment when no mock is passed', () => {
  const output = execFileSync(
    process.execPath,
    ['-e', "process.stdout.write(require('./apiConfig').getApiBaseUrl())"],
    {
      cwd: __dirname,
      encoding: 'utf8',
      env: { ...process.env, NODE_ENV: 'production', EXPO_PUBLIC_API_URL: 'https://build-api.example.com///' },
    },
  );
  assert.equal(output, 'https://build-api.example.com');
});
