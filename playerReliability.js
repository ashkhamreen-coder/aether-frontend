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

module.exports = { isValidHttpsVideoUrl, resolveContent, resolveWebPoster };
