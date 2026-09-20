const fs = require('node:fs');
const path = require('node:path');

const TV_RESOURCES = {
  'ripple_app_icon.xml': `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">
  <path android:fillColor="#05030D" android:pathData="M0,0h108v108h-108z" />
  <path android:fillColor="#FFFFFF" android:pathData="M25,22h31c18,0 29,9 29,25c0,11 -6,19 -16,23l18,16h-22l-15,-14h-8v14h-17zM42,37v21h13c8,0 13,-4 13,-11c0,-7 -5,-10 -13,-10z" />
</vector>
`,
  'ripple_tv_banner.xml': `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
  <item><shape><gradient android:angle="0" android:startColor="#05030D" android:endColor="#241747" /></shape></item>
  <item android:left="112dp" android:right="112dp" android:top="40dp" android:bottom="40dp">
    <shape android:shape="rectangle"><corners android:radius="12dp"/><stroke android:width="2dp" android:color="#B9A5FF"/><solid android:color="#171027"/></shape>
  </item>
</layer-list>
`,
};

function setAttribute(node, name, value) {
  node.$ = node.$ || {};
  node.$[`android:${name}`] = value;
}

function applyTvManifest(androidManifest) {
  const manifest = androidManifest.manifest;
  const application = manifest.application?.[0];
  const activity = application?.activity?.find((candidate) =>
    candidate.$?.['android:name'] === '.MainActivity'
  ) || application?.activity?.[0];
  if (!application || !activity) throw new Error('Android main application/activity is missing.');

  setAttribute(application, 'banner', '@drawable/ripple_tv_banner');
  // Keep a deterministic icon on generated phone and TV builds when no Expo icon
  // is configured. This is Ripple artwork, not the old Aether placeholder.
  setAttribute(application, 'icon', '@drawable/ripple_app_icon');
  setAttribute(application, 'label', 'Ripple');

  manifest['uses-feature'] = manifest['uses-feature'] || [];
  const features = [
    ['android.software.leanback', 'false'],
    ['android.hardware.touchscreen', 'false'],
  ];
  for (const [name, required] of features) {
    let feature = manifest['uses-feature'].find((item) => item.$?.['android:name'] === name);
    if (!feature) {
      feature = { $: { 'android:name': name } };
      manifest['uses-feature'].push(feature);
    }
    setAttribute(feature, 'required', required);
  }

  activity['intent-filter'] = activity['intent-filter'] || [];
  const hasLeanbackLauncher = activity['intent-filter'].some((filter) =>
    filter.category?.some((category) =>
      category.$?.['android:name'] === 'android.intent.category.LEANBACK_LAUNCHER'
    )
  );
  if (!hasLeanbackLauncher) {
    activity['intent-filter'].push({
      action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
      category: [{ $: { 'android:name': 'android.intent.category.LEANBACK_LAUNCHER' } }],
    });
  }

  return androidManifest;
}

function withAndroidTv(config) {
  const { withAndroidManifest, withDangerousMod } = require('expo/config-plugins');
  config = withAndroidManifest(config, (mod) => {
    mod.modResults = applyTvManifest(mod.modResults);
    return mod;
  });

  return withDangerousMod(config, ['android', async (mod) => {
    const drawableDirectory = path.join(
      mod.modRequest.platformProjectRoot,
      'app/src/main/res/drawable'
    );
    await fs.promises.mkdir(drawableDirectory, { recursive: true });
    await Promise.all(Object.entries(TV_RESOURCES).map(([name, contents]) =>
      fs.promises.writeFile(path.join(drawableDirectory, name), contents)
    ));
    return mod;
  }]);
}

module.exports = withAndroidTv;
module.exports.applyTvManifest = applyTvManifest;
module.exports.TV_RESOURCES = TV_RESOURCES;
