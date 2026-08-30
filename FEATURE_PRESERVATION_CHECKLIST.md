# Ripple feature-preservation checklist

This checklist records the latest viewer capabilities audited before the cinematic UI correction. The visual work must remain additive: live API responses always take precedence over editorial preview data, and editorial items never become playable without a backend media response.

## Platform and reliability

- [x] Centralized production API client, URL validation, request timeout, retry, deduplication, and stale-request abort support
- [x] Backend wake-up, unavailable, offline, loading, empty, and retry states
- [x] Production backend URL (`https://ripple-api-p67c.onrender.com`) remains build-time validated
- [x] Responsive phone, tablet, iPad landscape, desktop, and safe-area navigation architecture
- [x] Cloudinary technical playback test remains isolated at the bottom of Home

## Accounts and personalization

- [x] Sign up, sign in, forgot/reset-password routes, secure token storage, and session restoration
- [x] Viewer-profile, profile-selection, create/edit-profile, kids-profile, and account route architecture
- [x] Country, language, subtitle, genre, and maturity onboarding architecture
- [x] Personalized backend Home rows, including Continue Watching, Top 10, Trending, Popular by country/globally, new/recent titles, Top Picks, and Because You Watched
- [x] My List, likes, Not Interested, creator-following, watch-progress, and resume API architecture

## Discovery and catalogue

- [x] Backend-driven Home, search/suggestions/filter architecture, genre/language routes, and New & Popular
- [x] Film, series, short, season, episode, similar-title, and content-detail architecture
- [x] Region and maturity eligibility remain backend-authoritative
- [x] Editorial mythology/AI-cinema previews are visibly labelled “Editorial preview” and “Coming Soon”
- [x] Backend-supplied popularity/ranks only; no fabricated rankings or view counts

## Trust, playback, and accessibility

- [x] AI disclosure, cultural context, origin/language/subtitle metadata, sharing, and reporting presentation
- [x] MP4 playback, HLS fallback, poster, native controls, captions, fullscreen, retry, progress reporting, and cleanup
- [x] Next-episode data architecture remains accepted from playback/detail payloads
- [x] Semantic navigation, buttons, labelled player controls, keyboard focus, modal focus restoration, reduced motion, contrast, and 44px targets

## Visual correction guardrails

- [x] Full-bleed cinematic hero precedes all rails
- [x] Live featured content is preferred; a non-playable editorial hero safely fills sparse catalogues
- [x] Important discovery rails precede editorial preview rails
- [x] Technical test is excluded from hero, rankings, trending, and ordinary catalogue rows
- [x] Creator Studio is not exposed to viewers
