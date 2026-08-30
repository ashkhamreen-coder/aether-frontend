const test = require('node:test');
const assert = require('node:assert/strict');
const { isValidHttpsVideoUrl, resolveContent, resolveWebPoster } = require('./playerReliability');

test('accepts only non-empty HTTPS video URLs', () => {
  assert.equal(isValidHttpsVideoUrl('https://cdn.example.com/movie.mp4'), true);
  assert.equal(isValidHttpsVideoUrl('  https://cdn.example.com/movie.mp4  '), true);
  assert.equal(isValidHttpsVideoUrl('http://cdn.example.com/movie.mp4'), false);
  assert.equal(isValidHttpsVideoUrl(''), false);
  assert.equal(isValidHttpsVideoUrl('not a url'), false);
});

test('keeps the local URL when the backend URL is unusable', () => {
  const local = { title: 'Film', videoUrl: 'https://local.example.com/film.mp4' };
  for (const videoUrl of ['', null, 'http://unsafe.example.com/film.mp4', 'invalid']) {
    assert.equal(resolveContent(local, [{ title: 'Film', videoUrl }]).videoUrl, local.videoUrl);
  }
});

test('uses a valid backend HTTPS URL', () => {
  const resolved = resolveContent(
    { title: 'Film', videoUrl: 'https://local.example.com/film.mp4' },
    [{ title: 'Film', videoUrl: ' https://api.example.com/film.mp4 ' }],
  );
  assert.equal(resolved.videoUrl, 'https://api.example.com/film.mp4');
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
