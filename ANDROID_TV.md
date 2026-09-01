# Ripple Android mobile, tablet, and TV builds

Ripple is an Expo managed/CNG project. The same source targets phones, tablets,
Android TV, and web. The generated `android/` directory is disposable and ignored.
Never commit it, an APK/AAB, Gradle output, credentials, or signing material.

## Prerequisites and configuration

- Node.js 20.19+, npm, Java 17, Android Studio, the Android SDK/platform tools,
  and (for cloud builds) the current EAS CLI: `npm install --global eas-cli`.
- Run `npm ci`, then `eas login`. Link the project with `eas init` only when the
  owning Expo organization is known; do not invent or commit an EAS project ID.
- `EXPO_PUBLIC_API_URL` must be
  `https://ripple-api-p67c.onrender.com`. It is public configuration, not a
  credential. Keep every secret in EAS environment/credentials storage, never in
  `.env`, `eas.json`, Git, or the Android project.
- Package `com.aethercreators.ripple` is retained because changing an installed
  application ID breaks upgrades and can invalidate authentication/app links.
  The visible name is **Ripple**, version is 2.0.0, and EAS remotely increments
  production version codes after the source baseline.

## Build and install

Generate/run a local development build (USB device or emulator):

```bash
EXPO_PUBLIC_API_URL=https://ripple-api-p67c.onrender.com npm run android:prebuild
npm run android
```

Cloud profiles are source-only configuration. Development and preview emit APKs;
production emits an AAB:

```bash
npm run build:android:development
npm run build:android:preview
npm run build:android:production
```

Download build artifacts outside this repository. Install an APK on a connected
phone, tablet, or TV with `adb devices` followed by
`adb install -r /external/path/ripple.apk`. An AAB is uploaded to Play Console
and is not directly installable. EAS/Play App Signing credentials belong in the
Expo credential service or the Play Console, not in source control.

## Android TV emulator and remote test

In Android Studio Device Manager, create a TV device with a current Google TV or
Android TV image. Start it, install the preview APK using `adb install -r`, and
launch Ripple from the TV Apps row. Verify **Up, Down, Left, Right, Select/Enter,
Play/Pause, and Back** with the emulator remote. Confirm the initial navigation
item receives a visible focus ring; every horizontal rail can be entered and
exited vertically; details and player close on Back; focus returns to useful
content; and all player controls are reachable. Repeat touch, system Back,
portrait browsing, rotation/fullscreen playback, sign-up/sign-in/sign-out,
session restore, expired-session handling, backend cold start, and failed MP4/HLS
on physical phones/tablets. Automated checks do not constitute device testing or
Android TV certification.

## Manifest and artwork

`plugins/withAndroidTv.js` preserves the normal `LAUNCHER`, adds
`LEANBACK_LAUNCHER`, marks Leanback and touchscreen optional, and sets an
application TV banner. Verify every generated project:

```bash
EXPO_PUBLIC_API_URL=https://ripple-api-p67c.onrender.com npx expo prebuild --platform android --no-install
grep -E 'LAUNCHER|LEANBACK_LAUNCHER|software.leanback|hardware.touchscreen|android:banner' android/app/src/main/AndroidManifest.xml
```

The plugin generates text-only XML placeholders so no fake binary artwork enters
Git. Before release, replace `@drawable/tv_banner_placeholder` through the
approved asset pipeline with a branded **320 × 180 px** TV banner and replace
`@drawable/app_icon_placeholder` with production adaptive/legacy launcher icon
resources. Update the resource references in `plugins/withAndroidTv.js`. Keep
source artwork in an approved source repository/pipeline and generated density
variants out of this repository.

## Play Console checklist

- Build the production AAB with the intended Expo account and external signing.
- Confirm package, display name, version/version code, target SDK, privacy/data
  safety declarations, content rating, store listing, and production artwork.
- Upload first to an internal testing track; test install/upgrade on a phone,
  tablet, and representative TV devices.
- Validate touch and responsive layouts plus TV launcher visibility, banner,
  D-pad focus, Select, Back, accessibility, playback/error states, and auth against
  the deployed HTTPS API.
- Complete Android TV quality review requirements and provide TV screenshots only
  after real emulator/device validation. Do not claim Play or TV certification
  merely because prebuild or automated tests pass.
