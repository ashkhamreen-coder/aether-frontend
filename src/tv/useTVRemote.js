import { useEffect } from 'react';
import { BackHandler, Platform, TVEventHandler } from 'react-native';
import { isTVDevice } from './runtime';

export const isTV = isTVDevice;

export function useTVRemote(onEvent, onBack) {
  useEffect(() => {
    if (!isTV) return undefined;
    const subscription = TVEventHandler?.addListener?.(event => onEvent?.(event));
    return () => subscription?.remove?.();
  }, [onEvent]);
  useEffect(() => {
    if (!isTV || !onBack) return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => { onBack(); return true; });
    return () => subscription.remove();
  }, [onBack]);
}
