import { api } from './api';
import { clearSession, setSession } from './session';
import { AUTH_ROUTES, loginPayload, normalizeAuthResponse, registrationPayload } from '../../authContract';

// The deployed API contract is POST /api/auth/login with { email, password }.
// Keep all backend compatibility mapping here rather than throughout the UI.
async function completeSession(session) {
  try {
    const profile = await api(AUTH_ROUTES.currentUser);
    const user = profile?.user || profile?.data?.user || profile?.data || profile;
    if (!user || typeof user !== 'object') throw new Error('INVALID_PROFILE_RESPONSE');
    const completed = { ...session, user };
    await setSession(completed);
    return completed;
  } catch (error) {
    if (session.user && typeof session.user === 'object' && error?.status !== 401 && error?.status !== 403) return session;
    await clearSession();
    throw error;
  }
}

export async function signIn(email, password) {
  const payload = await api(AUTH_ROUTES.login, { method: 'POST', body: JSON.stringify(loginPayload(email, password)), _skipAuth: true });
  const session = normalizeAuthResponse(payload);
  await setSession(session);
  return completeSession(session);
}

export async function signUp({ name, email, password }) {
  const payload = await api(AUTH_ROUTES.register, { method: 'POST', body: JSON.stringify(registrationPayload({ name, email, password })), _skipAuth: true });
  const session = normalizeAuthResponse(payload);
  await setSession(session);
  return completeSession(session);
}

export async function signOut() {
  try { await api(AUTH_ROUTES.logout, { method: 'POST' }); }
  finally { await setSession(null); }
}
