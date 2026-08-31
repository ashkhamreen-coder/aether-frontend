const DEFAULT_TIMEOUT_MS = 10000;

class ApiError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ApiError';
    Object.assign(this, details);
  }
}

function createApiClient({ baseUrl, getToken, refreshToken, onUnauthorized, fetchImpl = globalThis.fetch, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  const base = String(baseUrl || '').trim().replace(/\/+$/, '');
  const pending = new Map();
  async function request(path, options = {}) {
    if (!base) throw new ApiError('Ripple is not connected. Set EXPO_PUBLIC_API_URL and rebuild the app.', { code: 'NOT_CONFIGURED' });
    const method = String(options.method || 'GET').toUpperCase();
    const normalizedPath = `/${String(path).replace(/^\/+/, '')}`;
    const dedupeKey = method === 'GET' && !options.signal && !options._refreshed ? normalizedPath : null;
    if (dedupeKey && pending.has(dedupeKey)) return pending.get(dedupeKey);
    const run = async () => {
    const retries = method === 'GET' ? (options.retries ?? 1) : 0;
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), options.timeoutMs || timeoutMs);
      const abort = () => controller.abort();
      options.signal?.addEventListener('abort', abort, { once: true });
      try {
        const token = await getToken?.();
        const response = await fetchImpl(`${base}${normalizedPath}`, {
          ...Object.fromEntries(Object.entries(options).filter(([key]) => !key.startsWith('_'))),
          signal: controller.signal,
          headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
        });
        const type = response.headers?.get?.('content-type') || '';
        const data = type.includes('json') ? await response.json().catch(() => ({})) : {};
        if (response.status === 401 && refreshToken && !options._refreshed) {
          const refreshed = await refreshToken();
          if (refreshed) return request(normalizedPath, { ...options, _refreshed: true, retries: 0 });
        }
        if (response.status === 401) await onUnauthorized?.();
        if (!response.ok) throw new ApiError(data.error || data.message || `Request failed (${response.status})`, { status: response.status, code: 'HTTP_ERROR' });
        return data;
      } catch (error) {
        lastError = error instanceof ApiError ? error : new ApiError(error.name === 'AbortError' ? 'The request timed out.' : 'Ripple could not reach the service.', { code: error.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR', cause: error });
        if (attempt === retries || (lastError.status && lastError.status < 500)) throw lastError;
        await new Promise(resolve => setTimeout(resolve, 250 * (2 ** attempt)));
      } finally {
        clearTimeout(timer);
        options.signal?.removeEventListener('abort', abort);
      }
    }
    throw lastError;
    };
    const promise = run();
    if (dedupeKey) pending.set(dedupeKey, promise);
    try { return await promise; } finally { if (dedupeKey && pending.get(dedupeKey) === promise) pending.delete(dedupeKey); }
  }
  return { request };
}

module.exports = { ApiError, createApiClient };
