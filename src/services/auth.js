import { api } from './api';
import { setSession } from './session';

// The deployed API contract is POST /api/auth/login with { email, password }.
// Keep all backend compatibility mapping here rather than throughout the UI.
export function normalizeAuthResponse(payload = {}) {
  const source = payload.data && typeof payload.data === 'object' ? payload.data : payload;
  const accessToken = source.accessToken || source.token;
  const refreshToken = source.refreshToken || null;
  const expiresAt = source.expiresAt || (source.expiresIn ? Date.now() + Number(source.expiresIn) * 1000 : null);
  const user = source.user || null;
  if (!accessToken || typeof accessToken !== 'string') throw new Error('INVALID_AUTH_RESPONSE');
  return { user, accessToken, refreshToken, expiresAt };
}

export async function signIn(email, password) {
  const payload = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: email.trim().toLowerCase(), password }), _skipAuth: true });
  const session = normalizeAuthResponse(payload);
  await setSession(session);
  const profile = await api('/api/me');
  const user = profile.user || profile;
  const completed = { ...session, user };
  await setSession(completed);
  return completed;
}

export async function signUp(fields) {
  const payload = await api('/api/auth/register', { method: 'POST', body: JSON.stringify(fields), _skipAuth: true });
  const session = normalizeAuthResponse(payload);
  await setSession(session);
  return session;
}
