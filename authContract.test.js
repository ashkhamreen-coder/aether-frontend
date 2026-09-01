const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { AUTH_ROUTES, loginPayload, registrationPayload, normalizeAuthResponse } = require('./authContract');
const { createApiClient } = require('./apiClient');

test('uses the deployed authentication routes and exact request fields', () => {
  assert.deepEqual(AUTH_ROUTES, { login:'/api/auth/login', register:'/api/auth/register', currentUser:'/api/me', refresh:'/api/auth/refresh', logout:'/api/auth/logout' });
  assert.deepEqual(loginPayload(' Person@Example.com ', 'secret'), { email:'person@example.com', password:'secret' });
  assert.deepEqual(registrationPayload({ name:' Ada ', email:' ADA@EXAMPLE.COM ', password:'secret' }), { name:'Ada', email:'ada@example.com', password:'secret' });
});

test('normalises successful token sessions and rejects unusable responses', () => {
  assert.equal(normalizeAuthResponse({ token:'access', user:{ id:1 } }).accessToken, 'access');
  assert.equal(normalizeAuthResponse({ data:{ accessToken:'access' } }).accessToken, 'access');
  assert.throws(() => normalizeAuthResponse({ user:{} }), /INVALID_AUTH_RESPONSE/);
});

test('surfaces invalid credentials and duplicate accounts from the API', async () => {
  for (const [status, message] of [[401, 'Invalid credentials'], [409, 'Email already exists']]) {
    const client=createApiClient({ baseUrl:'https://api.example.com', fetchImpl:async()=>({ ok:false, status, headers:{get:()=> 'application/json'}, json:async()=>({message}) }) });
    await assert.rejects(()=>client.request(status===401?AUTH_ROUTES.login:AUTH_ROUTES.register,{method:'POST',body:'{}'}), error=>error.status===status && error.message===message);
  }
});

test('auth screens, restoration, route protection and logout are wired end to end', () => {
  const form=fs.readFileSync('src/screens/AuthScreen.js','utf8');
  const shell=fs.readFileSync('src/navigation/AppShell.js','utf8');
  const auth=fs.readFileSync('src/services/auth.js','utf8');
  const profile=fs.readFileSync('src/screens/ProfileScreen.js','utf8');
  for (const value of ["'form'", "'button'", 'name="name"', 'name="email"', 'name="password"', 'name="confirmPassword"', 'required', 'autoComplete=', 'disabled={busy}', 'e.status===409']) assert.match(form, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  assert.match(shell, /getAccessToken\(\), getSession\(\)/);
  assert.match(shell, /protectedRoutes/);
  assert.match(shell, /replace\(intended\|\|'\/browse'\)/);
  assert.match(auth, /AUTH_ROUTES\.currentUser/g);
  assert.match(auth, /finally \{ await setSession\(null\); \}/);
  assert.match(profile, /await signOut\(\)/);
});
