# Ripple frontend production contract

## Media playback

The frontend requests `/api/content/:id/playback` and mounts a player only when the response has `mediaStatus: "ready"` and an HTTPS media URL. The backend/CDN must make that URL unexpired and browser-accessible:

- returns `200` or `206`, never an HTML/XML error document;
- returns the real browser-playable MIME type (`video/mp4`, WebM, or an HLS MIME type);
- supports `Range` requests and exposes `Content-Type`, `Content-Length`, `Content-Range`, and `Accept-Ranges` through CORS;
- permits the deployed Ripple web origin with `GET`, `HEAD`, and `Range` in its CORS policy; and
- remains valid for the viewing session (or provides a frontend-accessible refresh endpoint).

If Render currently returns a storage error page, the backend must refresh the signed object URL before returning `/api/content/:id`. This cannot be corrected by frontend substitution.

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
