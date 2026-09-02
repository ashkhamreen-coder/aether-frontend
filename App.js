import React from 'react';
import { Platform } from 'react-native';
import { AppErrorBoundary } from './src/components/AppErrorBoundary';
import { AppShell } from './src/navigation/AppShell';

// Do not evaluate the DOM bootstrap in a native JavaScript runtime.
if (Platform.OS === 'web') require('./src/web/rootStyles');

export default function App() {
  return <AppErrorBoundary><AppShell /></AppErrorBoundary>;
}
