export function currentPath(){ if(typeof window==='undefined')return '/'; return window.location.pathname || '/'; }
export function navigate(path,setPath){ if(typeof window!=='undefined'){window.history.pushState({},'',path);window.scrollTo?.(0,0)}setPath(path); }
export const KNOWN_ROUTES=new Set(['/','/films','/series','/shorts','/new','/my-list','/search','/account','/signin','/signup','/forgot-password','/reset-password','/profiles','/profiles/new','/onboarding','/kids','/offline']);
