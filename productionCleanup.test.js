const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=path=>fs.readFileSync(path,'utf8');

test('technical playback content is closed by default and requires an explicit build flag',()=>{
  assert.match(read('src/config/features.js'),/EXPO_PUBLIC_ENABLE_TECHNICAL_PLAYBACK_TESTS === 'true'/);
  assert.match(read('src/navigation/AppShell.js'),/technicalPlaybackTestsEnabled \? allContent\.filter\(isTechnicalTest\) : \[\]/);
  assert.match(read('src/screens/HomeScreen.js'),/showTechnicalTests && Array\.isArray/);
});

test('customer navigation reflects authentication state and selected profile',()=>{
  const header=read('src/components/Header.js'),mobile=read('src/components/MobileNavigation.js'),shell=read('src/navigation/AppShell.js');
  assert.match(header,/signedIn\?<Pressable[^>]+accessibilityLabel="Notifications"/);
  assert.match(header,/signedIn\?profileName:'Sign In'/);
  assert.match(mobile,/\['\/signin','profile','Sign In'\]/);
  assert.match(shell,/selectedProfileOf/);
  assert.match(shell,/needsOnboarding/);
  assert.match(shell,/await load\(\)/);
});

test('hero uses swipe and accessible dots on mobile while desktop arrows require hover',()=>{
  const hero=read('src/components/HeroBanner.js');
  assert.match(hero,/mobile\?swipe\.panHandlers/);
  assert.match(hero,/accessibilityRole="tablist"/);
  assert.match(hero,/accessibilityState=\{\{selected:i===index\}\}/);
  assert.match(hero,/arrowVisible:\{opacity:1\}/);
  assert.match(hero,/arrow:\{[^}]+opacity:0/);
});
