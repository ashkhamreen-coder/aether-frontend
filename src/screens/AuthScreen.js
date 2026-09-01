import React, { useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { signIn, signUp } from '../services/auth';
import { tokens } from '../theme/tokens';
import { validateAuth } from '../../authValidation';

const Form = Platform.OS === 'web' ? 'form' : View;
const Label = Platform.OS === 'web' ? 'label' : Text;

export function AuthScreen({ mode='signin', initialEmail='', onComplete, navigate }) {
  const [name,setName]=useState(''), [email,setEmail]=useState(initialEmail), [password,setPassword]=useState(''), [confirm,setConfirm]=useState(''), [country,setCountry]=useState(''), [accepted,setAccepted]=useState(false), [visible,setVisible]=useState(false), [busy,setBusy]=useState(false), [error,setError]=useState('');
  const submitting=useRef(false), emailRef=useRef(null), passwordRef=useRef(null); const signup=mode==='signup';
  async function submit(event) {
    event?.preventDefault?.();
    if (submitting.current) return;
    const validation=validateAuth({signup,email,password,confirm,accepted,name,country});
    if (validation) { setError(validation); (validation.includes('email') ? emailRef : passwordRef).current?.focus?.(); return; }
    submitting.current=true; setBusy(true); setError('');
    try {
      const session=signup ? await signUp({displayName:name.trim(),country:country.trim(),email:email.trim().toLowerCase(),password,acceptedTerms:true}) : await signIn(email,password);
      onComplete(session.user,signup);
    } catch(e) {
      if (e.status===401 || e.status===403) setError('Email or password is incorrect.');
      else if (e.code==='TIMEOUT') setError('Ripple is waking up. This may take a few seconds.');
      else if (e.code==='NETWORK_ERROR') setError('Ripple could not connect. Please try again.');
      else setError('Something went wrong. Please try again.');
    } finally { submitting.current=false; setBusy(false); }
  }
  const formProps=Platform.OS==='web'?{onSubmit:submit,noValidate:true}:{ };
  return <ScrollView keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets contentContainerStyle={s.page}>
    <View style={s.authHeader}><Pressable accessibilityRole="link" onPress={()=>navigate('/')}><Text style={s.logo}>RIPPLE</Text></Pressable><Pressable accessibilityRole="link" onPress={()=>navigate('/')}><Text style={s.back}>Back to welcome</Text></Pressable></View>
    <Form {...formProps} style={s.card}><Text accessibilityRole="header" style={s.title}>{signup?'Create your account':'Welcome back'}</Text><Text style={s.intro}>{signup?'Start with the Free plan. You can choose a paid plan later.':'Sign in to sync your list and continue watching.'}</Text>
      {signup?<><Field label="Display name" id="display-name"><TextInput nativeID="display-name" name="displayName" autoComplete="name" value={name} onChangeText={setName} style={s.input}/></Field><Field label="Country" id="country"><TextInput nativeID="country" name="country" autoComplete="country" value={country} onChangeText={setCountry} style={s.input}/></Field></>:null}
      <Field label="Email" id="email"><TextInput ref={emailRef} nativeID="email" accessibilityLabel="Email" type="email" name="email" autoComplete="email" required value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={s.input}/></Field>
      <Field label="Password" id="password"><View><TextInput ref={passwordRef} nativeID="password" accessibilityLabel="Password" type={visible?'text':'password'} name="password" autoComplete={signup?'new-password':'current-password'} required value={password} onChangeText={setPassword} secureTextEntry={!visible} onSubmitEditing={!signup?submit:undefined} style={s.input}/><Pressable accessibilityRole="button" role="button" type="button" accessibilityLabel={visible?'Hide password':'Show password'} onPress={()=>setVisible(!visible)} style={s.show}><Text style={s.showText}>{visible?'Hide':'Show'}</Text></Pressable></View></Field>
      {signup?<Field label="Confirm password" id="confirm-password"><TextInput nativeID="confirm-password" name="confirmPassword" autoComplete="new-password" required value={confirm} onChangeText={setConfirm} secureTextEntry={!visible} onSubmitEditing={submit} style={s.input}/></Field>:null}
      {signup?<Pressable accessibilityRole="checkbox" accessibilityState={{checked:accepted}} onPress={()=>setAccepted(!accepted)} style={s.check}><View style={[s.box,accepted&&s.boxOn]}><Text style={s.tick}>{accepted?'✓':''}</Text></View><Text style={s.checkText}>I accept the Terms and Privacy Policy.</Text></Pressable>:null}
      <Text accessibilityRole="alert" aria-live="assertive" accessibilityLiveRegion="assertive" style={s.error}>{error}</Text>
      <Pressable accessibilityRole="button" role="button" type="submit" disabled={busy} onPress={Platform.OS==='web'?undefined:submit} style={[s.submit,busy&&s.disabled]}><Text style={s.submitText}>{busy?'Signing in…':signup?'Create account':'Sign in'}</Text></Pressable>
      <Pressable accessibilityRole="link" onPress={()=>navigate(signup?'/signin':'/signup')} style={s.link}><Text style={s.linkText}>{signup?'Already have an account? Sign in':'New to Ripple? Create account'}</Text></Pressable>{!signup?<Pressable accessibilityRole="link" onPress={()=>navigate('/forgot-password')} style={s.link}><Text style={s.linkText}>Forgot password?</Text></Pressable>:null}
    </Form></ScrollView>;
}
function Field({label,id,children}) { return <View><Label htmlFor={id} style={s.label}>{label}</Label>{children}</View>; }
const s=StyleSheet.create({page:{flexGrow:1,minHeight:'100%',backgroundColor:tokens.color.background,alignItems:'center',justifyContent:'center',padding:16,paddingTop:88,paddingBottom:100},authHeader:{position:'absolute',top:16,left:16,right:16,minHeight:48,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},logo:{color:tokens.color.text,fontSize:18,fontWeight:'900',letterSpacing:5},back:{color:tokens.color.accentSoft,fontWeight:'800'},card:{width:'100%',maxWidth:480,padding:28,borderRadius:18,backgroundColor:tokens.color.surface,borderWidth:1,borderColor:tokens.color.border,gap:10},title:{color:tokens.color.text,fontSize:32,fontWeight:'900'},intro:{color:tokens.color.muted,lineHeight:20,marginBottom:6},label:{display:'flex',color:tokens.color.text,fontSize:13,fontWeight:'800',marginBottom:6},input:{height:52,borderWidth:1,borderColor:'#676272',borderRadius:9,color:tokens.color.text,paddingHorizontal:14,paddingRight:62,outlineColor:tokens.color.accentSoft},show:{position:'absolute',right:4,top:4,minWidth:48,height:44,alignItems:'center',justifyContent:'center'},showText:{color:tokens.color.accentSoft,fontWeight:'800'},check:{minHeight:48,flexDirection:'row',alignItems:'center',gap:10},box:{width:24,height:24,borderWidth:1,borderColor:'#8f8998',borderRadius:4,alignItems:'center',justifyContent:'center'},boxOn:{backgroundColor:tokens.color.accent},tick:{color:'#fff',fontWeight:'900'},checkText:{color:tokens.color.text,flex:1},error:{color:'#ffb8b8',minHeight:22},submit:{minHeight:50,backgroundColor:tokens.color.text,borderRadius:9,alignItems:'center',justifyContent:'center'},submitText:{color:tokens.color.background,fontWeight:'900'},disabled:{opacity:.6},link:{minHeight:44,justifyContent:'center',alignItems:'center'},linkText:{color:tokens.color.accentSoft,fontWeight:'800'}});
