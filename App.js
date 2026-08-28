// App.js
// Production React Native / Expo frontend for AETHER
// Required packages:
// npx expo install expo-video expo-linear-gradient expo-secure-store
// Web build intentionally avoids loading expo-video / expo-secure-store at runtime.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const API_BASE = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');
if (!API_BASE && Platform.OS !== 'web') {
  console.warn('EXPO_PUBLIC_API_URL is not configured.');
}

const C = {
  bg: '#050505',
  panel: '#111111',
  panel2: '#171717',
  text: '#f9e8d9',
  muted: '#c59b78',
  copper: '#b87333',
  copper2: '#e8a87c',
  border: '#54341c',
  cyan: '#00f5ff',
  danger: '#ff6b6b',
};

async function tokenGet() {
  if (Platform.OS === 'web') {
    try {
      return globalThis.localStorage?.getItem('aether_token') || null;
    } catch {
      return null;
    }
  }
  // Keep SecureStore native-only so the web bundle never initializes Expo native modules.
  const SecureStore = require('expo-secure-store');
  return SecureStore.getItemAsync('aether_token');
}
async function tokenSet(value) {
  if (Platform.OS === 'web') {
    try {
      if (value) globalThis.localStorage?.setItem('aether_token', value);
      else globalThis.localStorage?.removeItem('aether_token');
    } catch {}
    return;
  }
  const SecureStore = require('expo-secure-store');
  if (value) await SecureStore.setItemAsync('aether_token', value);
  else await SecureStore.deleteItemAsync('aether_token');
}

async function api(path, options = {}) {
  const token = await tokenGet();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data.error || `Request failed (${response.status})`);
    err.status = response.status;
    throw err;
  }
  return data;
}

function Button({ title, onPress, secondary, disabled, compact }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.buttonSecondary,
        compact && styles.buttonCompact,
        (disabled || pressed) && { opacity: 0.65 },
      ]}
    >
      <Text style={[styles.buttonText, secondary && styles.buttonTextSecondary]}>{title}</Text>
    </Pressable>
  );
}

function ContentCard({ item, onPlay }) {
  return (
    <Pressable style={styles.card} onPress={() => onPlay(item)}>
      <Image source={{ uri: item.thumbnail }} style={styles.cardImage} />
      <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.cardCreator} numberOfLines={1}>{item.creator?.name || 'Unknown creator'}</Text>
    </Pressable>
  );
}

function ContentRow({ title, data, onPlay }) {
  if (!data?.length) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowTitle}>{title}</Text>
      <FlatList
        data={data}
        horizontal
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ContentCard item={item} onPlay={onPlay} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rowList}
      />
    </View>
  );
}

function NativeVideoPlayer({ source, visible }) {
  // This component is never rendered on web. Keeping the require here prevents
  // expo-video's native SharedObject implementation from initializing in browsers.
  const { VideoView, useVideoPlayer } = require('expo-video');
  const player = useVideoPlayer(source || null, p => {
    p.loop = false;
    if (visible && source) p.play();
  });

  useEffect(() => {
    if (!visible) player.pause();
    else if (source) player.play();
  }, [visible, source, player]);

  return (
    <VideoView
      player={player}
      style={styles.video}
      nativeControls
      allowsFullscreen
      allowsPictureInPicture
    />
  );
}

function WebVideoPlayer({ source }) {
  if (!source) {
    return (
      <View style={[styles.video, styles.videoFallback]}>
        <Text style={styles.helper}>Video is not available.</Text>
      </View>
    );
  }

  return (
    <video
      src={source}
      controls
      autoPlay
      playsInline
      preload="metadata"
      style={{ width: '100%', aspectRatio: '16 / 9', backgroundColor: '#000', borderRadius: 12 }}
    />
  );
}

function PlayerModal({ item, visible, onClose, inList, onToggleList, signedIn }) {
  const source = item?.videoUrl || null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.playerPage}>
        <View style={styles.playerTopBar}>
          <Text style={styles.logo}>AETHER</Text>
          <Button title="Close" onPress={onClose} secondary compact />
        </View>

        {item ? (
          <ScrollView contentContainerStyle={styles.playerBody}>
            {Platform.OS === 'web' ? (
              <WebVideoPlayer source={source} />
            ) : source ? (
              <NativeVideoPlayer source={source} visible={visible} />
            ) : (
              <View style={[styles.video, styles.videoFallback]}>
                <Text style={styles.helper}>Video is not available.</Text>
              </View>
            )}
            <Text style={styles.playerTitle}>{item.title}</Text>
            <Text style={styles.playerCreator}>{item.creator?.name}</Text>
            <Text style={styles.playerDesc}>{item.description}</Text>
            {signedIn ? (
              <Button
                title={inList ? 'Remove from My List' : '+ Add to My List'}
                onPress={() => onToggleList(item)}
                secondary={inList}
              />
            ) : (
              <Text style={styles.helper}>Sign in to save this title to My List.</Text>
            )}
          </ScrollView>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}

function AuthModal({ visible, onClose, onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      const body = mode === 'register' ? { name, email, password } : { email, password };
      const data = await api(`/api/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      await tokenSet(data.token);
      onAuthenticated(data.user);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.authBox}>
          <Text style={styles.authTitle}>{mode === 'login' ? 'Welcome back' : 'Create account'}</Text>
          {mode === 'register' ? (
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Name"
              placeholderTextColor="#777"
              style={styles.input}
              autoCapitalize="words"
            />
          ) : null}
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#777"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#777"
            style={styles.input}
            secureTextEntry
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button
            title={busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Register'}
            onPress={submit}
            disabled={busy}
          />
          <Pressable onPress={() => { setError(''); setMode(mode === 'login' ? 'register' : 'login'); }}>
            <Text style={styles.authSwitch}>
              {mode === 'login' ? 'New here? Create an account' : 'Already registered? Sign in'}
            </Text>
          </Pressable>
          <Pressable onPress={onClose}><Text style={styles.cancelText}>Cancel</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function App() {
  const { width } = useWindowDimensions();
  const [screen, setScreen] = useState('home');
  const [content, setContent] = useState([]);
  const [creators, setCreators] = useState([]);
  const [myList, setMyList] = useState([]);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fatalError, setFatalError] = useState('');
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setFatalError('');

    try {
      if (!API_BASE) throw new Error('Set EXPO_PUBLIC_API_URL to your deployed backend URL.');

      const [items, creatorItems] = await Promise.all([
        api('/api/content'),
        api('/api/creators'),
      ]);
      setContent(Array.isArray(items) ? items : []);
      setCreators(Array.isArray(creatorItems) ? creatorItems : []);

      const token = await tokenGet();
      if (token) {
        try {
          const me = await api('/api/me');
          setUser(me.user);
          const saved = await api('/api/my-list');
          setMyList(Array.isArray(saved) ? saved : []);
        } catch (e) {
          if (e.status === 401) {
            await tokenSet(null);
            setUser(null);
            setMyList([]);
          }
        }
      }
    } catch (e) {
      setFatalError(e.message || 'Unable to load AETHER.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const savedIds = useMemo(() => new Set(myList.map(x => x.id)), [myList]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return content;
    return content.filter(item =>
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.creator?.name?.toLowerCase().includes(q) ||
      item.type?.toLowerCase().includes(q)
    );
  }, [content, query]);

  const featured = content.find(x => x.featured) || content[0];

  const toggleList = async item => {
    if (!user) return setAuthOpen(true);
    try {
      if (savedIds.has(item.id)) {
        await api(`/api/my-list/${item.id}`, { method: 'DELETE' });
        setMyList(prev => prev.filter(x => x.id !== item.id));
      } else {
        await api(`/api/my-list/${item.id}`, { method: 'PUT' });
        setMyList(prev => [item, ...prev.filter(x => x.id !== item.id)]);
      }
    } catch (e) {
      setFatalError(e.message);
    }
  };

  const logout = async () => {
    await tokenSet(null);
    setUser(null);
    setMyList([]);
    setScreen('home');
  };

  const openCreator = creator => {
    setSelectedCreator(creator);
    setScreen('creator');
  };

  const refreshProps = {
    refreshControl: <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={C.copper} />,
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={C.copper} /></View>;
  }

  if (fatalError && content.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorTitle}>Could not connect</Text>
        <Text style={styles.errorBody}>{fatalError}</Text>
        <Button title="Try again" onPress={() => load()} />
      </SafeAreaView>
    );
  }

  const Home = () => (
    <ScrollView style={styles.page} {...refreshProps}>
      {featured ? (
        <View style={[styles.hero, { height: Math.min(620, Math.max(440, width * 0.95)) }]}>
          <Image source={{ uri: featured.thumbnail }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          <LinearGradient colors={['transparent', 'rgba(5,5,5,.72)', C.bg]} style={StyleSheet.absoluteFillObject} />
          <View style={styles.heroContent}>
            <Text style={styles.eyebrow}>FEATURED AI CREATION</Text>
            <Text style={styles.heroTitle}>{featured.title}</Text>
            <Text style={styles.heroDescription} numberOfLines={3}>{featured.description}</Text>
            <View style={styles.actions}>
              <Button title="▶ Play" onPress={() => setCurrentItem(featured)} />
              <Button
                title={savedIds.has(featured.id) ? '✓ In My List' : '+ My List'}
                onPress={() => toggleList(featured)}
                secondary
              />
            </View>
          </View>
        </View>
      ) : null}
      <ContentRow title="Cinematic Films" data={content.filter(x => x.type === 'film')} onPlay={setCurrentItem} />
      <ContentRow title="Short Form" data={content.filter(x => x.type === 'short')} onPlay={setCurrentItem} />
      <ContentRow title="AI Music Videos" data={content.filter(x => x.type === 'music')} onPlay={setCurrentItem} />
      <ContentRow title="Generative Art" data={content.filter(x => x.type === 'art')} onPlay={setCurrentItem} />
      <View style={{ height: 40 }} />
    </ScrollView>
  );

  const Browse = () => (
    <ScrollView style={styles.page} {...refreshProps}>
      <Text style={styles.pageTitle}>Browse</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search title, creator or type"
        placeholderTextColor="#777"
        style={[styles.input, styles.search]}
      />
      <View style={styles.grid}>
        {filtered.map(item => <ContentCard key={item.id} item={item} onPlay={setCurrentItem} />)}
      </View>
      {!filtered.length ? <Text style={styles.empty}>No matching content.</Text> : null}
    </ScrollView>
  );

  const Creators = () => (
    <ScrollView style={styles.page} {...refreshProps}>
      <Text style={styles.pageTitle}>AI Creators</Text>
      {creators.map(c => (
        <Pressable key={c.id} style={styles.creatorPanel} onPress={() => openCreator(c)}>
          <Image source={{ uri: c.banner }} style={styles.creatorBanner} />
          <View style={styles.creatorInfo}>
            <Image source={{ uri: c.avatar }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.creatorName}>{c.name} {c.verified ? '✓' : ''}</Text>
              <Text style={styles.creatorMeta}>@{c.handle} · {Number(c.followers || 0).toLocaleString()} followers</Text>
              <Text style={styles.creatorBio} numberOfLines={2}>{c.bio}</Text>
            </View>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );

  const Creator = () => {
    if (!selectedCreator) return null;
    const works = content.filter(x => x.creatorId === selectedCreator.id);
    return (
      <ScrollView style={styles.page} {...refreshProps}>
        <Image source={{ uri: selectedCreator.banner }} style={styles.profileBanner} />
        <View style={styles.profile}>
          <Image source={{ uri: selectedCreator.avatar }} style={styles.profileAvatar} />
          <Text style={styles.profileName}>{selectedCreator.name} {selectedCreator.verified ? '✓' : ''}</Text>
          <Text style={styles.creatorMeta}>@{selectedCreator.handle}</Text>
          <Text style={styles.profileBio}>{selectedCreator.bio}</Text>
        </View>
        <ContentRow title="Works" data={works} onPlay={setCurrentItem} />
      </ScrollView>
    );
  };

  const MyList = () => (
    <ScrollView style={styles.page} {...refreshProps}>
      <Text style={styles.pageTitle}>My List</Text>
      {user ? (
        myList.length ? (
          <View style={styles.grid}>
            {myList.map(item => <ContentCard key={item.id} item={item} onPlay={setCurrentItem} />)}
          </View>
        ) : <Text style={styles.empty}>Your list is empty.</Text>
      ) : (
        <View style={styles.signInPrompt}>
          <Text style={styles.empty}>Sign in to sync your list across devices.</Text>
          <Button title="Sign in" onPress={() => setAuthOpen(true)} />
        </View>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={styles.nav}>
        <Pressable onPress={() => setScreen('home')}><Text style={styles.logo}>AETHER</Text></Pressable>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navLinks}>
          {[
            ['home', 'Home'],
            ['browse', 'Browse'],
            ['creators', 'Creators'],
            ['list', 'My List'],
          ].map(([key, label]) => (
            <Pressable key={key} onPress={() => setScreen(key)}>
              <Text style={[styles.navText, screen === key && styles.navActive]}>{label}</Text>
            </Pressable>
          ))}
          {user ? (
            <Pressable onPress={logout}><Text style={styles.navText}>Logout</Text></Pressable>
          ) : (
            <Pressable onPress={() => setAuthOpen(true)}><Text style={styles.navText}>Sign in</Text></Pressable>
          )}
        </ScrollView>
      </View>

      {fatalError ? <Text style={styles.inlineError}>{fatalError}</Text> : null}

      {screen === 'home' && <Home />}
      {screen === 'browse' && <Browse />}
      {screen === 'creators' && <Creators />}
      {screen === 'creator' && <Creator />}
      {screen === 'list' && <MyList />}

      <PlayerModal
        visible={Boolean(currentItem)}
        item={currentItem}
        onClose={() => setCurrentItem(null)}
        inList={currentItem ? savedIds.has(currentItem.id) : false}
        onToggleList={toggleList}
        signedIn={Boolean(user)}
      />

      <AuthModal
        visible={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={async newUser => {
          setUser(newUser);
          try {
            const saved = await api('/api/my-list');
            setMyList(Array.isArray(saved) ? saved : []);
          } catch {}
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  page: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  nav: {
    minHeight: 58, backgroundColor: C.bg, borderBottomWidth: 1, borderBottomColor: C.border,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 18,
  },
  logo: { color: C.copper2, fontSize: 21, fontWeight: '800', letterSpacing: 2 },
  navLinks: { flexGrow: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 18 },
  navText: { color: C.muted, fontWeight: '600', paddingVertical: 18 },
  navActive: { color: C.cyan },
  hero: { width: '100%', justifyContent: 'flex-end' },
  heroContent: { paddingHorizontal: 18, paddingBottom: 34 },
  eyebrow: { color: C.cyan, fontWeight: '700', letterSpacing: 1.6, fontSize: 12 },
  heroTitle: { color: C.text, fontSize: 36, fontWeight: '800', marginTop: 8 },
  heroDescription: { color: C.text, opacity: .86, maxWidth: 650, fontSize: 15, lineHeight: 22, marginTop: 8 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 18, flexWrap: 'wrap' },
  button: { backgroundColor: C.copper, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 28, alignItems: 'center' },
  buttonSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.copper },
  buttonCompact: { paddingVertical: 8, paddingHorizontal: 14 },
  buttonText: { color: '#080808', fontWeight: '800' },
  buttonTextSecondary: { color: C.text },
  row: { marginTop: 26 },
  rowTitle: { color: C.text, fontSize: 19, fontWeight: '800', paddingHorizontal: 16, marginBottom: 12 },
  rowList: { paddingHorizontal: 16 },
  card: { width: 150, marginRight: 14, marginBottom: 22 },
  cardImage: { width: 150, height: 220, borderRadius: 12, backgroundColor: C.panel },
  cardTitle: { color: C.text, fontSize: 14, fontWeight: '700', marginTop: 8 },
  cardCreator: { color: C.muted, fontSize: 12, marginTop: 3 },
  pageTitle: { color: C.text, fontSize: 30, fontWeight: '800', margin: 18 },
  search: { marginHorizontal: 18, marginTop: 0, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8 },
  creatorPanel: {
    marginHorizontal: 16, marginBottom: 18, overflow: 'hidden', borderRadius: 14,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.panel,
  },
  creatorBanner: { width: '100%', height: 125, backgroundColor: C.panel2 },
  creatorInfo: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
  avatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: C.copper },
  creatorName: { color: C.text, fontWeight: '800', fontSize: 17 },
  creatorMeta: { color: C.muted, marginTop: 3 },
  creatorBio: { color: C.text, opacity: .78, marginTop: 7, lineHeight: 19 },
  profileBanner: { width: '100%', height: 220, backgroundColor: C.panel },
  profile: { alignItems: 'center', paddingHorizontal: 20, marginTop: -55 },
  profileAvatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 4, borderColor: C.copper },
  profileName: { color: C.text, fontSize: 27, fontWeight: '800', marginTop: 12 },
  profileBio: { color: C.text, opacity: .82, textAlign: 'center', marginTop: 12, lineHeight: 21, maxWidth: 680 },
  playerPage: { flex: 1, backgroundColor: C.bg },
  playerTopBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  playerBody: { padding: 16, paddingBottom: 50 },
  video: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000', borderRadius: 12 },
  playerTitle: { color: C.text, fontSize: 28, fontWeight: '800', marginTop: 22 },
  playerCreator: { color: C.copper2, fontWeight: '700', marginTop: 6 },
  playerDesc: { color: C.text, opacity: .82, lineHeight: 22, marginTop: 14, marginBottom: 22 },
  helper: { color: C.muted, marginTop: 10 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,.78)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  authBox: { width: '100%', maxWidth: 430, backgroundColor: C.panel, borderRadius: 18, padding: 22, borderWidth: 1, borderColor: C.border },
  authTitle: { color: C.text, fontWeight: '800', fontSize: 26, marginBottom: 18 },
  input: {
    backgroundColor: C.panel2, color: C.text, borderWidth: 1, borderColor: '#343434',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 12,
  },
  authSwitch: { color: C.cyan, textAlign: 'center', marginTop: 18 },
  cancelText: { color: C.muted, textAlign: 'center', marginTop: 16 },
  error: { color: C.danger, marginBottom: 12 },
  inlineError: { backgroundColor: '#3a1616', color: '#ffd7d7', padding: 10, textAlign: 'center' },
  errorTitle: { color: C.text, fontWeight: '800', fontSize: 26, marginBottom: 10 },
  errorBody: { color: C.muted, textAlign: 'center', marginBottom: 18, lineHeight: 20 },
  empty: { color: C.muted, padding: 20, textAlign: 'center' },
  signInPrompt: { padding: 22, gap: 10, alignItems: 'center' },
});
