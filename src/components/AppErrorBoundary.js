import React, { Component } from 'react';
import { SafeAreaView } from 'react-native';
import { StatePanel } from './StatePanel';

const SAFE_ERROR = /^(Error|TypeError|RangeError|ReferenceError|SyntaxError|Invariant Violation)$/;
export function sanitizeStartupError(error) {
  const name = SAFE_ERROR.test(error?.name || '') ? error.name : 'Error';
  const raw = typeof error?.message === 'string' ? error.message : 'Unexpected startup failure.';
  const message = raw.replace(/(token|authorization|cookie|email|password|secret)\s*[:=]\s*\S+/gi, '$1=[redacted]').slice(0, 240);
  let hash = 2166136261;
  for (const character of `${name}:${message}`) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return { name, message, reference: `RPL-${(hash >>> 0).toString(16).toUpperCase().padStart(8, '0')}` };
}

const diagnosticBuild = __DEV__ || process.env.EXPO_PUBLIC_BUILD_PROFILE === 'preview' || process.env.EXPO_PUBLIC_BUILD_PROFILE === 'development';
export class AppErrorBoundary extends Component {
  state={ error:null };
  static getDerivedStateFromError(error){ return { error }; }
  componentDidCatch(error, info) {
    const safe = sanitizeStartupError(error);
    const componentStack = String(info?.componentStack || '').replace(/\([^)]*\)|file:\/\/\S+/g, '').slice(0, 1200);
    console.error('Ripple render failure', { ...safe, componentStack });
  }
  render(){
    if (!this.state.error) return this.props.children;
    const safe = sanitizeStartupError(this.state.error);
    const message = diagnosticBuild ? `${safe.name}: ${safe.message}\nReference: ${safe.reference}` : 'Ripple could not display this screen.';
    return <SafeAreaView style={{flex:1,backgroundColor:'#05030d'}}><StatePanel title="Something went wrong" message={message} action="Try again" onAction={()=>this.setState({error:null})}/></SafeAreaView>;
  }
}
