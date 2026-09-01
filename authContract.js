const AUTH_ROUTES = Object.freeze({
  login: '/api/auth/login', register: '/api/auth/register', currentUser: '/api/me',
  refresh: '/api/auth/refresh', logout: '/api/auth/logout',
});
const loginPayload = (email, password) => ({ email: String(email).trim().toLowerCase(), password });
const registrationPayload = ({ name, email, password }) => ({ name: String(name).trim(), email: String(email).trim().toLowerCase(), password });
function normalizeAuthResponse(payload = {}) {
  const source = payload.data && typeof payload.data === 'object' ? payload.data : payload;
  const accessToken = source.accessToken || source.token;
  if (!accessToken || typeof accessToken !== 'string') throw new Error('INVALID_AUTH_RESPONSE');
  return { user: source.user || null, accessToken, refreshToken: source.refreshToken || null,
    expiresAt: source.expiresAt || (source.expiresIn ? Date.now() + Number(source.expiresIn) * 1000 : null) };
}
module.exports = { AUTH_ROUTES, loginPayload, registrationPayload, normalizeAuthResponse };
