// This must be explicitly enabled in a development or admin build. Keep the
// production default closed so diagnostic media can never leak into customer UI.
export const technicalPlaybackTestsEnabled = process.env.EXPO_PUBLIC_ENABLE_TECHNICAL_PLAYBACK_TESTS === 'true';
