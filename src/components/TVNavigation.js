import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tokens } from '../theme/tokens';

const destinations = [['/browse', 'Home'], ['/films', 'Films'], ['/series', 'Series'], ['/shorts', 'Shorts'], ['/new', 'New'], ['/search', 'Search']];
export function TVNavigation({ path, navigate, user }) {
  return <View accessibilityRole="navigation" accessibilityLabel="TV navigation" style={s.root}>
    <Text style={s.logo}>RIPPLE</Text>
    {destinations.map(([route, label], index) => <Pressable key={route} hasTVPreferredFocus={index === 0 && path === '/browse'} accessibilityRole="link" accessibilityState={{ selected: path === route }} onPress={() => navigate(route)} style={({ focused }) => [s.item, path === route && s.selected, focused && s.focused]}><Text style={s.label}>{label}</Text></Pressable>)}
    <Pressable onPress={() => navigate(user ? '/account' : '/signin')} style={({ focused }) => [s.item, focused && s.focused]}><Text style={s.label}>{user ? 'Account' : 'Sign in'}</Text></Pressable>
  </View>;
}
const s = StyleSheet.create({root:{width:230,paddingTop:48,paddingHorizontal:22,gap:8,backgroundColor:'#090711',borderRightWidth:1,borderRightColor:tokens.color.border},logo:{color:'#fff',fontSize:22,fontWeight:'900',letterSpacing:5,marginBottom:28},item:{minHeight:52,paddingHorizontal:16,justifyContent:'center',borderRadius:8,borderWidth:2,borderColor:'transparent'},selected:{backgroundColor:'rgba(181,169,255,.14)'},focused:{backgroundColor:tokens.color.accent,borderColor:'#fff',transform:[{scale:1.06}]},label:{color:'#fff',fontSize:18,fontWeight:'800'}});
