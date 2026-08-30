import { createApiClient } from '../../apiClient';
import { getApiBaseUrl } from '../../apiConfig';
import { getAccessToken, setAccessToken } from './session';

const baseUrl = getApiBaseUrl();
let client;
async function refreshToken() {
  try {
    const response = await fetch(`${baseUrl}/api/auth/refresh`, { method:'POST', credentials:'include', headers:{ Accept:'application/json' } });
    if (!response.ok) return false;
    const body = await response.json();
    if (!body.token && !body.accessToken) return false;
    await setAccessToken(body.token || body.accessToken);
    return true;
  } catch { return false; }
}
export function api(path, options) {
  client ||= createApiClient({ baseUrl, getToken:getAccessToken, refreshToken, onUnauthorized:()=>setAccessToken(null), timeoutMs:15000 });
  return client.request(path, options);
}
export { baseUrl };
