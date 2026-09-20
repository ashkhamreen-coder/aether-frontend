const test = require('node:test');
const assert = require('node:assert/strict');
const { isHlsUrl, isValidHttpsVideoUrl, playbackDecision, resolveContent, resolveWebPoster } = require('./playerReliability');

test('opens successful HTTPS MP4 playback only when ready', () => {
  assert.equal(playbackDecision({ mediaStatus: 'ready', videoUrl: 'https://cdn.example.com/movie.mp4' }).kind, 'ready');
});

test('recognises HLS URLs for native or hls.js fallback', () => {
  assert.equal(isHlsUrl('https://cdn.example.com/master.m3u8'), true);
  assert.equal(isHlsUrl('https://cdn.example.com/stream', 'application/vnd.apple.mpegurl'), true);
});

test('keeps pending and missing video out of the player', () => {
  assert.equal(playbackDecision({ mediaStatus: 'pending' }).kind, 'pending');
  assert.equal(playbackDecision({ mediaStatus: 'ready', videoUrl: null }).kind, 'unavailable');
  assert.equal(playbackDecision({ mediaStatus: 'failed', videoUrl: 'https://cdn.example.com/movie.mp4' }).kind, 'unavailable');
});

test('player close and reopen decisions do not retain prior media', () => {
  const first = playbackDecision({ mediaStatus:'ready', videoUrl:'https://cdn.example.com/first.mp4' });
  const reopened = playbackDecision({ mediaStatus:'ready', videoUrl:'https://cdn.example.com/second.mp4' });
  assert.equal(first.playback.videoUrl.endsWith('first.mp4'), true);
  assert.equal(reopened.playback.videoUrl.endsWith('second.mp4'), true);
});

test('no blank-screen regression: every non-ready payload has a visible state', () => {
  for (const payload of [{}, { mediaStatus:'failed' }, { mediaStatus:'ready', videoUrl:'javascript:void(0)' }]) {
    assert.notEqual(playbackDecision(payload).kind, 'ready');
  }
});

test('accepts only non-empty HTTPS video URLs', () => {
  assert.equal(isValidHttpsVideoUrl('https://cdn.example.com/movie.mp4'), true);
  assert.equal(isValidHttpsVideoUrl('  https://cdn.example.com/movie.mp4  '), true);
  assert.equal(isValidHttpsVideoUrl('http://cdn.example.com/movie.mp4'), false);
  assert.equal(isValidHttpsVideoUrl(''), false);
  assert.equal(isValidHttpsVideoUrl('not a url'), false);
});

test('does not fall back to an inferred local URL when backend media is unusable', () => {
  const local = { title: 'Film', videoUrl: 'https://local.example.com/film.mp4' };
  for (const videoUrl of ['', null, 'http://unsafe.example.com/film.mp4', 'invalid']) {
    assert.equal(resolveContent(local, [{ title: 'Film', videoUrl }]).videoUrl, undefined);
  }
});

test('uses a valid backend HTTPS URL', () => {
  const resolved = resolveContent(
    { title: 'Film', videoUrl: 'https://local.example.com/film.mp4' },
    [{ title: 'Film', videoUrl: ' https://api.example.com/film.mp4 ', isPlayable: true }],
  );
  assert.equal(resolved.videoUrl, 'https://api.example.com/film.mp4');
  assert.equal(resolved.isPlayable, true);
});

test('resolves only web-safe poster sources', () => {
  assert.equal(resolveWebPoster(' /poster.png '), '/poster.png');
  assert.equal(resolveWebPoster({ uri: 'https://cdn.example.com/poster.png' }), 'https://cdn.example.com/poster.png');
  assert.equal(resolveWebPoster(42), null);
  assert.equal(resolveWebPoster(null), null);
});

test('recognises browser media MIME types', () => {
  const { isPlayableMediaType } = require('./playerReliability');
  assert.equal(isPlayableMediaType('video/mp4; charset=binary'), true);
  assert.equal(isPlayableMediaType('application/vnd.apple.mpegurl'), true);
  assert.equal(isPlayableMediaType('text/html'), false);
});

test('rejects an HTML response before playback', async () => {
  const { inspectVideoUrl } = require('./playerReliability');
  const result = await inspectVideoUrl('https://cdn.example.com/video.mp4', async () => ({ ok: true, status: 200, headers: { get: () => 'text/html' } }));
  assert.equal(result.playable, false);
  assert.equal(result.contentType, 'text/html');
});

test('marks a known forbidden response as non-retryable', async () => {
  const { inspectVideoUrl } = require('./playerReliability');
  const result = await inspectVideoUrl('https://cdn.example.com/video.mp4', async () => ({
    ok: false, status: 403, headers: { get: () => 'application/xml' },
  }));
  assert.equal(result.playable, false);
  assert.equal(result.retryable, false);
});

test('native player is selected by Metro and uses the SDK-compatible Expo video module', () => {
  const fs = require('node:fs');
  const native = fs.readFileSync('src/components/VideoPlayer/index.native.js', 'utf8');
  const web = fs.readFileSync('src/components/VideoPlayer/index.web.js', 'utf8');
  assert.match(native, /from 'expo-video'/);
  assert.match(native, /player\.replace\(null\)/);
  assert.match(native, /AppState\.addEventListener/);
  assert.doesNotMatch(web, /from 'expo-video'/);
});

test('native playback handles invalid URLs, retries, TV seeking, and lifecycle persistence', () => {
  const fs = require('node:fs');
  const native = fs.readFileSync('src/components/VideoPlayer/index.native.js', 'utf8');
  assert.match(native, /A secure playback stream is not available/);
  assert.match(native, /Retry/);
  assert.match(native, /seek\(-10\)/);
  assert.match(native, /seek\(10\)/);
  for (const reason of ['playing', 'paused', 'background', 'closed', 'completed', 'unmounted']) assert.match(native, new RegExp(`['\"]${reason}['\"]`));
});

test('My List is optimistic, duplicate-safe, and rolls back a failed mutation', () => {
  const fs = require('node:fs');
  const shell = fs.readFileSync('src/navigation/AppShell.js', 'utf8');
  assert.match(shell, /listPending\.current\.has\(id\)/);
  assert.match(shell, /listPending\.current\.add\(id\)/);
  assert.match(shell, /catch \(error\)[\s\S]*removing \? next\.add\(id\) : next\.delete\(id\)/);
  assert.match(shell, /setListError\(error\.message/);
});
