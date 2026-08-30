import React from 'react';
import { AppErrorBoundary } from './src/components/AppErrorBoundary';
import { AppShell } from './src/navigation/AppShell';

export default function App() {
  return <AppErrorBoundary><AppShell /></AppErrorBoundary>;
}
