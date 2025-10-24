import { getPlaiceholder } from '@plaiceholder/next'
import { logger } from '@pawfectmatch/core';
;
// Generate blur data URL for progressive image loading
export async function getBlurData(url) {
    try {
        const { base64 } = await getPlaiceholder(url, {
            size: 10, // Small size for faster generation
        });
        return base64;
    }
    catch (error) {
        logger.warn('Failed to generate blur placeholder:', { error });
        // Return a simple SVG placeholder as fallback
        return generateSVGPlaceholder();
    }
}
// Generate multiple blur data URLs for an array of images
export async function getBlurDataBatch(urls) {
    const results = {};
    // Process in batches to avoid overwhelming the server
    const batchSize = 5;
    for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        const promises = batch.map(async (url) => {
            try {
                const blurData = await getBlurData(url);
                return { url, blurData };
            }
            catch (error) {
                logger.warn(`Failed to generate blur for ${url}:`, { error });
                return { url, blurData: generateSVGPlaceholder() };
            }
        });
        const batchResults = await Promise.all(promises);
        batchResults.forEach(({ url, blurData }) => {
            results[url] = blurData;
        });
    }
    return results;
}
// Generate a simple SVG placeholder as fallback
function generateSVGPlaceholder() {
    const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <circle cx="200" cy="150" r="30" fill="#d1d5db" opacity="0.5"/>
    </svg>
  `;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
// Generate blur data for pet photos with specific dimensions
export async function getPetPhotoBlur(url, width = 400, height = 300) {
    try {
        const { base64 } = await getPlaiceholder(url, {
            size: 10,
            format: 'webp', // Use WebP for better compression
        });
        return base64;
    }
    catch (error) {
        logger.warn('Failed to generate pet photo blur:', { error });
        return generatePetPhotoPlaceholder(width, height);
    }
}
// Generate a pet-specific SVG placeholder
function generatePetPhotoPlaceholder(width, height) {
    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="petGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#fdf2f8;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#fce7f3;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#fbcfe8;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#petGrad)"/>
      <circle cx="${width * 0.3}" cy="${height * 0.4}" r="${Math.min(width, height) * 0.08}" fill="#ec4899" opacity="0.3"/>
      <circle cx="${width * 0.7}" cy="${height * 0.6}" r="${Math.min(width, height) * 0.06}" fill="#a855f7" opacity="0.3"/>
      <path d="M${width * 0.2} ${height * 0.7} Q${width * 0.5} ${height * 0.5} ${width * 0.8} ${height * 0.7}" 
            stroke="#ec4899" stroke-width="2" fill="none" opacity="0.2"/>
    </svg>
  `;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
// Utility to check if an image URL is valid
export async function validateImageUrl(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok && response.headers.get('content-type')?.startsWith('image/');
    }
    catch {
        return false;
    }
}
// Generate blur data with validation
export async function getValidatedBlurData(url) {
    const isValid = await validateImageUrl(url);
    if (!isValid) {
        logger.warn(`Invalid image URL: ${url}`);
        return null;
    }
    return getBlurData(url);
}
// Cache for blur data to avoid regenerating
const blurCache = new Map();
export async function getCachedBlurData(url) {
    if (blurCache.has(url)) {
        return blurCache.get(url);
    }
    const blurData = await getBlurData(url);
    blurCache.set(url, blurData);
    return blurData;
}
// Clear blur cache (useful for memory management)
export function clearBlurCache() {
    blurCache.clear();
}
// Get cache size for monitoring
export function getBlurCacheSize() {
    return blurCache.size;
}
//# sourceMappingURL=getBlur.js.map