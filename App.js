import React from 'react';
import './src/web/rootStyles';
import { AppErrorBoundary } from './src/components/AppErrorBoundary';
import { AppShell } from './src/navigation/AppShell';

export default function App() {
  return <AppErrorBoundary><AppShell /></AppErrorBoundary>;
}
