import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { HeroBanner } from '../components/HeroBanner';
import { ContentRail } from '../components/ContentRail';
import { StatePanel } from '../components/StatePanel';
import { tokens } from '../theme/tokens';
export function HomeScreen({state,retry,onOpen,onPlay}) { if(state.loading)return <StatePanel busy title="Loading Ripple" message="Preparing your cinematic home."/>; if(state.service==='waking')return <StatePanel busy title="Ripple is waking up" message="Ripple is waking up. This may take a few seconds." action="Try again" onAction={retry}/>; if(state.error)return <StatePanel title={state.service==='offline'?'You’re offline':'Ripple is unavailable'} message={state.error} action="Try again" onAction={retry}/>; if(!state.rows.length&&!state.technical.length)return <StatePanel title="The catalogue is quiet" message="No titles are available yet. Please check back soon." action="Refresh" onAction={retry}/>; return <ScrollView style={s.page} contentContainerStyle={s.content}><HeroBanner item={state.hero} onOpen={onOpen} onPlay={onPlay}/>{state.rows.map(row=><ContentRail key={row.id} row={row} onOpen={onOpen}/>)}{state.technical.length?<ContentRail technical row={{id:'technical-playback-test',title:'Technical Playback Test',items:state.technical}} onOpen={onOpen}/>:null}</ScrollView>; }
const s=StyleSheet.create({page:{flex:1,backgroundColor:tokens.color.background},content:{paddingBottom:40}});
