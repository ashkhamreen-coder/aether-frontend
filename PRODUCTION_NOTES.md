# Ripple frontend production contract

## Media playback

The frontend requests `/api/content/:id/playback` and mounts a player only when the response has `mediaStatus: "ready"` and an HTTPS media URL. The backend/CDN must make that URL unexpired and browser-accessible:

- returns `200` or `206`, never an HTML/XML error document;
- returns the real browser-playable MIME type (`video/mp4`, WebM, or an HLS MIME type);
- supports `Range` requests and exposes `Content-Type`, `Content-Length`, `Content-Range`, and `Accept-Ranges` through CORS;
- permits the deployed Ripple web origin with `GET`, `HEAD`, and `Range` in its CORS policy; and
- remains valid for the viewing session (or provides a frontend-accessible refresh endpoint).

If Render currently returns a storage error page, the backend must refresh the signed object URL before returning `/api/content/:id`. This cannot be corrected by frontend substitution.

Web playback uses the browser media element and an HLS fallback. Android and Android TV use `expo-video` 3.0.16, the Expo SDK 54 bundled version, with Media3-backed MP4/HLS playback. The native player validates URLs, exposes phone-native controls/fullscreen, supplies TV D-pad/select/play-pause/back controls, persists progress on intervals and lifecycle boundaries, and releases its source on unmount. A generated native project and repository tests do not replace installed phone/TV verification.

## Required production configuration

Set `EXPO_PUBLIC_API_URL` to the HTTPS backend origin in every build environment. The build intentionally fails when it is absent, and production builds fail when it is insecure. The frontend contains no localhost fallback.

The Render frontend service must define:

```text
EXPO_PUBLIC_API_URL=https://ripple-api-p67c.onrender.com
NODE_ENV=production
```

No API, Cloudinary, signing, or refresh secrets belong in the frontend environment. Access tokens are attached only by the central API client; refresh uses `/api/auth/refresh` with the backend's secure, HTTP-only refresh cookie when supported.

## Consumer API expectations

Public home, browse, details, taxonomy, search, and playback metadata may be read anonymously. Profiles, onboarding preferences, My List, feedback, follows, and progress require authentication and backend account/profile ownership checks. Home and popularity responses are authoritative: the frontend hides empty rows and never derives ranks, country claims, percentages, or audience counts.

The consumer expects backend-provided profile maturity eligibility to be enforced on every catalogue, search, recommendation, details, and playback endpoint. Frontend kids filtering is defence in depth, not the authority.

Render cold starts are treated as a waking state for the first 45 seconds. Operators should keep `/health` inexpensive and return normalized JSON error responses for processing, region, and maturity restrictions.

## Web routing

The viewer uses History API paths. Configure the Render static-site rewrite `/*` to `/index.html` with status `200`, so direct links and refreshes are served by Expo's generated entry document rather than returning a platform 404.

## Backend capabilities and rollout

Creator Studio is intentionally excluded from this consumer build. Before enabling each consumer surface, document response schemas for profiles, preferences, dynamic home rows, cursor pagination, aggregate popularity, playback sessions/progress, recommendations, feedback, creator follows, reports, and search facets. The UI must keep unavailable capabilities honest rather than synthesizing success or catalogue statistics.

The repository currently calls only the documented paths visible in the source. It has no verified contracts for creator profiles/filmographies, uploads or transcoding, comments, likes, follows, notification registration, watchlist hydration, history retrieval, recommendation pagination, seasons/episodes, subtitle/audio/quality manifests, or cross-device resume retrieval. Those surfaces must remain absent until backend schemas and authorization behavior are supplied. The existing My List mutation (`POST`/`DELETE /api/content/:id/my-list`) now uses duplicate-safe optimistic updates with rollback and a visible error. Progress mutation (`PUT /api/content/:id/progress`) is sent every 15 seconds and on pause, background, close, completion, and unmount. Cross-device behavior remains blocked until authoritative reads exist. Required read contracts are `GET /api/my-list` returning `{ items: Content[] }` (or an agreed equivalent), and either `GET /api/content/:id/progress` returning `{ positionSeconds, durationSeconds, completed, updatedAt }` or those same fields in the playback response. The player consumes backend `progress.positionSeconds`, `progressSeconds`, or `resumePositionSeconds` when present; it does not synthesize a cross-device position.

## Release verification

Repository render tests and prebuild checks do not reproduce an installed APK process death. A production-signed APK/AAB must still be exercised on phone and TV with `adb logcat` retained across cold launch, corrupt/expired storage, sign-up, sign-in, offline launch, playback, background/resume, and process recreation. Do not label the Android crash resolved until those runs pass.

## Frontend endpoint map

All calls use the centralized client, which supplies bearer authentication when a token exists, JSON parsing, timeout handling, one refresh attempt, and session clearing after an unrecoverable unauthorized response.

| Method | Path | Authentication / consumer |
| --- | --- | --- |
| GET | `/api/home`, `/api/content`, `/api/content/:id`, `/api/search?q=` | Public discovery in `AppShell` and Search |
| GET | `/api/content/:id/playback` | Playback authorization and media metadata in `AppShell` |
| GET | `/api/me` | Authenticated startup/session recovery |
| POST | `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/refresh`, `/api/auth/forgot-password`, `/api/auth/reset-password` | Authentication/session screens and services |
| POST / PUT | `/api/profiles`, `/api/profiles/preferences` | Authenticated profile creation/preferences |
| POST / DELETE | `/api/content/:id/my-list` | Authenticated My List mutation |
| PUT | `/api/content/:id/progress` | Authenticated playback progress `{ positionSeconds, durationSeconds, completed }` |
| GET / POST | `/api/subscriptions/plans`, `/api/subscriptions/checkout` | Public plan read / authenticated checkout |
| POST | `/api/subscriptions/cancel` | Authenticated subscription cancellation |

No verified frontend/backend contracts exist for creator profile/follow reads, filmographies, seasons/episodes/next episode, media track lists or manual quality selection, likes, comments, Not Interested, history reads, reports, sharing records, or notifications. Those controls remain absent. To enable them, the backend must publish authenticated method/path definitions plus stable identifier, pagination, error, and response schemas; series responses additionally need season and ordered episode IDs, artwork, duration, playback eligibility, progress, and `nextEpisodeId`, while media responses need subtitle/audio renditions and quality variants or a master manifest.
