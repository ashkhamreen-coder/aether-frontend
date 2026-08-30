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
  resolved.videoUrl = isValidHttpsVideoUrl(backendItem.videoUrl)
    ? backendItem.videoUrl.trim()
    : localItem.videoUrl;
  return resolved;
}

function isPlayableMediaType(value) {
  const type = String(value || '').toLowerCase().split(';')[0].trim();
  return type.startsWith('video/') || ['application/vnd.apple.mpegurl', 'application/x-mpegurl'].includes(type);
}

async function inspectVideoUrl(url, fetchImpl = globalThis.fetch, signal) {
  if (!isValidHttpsVideoUrl(url)) return { playable: false, reason: 'A secure media URL was not provided.' };
  try {
    const response = await fetchImpl(url.trim(), { method: 'GET', headers: { Range: 'bytes=0-1' }, signal });
    const contentType = response.headers?.get?.('content-type') || '';
    if (!response.ok || !isPlayableMediaType(contentType)) {
      return { playable: false, status: response.status, contentType, reason: `The media host returned ${response.status || 'an invalid response'}${contentType ? ` (${contentType})` : ''}.` };
    }
    response.body?.cancel?.();
    return { playable: true, contentType };
  } catch (error) {
    return { playable: false, reason: error.name === 'AbortError' ? 'Media validation was cancelled.' : 'The media host could not be reached.' };
  }
}

module.exports = { inspectVideoUrl, isPlayableMediaType, isValidHttpsVideoUrl, resolveContent, resolveWebPoster };
