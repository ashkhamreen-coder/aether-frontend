const RIPPLE_BACKGROUND = '#05030d';

// Expo owns the generated web document, so install the root canvas rules before
// React mounts. This also replaces Expo's viewport value without dropping any
// additional directives a future Expo release may add.
if (typeof document !== 'undefined') {
  const viewport = document.querySelector('meta[name="viewport"]') || document.createElement('meta');
  const directives = new Map((viewport.getAttribute('content') || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean)
    .map(value => {
      const [key, ...rest] = value.split('=');
      return [key.trim(), rest.join('=').trim()];
    }));
  directives.set('width', 'device-width');
  directives.set('initial-scale', '1');
  directives.set('viewport-fit', 'cover');
  viewport.name = 'viewport';
  viewport.content = [...directives].map(([key, value]) => value ? `${key}=${value}` : key).join(', ');
  if (!viewport.parentNode) document.head.appendChild(viewport);

  const style = document.createElement('style');
  style.id = 'ripple-root-styles';
  style.textContent = `
    html,
    body,
    #root {
      margin: 0;
      padding: 0;
      width: 100%;
      min-height: 100%;
      background-color: ${RIPPLE_BACKGROUND};
    }

    html {
      min-height: 100%;
      overscroll-behavior-y: none;
    }

    body {
      min-height: 100vh;
      min-height: 100svh;
      min-height: 100dvh;
      overflow-x: hidden;
      overflow-y: auto;
      color: #ffffff;
    }

    #root {
      min-height: 100vh;
      min-height: 100svh;
      min-height: 100dvh;
      background-color: ${RIPPLE_BACKGROUND};
      isolation: isolate;
    }
  `;
  document.head.appendChild(style);
}

export { RIPPLE_BACKGROUND };
