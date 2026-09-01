const fs = require('node:fs');
const path = require('node:path');
const {
  AndroidConfig,
  withAndroidManifest,
  withDangerousMod,
} = require('expo/config-plugins');

const PLACEHOLDER_RESOURCES = {
  'app_icon_placeholder.xml': `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">
  <path android:fillColor="#05030D" android:pathData="M0,0h108v108h-108z" />
  <path android:fillColor="#9B7BFF" android:pathData="M24,27h60v12h-24v42h-12v-42h-24z" />
</vector>
`,
  'tv_banner_placeholder.xml': `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
  <item><shape><solid android:color="#05030D" /></shape></item>
</layer-list>
`,
};

function setAttribute(node, name, value) {
  node.$ = node.$ || {};
  node.$[`android:${name}`] = value;
}

function applyTvManifest(androidManifest) {
  const manifest = androidManifest.manifest;
  const application = AndroidConfig.Manifest.getMainApplicationOrThrow(androidManifest);
  const activity = AndroidConfig.Manifest.getMainActivityOrThrow(androidManifest);

  setAttribute(application, 'banner', '@drawable/tv_banner_placeholder');
  setAttribute(application, 'icon', '@drawable/app_icon_placeholder');

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
    await Promise.all(Object.entries(PLACEHOLDER_RESOURCES).map(([name, contents]) =>
      fs.promises.writeFile(path.join(drawableDirectory, name), contents)
    ));
    return mod;
  }]);
}

module.exports = withAndroidTv;
module.exports.applyTvManifest = applyTvManifest;
module.exports.PLACEHOLDER_RESOURCES = PLACEHOLDER_RESOURCES;
