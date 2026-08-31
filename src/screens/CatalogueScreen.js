import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ContentCard } from '../components/ContentCard';
import { ContentRail } from '../components/ContentRail';
import { HeroBanner } from '../components/HeroBanner';
import { StatePanel } from '../components/StatePanel';
import { tokens } from '../theme/tokens';
export function CatalogueScreen({title,items=[],rows=[],loading,onOpen,onPlay,onToggleList,saved,empty="No titles are available in this collection."}) { const shown=items; const hero=shown[0]; return <ScrollView style={s.page} contentContainerStyle={s.content}>{hero&&title!=='My List'?<HeroBanner items={shown.slice(0,4)} onOpen={onOpen} onPlay={onPlay} onToggleList={onToggleList} saved={saved}/>:<Text accessibilityRole="header" style={s.title}>{title}</Text>}{loading?<StatePanel busy title="Loading titles" message="Fetching the latest catalogue."/>:rows.length?rows.map(row=><ContentRail key={row.id} row={row} onOpen={onOpen}/>):shown.length?<><Text style={s.label}>Live catalogue</Text><View style={s.grid}>{shown.map(item=><ContentCard key={item.id||item._id} item={item} onOpen={onOpen}/>)}</View></>:<StatePanel title={title==='My List'?'Your list is ready for something new':'Nothing here yet'} message={empty}/>}</ScrollView>; }
const s=StyleSheet.create({page:{flex:1,backgroundColor:tokens.color.background},content:{padding:24,paddingBottom:90},title:{color:tokens.color.text,fontSize:36,fontWeight:'900',marginVertical:20},label:{color:tokens.color.accentSoft,fontSize:11,fontWeight:'900',letterSpacing:1.2,marginBottom:14},grid:{flexDirection:'row',flexWrap:'wrap',gap:16}});
