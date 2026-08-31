import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tokens } from '../theme/tokens';
const links=[['/','⌂','Home'],['/new','✦','New'],['/my-list','＋','My List'],['/account','●','Profile']];
export function MobileNavigation({navigate,path}) { return <View style={s.nav}>{links.map(([url,icon,label])=><Pressable accessibilityRole="link" accessibilityState={{selected:path===url}} key={url} onPress={()=>navigate(url)} style={s.item}><Text style={[s.icon,path===url&&s.active]}>{icon}</Text><Text style={[s.label,path===url&&s.active]}>{label}</Text></Pressable>)}</View>; }
const s=StyleSheet.create({nav:{minHeight:68,paddingBottom:'max(6px, env(safe-area-inset-bottom))',flexDirection:'row',borderTopWidth:1,borderTopColor:tokens.color.border,backgroundColor:tokens.color.background},item:{flex:1,minHeight:58,alignItems:'center',justifyContent:'center',gap:2},icon:{color:tokens.color.muted,fontSize:19},label:{color:tokens.color.muted,fontSize:10},active:{color:tokens.color.accentSoft,fontWeight:'800'}});
