const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const read = path => fs.readFileSync(path, 'utf8');

const shell = () => read('src/navigation/AppShell.js');
const welcome = () => read('src/screens/WelcomeScreen.js');

test('signed-out root waits for session resolution and renders the public welcome screen', () => {
  assert.match(shell(), /path === '\/' && !authResolved/);
  assert.match(shell(), /path === '\/'\) screen = <WelcomeScreen/);
  assert.doesNotMatch(shell(), /path === '\/'\) screen = <HomeScreen/);
});

test('signed-in root is replaced with browse after authentication resolves', () => {
  assert.match(shell(), /path === '\/' && authResolved && user\) replace\('\/browse'\)/);
  assert.match(read('src/navigation/router.js'), /history\.replaceState/);
});

test('browse retains the existing OTT HomeScreen and is a known direct route', () => {
  assert.match(shell(), /path === '\/browse'\) screen = <HomeScreen/);
  assert.match(read('src/navigation/router.js'), /'\/browse'/);
  assert.match(read('app.json'), /"output": "single"/);
});

test('logout clears stored and in-memory session then returns to root', () => {
  assert.match(read('src/screens/ProfileScreen.js'), /setAccessToken\(null\).*navigate\('\/'\)/);
  assert.match(shell(), /onLogout=\{\(\) => \{ setUser\(null\); setSubscription\(null\); setAuthResolved\(true\); \}\}/);
});

test('welcome Sign In and Explore Ripple open their real routes', () => {
  assert.match(welcome(), /Sign In<\/Text>/);
  assert.match(welcome(), /navigate\('\/signin'\)/);
  assert.match(welcome(), /Explore Ripple<\/Text>/);
  assert.match(welcome(), /navigate\('\/browse'\)/);
});

test('Get Started validates email and prefills sign-up', () => {
  assert.match(welcome(), /validEmail\(email\)/);
  assert.match(welcome(), /navigate\(`\/signup\?email=\$\{encodeURIComponent\(email\.trim\(\)\)\}`\)/);
  assert.match(shell(), /new URLSearchParams\(window\.location\.search\)\.get\('email'\)/);
  assert.match(read('src/screens/AuthScreen.js'), /useState\(initialEmail\)/);
});

test('welcome headline uses responsive pixel line heights and is never artificially clipped', () => {
  const source = welcome();
  assert.match(source, /fontSize:36,lineHeight:40/);
  assert.match(source, /fontSize:44,lineHeight:48/);
  assert.match(source, /fontSize:68,lineHeight:72/);
  assert.match(source, /fontSize:88,lineHeight:92/);
  assert.doesNotMatch(source, /lineHeight:\s*1(?:\.0?2|\.1)?[,}]/);
  for (const [, fontSize, lineHeight] of source.matchAll(/fontSize:(36|44|68|88),lineHeight:(40|48|72|92)/g)) {
    assert.ok(Number(lineHeight) > Number(fontSize) * .9, `rendered line box ${lineHeight}px must exceed 90% of ${fontSize}px font size`);
  }
  assert.match(source, /testID="welcome-headline"/);
  assert.doesNotMatch(source, /title:\{[^}]*height:/);
});

test('welcome includes the complete public-page sections and live plan preview', () => {
  const source = welcome();
  for (const label of ['Why watch on Ripple', 'Explore the catalogue', 'Frequently Asked Questions', 'Start exploring Ripple']) assert.match(source, new RegExp(label));
  assert.match(source, /api\('\/api\/subscriptions\/plans'\)/);
  assert.match(source, /editorialTitles\.slice/);
});
