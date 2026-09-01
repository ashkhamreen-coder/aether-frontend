const assert = require('node:assert/strict');
const test = require('node:test');

const { applyTvManifest, PLACEHOLDER_RESOURCES } = require('./plugins/withAndroidTv');

test('adds TV capabilities and launch entry without duplicating mobile launch configuration', () => {
  const manifest = {
    manifest: {
      application: [{
        $: { 'android:name': '.MainApplication' },
        activity: [{
          $: { 'android:name': '.MainActivity' },
          'intent-filter': [{
            action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
            category: [{ $: { 'android:name': 'android.intent.category.LAUNCHER' } }],
          }],
        }],
      }],
    },
  };

  applyTvManifest(manifest);

  const application = manifest.manifest.application[0];
  const features = manifest.manifest['uses-feature'];
  const filters = application.activity[0]['intent-filter'];
  assert.equal(application.$['android:banner'], '@drawable/tv_banner_placeholder');
  assert.equal(application.$['android:icon'], '@drawable/app_icon_placeholder');
  assert.deepEqual(features.map((feature) => feature.$), [
    { 'android:name': 'android.software.leanback', 'android:required': 'false' },
    { 'android:name': 'android.hardware.touchscreen', 'android:required': 'false' },
  ]);
  assert.equal(filters.length, 2);
});

test('placeholder Android artwork is text-only XML', () => {
  for (const [name, contents] of Object.entries(PLACEHOLDER_RESOURCES)) {
    assert.match(name, /\.xml$/);
    assert.match(contents, /^<\?xml/);
  }
});
