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

Set `EXPO_PUBLIC_API_URL` to the HTTPS backend origin in the production build environment. The build intentionally fails when it is absent or insecure. Localhost is used only as a clearly defined development fallback.

Upload requests are authenticated multipart requests to `/api/content/upload`. Cloudinary signing and the API secret remain backend-only; the frontend never contains `API_SECRET`.

## Endpoints still required

The UI does not claim uploads or publication succeed. The backend must document schemas for project drafts, upload signing/completion, processing status, moderation submission, publication, analytics, notifications, reporting, comments, recommendations, and creator follow state. `EXPO_PUBLIC_API_URL` must be injected at build time; no secrets belong in it.
