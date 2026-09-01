import { api } from './api';
import { setSession } from './session';
import { AUTH_ROUTES, loginPayload, normalizeAuthResponse, registrationPayload } from '../../authContract';

// The deployed API contract is POST /api/auth/login with { email, password }.
// Keep all backend compatibility mapping here rather than throughout the UI.
export async function signIn(email, password) {
  const payload = await api(AUTH_ROUTES.login, { method: 'POST', body: JSON.stringify(loginPayload(email, password)), _skipAuth: true });
  const session = normalizeAuthResponse(payload);
  await setSession(session);
  const profile = await api(AUTH_ROUTES.currentUser);
  const user = profile.user || profile;
  const completed = { ...session, user };
  await setSession(completed);
  return completed;
}

export async function signUp({ name, email, password }) {
  const payload = await api(AUTH_ROUTES.register, { method: 'POST', body: JSON.stringify(registrationPayload({ name, email, password })), _skipAuth: true });
  const session = normalizeAuthResponse(payload);
  await setSession(session);
  const profile = await api(AUTH_ROUTES.currentUser);
  const completed = { ...session, user: profile.user || profile };
  await setSession(completed);
  return completed;
}

export async function signOut() {
  try { await api(AUTH_ROUTES.logout, { method: 'POST' }); }
  finally { await setSession(null); }
}
