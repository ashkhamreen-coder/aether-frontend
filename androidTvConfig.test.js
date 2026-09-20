const assert = require('node:assert/strict');
const test = require('node:test');

const { applyTvManifest, TV_RESOURCES } = require('./plugins/withAndroidTv');

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
  assert.equal(application.$['android:banner'], '@drawable/ripple_tv_banner');
  assert.equal(application.$['android:icon'], '@drawable/ripple_app_icon');
  assert.equal(application.$['android:label'], 'Ripple');
  assert.deepEqual(features.map((feature) => feature.$), [
    { 'android:name': 'android.software.leanback', 'android:required': 'false' },
    { 'android:name': 'android.hardware.touchscreen', 'android:required': 'false' },
  ]);
  assert.equal(filters.length, 2);
});

test('Ripple Android TV artwork is generated as durable drawable XML', () => {
  for (const [name, contents] of Object.entries(TV_RESOURCES)) {
    assert.match(name, /\.xml$/);
    assert.match(contents, /^<\?xml/);
  }
});
