const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('production Android identity and source-only EAS profiles are stable', () => {
  const app = require('./app.json').expo;
  const eas = require('./eas.json');
  const pkg = require('./package.json');
  assert.equal(app.name, 'Ripple');
  assert.equal(app.version, '2.0.0');
  assert.equal(app.orientation, 'default');
  assert.equal(app.android.package, 'com.aethercreators.ripple');
  assert.ok(Number.isInteger(app.android.versionCode) && app.android.versionCode > 0);
  assert.equal(pkg.dependencies['react-native'], 'npm:react-native-tvos@0.81.5-0');
  assert.equal(eas.build.development.android.buildType, 'apk');
  assert.equal(eas.build.preview.android.buildType, 'apk');
  assert.equal(eas.build.production.android.buildType, 'app-bundle');
  for (const profile of Object.values(eas.build)) {
    assert.equal(profile.env.EXPO_PUBLIC_API_URL, 'https://ripple-api-p67c.onrender.com');
  }
});

test('generated release outputs and credentials are ignored', () => {
  const ignore = fs.readFileSync('.gitignore', 'utf8');
  for (const pattern of ['*.apk', '*.aab', '*.keystore', '*.jks', '.gradle/', '.eas/', '*.zip', '.env']) {
    assert.ok(ignore.includes(pattern), `missing ignore rule: ${pattern}`);
  }
});
