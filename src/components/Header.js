import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { tokens } from '../theme/tokens';
import { pageGutter } from '../utils/layout';

const publicLinks=[['/browse','Home'],['/series','Series'],['/films','Films'],['/shorts','Shorts'],['/new','New & Popular']];

export function Header({path,navigate,compact,onSignIn,plan,user,profile,overlay=false,scrolled=false}) {
  const {width}=useWindowDimensions();
  const signedIn=Boolean(user);
  const links=signedIn?[...publicLinks,['/my-list','My List'],['/search','Search']]:[...publicLinks,['/search','Search']];
  const profileName=profile?.name||profile?.displayName||user?.displayName||user?.name||'Account';
  const avatar=profile?.avatarUrl||profile?.avatar||user?.avatarUrl;
  return <View accessibilityRole="navigation" accessibilityLabel="Primary navigation" style={[s.header,{paddingHorizontal:pageGutter(width)},width<768&&s.mobile,overlay&&s.overlay,overlay&&scrolled&&s.scrolled]}>
    <Pressable accessibilityRole="link" accessibilityLabel="Ripple home" onPress={()=>navigate('/')}><Text style={s.logo}>RIPPLE</Text></Pressable>
    {!compact?<View style={s.links}>{links.map(([url,label])=><Pressable accessibilityRole="link" accessibilityState={{selected:path===url}} key={url} onPress={()=>navigate(url)} style={s.link}><Text style={[s.linkText,path===url&&s.active]}>{label}</Text></Pressable>)}</View>:<View style={s.spacer}/>}
    <Pressable accessibilityRole="button" accessibilityLabel="Open search" onPress={()=>navigate('/search')} style={s.icon}><Text style={s.profileText}>⌕</Text></Pressable>
    {!compact?<Pressable accessibilityRole="link" onPress={()=>navigate('/plans')} style={s.plan}><Text style={s.profileText}>{plan||'Plans'}</Text></Pressable>:null}
    {signedIn?<Pressable accessibilityRole="button" accessibilityLabel="Notifications" style={s.icon}><Text style={s.profileText}>♢</Text></Pressable>:null}
    <Pressable accessibilityRole="button" accessibilityLabel={signedIn?`Open ${profileName} account menu`:'Sign in'} onPress={onSignIn} style={s.profile}>
      {signedIn&&avatar?<Image source={{uri:avatar}} accessibilityLabel={`${profileName} profile avatar`} style={s.avatar}/>:signedIn?<View style={s.avatarFallback}><Text style={s.avatarInitial}>{profileName[0]?.toUpperCase()}</Text></View>:null}
      <Text numberOfLines={1} style={s.profileText}>{signedIn?profileName:'Sign In'}</Text>
    </Pressable>
  </View>;
}

const s=StyleSheet.create({header:{height:68,paddingTop:'max(4px, env(safe-area-inset-top))',flexDirection:'row',alignItems:'center',gap:16,backgroundColor:'rgba(5,5,9,.98)',borderBottomWidth:1,borderBottomColor:tokens.color.border,zIndex:20},mobile:{height:64,gap:4},overlay:{position:'absolute',top:0,left:0,right:0,backgroundColor:'rgba(5,5,9,.18)',borderBottomColor:'transparent'},scrolled:{backgroundColor:'rgba(8,8,13,.92)',borderBottomColor:'rgba(255,255,255,.08)',backdropFilter:'blur(16px)'},logo:{color:tokens.color.text,fontSize:20,fontWeight:'900',letterSpacing:5},links:{flex:1,flexDirection:'row',alignItems:'center',gap:2},spacer:{flex:1},link:{minHeight:44,paddingHorizontal:11,justifyContent:'center'},linkText:{color:'#d0ccd5',fontSize:13},active:{color:tokens.color.text,fontWeight:'800'},icon:{width:44,height:44,alignItems:'center',justifyContent:'center'},plan:{minHeight:44,paddingHorizontal:10,justifyContent:'center'},profile:{minHeight:44,maxWidth:180,paddingHorizontal:8,justifyContent:'center',alignItems:'center',flexDirection:'row',gap:8},profileText:{color:tokens.color.text,fontWeight:'700'},avatar:{width:30,height:30,borderRadius:8},avatarFallback:{width:30,height:30,borderRadius:8,backgroundColor:tokens.color.accent,alignItems:'center',justifyContent:'center'},avatarInitial:{color:'#fff',fontWeight:'900'}});
