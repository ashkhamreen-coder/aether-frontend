import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Header } from '../components/Header';
import { MobileNavigation } from '../components/MobileNavigation';
import { ContentDetails } from '../components/ContentDetails';
import { VideoPlayer } from '../components/VideoPlayer';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { CatalogueScreen } from '../screens/CatalogueScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { PasswordScreen } from '../screens/PasswordScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { PlansScreen } from '../screens/PlansScreen';
import { SubscriptionScreen } from '../screens/SubscriptionScreen';
import { StatePanel } from '../components/StatePanel';
import { api } from '../services/api';
import { getAccessToken } from '../services/session';
import { arrayFrom, idOf, isTechnicalTest, normalizeRows } from '../utils/content';
import { serviceState, progressPayload } from '../../consumerCore';
import { playbackDecision } from '../../playerReliability';
import { currentPath, KNOWN_ROUTES, navigate as go, replace as replaceRoute } from './router';
import { tokens } from '../theme/tokens';
import { editorialTitles, routeEditorial } from '../data/editorial';

const titleIdFromPath = path => path.startsWith('/title/') ? decodeURIComponent(path.slice(7)) : '';

export function AppShell() {
  const { width } = useWindowDimensions();
  const compact = width < 1024;
  const [path, setPath] = useState(currentPath);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailState, setDetailState] = useState({ loading: false, error: '' });
  const [player, setPlayer] = useState(null);
  const [saved, setSaved] = useState(new Set());
  const [state, setState] = useState({ loading: true, error: '', service: 'ready', rows: [], catalogue: [], technical: [], hero: null });
  const navigate = useCallback(next => go(next, setPath), []);
  const replace = useCallback(next => replaceRoute(next, setPath), []);

  useEffect(() => { if (typeof window === 'undefined') return; const pop = () => setPath(currentPath()); window.addEventListener('popstate', pop); return () => window.removeEventListener('popstate', pop); }, []);

  const load = useCallback(async () => {
    const began = Date.now();
    setState(previous => ({ ...previous, loading: true, error: '' }));
    try {
      const [homeResult, contentResult] = await Promise.allSettled([api('/api/home'), api('/api/content')]);
      if (homeResult.status === 'rejected' && contentResult.status === 'rejected') throw homeResult.reason;
      const home = homeResult.status === 'fulfilled' ? homeResult.value : {};
      const rows = normalizeRows(home);
      const allContent = (contentResult.status === 'fulfilled' ? arrayFrom(contentResult.value, 'content') : []).filter(item => item && idOf(item));
      const catalogue = allContent.filter(item => !isTechnicalTest(item));
      const technical = allContent.filter(isTechnicalTest);
      const featured = arrayFrom(home, 'featured').concat(rows.flatMap(row => row.items)).filter(item => item && !isTechnicalTest(item));
      setState({ loading: false, error: '', service: 'ready', rows, catalogue, technical, hero: featured.find(item => item.featured) || featured[0] || null });
    } catch (error) {
      setState(previous => ({ ...previous, loading: false, error: error.message || 'Ripple could not reach the service.', service: serviceState(error, Date.now() - began, typeof navigator === 'undefined' || navigator.onLine) }));
    }
  }, []);

  useEffect(() => {
    load();
    let active = true;
    getAccessToken().then(async token => {
      if (!token) return;
      try {
        const value = await api('/api/me');
        if (active) { setUser(value.user || value); setSubscription(value.subscription || value.user?.subscription || null); }
      } catch {}
    }).finally(() => { if (active) setAuthResolved(true); });
    return () => { active = false; };
  }, [load]);

  useEffect(() => { if (path === '/' && authResolved && user) replace('/browse'); }, [path, authResolved, user, replace]);

  const loadDetails = useCallback(async id => {
    if (!id) return;
    setDetailState({ loading: true, error: '' });
    try { const value = await api(`/api/content/${encodeURIComponent(id)}`); setDetails(value.content || value.data || value); setDetailState({ loading: false, error: '' }); }
    catch (error) { setDetails(null); setDetailState({ loading: false, error: error.message || 'Title details are unavailable.' }); }
  }, []);

  useEffect(() => { const id = titleIdFromPath(path); if (id) loadDetails(id); else setDetails(null); }, [path, loadDetails]);
  const open = useCallback(item => { if (item?.isEditorialPreview) { setDetails(item); return; } const id = idOf(item); if (id) navigate(`/title/${encodeURIComponent(id)}`); }, [navigate]);
  const closeDetails = useCallback(() => navigate('/browse'), [navigate]);

  const play = useCallback(async item => {
    const id = idOf(item); if (!id) return;
    if (item.requiresSubscription || (item.playbackAllowed === false && item.requiredPlan)) { navigate('/plans'); return; }
    try {
      const data = await api(`/api/content/${encodeURIComponent(id)}/playback`);
      const payload = data.playback || data.data || data;
      const decision = playbackDecision(payload);
      if (decision.kind === 'ready') { setDetails(null); setPlayer({ ...item, ...payload, ...decision.playback }); }
      else setDetails({ ...item, ...payload, mediaStatus: payload.mediaStatus || decision.kind });
    } catch (error) { setDetails({ ...item, playbackError: error.message, mediaStatus: error.code === 'MEDIA_PROCESSING' ? 'processing' : 'unavailable' }); }
  }, [navigate]);

  const toggleList = useCallback(item => {
    if (!user) return;
    const id = idOf(item); if (!id) return;
    const removing = saved.has(id);
    api(`/api/content/${encodeURIComponent(id)}/my-list`, { method: removing ? 'DELETE' : 'POST' }).then(() => setSaved(old => { const next = new Set(old); removing ? next.delete(id) : next.add(id); return next; })).catch(() => {});
  }, [user, saved]);

  const catalogue = useMemo(() => state.catalogue.filter(item => !isTechnicalTest(item)), [state.catalogue]);
  let screen;
  if (path === '/' && !authResolved) screen = <StatePanel busy title="Loading Ripple" message="Checking your session."/>;
  else if (path === '/') screen = <WelcomeScreen navigate={navigate}/>;
  else if (path === '/browse') screen = <HomeScreen state={state} retry={load} onOpen={open} onPlay={play} onToggleList={toggleList} saved={saved} canSave={Boolean(user)} onScroll={event => setHeaderScrolled(event.nativeEvent.contentOffset.y > 36)}/>;
  else if (path === '/search') screen = <SearchScreen onOpen={open}/>;
  else if (path === '/new') {
    const recentlyAdded = catalogue.filter(item => !item.comingSoon && String(item.releaseStatus || '').toLowerCase() !== 'coming soon');
    const comingSoon = catalogue.filter(item => item.comingSoon || String(item.releaseStatus || '').toLowerCase() === 'coming soon').concat(editorialTitles.filter(item => item.isEditorialPreview));
    screen = <CatalogueScreen title="New & Popular" items={recentlyAdded} rows={comingSoon.length ? [{ id:'coming-soon', title:'Coming Soon', items:comingSoon, portrait:true }] : []} loading={state.loading} onOpen={open} onPlay={play} empty="No recently added titles are available right now."/>;
  }
  else if (path === '/signin' || path === '/signup') screen = <AuthScreen mode={path === '/signup' ? 'signup' : 'signin'} initialEmail={path === '/signup' && typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('email') || '' : ''} navigate={navigate} onComplete={(value,created) => { setUser(value); const intended=typeof sessionStorage!=='undefined'?sessionStorage.getItem('ripple_intended_route'):null; if(typeof sessionStorage!=='undefined')sessionStorage.removeItem('ripple_intended_route'); navigate(created?'/onboarding':intended||'/profiles'); }}/>;
  else if (path === '/forgot-password' || path === '/reset-password') screen = <PasswordScreen reset={path === '/reset-password'} navigate={navigate}/>;
  else if (['/account', '/profiles', '/profiles/new', '/onboarding'].includes(path)) screen = <ProfileScreen route={path} user={user} navigate={navigate} onLogout={() => { setUser(null); setSubscription(null); setAuthResolved(true); }} onRefresh={load}/>;
  else if (path === '/plans') screen = <PlansScreen user={user} subscription={subscription} navigate={navigate} onSubscription={setSubscription}/>;
  else if (path === '/account/subscription') screen = user?<SubscriptionScreen subscription={subscription} navigate={navigate} onChanged={setSubscription}/>:<AuthScreen navigate={navigate} onComplete={value=>{setUser(value);navigate('/account/subscription')}}/>;
  else if (path === '/checkout/success') screen = <StatePanel title="Confirming subscription" message="Ripple will show your plan after the billing backend confirms it." action="View subscription" onAction={()=>navigate('/account/subscription')}/>;
  else if (path === '/checkout/canceled') screen = <StatePanel title="Checkout canceled" message="No plan change is shown. You can keep browsing with Free." action="View plans" onAction={()=>navigate('/plans')}/>;
  else if (['/films', '/series', '/shorts'].includes(path)) {
    const key = path.slice(1), type = key.replace(/s$/, '');
    const liveItems = catalogue.filter(item => String(item.type || item.contentType).toLowerCase().includes(type));
    const liveRows = state.rows.filter(row => String(row.title || '').toLowerCase().includes(type));
    const items = liveItems.length || liveRows.length ? liveItems : editorialTitles.filter(item => item.type === type);
    const rows = liveRows.length ? liveRows : (liveItems.length ? [] : routeEditorial[key]);
    screen = <CatalogueScreen title={key[0].toUpperCase() + key.slice(1)} loading={state.loading} items={items} rows={rows} onOpen={open} onPlay={play} onToggleList={user ? toggleList : null} saved={saved}/>;
  } else if (path === '/my-list') screen = <CatalogueScreen title="My List" items={catalogue.filter(item => saved.has(idOf(item)))} onOpen={open} empty={user ? 'Titles you save will appear here.' : 'Sign in to use My List.'}/>;
  else if (titleIdFromPath(path)) screen = detailState.loading ? <StatePanel busy title="Loading title" message="Fetching title details from Ripple."/> : detailState.error ? <StatePanel title="Title couldn’t load" message={detailState.error} action="Try again" onAction={() => loadDetails(titleIdFromPath(path))}/> : <View/>;
  else if (!KNOWN_ROUTES.has(path)) screen = <StatePanel title="Page not found" message="That Ripple destination does not exist." action="Go home" onAction={() => navigate('/')}/>;
  else screen = <StatePanel title="Experience unavailable" message="Ripple will enable this screen when the backend capability is available." action="Go home" onAction={() => navigate('/')}/>;

  const publicWelcome = path === '/';
  return <SafeAreaView style={styles.safe}>{!publicWelcome ? <Header overlay={path === '/browse'} scrolled={headerScrolled} path={path} navigate={navigate} compact={compact} plan={subscription?.plan?.name||subscription?.planName} onSignIn={() => navigate(user ? '/account' : '/signin')}/> : null}<View style={styles.body}>{screen}</View>{compact && !publicWelcome ? <MobileNavigation path={path} navigate={navigate} hidden={Boolean(player)}/> : null}<ContentDetails item={details} onClose={closeDetails} onOpen={open} onPlay={play} onToggleList={user ? toggleList : null} saved={details && saved.has(idOf(details))}/><VideoPlayer item={player} onClose={() => setPlayer(null)} onProgress={(position, duration) => { const id = idOf(player); if (user && id) api(`/api/content/${encodeURIComponent(id)}/progress`, { method: 'PUT', body: JSON.stringify(progressPayload(position, duration)) }).catch(() => {}); }}/></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex:1, minHeight:'100vh', minHeight:'100svh', minHeight:'100dvh', backgroundColor:'#05030d' }, body: { flex:1, minWidth:0, minHeight:0, backgroundColor:'#05030d', overflowX:'hidden' } });
