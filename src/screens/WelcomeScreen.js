import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export function WelcomeScreen({ navigate }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const getStarted = () => {
    if (!validEmail(email)) { setError('Enter a valid email address.'); return; }
    setError('');
    navigate(`/signup?email=${encodeURIComponent(email.trim())}`);
  };
  return <LinearGradient colors={['#080512','#140b2b','#07111e']} start={{x:0,y:0}} end={{x:1,y:1}} style={s.page}>
    <View style={s.glow}/>
    <View style={s.header}><Text style={s.logo}>RIPPLE</Text><Pressable accessibilityRole="link" onPress={()=>navigate('/signin')} style={s.signIn}><Text style={s.signInText}>Sign In</Text></Pressable></View>
    <View style={s.hero}>
      <Text style={s.eyebrow}>STORIES WITHOUT LIMITS</Text>
      <Text accessibilityRole="header" style={s.title}>Entertainment, reimagined.</Text>
      <Text style={s.copy}>Discover original films, series and visual worlds created by a new generation of storytellers.</Text>
      <View style={s.form}>
        <TextInput accessibilityLabel="Email address" autoComplete="email" textContentType="emailAddress" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={value=>{setEmail(value);if(error)setError('')}} onSubmitEditing={getStarted} placeholder="Email address" placeholderTextColor="#918aa3" style={s.input}/>
        <Pressable accessibilityRole="button" onPress={getStarted} style={s.primary}><Text style={s.primaryText}>Get Started</Text></Pressable>
      </View>
      <Text accessibilityRole="alert" style={s.error}>{error}</Text>
      <Pressable accessibilityRole="link" onPress={()=>navigate('/browse')} style={s.explore}><Text style={s.exploreText}>Explore Ripple</Text><Text style={s.arrow}>→</Text></Pressable>
    </View>
    <Text style={s.footer}>Original worlds. Made for everyone.</Text>
  </LinearGradient>;
}

const s=StyleSheet.create({page:{flex:1,minHeight:'100dvh',overflow:'hidden',paddingHorizontal:'clamp(20px, 5vw, 76px)'},glow:{position:'absolute',width:'70vw',height:'70vw',maxWidth:900,maxHeight:900,borderRadius:9999,backgroundColor:'rgba(117,73,216,.22)',filter:'blur(90px)',right:'-20%',top:'-35%'},header:{height:88,flexDirection:'row',alignItems:'center',justifyContent:'space-between',zIndex:2},logo:{color:'#fff',fontSize:20,fontWeight:'900',letterSpacing:6},signIn:{minHeight:44,paddingHorizontal:22,borderRadius:24,borderWidth:1,borderColor:'rgba(255,255,255,.5)',alignItems:'center',justifyContent:'center'},signInText:{color:'#fff',fontWeight:'800'},hero:{flex:1,maxWidth:850,justifyContent:'center',paddingBottom:50,zIndex:2},eyebrow:{color:'#b9a5ff',fontSize:12,fontWeight:'900',letterSpacing:3,marginBottom:20},title:{color:'#fff',fontSize:'clamp(48px, 8vw, 104px)',lineHeight:1.02,fontWeight:'900',letterSpacing:-3,maxWidth:820},copy:{color:'#cac4d5',fontSize:'clamp(17px, 2vw, 22px)',lineHeight:30,maxWidth:650,marginTop:26},form:{flexDirection:'row',flexWrap:'wrap',gap:10,marginTop:34,maxWidth:650},input:{flexGrow:1,minWidth:240,height:56,borderRadius:9,borderWidth:1,borderColor:'rgba(255,255,255,.3)',backgroundColor:'rgba(5,4,12,.65)',color:'#fff',paddingHorizontal:18,fontSize:16,outlineColor:'#b9a5ff'},primary:{height:56,paddingHorizontal:28,borderRadius:9,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'},primaryText:{color:'#100923',fontSize:16,fontWeight:'900'},error:{color:'#ffb8c2',minHeight:24,marginTop:7},explore:{minHeight:48,alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:10},exploreText:{color:'#fff',fontWeight:'800',fontSize:16},arrow:{color:'#b9a5ff',fontSize:22},footer:{color:'#827c90',fontSize:12,letterSpacing:1.5,paddingBottom:'max(24px, env(safe-area-inset-bottom))',zIndex:2}});
