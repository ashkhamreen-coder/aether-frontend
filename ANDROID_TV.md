# Android and Android TV source build

Ripple remains an Expo managed/CNG project. The native `android/` directory is
generated locally and is intentionally ignored; do not commit it or any Gradle
wrapper JAR, application package, signing key, or generated native output.

## Generate and run

1. Install dependencies with `npm ci`.
2. Configure the production environment described in `PRODUCTION_NOTES.md`.
3. Generate a disposable native project with `npx expo prebuild --platform android`.
4. Build or run it through Expo/EAS, then delete the generated `android/` folder.

`plugins/withAndroidTv.js` applies the Android TV manifest declarations during
prebuild. It retains the standard phone/tablet launcher, adds a Leanback launcher,
makes touch and Leanback hardware optional, and points Android at text-only XML
placeholder artwork.

## Artwork required before release

The XML artwork is deliberately a build-safe placeholder, not release branding.
Before submitting to Google Play, add final artwork through a source-only delivery
mechanism (for example, an approved external asset pipeline) without committing
binary files to this repository:

- **Launcher icon:** production adaptive/legacy icon source and density variants.
- **Android TV banner:** a branded 320 x 180 px (xhdpi) banner, plus any density
  variants required by the release pipeline.

Update the config plugin resource references when that pipeline is available.
Never commit APK, AAB, JAR, PNG, keystore/JKS, video, credentials, or generated
native build files.

## Runtime and SDK compatibility

Expo's SDK 54 TV guide pairs React Native 0.81 with the published
`react-native-tvos@0.81.5-0` release. The dependency uses npm's package alias so
imports remain `react-native`, as required by Expo and application code; it is
pinned rather than tracking `latest`.

The TV runtime uses `Platform.isTV` to select a persistent, remote-focused side
navigation and larger catalogue cards. React Native TV's focus engine provides
D-pad movement, while preferred initial focus, high-contrast focused borders,
hardware Back handling, and modal close focus make entry and restoration
predictable. Player buttons accept Select and the remote play/pause event; Left
and Right seek by ten seconds when the active media implementation supports it.
The web header/player and Android phone navigation remain selected on their
existing platform paths.

Source: [Expo — Build apps for TV](https://docs.expo.dev/guides/building-for-tv/).
