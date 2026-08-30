import { Platform } from 'react-native';

const KEY = 'ripple_access_token';
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
