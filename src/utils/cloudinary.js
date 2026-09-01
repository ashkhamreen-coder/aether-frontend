const DEFAULT_TRANSFORMS = Object.freeze({ hero:'f_auto,q_auto,dpr_auto,c_fill,w_1920,h_1080', landscape:'f_auto,q_auto,dpr_auto,c_fill,w_640,h_360', portrait:'f_auto,q_auto,dpr_auto,c_fill,w_480,h_720' });

/** Adds delivery transformations without changing the Cloudinary public ID. */
export function cloudinaryImageUrl(url, variant = 'landscape') {
  if (!url || typeof url !== 'string' || !url.includes('/image/upload/')) return url;
  return url.replace('/image/upload/', `/image/upload/${DEFAULT_TRANSFORMS[variant] || DEFAULT_TRANSFORMS.landscape}/`);
}
