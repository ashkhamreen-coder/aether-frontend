function isValidHttpsVideoUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function resolveWebPoster(image) {
  if (typeof image === 'string' && image.trim()) return image.trim();
  if (image && typeof image === 'object' && typeof image.uri === 'string' && image.uri.trim()) {
    return image.uri.trim();
  }
  return null;
}

function resolveContent(localItem, backendItems) {
  const backendItem = backendItems.find(
    item => String(item.title).toLowerCase() === localItem.title.toLowerCase(),
  );
  if (!backendItem) return localItem;

  const resolved = {
    ...localItem,
    ...backendItem,
    image: localItem.image,
    creator: backendItem.creator || localItem.creator,
  };
  resolved.videoUrl = isValidHttpsVideoUrl(backendItem.videoUrl) ? backendItem.videoUrl.trim() : undefined;
  resolved.isPlayable = backendItem.isPlayable === true;
  return resolved;
}

function isPlayableMediaType(value) {
  const type = String(value || '').toLowerCase().split(';')[0].trim();
  return type.startsWith('video/') || ['application/vnd.apple.mpegurl', 'application/x-mpegurl'].includes(type);
}

function isHlsUrl(value, mimeType = '') {
  return /\.m3u8(?:$|[?#])/i.test(String(value || '')) || /(?:mpegurl|x-mpegurl)/i.test(String(mimeType || ''));
}

function resolvePlayback(payload) {
  const data = payload?.playback || payload?.data || payload || {};
  const mediaStatus = String(data.mediaStatus || data.status || '').toLowerCase();
  const videoUrl = data.videoUrl || data.playbackUrl || data.url;
  return { ...data, mediaStatus, videoUrl: isValidHttpsVideoUrl(videoUrl) ? videoUrl.trim() : null };
}

function playbackDecision(payload) {
  const playback = resolvePlayback(payload);
  if (playback.mediaStatus === 'pending' || playback.mediaStatus === 'processing') return { kind: 'pending', playback };
  if (playback.mediaStatus !== 'ready' || !playback.videoUrl) return { kind: 'unavailable', playback };
  return { kind: 'ready', playback };
}

async function inspectVideoUrl(url, fetchImpl = globalThis.fetch, signal) {
  if (!isValidHttpsVideoUrl(url)) return { playable: false, reason: 'A secure media URL was not provided.' };
  try {
    const response = await fetchImpl(url.trim(), { method: 'GET', headers: { Range: 'bytes=0-1' }, signal });
    const contentType = response.headers?.get?.('content-type') || '';
    if (!response.ok || !isPlayableMediaType(contentType)) {
      return { playable: false, status: response.status, contentType, retryable: response.status !== 403 && response.status !== 404 };
    }
    response.body?.cancel?.();
    return { playable: true, contentType };
  } catch (error) {
    return { playable: false, retryable: error.name !== 'AbortError' };
  }
}

module.exports = { inspectVideoUrl, isHlsUrl, isPlayableMediaType, isValidHttpsVideoUrl, playbackDecision, resolveContent, resolvePlayback, resolveWebPoster };
