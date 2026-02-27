// Helper functions for frontend
export function isImage(item) {
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'];
  return imageExts.includes(item.extension);
}
