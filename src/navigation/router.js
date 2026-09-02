import { Platform } from 'react-native';

export function currentPath(){ if(Platform.OS!=='web')return '/'; return globalThis.window.location.pathname || '/'; }
export function navigate(path,setPath){ if(Platform.OS==='web'){globalThis.window.history.pushState({},'',path);globalThis.window.scrollTo?.(0,0)}setPath(path.split('?')[0]); }
export function replace(path,setPath){ if(Platform.OS==='web'){globalThis.window.history.replaceState({},'',path);globalThis.window.scrollTo?.(0,0)}setPath(path.split('?')[0]); }
export const KNOWN_ROUTES=new Set(['/','/browse','/films','/series','/shorts','/new','/my-list','/search','/plans','/account','/account/subscription','/checkout/success','/checkout/canceled','/signin','/signup','/forgot-password','/reset-password','/profiles','/profiles/new','/onboarding','/kids','/offline']);
