import { Platform } from 'react-native';

export const isTVDevice = Platform.isTV === true;
export const TV_SAFE_AREA = Object.freeze({ horizontal: 48, vertical: 32 });

export function remoteAction(event) {
  const type = event?.eventType;
  if (type === 'up' || type === 'down' || type === 'left' || type === 'right') return type;
  if (type === 'select' || type === 'longSelect') return 'select';
  if (type === 'playPause' || type === 'play' || type === 'pause') return 'playPause';
  if (type === 'menu' || type === 'back') return 'back';
  return null;
}

// Prevent key-repeat/select bounce from launching a route or playback twice.
export function createRemoteGate(windowMs = 280) {
  let lastAction = '';
  let lastAt = 0;
  return (action, now = Date.now()) => {
    if (!action) return false;
    if (action === lastAction && now - lastAt < windowMs) return false;
    lastAction = action;
    lastAt = now;
    return true;
  };
}

export function playerBackAction(controlsVisible) {
  return controlsVisible ? 'hide-controls' : 'close-player';
}
