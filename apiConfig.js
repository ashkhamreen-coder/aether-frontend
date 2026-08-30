const BUILD_API_URL = process.env.EXPO_PUBLIC_API_URL;
const BUILD_NODE_ENV = process.env.NODE_ENV;

function getApiBaseUrl(env) {
  const source = env || {
    EXPO_PUBLIC_API_URL: BUILD_API_URL,
    NODE_ENV: BUILD_NODE_ENV,
  };
  const configured = String(source.EXPO_PUBLIC_API_URL || '').trim().replace(/\/+$/, '');
  if (configured) {
    let parsed;
    try { parsed = new URL(configured); } catch { throw new Error('EXPO_PUBLIC_API_URL must be a valid absolute URL.'); }
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('EXPO_PUBLIC_API_URL must use HTTP or HTTPS.');
    if (source.NODE_ENV === 'production' && parsed.protocol !== 'https:') throw new Error('EXPO_PUBLIC_API_URL must use HTTPS in production.');
    return configured;
  }
  throw new Error('EXPO_PUBLIC_API_URL is required. Copy .env.example for local development.');
}

module.exports = { getApiBaseUrl };
