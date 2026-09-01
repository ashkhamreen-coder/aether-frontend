import React, { Component } from 'react';
import { SafeAreaView, Text } from 'react-native';
import { StatePanel } from './StatePanel';
export class AppErrorBoundary extends Component {
  state={ error:null };
  static getDerivedStateFromError(error){ return { error }; }
  render(){ return this.state.error ? <SafeAreaView style={{flex:1,backgroundColor:'#05030d'}}><StatePanel title="Something went wrong" message="Ripple could not display this screen." action="Try again" onAction={()=>this.setState({error:null})}/></SafeAreaView> : this.props.children; }
}
