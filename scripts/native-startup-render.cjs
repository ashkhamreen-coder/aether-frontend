const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const React = require('react');

global.__DEV__ = true;
process.env.EXPO_PUBLIC_API_URL = 'https://ripple-api-p67c.onrender.com';
const root = path.resolve(__dirname, '..');
const originalLoader = Module._extensions['.js'];
Module._extensions['.js'] = (module, filename) => {
  if (!filename.startsWith(root + path.sep) || filename.includes(`${path.sep}node_modules${path.sep}`)) return originalLoader(module, filename);
  const { code } = require('@babel/core').transformSync(fs.readFileSync(filename, 'utf8'), {
    filename, presets: [require.resolve('@babel/preset-react')], plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')], babelrc: false, configFile: false,
  });
  module._compile(code, filename);
};

const host = name => React.forwardRef((props, ref) => React.createElement(name, { ...props, ref, style: undefined }, props.children));
const native = {
  Platform: { OS: 'android', select: values => values.android ?? values.native ?? values.default },
  StyleSheet: { create: value => value, flatten: value => Array.isArray(value) ? Object.assign({}, ...value.filter(Boolean)) : value, absoluteFillObject: {} },
  useWindowDimensions: () => ({ width: 412, height: 915, scale: 1, fontScale: 1 }),
  View: host('div'), Text: host('span'), SafeAreaView: host('main'), Pressable: host('button'),
  ScrollView: host('section'), TextInput: host('input'), Image: Object.assign(host('img'), { prefetch: () => Promise.resolve(true) }),
  ActivityIndicator: host('i'), Modal: host('aside'), BackHandler: { addEventListener: () => ({ remove() {} }) },
  useTVEventHandler: () => {},
};
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === 'react-native') return native;
  if (request === 'expo-linear-gradient') return { LinearGradient: host('div') };
  if (request === 'expo-secure-store') return { getItemAsync: async () => null, setItemAsync: async () => {}, deleteItemAsync: async () => {} };
  return originalLoad.call(this, request, parent, isMain);
};

const { renderToString } = require('react-dom/server');
const App = require('../App').default;
const rendered = renderToString(React.createElement(App));
if (rendered.includes('Something went wrong')) throw new Error('The startup error boundary was triggered.');
if (!rendered.includes('Loading Ripple')) throw new Error('The native startup route did not render.');
process.stdout.write(JSON.stringify({ platform: native.Platform.OS, boundaryTriggered: false, startupRendered: true }));
