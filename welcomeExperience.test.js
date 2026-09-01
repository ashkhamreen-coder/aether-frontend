const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { listPlans, normalizeWelcomePlan } = require('./welcomePlans.cjs');

const welcome = fs.readFileSync('src/screens/WelcomeScreen.js', 'utf8');
const shell = fs.readFileSync('src/navigation/AppShell.js', 'utf8');
const root = fs.readFileSync('src/web/rootStyles.js', 'utf8');

test('real plan response shapes map all production subscription fields without invented prices', () => {
  const response = { data:{ plans:[
    { id:'free', name:'Free', price:0, currency:'INR', billing_interval:'month', features:{ video_quality:'720p', simultaneous_streams:1, advertisements:true, downloads:false }, active:true },
    { slug:'premium', title:'Premium', formattedPrice:'₹499', interval:'month', videoQuality:'4K', simultaneousStreams:4, advertisements:false, downloads:true, isAvailable:false },
  ] } };
  const plans = listPlans(response).map(normalizeWelcomePlan);
  assert.deepEqual(plans[0], { id:'free', name:'Free', price:'INR 0', currency:'INR', interval:'month', quality:'720p', streams:'1', ads:'Included', downloads:'Not included', available:true });
  assert.equal(plans[1].name, 'Premium');
  assert.equal(plans[1].price, '₹499');
  assert.equal(plans[1].available, false);
  assert.equal(normalizeWelcomePlan({name:'Standard'}).price, 'Price unavailable');
});

test('plan API failure and empty data render one honest fallback rather than duplicate placeholders', () => {
  assert.match(welcome, /PLAN_FALLBACK_TITLE = 'Free access available'/);
  assert.match(welcome, /Premium plans are temporarily unavailable\. You can continue exploring Ripple\./);
  assert.match(welcome, /catch\(\(\)=>\{if\(live\)setPlanStatus\('unavailable'\)\}\)/);
  assert.doesNotMatch(welcome, /Ripple plan|View plan|plans\.slice\(0,3\)/);
});

test('welcome uses exact semantic heading order, landmarks, labelled forms, and accessible FAQ controls', () => {
  assert.match(welcome, /React\.createElement\(`h\$\{level\}`/);
  const headings = [...welcome.matchAll(/<Heading level=\{?(\d)\}?[^>]*>([^<{]+)/g)].map(([,level,text]) => [Number(level), text.trim()]);
  assert.deepEqual(headings.filter(([,text]) => ['Entertainment, reimagined.','Why watch on Ripple','Explore the catalogue','Choose how you watch','Frequently Asked Questions','Start exploring Ripple'].includes(text)), [
    [1,'Entertainment, reimagined.'], [2,'Why watch on Ripple'], [2,'Explore the catalogue'], [2,'Choose how you watch'], [2,'Frequently Asked Questions'], [2,'Start exploring Ripple'],
  ]);
  for (const role of ['main','banner','region','contentinfo','form']) assert.match(welcome, new RegExp(`accessibilityRole="${role}"`));
  assert.match(welcome, /accessibilityState=\{\{expanded\}\}/);
  assert.match(welcome, /accessibilityControls=\{`faq-answer-\$\{index\}`\}/);
  assert.match(welcome, /accessibilityLabel="Email address"/);
});

test('welcome uses document scrolling, contains horizontal overflow, and keeps the root safe area dark', () => {
  assert.match(welcome, /return <View accessibilityRole="main"/);
  assert.doesNotMatch(welcome, /return <ScrollView style=\{s\.scroll\}/);
  assert.match(welcome, /page:\{[^}]*overflowX:'hidden'/);
  assert.match(root, /body \{[\s\S]*overflow-y: auto/);
  assert.match(root, /background-color: \$\{RIPPLE_BACKGROUND\}/);
  assert.match(shell, /safe: \{[^}]*backgroundColor:'#05030d'/);
});

test('cinematic hero uses a restrained mixed montage, optimized Cloudinary delivery, and data conservation', () => {
  assert.equal((welcome.match(/kind:'landscape'/g) || []).length, 4);
  assert.equal((welcome.match(/kind:'portrait'/g) || []).length, 4);
  assert.match(welcome, /cloudinaryImageUrl/);
  assert.equal((welcome.match(/critical:true/g) || []).length, 2);
  assert.match(welcome, /loading=\{critical\?'eager':'lazy'\}/);
  assert.match(welcome, /prefers-reduced-motion: reduce/);
  assert.match(welcome, /navigator\.connection\?\.saveData/);
  assert.match(welcome, /conserveData \? montage\.slice\(0,3\) : montage/);
});

test('authentication and browse navigation remain real and URL-safe', () => {
  assert.match(welcome, /navigate\('\/signin'\)/);
  assert.match(welcome, /navigate\('\/browse'\)/);
  assert.match(welcome, /if \(!validEmail\(email\)\)/);
  assert.match(welcome, /encodeURIComponent\(email\.trim\(\)\)/);
  assert.match(shell, /path === '\/' && authResolved && user\) replace\('\/browse'\)/);
  assert.doesNotMatch(welcome, /password|accessToken|fakeAuth/i);
});
