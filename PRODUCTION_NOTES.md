# Ripple frontend production contract

## Media playback

The frontend rejects missing and non-HTTPS media, then performs a two-byte range request before mounting the player. The backend/CDN must make `videoUrl` an unexpired HTTPS URL that:

- returns `200` or `206`, never an HTML/XML error document;
- returns the real browser-playable MIME type (`video/mp4`, WebM, or an HLS MIME type);
- supports `Range` requests and exposes `Content-Type`, `Content-Length`, `Content-Range`, and `Accept-Ranges` through CORS;
- permits the deployed Ripple web origin with `GET`, `HEAD`, and `Range` in its CORS policy; and
- remains valid for the viewing session (or provides a frontend-accessible refresh endpoint).

If Render currently returns a storage error page, the backend must refresh the signed object URL before returning `/api/content/:id`. This cannot be corrected by frontend substitution.

## Endpoints still required

The UI does not claim uploads or publication succeed. The backend must document schemas for project drafts, upload signing/completion, processing status, moderation submission, publication, analytics, notifications, reporting, comments, recommendations, and creator follow state. `EXPO_PUBLIC_API_URL` must be injected at build time; no secrets belong in it.
