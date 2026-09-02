import React, { useEffect, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../services/api';
import { editorialTitles } from '../data/editorial';
import { cloudinaryImageUrl } from '../utils/cloudinary';
const { listPlans, normalizeWelcomePlan } = require('../../welcomePlans.cjs');

export const PLAN_FALLBACK_TITLE = 'Free access available';
export const PLAN_FALLBACK_COPY = 'Premium plan details are temporarily unavailable.';
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

const montage = [
  { item: editorialTitles[0], kind:'landscape', style:'wideOne', critical:true },
  { item: editorialTitles[1], kind:'portrait', style:'portraitOne', critical:true },
  { item: editorialTitles[2], kind:'landscape', style:'wideTwo' },
  { item: editorialTitles[3], kind:'portrait', style:'portraitTwo' },
  { item: editorialTitles[4], kind:'landscape', style:'wideThree' },
  { item: editorialTitles[6], kind:'portrait', style:'portraitThree' },
  { item: editorialTitles[7], kind:'landscape', style:'wideFour' },
  { item: editorialTitles[9], kind:'portrait', style:'portraitFour' },
];

function Heading({ level, children, style, ...props }) {
  if (Platform.OS === 'web') {
    const webStyle = { ...StyleSheet.flatten(style) };
    // DOM numeric line-height is a multiplier, unlike React Native's pixel value.
    if (typeof webStyle.lineHeight === 'number') webStyle.lineHeight = `${webStyle.lineHeight}px`;
    return React.createElement(`h${level}`, { ...props, style:webStyle }, children);
  }
  return <Text accessibilityRole="header" aria-level={level} style={style} {...props}>{children}</Text>;
}
function EmailCta({ email, setEmail, error, setError, getStarted, repeated = false }) {
  const { width } = useWindowDimensions();
  const errorId = repeated ? 'footer-email-error' : 'hero-email-error';
  return <View style={[s.ctaWrap, repeated && s.ctaCentered]}>
    <View accessibilityRole="form" aria-label="Create your Ripple account" style={s.form}>
      <TextInput accessibilityLabel="Email address" aria-describedby={error ? errorId : undefined} autoComplete="email" textContentType="emailAddress" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={value=>{setEmail(value);if(error)setError('')}} onSubmitEditing={getStarted} placeholder="Email address" placeholderTextColor="#918aa3" style={[s.input,width<768&&s.formFull]}/>
      <Pressable accessibilityRole="button" onPress={getStarted} style={({focused})=>[s.primary,width<768&&s.formFull,focused&&s.focus]}><Text style={s.primaryText}>Get Started</Text></Pressable>
    </View>
    <Text nativeID={errorId} accessibilityRole="alert" style={s.error}>{error}</Text>
  </View>;
}

function NativeWelcomeScreen({ navigate }) {
  return <LinearGradient colors={['#05030d','#160b2d','#05030d']} style={native.page}>
    <View style={native.header}><Text style={native.logo}>RIPPLE</Text></View>
    <View style={native.hero}>
      <Text accessibilityRole="header" style={native.title}>Entertainment, reimagined.</Text>
      <Text style={native.copy}>Discover original films, series and visual worlds shaped by a new generation of AI storytellers.</Text>
      <Pressable accessibilityRole="button" onPress={()=>navigate('/signin')} style={native.primary}><Text style={native.primaryText}>Sign In</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={()=>navigate('/browse')} style={native.secondary}><Text style={native.secondaryText}>Explore Ripple</Text></Pressable>
    </View>
  </LinearGradient>;
}

export function WelcomeScreen(props) {
  return Platform.OS === 'web' ? <WebWelcomeScreen {...props}/> : <NativeWelcomeScreen {...props}/>;
}

function WebWelcomeScreen({ navigate }) {
  const { width } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [plans, setPlans] = useState([]);
  const [planStatus, setPlanStatus] = useState('loading');
  const [openFaq, setOpenFaq] = useState(-1);
  const [conserveData, setConserveData] = useState(false);
  const compact = width < 700;
  const titleMetrics = width < 375 ? [38,42,-1] : width < 480 ? [44,48,-1.2]
    : width < 768 ? [52,57,-1.5] : width < 1024 ? [64,69,-2]
    : width < 1440 ? [76,81,-2.5] : [88,94,-3];
  if (__DEV__) {
    const [fontSize,lineHeight] = titleMetrics;
    console.assert(lineHeight >= fontSize && lineHeight <= fontSize * 1.2, 'Welcome H1 line-height is outside its safe range.');
  }
  useEffect(() => {
    const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const saveData = typeof navigator !== 'undefined' && navigator.connection?.saveData === true;
    setConserveData(Boolean(reduced || saveData));
    if (!saveData) montage.filter(image=>image.critical).forEach(({item,kind})=>Image.prefetch(cloudinaryImageUrl(kind==='portrait'?item.portraitImageUrl:item.landscapeImageUrl,kind)));
  }, []);
  useEffect(() => {
    let live=true;
    api('/api/subscriptions/plans').then(value=>{
      if (!live) return;
      const rawPlans = listPlans(value);
      const normalized = rawPlans.map(normalizeWelcomePlan).filter(Boolean);
      if (__DEV__ && normalized.length !== rawPlans.length) console.warn('Ripple omitted an invalid subscription plan response.');
      setPlans(normalized); setPlanStatus(normalized.length ? 'ready' : 'unavailable');
    }).catch(()=>{if(live)setPlanStatus('unavailable')});
    return()=>{live=false};
  }, []);
  const getStarted = () => {
    if (!validEmail(email)) { setError('Enter a valid email address.'); return; }
    setError(''); navigate(`/signup?email=${encodeURIComponent(email.trim())}`);
  };
  const ctaProps={email,setEmail,error,setError,getStarted};
  const visibleMontage = (conserveData || width < 480) ? montage.slice(0,3) : width < 768 ? montage.slice(0,4) : width < 1024 ? montage.slice(0,6) : montage;
  return <View accessibilityRole="main" style={s.page}>
    <LinearGradient accessibilityRole="banner" colors={['#05030d','#100820','#05030d']} start={{x:0,y:0}} end={{x:1,y:1}} style={[s.heroShell,width<768&&s.heroShellMobile]}>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[s.montage,width<700&&s.montageMobile]}>{visibleMontage.map(({item,kind,style,critical})=><View key={item.id} style={[s.panel,s[style]]}><Image source={{uri:cloudinaryImageUrl(kind==='portrait'?item.portraitImageUrl:item.landscapeImageUrl,kind)}} resizeMode="cover" loading={critical?'eager':'lazy'} style={s.panelImage}/></View>)}</View>
      <LinearGradient colors={width<700?['rgba(5,3,13,.15)','rgba(5,3,13,.82)','#05030d']:['#05030d','rgba(5,3,13,.92)','rgba(5,3,13,.18)']} locations={width<700?[0,.52,1]:[0,.48,1]} start={width<700?{x:0,y:0}:{x:0,y:.5}} end={width<700?{x:0,y:1}:{x:1,y:.5}} style={s.heroShade}/>
      <View style={s.header}><Text style={s.logo}>RIPPLE</Text><Pressable accessibilityRole="link" onPress={()=>navigate('/signin')} style={({focused})=>[s.signIn,focused&&s.focus]}><Text style={s.signInText}>Sign In</Text></Pressable></View>
      <View style={[s.hero,width<768&&s.heroMobile,width>=768&&width<1024&&s.heroTablet]}>
        <Heading level={1} testID="welcome-headline" style={[s.title,{fontSize:titleMetrics[0],lineHeight:titleMetrics[1],letterSpacing:titleMetrics[2]}]}>Entertainment, reimagined.</Heading>
        <Text style={s.copy}>Discover original films, series and visual worlds shaped by a new generation of AI storytellers.</Text>
        <EmailCta {...ctaProps}/>
        <Pressable accessibilityRole="link" onPress={()=>navigate('/browse')} style={({focused})=>[s.explore,focused&&s.focus]}><Text style={s.exploreText}>Explore Ripple</Text><Text style={s.arrow}>→</Text></Pressable>
      </View>
    </LinearGradient>

    <View accessibilityRole="region" aria-label="Why watch on Ripple" style={s.section}><View style={s.content}><Heading level={2} style={s.sectionTitle}>Why watch on Ripple</Heading>
      <View style={s.grid}>{benefits.map(([title,copy],index)=><View key={title} style={[s.benefit,compact&&s.fullCard]}><Text style={s.cardNumber}>0{index+1}</Text><Heading level={3} style={s.cardTitle}>{title}</Heading><Text style={s.cardCopy}>{copy}</Text></View>)}</View></View>
    </View>

    <View accessibilityRole="region" aria-label="Explore the catalogue" style={s.section}><View style={s.content}><View style={s.sectionHead}><Heading level={2} style={s.sectionTitle}>Explore the catalogue</Heading><Pressable accessibilityRole="link" onPress={()=>navigate('/browse')}><Text style={s.inlineLink}>Browse all →</Text></Pressable></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catalogue}>{editorialTitles.slice(0,5).map(item=><Pressable key={item.id} accessibilityLabel={`Explore ${item.title}`} onPress={()=>navigate('/browse')} style={s.posterCard}><Image source={{uri:cloudinaryImageUrl(item.portraitImageUrl,'portrait')}} loading="lazy" resizeMode="cover" style={s.poster}/><Text numberOfLines={2} style={s.posterTitle}>{item.title}</Text><Text style={s.meta}>{item.format} · {item.releaseStatus}</Text></Pressable>)}</ScrollView>
      <View style={s.categories}>{[['Films','/films'],['Series','/series'],['Shorts','/shorts'],['New & Popular','/new']].map(([label,path])=><Pressable key={path} onPress={()=>navigate(path)} style={s.category}><Text style={s.categoryText}>{label}</Text></Pressable>)}</View></View>
    </View>

    <View accessibilityRole="region" aria-label="Choose how you watch" style={s.section}><View style={s.content}><Heading level={2} style={s.sectionTitle}>Choose how you watch</Heading>
      <Text accessibilityLiveRegion="polite" style={s.planLive}>{planStatus==='loading'?'Loading current plans…':''}</Text>
      <View style={s.grid}>{planStatus==='ready' ? plans.map(plan=><Pressable key={plan.id} accessibilityRole="link" onPress={()=>navigate('/plans')} style={[s.plan,compact&&s.fullCard,!plan.available&&s.unavailable]}><View><View style={s.planHeading}><Heading level={3} style={s.cardTitle}>{plan.name}</Heading><Text style={s.availability}>{plan.available?'Available':'Unavailable'}</Text></View><Text style={s.planPrice}>{plan.price}{plan.interval?<Text style={s.planPeriod}> / {plan.interval}</Text>:null}</Text><View style={s.planFeatures}><Text style={s.feature}>Quality · {plan.quality}</Text><Text style={s.feature}>Streams · {plan.streams}</Text><Text style={s.feature}>Advertisements · {plan.ads}</Text><Text style={s.feature}>Downloads · {plan.downloads}</Text></View></View><Text style={s.inlineLink}>See plan details →</Text></Pressable>) : planStatus==='unavailable' ? <View style={[s.plan,s.fullCard]}><Heading level={3} style={s.cardTitle}>{PLAN_FALLBACK_TITLE}</Heading><Text style={s.cardCopy}>{PLAN_FALLBACK_COPY}</Text><Pressable accessibilityRole="link" onPress={()=>navigate('/browse')}><Text style={s.inlineLink}>Explore Ripple →</Text></Pressable></View> : null}</View></View>
    </View>

    <View accessibilityRole="region" aria-label="Frequently Asked Questions" style={[s.section,s.faqSection]}><View style={s.content}><Heading level={2} style={s.sectionTitle}>Frequently Asked Questions</Heading>{faqs.map(([question,answer],index)=>{const expanded=openFaq===index;return <View key={question} style={s.faq}><Pressable accessibilityRole="button" accessibilityState={{expanded}} accessibilityControls={`faq-answer-${index}`} onPress={()=>setOpenFaq(expanded?-1:index)} style={({focused})=>[s.faqButton,focused&&s.focus]}><Text style={s.faqQuestion}>{question}</Text><Text style={s.plus}>{expanded?'−':'+'}</Text></Pressable>{expanded&&<Text nativeID={`faq-answer-${index}`} style={s.faqAnswer}>{answer}</Text>}</View>})}</View></View>

    <View accessibilityRole="region" aria-label="Start exploring Ripple" style={s.finalCta}><Heading level={2} style={[s.sectionTitle,s.centerText]}>Start exploring Ripple</Heading><Text style={s.finalCopy}>Your next original world is waiting.</Text><EmailCta {...ctaProps} repeated/></View>
    <View accessibilityRole="contentinfo" style={s.footer}><Text style={s.footerBrand}>RIPPLE</Text><View style={s.footerLinks}><Pressable onPress={()=>navigate('/browse')}><Text style={s.footerLink}>Browse</Text></Pressable><Pressable onPress={()=>navigate('/plans')}><Text style={s.footerLink}>Plans</Text></Pressable><Pressable onPress={()=>navigate('/signin')}><Text style={s.footerLink}>Sign In</Text></Pressable></View><Text style={s.footerTag}>Original worlds. Made for everyone.</Text></View>
  </View>;
}

const native=StyleSheet.create({
  page:{flex:1,minHeight:600,paddingHorizontal:24,backgroundColor:'#05030d'},
  header:{paddingTop:28,minHeight:88,justifyContent:'center'}, logo:{color:'#fff',fontSize:20,fontWeight:'900',letterSpacing:6},
  hero:{flex:1,justifyContent:'center',paddingBottom:64}, title:{color:'#fff',fontSize:48,lineHeight:53,fontWeight:'900',letterSpacing:-1.2},
  copy:{color:'#d5d0dc',fontSize:18,lineHeight:27,marginTop:22,marginBottom:32},
  primary:{height:54,borderRadius:9,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'}, primaryText:{color:'#100923',fontSize:16,fontWeight:'900'},
  secondary:{height:54,marginTop:12,borderRadius:9,borderWidth:1,borderColor:'#b9a5ff',alignItems:'center',justifyContent:'center'}, secondaryText:{color:'#fff',fontSize:16,fontWeight:'800'},
});

const s=Platform.OS === 'web' ? StyleSheet.create({
  page:{width:'100%',minHeight:'100vh',minHeight:'100svh',backgroundColor:'#05030d',overflowX:'hidden'},heroShell:{position:'relative',height:'min(900px, 100svh)',minHeight:720,backgroundColor:'#05030d',paddingHorizontal:'clamp(16px, 5vw, 72px)',overflow:'hidden'},heroShellMobile:{height:'auto',minHeight:680},montage:{position:'absolute',inset:0,left:'32%',opacity:.72,pointerEvents:'none'},montageMobile:{left:'-18%',right:'-22%',bottom:'38%',opacity:.62},panel:{position:'absolute',overflow:'hidden',borderRadius:18,borderWidth:1,borderColor:'rgba(255,255,255,.14)',backgroundColor:'#130e20',boxShadow:'0 24px 65px rgba(0,0,0,.45)',transform:[{rotate:'-4deg'}]},panelImage:{width:'100%',height:'100%'},wideOne:{width:'45%',height:'32%',top:'5%',left:'5%'},portraitOne:{width:'21%',height:'45%',top:'11%',left:'53%',transform:[{rotate:'4deg'}]},wideTwo:{width:'42%',height:'29%',top:'42%',left:'12%',transform:[{rotate:'2deg'}]},portraitTwo:{width:'20%',height:'43%',top:'51%',left:'57%',transform:[{rotate:'-3deg'}]},wideThree:{width:'38%',height:'27%',top:'70%',left:'3%'},portraitThree:{width:'18%',height:'39%',top:'-8%',left:'78%',transform:[{rotate:'3deg'}]},wideFour:{width:'34%',height:'25%',top:'29%',left:'72%',transform:[{rotate:'-2deg'}]},portraitFour:{width:'17%',height:'36%',top:'63%',left:'82%',transform:[{rotate:'4deg'}]},heroShade:{position:'absolute',inset:0},header:{minHeight:88,paddingTop:'env(safe-area-inset-top)',flexDirection:'row',alignItems:'center',justifyContent:'space-between',zIndex:3},logo:{color:'#fff',fontSize:20,fontWeight:'900',letterSpacing:6,textShadow:'0 2px 12px #000'},signIn:{minHeight:44,paddingHorizontal:20,borderRadius:24,borderWidth:1,borderColor:'rgba(255,255,255,.55)',backgroundColor:'rgba(5,3,13,.42)',alignItems:'center',justifyContent:'center'},signInText:{color:'#fff',fontWeight:'800'},hero:{height:'calc(100% - 88px)',maxWidth:880,justifyContent:'center',paddingBottom:40,zIndex:2},heroMobile:{height:'auto',minHeight:592,justifyContent:'flex-end',paddingBottom:'max(48px, env(safe-area-inset-bottom))'},heroTablet:{maxWidth:'55%'},title:{color:'#fff',fontWeight:'900',maxWidth:880,maxHeight:300,textShadow:'0 3px 24px rgba(0,0,0,.8)'},copy:{color:'#d5d0dc',fontSize:'clamp(17px, 2vw, 21px)',lineHeight:30,maxWidth:640,marginTop:22,textShadow:'0 2px 14px #000'},ctaWrap:{marginTop:30,maxWidth:650},ctaCentered:{width:'100%',alignSelf:'center'},form:{flexDirection:'row',flexWrap:'wrap',gap:10},input:{flexGrow:1,minWidth:'min(240px, 100%)',height:56,borderRadius:9,borderWidth:1,borderColor:'rgba(255,255,255,.38)',backgroundColor:'rgba(5,4,12,.84)',color:'#fff',paddingHorizontal:18,fontSize:16,outlineColor:'#b9a5ff'},formFull:{width:'100%',minWidth:'100%'},primary:{minWidth:140,height:56,paddingHorizontal:28,borderRadius:9,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'},primaryText:{color:'#100923',fontSize:16,fontWeight:'900'},focus:{outlineStyle:'solid',outlineWidth:3,outlineColor:'#c8b7ff',outlineOffset:3},error:{color:'#ffb8c2',minHeight:24,lineHeight:18,marginTop:7},explore:{minHeight:48,alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:10,marginTop:2},exploreText:{color:'#fff',fontWeight:'800',fontSize:16},arrow:{color:'#b9a5ff',fontSize:22},section:{paddingHorizontal:'clamp(16px, 5vw, 72px)',paddingVertical:'clamp(64px, 8vw, 112px)',borderTopWidth:1,borderTopColor:'rgba(255,255,255,.08)'},content:{width:'100%',maxWidth:1440,alignSelf:'center'},sectionTitle:{color:'#fff',fontSize:'clamp(30px, 4vw, 52px)',lineHeight:'clamp(36px, 4.5vw, 58px)',fontWeight:'900',letterSpacing:-1.2,marginBottom:30},sectionHead:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',alignItems:'center',gap:12},grid:{flexDirection:'row',flexWrap:'wrap',gap:16},benefit:{width:'calc(50% - 8px)',minHeight:210,padding:28,borderRadius:18,backgroundColor:'#100b1b',borderWidth:1,borderColor:'rgba(185,165,255,.16)',backgroundImage:'linear-gradient(145deg, rgba(100,67,158,.16), rgba(8,5,18,.2))'},fullCard:{width:'100%'},cardNumber:{color:'#7e699e',fontSize:12,fontWeight:'900',letterSpacing:2,marginBottom:34},cardTitle:{color:'#fff',fontSize:21,lineHeight:27,fontWeight:'800',marginBottom:12},cardCopy:{color:'#aaa4b6',fontSize:16,lineHeight:24,maxWidth:650},inlineLink:{color:'#c1adff',fontSize:15,lineHeight:22,fontWeight:'800'},catalogue:{gap:14,paddingBottom:28},posterCard:{width:'clamp(180px, 20vw, 270px)'},poster:{width:'100%',aspectRatio:2/3,borderRadius:14,backgroundColor:'#171222'},posterTitle:{color:'#fff',fontSize:16,lineHeight:21,fontWeight:'800',marginTop:12},meta:{color:'#8f899b',fontSize:12,lineHeight:18,marginTop:4},categories:{flexDirection:'row',flexWrap:'wrap',gap:10},category:{minHeight:44,justifyContent:'center',borderWidth:1,borderColor:'rgba(255,255,255,.22)',borderRadius:999,paddingVertical:11,paddingHorizontal:18},categoryText:{color:'#e8e4ee',fontWeight:'700'},planLive:{color:'#aaa4b6',minHeight:22,marginTop:-20,marginBottom:14},plan:{width:'calc(25% - 12px)',minWidth:250,minHeight:330,flexGrow:1,padding:26,borderRadius:18,borderWidth:1,borderColor:'rgba(185,165,255,.15)',backgroundColor:'#100b1b',justifyContent:'space-between'},unavailable:{opacity:.58},planHeading:{flexDirection:'row',justifyContent:'space-between',gap:12},availability:{color:'#9f94ae',fontSize:12,lineHeight:18},planPrice:{color:'#fff',fontSize:28,lineHeight:34,fontWeight:'900',marginBottom:22},planPeriod:{fontSize:13,color:'#aaa4b6'},planFeatures:{gap:8},feature:{color:'#c7c1ce',fontSize:14,lineHeight:20},faqSection:{paddingHorizontal:'clamp(16px, 5vw, 72px)'},faqSectionContent:{maxWidth:1000},faq:{borderTopWidth:1,borderTopColor:'rgba(255,255,255,.15)',maxWidth:1000},faqButton:{minHeight:72,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:20},faqQuestion:{color:'#fff',fontSize:18,lineHeight:25,fontWeight:'800',flex:1},plus:{color:'#b9a5ff',fontSize:28,lineHeight:32},faqAnswer:{color:'#aaa4b6',fontSize:16,lineHeight:25,paddingBottom:24,maxWidth:780},finalCta:{paddingHorizontal:20,paddingVertical:90,alignItems:'center',backgroundColor:'#110a20'},centerText:{textAlign:'center',marginBottom:8},finalCopy:{color:'#aaa4b6',fontSize:17,lineHeight:25,textAlign:'center'},footer:{paddingHorizontal:'clamp(16px, 5vw, 72px)',paddingTop:40,paddingBottom:'max(24px, env(safe-area-inset-bottom))',backgroundColor:'#05030d',flexDirection:'row',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:24,borderTopWidth:1,borderTopColor:'rgba(255,255,255,.1)'},footerBrand:{color:'#fff',fontSize:17,fontWeight:'900',letterSpacing:5},footerLinks:{flexDirection:'row',flexWrap:'wrap',gap:24},footerLink:{color:'#bbb5c5',fontWeight:'700'},footerTag:{color:'#777181',fontSize:12,letterSpacing:1},
}) : {};
