import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tokens } from '../theme/tokens';

const links = [
  ['/browse', 'home', 'Home'],
  ['/new', 'spark', 'New'],
  ['/search', 'search', 'Search'],
  ['/my-list', 'bookmark', 'My List'],
  ['/account', 'profile', 'Profile'],
];

function LineIcon({ name, active }) {
  return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[s.iconFrame, active && s.iconActive]}>
    {name === 'home' ? <><View style={s.roof}/><View style={s.homeBody}/></> : null}
    {name === 'spark' ? <><View style={[s.sparkLine, s.sparkVertical]}/><View style={s.sparkLine}/></> : null}
    {name === 'search' ? <><View style={s.searchCircle}/><View style={s.searchHandle}/></> : null}
    {name === 'bookmark' ? <View style={s.bookmark}/> : null}
    {name === 'profile' ? <><View style={s.profileHead}/><View style={s.profileBody}/></> : null}
  </View>;
}

export function MobileNavigation({ navigate, path, hidden = false }) {
  if (hidden) return null;
  return <View accessibilityRole="tablist" accessibilityLabel="App navigation" style={s.nav}>
    {links.map(([url, icon, label]) => {
      const selected = path === url || (url === '/account' && path.startsWith('/account'));
      return <Pressable accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected }} key={url} onPress={() => navigate(url)} style={({ pressed }) => [s.item, pressed && s.pressed]}>
        <LineIcon name={icon} active={selected}/><Text style={[s.label, selected && s.active]}>{label}</Text>
      </Pressable>;
    })}
  </View>;
}

const stroke = { borderColor: '#aaa8b8', borderWidth: 1.8 };
const s = StyleSheet.create({
  nav: { position:'absolute', left:0, right:0, bottom:0, minHeight:64, paddingBottom:'max(6px, env(safe-area-inset-bottom))', paddingLeft:'env(safe-area-inset-left)', paddingRight:'env(safe-area-inset-right)', flexDirection:'row', borderTopWidth:1, borderTopColor:'rgba(255,255,255,.1)', backgroundColor:'rgba(7,7,13,.94)', backdropFilter:'blur(18px)', zIndex:40 },
  item: { flex:1, minWidth:44, minHeight:58, alignItems:'center', justifyContent:'center', gap:3, opacity:.78 }, pressed:{ opacity:.5, transform:[{scale:.96}] },
  iconFrame:{ width:24, height:24, alignItems:'center', justifyContent:'center' }, iconActive:{ opacity:1 },
  label:{ color:tokens.color.muted, fontSize:10, fontWeight:'650' }, active:{ color:tokens.color.accentSoft, fontWeight:'900' },
  roof:{ position:'absolute', top:3, width:15, height:15, ...stroke, transform:[{rotate:'45deg'}], borderBottomWidth:0, borderRightWidth:0 },
  homeBody:{ position:'absolute', bottom:3, width:15, height:12, ...stroke, borderTopWidth:0, borderRadius:2 },
  sparkLine:{ width:19, height:2, borderRadius:2, backgroundColor:'#aaa8b8' }, sparkVertical:{ position:'absolute', transform:[{rotate:'90deg'}] },
  searchCircle:{ width:15, height:15, borderRadius:8, ...stroke, marginLeft:-4, marginTop:-4 }, searchHandle:{ position:'absolute', width:8, height:2, backgroundColor:'#aaa8b8', transform:[{rotate:'45deg'}], right:1, bottom:4 },
  bookmark:{ width:14, height:19, ...stroke, borderRadius:2, borderBottomColor:'transparent', transform:[{perspective:100}] },
  profileHead:{ position:'absolute', top:2, width:9, height:9, borderRadius:5, ...stroke }, profileBody:{ position:'absolute', bottom:1, width:18, height:10, borderTopLeftRadius:10, borderTopRightRadius:10, ...stroke, borderBottomWidth:0 },
});
