import { Platform } from 'react-native';

const KEY = 'ripple_access_token';
const SESSION_KEY = 'ripple_session';
export async function getAccessToken() {
  if (Platform.OS === 'web') { try { return globalThis.localStorage?.getItem(KEY) || null; } catch { return null; } }
  const store = require('expo-secure-store');
  return store.getItemAsync(KEY);
}
export async function setAccessToken(token) {
  if (Platform.OS === 'web') { try { token ? globalThis.localStorage?.setItem(KEY, token) : globalThis.localStorage?.removeItem(KEY); } catch {} return; }
  const store = require('expo-secure-store');
  return token ? store.setItemAsync(KEY, token) : store.deleteItemAsync(KEY);
}
export async function getSession() {
  if (Platform.OS !== 'web') return null;
  try { const value = globalThis.localStorage?.getItem(SESSION_KEY); return value ? JSON.parse(value) : null; } catch { return null; }
}
export async function setSession(session) {
  await setAccessToken(session?.accessToken || null);
  if (Platform.OS !== 'web') return;
  try { session ? globalThis.localStorage?.setItem(SESSION_KEY, JSON.stringify(session)) : globalThis.localStorage?.removeItem(SESSION_KEY); } catch {}
}
export async function clearSession() { await setSession(null); }
