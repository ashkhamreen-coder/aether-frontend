import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Modal, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { isValidHttpsVideoUrl } from '../../../playerReliability';
import { tokens } from '../../theme/tokens';
import { isTV, useTVRemote } from '../../tv/useTVRemote';

const urlOf = item => item?.videoUrl || item?.playbackUrl || item?.url || null;

export function VideoPlayer({ item, onClose, onProgress }) {
  const url = urlOf(item);
  const validUrl = isValidHttpsVideoUrl(url);
  const mounted = useRef(true);
  const closing = useRef(false);
  const controlsTimer = useRef(null);
  const lastPersisted = useRef(0);
  const resumed = useRef(false);
  const completed = useRef(false);
  const resumeAt = Number(item?.progress?.positionSeconds ?? item?.progressSeconds ?? item?.resumePositionSeconds) || 0;
  const playButton = useRef(null);
  const [error, setError] = useState(validUrl ? '' : 'A secure playback stream is not available.');
  const [controlsVisible, setControlsVisible] = useState(true);
  const player = useVideoPlayer(null, instance => {
    instance.timeUpdateEventInterval = 1;
  });
  const { status, error: playerError } = useEvent(player, 'statusChange', { status: player.status, error: null });
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const { currentTime } = useEvent(player, 'timeUpdate', { currentTime: 0 });

  const persist = useCallback(reason => {
    const position = Number(player.currentTime) || 0;
    const duration = Number(player.duration) || 0;
    if (duration > 0) onProgress?.(position, duration, reason);
  }, [onProgress, player]);
  const revealControls = useCallback(() => {
    setControlsVisible(true);
    clearTimeout(controlsTimer.current);
    if (isPlaying) controlsTimer.current = setTimeout(() => mounted.current && setControlsVisible(false), 4000);
  }, [isPlaying]);
  const toggle = useCallback(() => {
    revealControls();
    if (player.playing) { player.pause(); persist('paused'); } else if (validUrl) player.play();
  }, [persist, player, revealControls, validUrl]);
  const seek = useCallback(delta => {
    revealControls();
    const duration = Number(player.duration) || 0;
    player.currentTime = Math.max(0, duration ? Math.min(duration, player.currentTime + delta) : player.currentTime + delta);
  }, [player, revealControls]);
  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    persist('closed');
    player.pause();
    onClose();
  }, [onClose, persist, player]);
  const retry = useCallback(() => {
    if (!validUrl) { setError('A secure playback stream is not available.'); return; }
    setError('');
    player.replace(url.trim());
    player.play();
  }, [player, url, validUrl]);

  useEffect(() => {
    mounted.current = true;
    closing.current = false;
    resumed.current = false;
    completed.current = false;
    if (validUrl) { setError(''); player.replace(url.trim()); player.play(); }
    else setError('A secure playback stream is not available.');
    return () => {
      mounted.current = false;
      clearTimeout(controlsTimer.current);
      persist('unmounted');
      player.pause();
      player.replace(null);
    };
  }, [persist, player, url, validUrl]);
  useEffect(() => {
    if (status === 'error') setError(playerError?.message || 'This video could not be played. The link may have expired.');
    if (status === 'readyToPlay') {
      if (!resumed.current && resumeAt > 0 && resumeAt < (Number(player.duration) || Infinity)) { player.currentTime = resumeAt; resumed.current = true; }
      revealControls();
    }
  }, [player, playerError, resumeAt, revealControls, status]);
  useEffect(() => {
    if (currentTime - lastPersisted.current >= 15) { lastPersisted.current = currentTime; persist('playing'); }
    const duration = Number(player.duration) || 0;
    if (!completed.current && duration > 0 && currentTime >= duration - 0.5) { completed.current = true; persist('completed'); }
  }, [currentTime, persist, player.duration]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', next => {
      if (next !== 'active') { persist('background'); player.pause(); }
    });
    return () => subscription.remove();
  }, [persist, player]);
  useEffect(() => { if (!controlsVisible) return undefined; const timer=setTimeout(() => playButton.current?.focus?.(), 0); return()=>clearTimeout(timer); }, [controlsVisible]);
  const remote = useCallback(event => {
    revealControls();
    if (event?.eventType==='playPause' || event?.eventType==='select') toggle();
    else if (event?.eventType==='left') seek(-10);
    else if (event?.eventType==='right') seek(10);
  }, [revealControls, seek, toggle]);
  useTVRemote(remote, item ? close : undefined);

  if (!item) return null;
  const button = (label, action, preferred = false, ref) => <Pressable ref={ref} accessibilityRole="button" hasTVPreferredFocus={preferred} onFocus={revealControls} onPress={action} style={({ focused }) => [s.control, focused&&s.focus]}><Text style={s.controlText}>{label}</Text></Pressable>;
  const loading = !error && (status === 'idle' || status === 'loading');
  return <Modal visible animationType="fade" onRequestClose={close} supportedOrientations={['portrait','landscape']}><SafeAreaView style={s.root}><View style={s.top}><Text style={s.logo}>RIPPLE</Text>{button('Close', close, isTV)}</View><View style={s.stage}>{validUrl ? <VideoView player={player} style={s.video} contentFit="contain" nativeControls={!isTV} allowsFullscreen /> : null}{loading ? <View style={s.overlay}><ActivityIndicator color={tokens.color.accentSoft}/><Text style={s.message}>Preparing secure playback…</Text></View> : null}{error ? <View accessibilityRole="alert" style={s.overlay}><Text style={s.errorTitle}>Playback unavailable</Text><Text style={s.message}>{error}</Text>{button('Retry', retry)}</View> : null}</View>{isTV && controlsVisible && !error ? <View style={s.controls}>{button('−10s', () => seek(-10))}{button(isPlaying ? 'Pause' : 'Play', toggle, true, playButton)}{button('+10s', () => seek(10))}</View> : null}<Text style={s.title}>{item.title}</Text></SafeAreaView></Modal>;
}
const s=StyleSheet.create({root:{flex:1,backgroundColor:'#05030d'},top:{height:76,paddingHorizontal:28,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},logo:{color:'#fff',fontWeight:'900',letterSpacing:4},stage:{width:'100%',maxWidth:1200,alignSelf:'center',position:'relative',aspectRatio:16/9,justifyContent:'center',backgroundColor:'#000'},video:{...StyleSheet.absoluteFillObject},overlay:{...StyleSheet.absoluteFillObject,alignItems:'center',justifyContent:'center',gap:12,padding:32,backgroundColor:'rgba(5,3,13,.92)'},message:{color:tokens.color.muted,textAlign:'center',fontSize:18},errorTitle:{color:'#fff',fontSize:24,fontWeight:'900'},controls:{flexDirection:'row',justifyContent:'center',gap:24,marginTop:24},control:{minHeight:52,minWidth:110,paddingHorizontal:20,borderRadius:8,borderWidth:2,borderColor:'rgba(255,255,255,.2)',alignItems:'center',justifyContent:'center'},focus:{backgroundColor:tokens.color.accent,borderColor:'#fff',transform:[{scale:1.08}]},controlText:{color:'#fff',fontWeight:'900',fontSize:17},title:{color:'#fff',fontSize:24,fontWeight:'900',padding:24}});
