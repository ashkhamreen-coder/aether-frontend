import { Platform } from 'react-native';

const KEY = 'ripple_access_token';
const SESSION_KEY = 'ripple_session';
export async function getAccessToken() {
  if (Platform.OS === 'web') { try { return globalThis.localStorage?.getItem(KEY) || null; } catch { return null; } }
  try { const store = require('expo-secure-store'); return await store.getItemAsync(KEY); } catch { return null; }
}
export async function setAccessToken(token) {
  if (Platform.OS === 'web') { try { token ? globalThis.localStorage?.setItem(KEY, token) : globalThis.localStorage?.removeItem(KEY); } catch {} return; }
  try { const store = require('expo-secure-store'); return token ? await store.setItemAsync(KEY, token) : await store.deleteItemAsync(KEY); } catch { return undefined; }
}
export async function getSession() {
  try {
    const value = Platform.OS === 'web' ? globalThis.localStorage?.getItem(SESSION_KEY) : await require('expo-secure-store').getItemAsync(SESSION_KEY);
    if (!value) return null;
    const session = JSON.parse(value);
    return session && typeof session === 'object' && typeof session.accessToken === 'string' ? session : null;
  } catch { return null; }
}
export async function setSession(session) {
  await setAccessToken(session?.accessToken || null);
  try {
    if (Platform.OS === 'web') session ? globalThis.localStorage?.setItem(SESSION_KEY, JSON.stringify(session)) : globalThis.localStorage?.removeItem(SESSION_KEY);
    else { const store=require('expo-secure-store'); session ? await store.setItemAsync(SESSION_KEY, JSON.stringify(session)) : await store.deleteItemAsync(SESSION_KEY); }
  } catch {}
}
export async function clearSession() { await setSession(null); }
