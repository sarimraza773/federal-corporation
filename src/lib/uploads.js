export const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024;

export const THUMBNAIL_TYPES = Object.freeze({
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
});

export function thumbnailExtension(mimeType) {
  return THUMBNAIL_TYPES[mimeType] || null;
}
