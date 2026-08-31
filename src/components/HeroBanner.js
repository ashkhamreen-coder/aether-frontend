import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, ImageBackground, PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { tokens } from '../theme/tokens';
import { cloudinaryImageUrl } from '../utils/cloudinary';
import { isTouchDevice, pageGutter } from '../utils/layout';

const sourceFor = image => typeof image === 'number' ? image : image ? { uri:image } : undefined;
const playableItem = item => item.isPlayable === true || item.playable === true || String(item.mediaStatus).toLowerCase() === 'ready';

export function HeroBanner({ items=[], onOpen, onPlay, onToggleList, saved=new Set() }) {
  const { width } = useWindowDimensions();
  const mobile = width < 768;
  const list = useMemo(() => items.filter(Boolean), [items]);
  const [index,setIndex] = useState(0), [paused,setPaused] = useState(false), [notifications,setNotifications] = useState(new Set()), [loaded,setLoaded] = useState(false), [failed,setFailed] = useState(false);
  const item = list[index % Math.max(1,list.length)];
  const move = delta => { setPaused(true); setIndex(i => (i + delta + list.length) % list.length); };
  const swipe = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_,gesture) => Math.abs(gesture.dx) > 14 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
    onPanResponderGrant: () => setPaused(true),
    onPanResponderRelease: (_,gesture) => { if (Math.abs(gesture.dx) > 48) move(gesture.dx < 0 ? 1 : -1); },
    onPanResponderTerminate: () => setPaused(false),
  })).current;
  useEffect(() => { if (paused || list.length < 2 || typeof window === 'undefined' || document.visibilityState === 'hidden' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return; const timer=setInterval(()=>setIndex(i=>(i+1)%list.length),12000); return()=>clearInterval(timer); }, [paused,list.length]);
  useEffect(() => { if (!item) return; setLoaded(false); setFailed(false); [item,list[(index+1)%list.length]].map(x=>cloudinaryImageUrl(x?.backdropUrl||x?.heroImageUrl||x?.imageUrl,'hero')).filter(Boolean).forEach(url=>Image.prefetch?.(url)); }, [index,item,list]);
  if (!item) return null;
  const rawImage=item.backdropUrl||item.heroImageUrl||item.imageUrl||item.posterUrl||item.image;
  const image=typeof rawImage==='string'?cloudinaryImageUrl(rawImage,'hero'):rawImage;
  const playable=playableItem(item), id=item.id||item._id, gutter=pageGutter(width);
  const focal = mobile ? item.imagePositionMobile : width < 1024 ? item.imagePositionTablet : item.imagePositionDesktop;
  const metadata=[item.format||item.type,item.originalLanguage||item.language,playable?(item.duration||'Available now'):(item.releaseStatus||'Coming Soon')].filter(Boolean).map(x=>x.name||x).join('  •  ');
  const actions=<View style={s.actions}>{playable?<Pressable accessibilityRole="button" accessibilityLabel={`Play ${item.title}`} onPress={()=>onPlay(item)} style={s.primary}><Text style={s.primaryText}>▶  Play</Text></Pressable>:<Pressable accessibilityRole="button" accessibilityLabel={`More information about ${item.title}`} onPress={()=>onOpen(item)} style={s.primary}><Text style={s.primaryText}>ⓘ  More Info</Text></Pressable>}{playable&&onToggleList?<Pressable accessibilityRole="button" accessibilityLabel={`${saved.has(id)?'Remove':'Add'} ${item.title} ${saved.has(id)?'from':'to'} My List`} onPress={()=>onToggleList(item)} style={s.secondary}><Text style={s.secondaryText}>{saved.has(id)?'✓':'＋'}  My List</Text></Pressable>:!playable?<Pressable accessibilityRole="button" accessibilityLabel={`${notifications.has(id)?'Notification set for':'Notify me about'} ${item.title}`} onPress={()=>setNotifications(old=>new Set(old).add(id))} style={s.secondary}><Text style={s.secondaryText}>{notifications.has(id)?'✓  Notification Set':'♢  Notify Me'}</Text></Pressable>:null}</View>;
  const info=<View style={[mobile?s.mobileInfo:s.desktopInfo,{paddingHorizontal:gutter}]}><Text accessibilityRole="header" numberOfLines={mobile?3:2} style={[s.title,mobile&&s.mobileTitle]}>{item.title}</Text><Text numberOfLines={1} style={s.meta}>{metadata}</Text><Text numberOfLines={mobile?2:3} style={[s.description,mobile&&s.mobileDescription]}>{item.synopsis||item.description}</Text>{!mobile&&item.aiDisclosure?<Text style={s.disclosure}>✦ {item.aiDisclosure}</Text>:null}{actions}</View>;
  const dots=list.length>1?<View accessibilityRole="tablist" style={[s.dots,mobile&&s.mobileDots]}>{list.map((x,i)=><Pressable key={x.id||i} accessibilityRole="tab" accessibilityLabel={`Show featured title ${i+1}`} accessibilityState={{selected:i===index}} onPress={()=>{setPaused(true);setIndex(i)}} style={[s.dot,i===index&&s.dotOn]}/>)}</View>:null;
  return <View testID="hero-banner" onPointerEnter={()=>setPaused(true)} onPointerLeave={()=>setPaused(false)} style={[s.wrap,mobile&&s.mobileWrap]} {...(mobile?swipe.panHandlers:{})}>
    <View style={[s.artwork,mobile&&s.mobileArtwork]}>{!loaded?<View accessibilityLabel="Loading hero artwork" style={s.heroSkeleton}/>:null}<ImageBackground key={id||index} source={!failed?sourceFor(image):undefined} onLoad={()=>setLoaded(true)} onError={()=>{setFailed(true);setLoaded(true)}} resizeMode="cover" style={s.hero} imageStyle={[s.heroImage,{objectPosition:focal||'center center'}]}><LinearGradient colors={['rgba(5,5,7,.72)','transparent']} locations={[0,.32]} style={StyleSheet.absoluteFillObject}/><LinearGradient colors={['transparent','rgba(5,5,9,.15)',tokens.color.background]} locations={[.55,.8,1]} style={StyleSheet.absoluteFillObject}/>{!mobile&&info}{!mobile&&list.length>1&&!isTouchDevice()?<><Pressable accessibilityRole="button" accessibilityLabel="Previous featured title" onPress={()=>move(-1)} style={[s.arrow,s.left]}><Text style={s.arrowText}>‹</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Next featured title" onPress={()=>move(1)} style={[s.arrow,s.right]}><Text style={s.arrowText}>›</Text></Pressable></>:null}</ImageBackground></View>
    {mobile?info:null}{dots}
  </View>;
}

const s=StyleSheet.create({wrap:{height:'78vh',minHeight:560,maxHeight:900,backgroundColor:tokens.color.background,position:'relative'},mobileWrap:{height:'auto',minHeight:0,maxHeight:'none'},artwork:{flex:1},mobileArtwork:{height:'55svh',minHeight:430,flexGrow:0},hero:{flex:1,justifyContent:'flex-end'},heroImage:{transitionDuration:'300ms',transitionProperty:'opacity'},heroSkeleton:{...StyleSheet.absoluteFillObject,backgroundColor:'#17171e'},desktopInfo:{paddingBottom:104,maxWidth:760},mobileInfo:{backgroundColor:tokens.color.background,paddingTop:10,paddingBottom:12},title:{color:tokens.color.text,fontSize:58,lineHeight:62,fontWeight:'900',textShadowColor:'rgba(0,0,0,.7)',textShadowRadius:16},mobileTitle:{fontSize:'clamp(32px, 9vw, 46px)',lineHeight:40,textShadowRadius:0},description:{color:'#e4e1e8',fontSize:16,lineHeight:24,marginTop:12,maxWidth:590},mobileDescription:{fontSize:15,lineHeight:22},meta:{color:'#cbc6d1',fontWeight:'700',fontSize:13,marginTop:10},disclosure:{color:tokens.color.accentSoft,fontSize:12,marginTop:10},actions:{flexDirection:'row',gap:10,marginTop:18},primary:{minHeight:48,paddingHorizontal:22,borderRadius:8,backgroundColor:tokens.color.text,justifyContent:'center'},primaryText:{color:'#09090d',fontWeight:'900'},secondary:{minHeight:48,paddingHorizontal:18,borderRadius:8,backgroundColor:'rgba(31,31,40,.9)',borderWidth:1,borderColor:'rgba(255,255,255,.16)',justifyContent:'center'},secondaryText:{color:tokens.color.text,fontWeight:'800'},arrow:{position:'absolute',top:'46%',width:44,height:44,borderRadius:22,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(8,8,13,.48)',opacity:.25},left:{left:16},right:{right:16},arrowText:{color:'#fff',fontSize:32,lineHeight:34},dots:{position:'absolute',bottom:38,right:'4%',flexDirection:'row',gap:7},mobileDots:{position:'relative',bottom:'auto',right:'auto',alignSelf:'center',paddingVertical:10,marginBottom:20},dot:{width:7,height:7,borderRadius:4,backgroundColor:'rgba(255,255,255,.3)'},dotOn:{width:18,backgroundColor:tokens.color.accentSoft}});
