import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { HeroBanner } from '../components/HeroBanner';
import { ContentRail } from '../components/ContentRail';
import { editorialRows, editorialTitles } from '../data/editorial';
import { tokens } from '../theme/tokens';
import { homeScreenContent } from '../../contentPresentation';

export function HomeScreen({ state, retry, onOpen, onPlay, onToggleList, saved, canSave, onScroll }) {
  const { live, concepts, featured, showEditorial } = homeScreenContent(state, editorialRows, editorialTitles);
  const technical = Array.isArray(state?.technical) ? state.technical.filter(item => item && (item.id || item._id || item.contentId)) : [];
  return <ScrollView style={s.page} contentContainerStyle={s.content} onScroll={onScroll} scrollEventThrottle={32}>
    {state?.loading && !featured.length
      ? <View accessibilityLabel="Loading featured title" style={s.heroSkeleton}><View style={s.skeletonTitle}/><View style={s.skeletonCopy}/></View>
      : <HeroBanner items={featured} onOpen={onOpen} onPlay={onPlay} onToggleList={canSave ? onToggleList : null} saved={saved}/>}
    {state?.loading
      ? <View style={s.notice}><Text style={s.noticeTitle}>Preparing your cinematic home</Text><Text style={s.noticeText}>Connecting to the Ripple catalogue… Editorial Coming Soon concepts are ready while you wait.</Text></View>
      : state?.error
        ? <View style={s.notice}><Text accessibilityRole="alert" style={s.noticeTitle}>{state.service === 'offline' ? 'You’re offline' : 'Ripple is waking up'}</Text><Text style={s.noticeText}>{state.service === 'waking' ? 'Ripple is waking up. This may take a few seconds.' : state.error} You can still explore the clearly labelled editorial concepts below.</Text><Text accessibilityRole="button" onPress={retry} style={s.retry}>Try again</Text></View>
        : showEditorial
          ? <View style={s.intro}><View style={s.introLine}/><Text style={s.introText}>Original worlds, taking shape — explore non-playable Ripple editorial concepts</Text></View>
          : null}
    {live.map(row => <ContentRail key={row.id} row={row} onOpen={onOpen}/>)}
    {concepts.map(row => <ContentRail key={row.id} row={row} onOpen={onOpen}/>)}
    {technical.length ? <ContentRail technical row={{ id:'technical-playback-test', title:'Technical Playback Test', reason:'Playback infrastructure validation • Separate from the Ripple catalogue', items:technical }} onOpen={onOpen}/> : null}
  </ScrollView>;
}

const s=StyleSheet.create({page:{flex:1,backgroundColor:tokens.color.background},content:{paddingBottom:110},heroSkeleton:{height:'86vh',minHeight:620,maxHeight:920,backgroundColor:'#111116',justifyContent:'flex-end',padding:'5%'},skeletonTitle:{height:54,width:'55%',maxWidth:560,borderRadius:8,backgroundColor:'#24242c',marginBottom:18},skeletonCopy:{height:22,width:'40%',maxWidth:440,borderRadius:6,backgroundColor:'#1d1d24',marginBottom:80},intro:{marginTop:-46,paddingTop:64,paddingHorizontal:'4%',flexDirection:'row',alignItems:'center',gap:10,zIndex:3},introLine:{width:30,height:2,backgroundColor:tokens.color.accent},introText:{color:tokens.color.muted,fontSize:10,fontWeight:'800',letterSpacing:1.3},notice:{marginHorizontal:24,marginTop:24,padding:18,borderRadius:12,backgroundColor:tokens.color.surface,borderWidth:1,borderColor:tokens.color.border},noticeTitle:{color:tokens.color.text,fontWeight:'800',fontSize:16},noticeText:{color:tokens.color.muted,marginTop:6},retry:{color:tokens.color.accentSoft,fontWeight:'800',marginTop:12,minHeight:44,textAlignVertical:'center'}});
