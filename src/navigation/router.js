export function currentPath(){ if(typeof window==='undefined')return '/'; return window.location.pathname || '/'; }
export function navigate(path,setPath){ if(typeof window!=='undefined'){window.history.pushState({},'',path);window.scrollTo?.(0,0)}setPath(path.split('?')[0]); }
export function replace(path,setPath){ if(typeof window!=='undefined'){window.history.replaceState({},'',path);window.scrollTo?.(0,0)}setPath(path.split('?')[0]); }
export const KNOWN_ROUTES=new Set(['/','/browse','/films','/series','/shorts','/new','/my-list','/search','/plans','/account','/account/subscription','/checkout/success','/checkout/canceled','/signin','/signup','/forgot-password','/reset-password','/profiles','/profiles/new','/onboarding','/kids','/offline']);
