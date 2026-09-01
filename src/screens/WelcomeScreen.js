import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../services/api';
import { editorialTitles } from '../data/editorial';

const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const benefits = [
  ['Original by design', 'Distinct films, series and visual stories from emerging creators.'],
  ['Made to discover', 'A focused catalogue that makes finding your next watch simple.'],
  ['Watch your way', 'Responsive playback across the screens you already use.'],
  ['Clear access', 'See availability and subscription requirements before you press play.'],
];
const faqs = [
  ['What is Ripple?', 'Ripple is a streaming home for original films, series, shorts and visual experiences.'],
  ['What can I watch?', 'The catalogue includes available releases and clearly labelled editorial previews for upcoming work.'],
  ['How do subscriptions work?', 'Available plans and their current prices come directly from Ripple’s subscription service.'],
  ['Where can I use Ripple?', 'Ripple is built for modern web browsers on phones, tablets and computers.'],
];
const planList = value => Array.isArray(value) ? value : value?.plans || value?.data || [];
const planPrice = plan => plan.displayPrice || plan.formattedPrice || (plan.price != null ? `${plan.currency || ''} ${plan.price}`.trim() : 'View plan');

function EmailCta({ email, setEmail, error, setError, getStarted, repeated = false }) {
  return <View style={[s.ctaWrap, repeated && s.ctaCentered]}>
    <View style={s.form}>
      <TextInput accessibilityLabel={repeated ? 'Email address to get started' : 'Email address'} autoComplete="email" textContentType="emailAddress" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={value=>{setEmail(value);if(error)setError('')}} onSubmitEditing={getStarted} placeholder="Email address" placeholderTextColor="#918aa3" style={s.input}/>
      <Pressable accessibilityRole="button" onPress={getStarted} style={s.primary}><Text style={s.primaryText}>Get Started</Text></Pressable>
    </View>
    <Text accessibilityRole="alert" style={s.error}>{error}</Text>
  </View>;
}

export function WelcomeScreen({ navigate }) {
  const { width } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [plans, setPlans] = useState([]);
  const [openFaq, setOpenFaq] = useState(-1);
  const titleType = width < 360 ? {fontSize:36,lineHeight:40,letterSpacing:-1.2} : width < 600 ? {fontSize:42,lineHeight:46,letterSpacing:-1.5} : width < 900 ? {fontSize:58,lineHeight:63,letterSpacing:-2} : width < 1200 ? {fontSize:76,lineHeight:80,letterSpacing:-2.5} : {fontSize:92,lineHeight:96,letterSpacing:-3};
  const compact = width < 700;
  useEffect(() => { let live=true; api('/api/subscriptions/plans').then(value=>{if(live)setPlans(planList(value));}).catch(()=>{}); return()=>{live=false}; }, []);
  const getStarted = () => {
    if (!validEmail(email)) { setError('Enter a valid email address.'); return; }
    setError(''); navigate(`/signup?email=${encodeURIComponent(email.trim())}`);
  };
  const ctaProps={email,setEmail,error,setError,getStarted};
  return <ScrollView style={s.scroll} contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
    <LinearGradient colors={['#080512','#140b2b','#07111e']} start={{x:0,y:0}} end={{x:1,y:1}} style={s.heroShell}>
      <View style={s.glow}/>
      <View style={s.header}><Text style={s.logo}>RIPPLE</Text><Pressable accessibilityRole="link" onPress={()=>navigate('/signin')} style={s.signIn}><Text style={s.signInText}>Sign In</Text></Pressable></View>
      <View style={s.hero}>
        <Text style={s.eyebrow}>STORIES WITHOUT LIMITS</Text>
        <Text accessibilityRole="header" testID="welcome-headline" style={[s.title,titleType]}>Entertainment, reimagined.</Text>
        <Text style={s.copy}>Discover original films, series and visual worlds created by a new generation of storytellers.</Text>
        <EmailCta {...ctaProps}/>
        <Pressable accessibilityRole="link" onPress={()=>navigate('/browse')} style={s.explore}><Text style={s.exploreText}>Explore Ripple</Text><Text style={s.arrow}>→</Text></Pressable>
      </View>
    </LinearGradient>

    <View style={s.section}><Text style={s.kicker}>WHY RIPPLE</Text><Text style={s.sectionTitle}>Why watch on Ripple</Text>
      <View style={s.grid}>{benefits.map(([title,copy])=><View key={title} style={[s.benefit, compact && s.fullCard]}><Text style={s.cardTitle}>{title}</Text><Text style={s.cardCopy}>{copy}</Text></View>)}</View>
    </View>

    <View style={s.section}><View style={s.sectionHead}><Text style={s.sectionTitle}>Explore the catalogue</Text><Pressable onPress={()=>navigate('/browse')}><Text style={s.inlineLink}>Browse all →</Text></Pressable></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catalogue}>{editorialTitles.slice(0,5).map(item=><Pressable key={item.id} onPress={()=>navigate('/browse')} style={s.posterCard}><Image source={{uri:item.portraitImageUrl}} resizeMode="cover" style={s.poster}/><Text numberOfLines={2} style={s.posterTitle}>{item.title}</Text><Text style={s.meta}>{item.format} · {item.releaseStatus}</Text></Pressable>)}</ScrollView>
      <View style={s.categories}>{[['Films','/films'],['Series','/series'],['Shorts','/shorts'],['New & Popular','/new']].map(([label,path])=><Pressable key={path} onPress={()=>navigate(path)} style={s.category}><Text style={s.categoryText}>{label}</Text></Pressable>)}</View>
    </View>

    <View style={s.section}><Text style={s.kicker}>MEMBERSHIP</Text><Text style={s.sectionTitle}>Choose how you watch</Text>
      <View style={s.grid}>{plans.length ? plans.slice(0,3).map((plan,index)=><Pressable key={plan.id || plan.name || index} onPress={()=>navigate('/plans')} style={[s.plan, compact && s.fullCard]}><Text style={s.cardTitle}>{plan.name || plan.title || 'Ripple plan'}</Text><Text style={s.planPrice}>{planPrice(plan)}</Text><Text style={s.inlineLink}>See plan details →</Text></Pressable>) : <View style={[s.plan,s.fullCard]}><Text style={s.cardTitle}>Plans built around your screen</Text><Pressable onPress={()=>navigate('/plans')}><Text style={s.inlineLink}>View current plans →</Text></Pressable></View>}</View>
    </View>

    <View style={[s.section,s.faqSection]}><Text style={s.sectionTitle}>Frequently Asked Questions</Text>{faqs.map(([question,answer],index)=><View key={question} style={s.faq}><Pressable accessibilityRole="button" accessibilityState={{expanded:openFaq===index}} onPress={()=>setOpenFaq(openFaq===index?-1:index)} style={s.faqButton}><Text style={s.faqQuestion}>{question}</Text><Text style={s.plus}>{openFaq===index?'−':'+'}</Text></Pressable>{openFaq===index&&<Text style={s.faqAnswer}>{answer}</Text>}</View>)}</View>

    <View style={s.finalCta}><Text style={s.kicker}>YOUR NEXT STORY</Text><Text style={[s.sectionTitle,s.centerText]}>Start exploring Ripple</Text><EmailCta {...ctaProps} repeated/></View>
    <View style={s.footer}><Text style={s.footerBrand}>RIPPLE</Text><View style={s.footerLinks}><Pressable onPress={()=>navigate('/browse')}><Text style={s.footerLink}>Browse</Text></Pressable><Pressable onPress={()=>navigate('/plans')}><Text style={s.footerLink}>Plans</Text></Pressable><Pressable onPress={()=>navigate('/signin')}><Text style={s.footerLink}>Sign In</Text></Pressable></View><Text style={s.footerTag}>Original worlds. Made for everyone.</Text></View>
  </ScrollView>;
}

const s=StyleSheet.create({scroll:{flex:1,backgroundColor:'#080512'},page:{backgroundColor:'#080512'},heroShell:{minHeight:'100dvh',paddingHorizontal:'clamp(20px, 5vw, 76px)',overflow:'hidden'},glow:{position:'absolute',width:'70vw',height:'70vw',maxWidth:900,maxHeight:900,borderRadius:9999,backgroundColor:'rgba(117,73,216,.22)',filter:'blur(90px)',right:'-20%',top:'-25%'},header:{minHeight:88,flexDirection:'row',alignItems:'center',justifyContent:'space-between',zIndex:2},logo:{color:'#fff',fontSize:20,fontWeight:'900',letterSpacing:6},signIn:{minHeight:44,paddingHorizontal:20,borderRadius:24,borderWidth:1,borderColor:'rgba(255,255,255,.5)',alignItems:'center',justifyContent:'center'},signInText:{color:'#fff',fontWeight:'800'},hero:{flexGrow:1,maxWidth:920,justifyContent:'center',paddingTop:50,paddingBottom:72,zIndex:2},eyebrow:{color:'#b9a5ff',fontSize:12,lineHeight:16,fontWeight:'900',letterSpacing:3,marginBottom:20},title:{color:'#fff',fontWeight:'900',maxWidth:880},copy:{color:'#cac4d5',fontSize:'clamp(17px, 2vw, 22px)',lineHeight:30,maxWidth:650,marginTop:22},ctaWrap:{marginTop:30,maxWidth:650},ctaCentered:{width:'100%',alignSelf:'center'},form:{flexDirection:'row',flexWrap:'wrap',gap:10},input:{flexGrow:1,minWidth:'min(240px, 100%)',height:56,borderRadius:9,borderWidth:1,borderColor:'rgba(255,255,255,.3)',backgroundColor:'rgba(5,4,12,.65)',color:'#fff',paddingHorizontal:18,fontSize:16,outlineColor:'#b9a5ff'},primary:{height:56,paddingHorizontal:28,borderRadius:9,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'},primaryText:{color:'#100923',fontSize:16,fontWeight:'900'},error:{color:'#ffb8c2',minHeight:24,lineHeight:18,marginTop:7},explore:{minHeight:48,alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:10,marginTop:4},exploreText:{color:'#fff',fontWeight:'800',fontSize:16},arrow:{color:'#b9a5ff',fontSize:22},section:{paddingHorizontal:'clamp(20px, 5vw, 76px)',paddingVertical:'clamp(64px, 8vw, 112px)',borderTopWidth:1,borderTopColor:'rgba(255,255,255,.08)'},kicker:{color:'#a98cff',fontSize:12,lineHeight:16,fontWeight:'900',letterSpacing:2.5,marginBottom:12},sectionTitle:{color:'#fff',fontSize:'clamp(30px, 4vw, 52px)',lineHeight:'clamp(36px, 4.5vw, 58px)',fontWeight:'900',letterSpacing:-1.2,marginBottom:30},sectionHead:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',alignItems:'center',gap:12},grid:{flexDirection:'row',flexWrap:'wrap',gap:16},benefit:{width:'calc(50% - 8px)',minHeight:180,padding:26,borderRadius:18,backgroundColor:'#151024',borderWidth:1,borderColor:'rgba(185,165,255,.16)'},fullCard:{width:'100%'},cardTitle:{color:'#fff',fontSize:21,lineHeight:27,fontWeight:'800',marginBottom:12},cardCopy:{color:'#aaa4b6',fontSize:16,lineHeight:24},inlineLink:{color:'#b9a5ff',fontSize:15,lineHeight:22,fontWeight:'800'},catalogue:{gap:14,paddingBottom:28},posterCard:{width:'clamp(150px, 19vw, 245px)'},poster:{width:'100%',aspectRatio:2/3,borderRadius:14,backgroundColor:'#171222'},posterTitle:{color:'#fff',fontSize:16,lineHeight:21,fontWeight:'800',marginTop:12},meta:{color:'#8f899b',fontSize:12,lineHeight:18,marginTop:4},categories:{flexDirection:'row',flexWrap:'wrap',gap:10},category:{borderWidth:1,borderColor:'rgba(255,255,255,.22)',borderRadius:999,paddingVertical:11,paddingHorizontal:18},categoryText:{color:'#e8e4ee',fontWeight:'700'},plan:{width:'calc(33.333% - 11px)',minHeight:190,padding:26,borderRadius:18,backgroundColor:'#151024',justifyContent:'space-between'},planPrice:{color:'#fff',fontSize:28,lineHeight:34,fontWeight:'900',marginBottom:24},faqSection:{maxWidth:1000,width:'100%',alignSelf:'center'},faq:{borderTopWidth:1,borderTopColor:'rgba(255,255,255,.15)'},faqButton:{minHeight:72,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:20},faqQuestion:{color:'#fff',fontSize:18,lineHeight:25,fontWeight:'800',flex:1},plus:{color:'#b9a5ff',fontSize:28,lineHeight:32},faqAnswer:{color:'#aaa4b6',fontSize:16,lineHeight:25,paddingBottom:24,maxWidth:780},finalCta:{paddingHorizontal:20,paddingVertical:90,alignItems:'center',backgroundColor:'#110a20'},centerText:{textAlign:'center',marginBottom:4},footer:{paddingHorizontal:'clamp(20px, 5vw, 76px)',paddingVertical:40,flexDirection:'row',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:24,borderTopWidth:1,borderTopColor:'rgba(255,255,255,.1)'},footerBrand:{color:'#fff',fontSize:17,fontWeight:'900',letterSpacing:5},footerLinks:{flexDirection:'row',flexWrap:'wrap',gap:24},footerLink:{color:'#bbb5c5',fontWeight:'700'},footerTag:{color:'#777181',fontSize:12,letterSpacing:1}});
