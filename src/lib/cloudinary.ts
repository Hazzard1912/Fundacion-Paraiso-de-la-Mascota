/**
 * Optimizes Cloudinary URLs by adding f_auto,q_auto and optional resizing
 * @param url - The original image URL
 * @param width - Optional width to resize the image
 * @returns Optimized URL or original if not a Cloudinary URL
 */
export const optimizeCloudinaryImage = (url: string | undefined | null, width?: number): string => {
  if (!url) return '';
  if (!url.includes('cloudinary.com')) return url;

  // Split the URL at /upload/
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  // Build transformation string
  const transformations = ['f_auto', 'q_auto'];
  if (width) {
    transformations.push(`w_${width}`);
    transformations.push('c_limit'); // Ensures image doesn't scale up if original is smaller
  }

  // Inject transformations
  return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
};
