const DEV_FALLBACK = 'http://localhost:3000';

function getApiBaseUrl(env = process.env) {
  const configured = String(env.EXPO_PUBLIC_API_URL || '').trim().replace(/\/+$/, '');
  if (configured) {
    let parsed;
    try { parsed = new URL(configured); } catch { throw new Error('EXPO_PUBLIC_API_URL must be a valid absolute URL.'); }
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('EXPO_PUBLIC_API_URL must use HTTP or HTTPS.');
    if (env.NODE_ENV === 'production' && parsed.protocol !== 'https:') throw new Error('EXPO_PUBLIC_API_URL must use HTTPS in production.');
    return configured;
  }
  if (env.NODE_ENV === 'production') throw new Error('EXPO_PUBLIC_API_URL is required for a production build.');
  return DEV_FALLBACK;
}

module.exports = { DEV_FALLBACK, getApiBaseUrl };
