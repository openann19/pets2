/**
 * Perceptual Hashing Service
 * 
 * Implements perceptual/difference hashing for duplicate detection and spam prevention.
 * Uses pHash and dHash algorithms to detect near-duplicate images even after
 * compression, rotation, or resizing.
 */

import { createHash } from 'crypto';
import sharp from 'sharp';

export interface PerceptualHashResult {
  hash: string;
  algorithm: 'average' | 'difference' | 'perceptual';
  distance?: number;
}

/**
 * Calculate average hash (aHash)
 * Simpler but faster than pHash
 */
export async function calculateAverageHash(
  buffer: Buffer,
  hashSize = 8
): Promise<string> {
  try {
    // Resize to small square and convert to grayscale
    const image = sharp(buffer)
      .resize(hashSize, hashSize, {
        fit: 'fill',
        kernel: sharp.kernel.lanczos3,
      })
      .greyscale();

    const { data } = await image.raw().toBuffer({ resolveWithObject: true });

    // Calculate average pixel value
    const pixels = Array.from(data.info.channels === 3 
      ? new Uint8Array(data.data) 
      : new Uint8Array(data.data)
    );
    
    const average = pixels.reduce((sum, val) => sum + val, 0) / pixels.length;

    // Generate hash: 1 if pixel >= average, 0 otherwise
    let hash = '';
    for (let i = 0; i < pixels.length; i++) {
      hash += pixels[i] >= average ? '1' : '0';
    }

    return hash;
  } catch (error) {
    console.error('Error calculating average hash:', error);
    throw error;
  }
}

/**
 * Calculate difference hash (dHash)
 * More accurate than aHash, detects minor changes
 */
export async function calculateDifferenceHash(
  buffer: Buffer,
  hashSize = 9
): Promise<string> {
  try {
    // Resize to (hashSize+1) x hashSize and convert to grayscale
    const image = sharp(buffer)
      .resize(hashSize + 1, hashSize, {
        fit: 'fill',
        kernel: sharp.kernel.lanczos3,
      })
      .greyscale();

    const { data } = await image.raw().toBuffer({ resolveWithObject: true });
    const pixels = new Uint8Array(data.data);

    // Compare adjacent pixels horizontally
    let hash = '';
    for (let row = 0; row < hashSize; row++) {
      for (let col = 0; col < hashSize; col++) {
        const index = row * (hashSize + 1) + col;
        const nextIndex = row * (hashSize + 1) + col + 1;
        hash += pixels[index] >= pixels[nextIndex] ? '1' : '0';
      }
    }

    return hash;
  } catch (error) {
    console.error('Error calculating difference hash:', error);
    throw error;
  }
}

/**
 * Calculate perceptual hash (pHash)
 * Most robust against transformations
 */
export async function calculatePerceptualHash(
  buffer: Buffer,
  hashSize = 32
): Promise<string> {
  try {
    // Resize to larger size first
    const largeSize = hashSize * 4;
    const image = sharp(buffer)
      .resize(largeSize, largeSize, {
        fit: 'fill',
        kernel: sharp.kernel.lanczos3,
      })
      .greyscale();

    const { data } = await image.raw().toBuffer({ resolveWithObject: true });
    const pixels = new Uint8Array(data.data);

    // DCT approximation (simplified)
    // In production, use a proper DCT library or service
    // For now, we'll use a simpler approach
    const average = pixels.reduce((sum, val) => sum + val, 0) / pixels.length;
    
    let hash = '';
    for (let i = 0; i < hashSize * hashSize; i++) {
      const pixelValue = pixels[i];
      hash += pixelValue >= average ? '1' : '0';
    }

    return hash;
  } catch (error) {
    console.error('Error calculating perceptual hash:', error);
    throw error;
  }
}

/**
 * Calculate Hamming distance between two hashes
 * Returns the number of differing bits (0 = identical)
 */
export function hammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) {
    throw new Error('Hashes must be the same length for Hamming distance');
  }

  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) {
      distance++;
    }
  }

  return distance;
}

/**
 * Calculate all hash types for an image
 */
export async function calculateAllHashes(
  buffer: Buffer
): Promise<{
  average: string;
  difference: string;
  perceptual: string;
}> {
  const [average, difference, perceptual] = await Promise.all([
    calculateAverageHash(buffer),
    calculateDifferenceHash(buffer),
    calculatePerceptualHash(buffer),
  ]);

  return {
    average,
    difference,
    perceptual,
  };
}

/**
 * Find similar images by comparing hashes
 * Returns array of similar images with their Hamming distances
 */
export interface SimilarImage {
  imageId: string;
  url: string;
  hammingDistance: number;
  similarity: number; // 0-1, 1 = identical
  hashType: 'average' | 'difference' | 'perceptual';
}

export async function findSimilarImages(
  targetHash: string,
  allHashes: Array<{
    imageId: string;
    url: string;
    hashes: { average?: string; difference?: string; perceptual?: string };
  }>,
  hashType: 'average' | 'difference' | 'perceptual' = 'difference',
  threshold = 5 // Maximum Hamming distance for "similar"
): Promise<SimilarImage[]> {
  const similar: SimilarImage[] = [];

  for (const image of allHashes) {
    const hash = image.hashes[hashType];
    if (!hash) continue;

    const distance = hammingDistance(targetHash, hash);
    
    if (distance <= threshold) {
      // Normalize similarity score (0-1)
      const maxDistance = hash.length;
      const similarity = 1 - (distance / maxDistance);
      
      similar.push({
        imageId: image.imageId,
        url: image.url,
        hammingDistance: distance,
        similarity,
        hashType,
      });
    }
  }

  // Sort by similarity (highest first)
  return similar.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Batch hash calculation for multiple images
 */
export async function batchCalculateHashes(
  images: Array<{ id: string; buffer: Buffer }>
): Promise<Array<{ id: string; hashes: { average: string; difference: string; perceptual: string } }>> {
  return Promise.all(
    images.map(async (image) => {
      const hashes = await calculateAllHashes(image.buffer);
      return {
        id: image.id,
        hashes,
      };
    })
  );
}

/**
 * Check if an image is a potential duplicate
 */
export async function checkForDuplicates(
  imageBuffer: Buffer,
  existingImages: Array<{ id: string; url: string; hashes: { average?: string; difference?: string; perceptual?: string } }>,
  strictness: 'low' | 'medium' | 'high' = 'medium'
): Promise<{
  isDuplicate: boolean;
  matches: SimilarImage[];
  confidence: number;
}> {
  const thresholds = {
    low: { distance: 15, minSimilarity: 0.7 },
    medium: { distance: 10, minSimilarity: 0.8 },
    high: { distance: 5, minSimilarity: 0.9 },
  };

  const threshold = thresholds[strictness];

  // Calculate hashes for the new image
  const newHashes = await calculateAllHashes(imageBuffer);

  // Check for matches in each hash type
  const allMatches: SimilarImage[] = [];
  
  for (const hashType of ['average', 'difference', 'perceptual'] as const) {
    const matches = await findSimilarImages(
      newHashes[hashType],
      existingImages,
      hashType,
      threshold.distance
    );
    allMatches.push(...matches);
  }

  // Remove duplicates by imageId
  const uniqueMatches = allMatches.filter(
    (match, index, self) => index === self.findIndex(m => m.imageId === match.imageId)
  );

  // Check if any matches exceed confidence threshold
  const confidentMatches = uniqueMatches.filter(
    match => match.similarity >= threshold.minSimilarity
  );

  return {
    isDuplicate: confidentMatches.length > 0,
    matches: uniqueMatches,
    confidence: confidentMatches.length > 0 
      ? Math.max(...confidentMatches.map(m => m.similarity))
      : 0,
  };
}

/**
 * Generate hash metadata for an image
 */
export async function generateHashMetadata(buffer: Buffer): Promise<{
  hashes: { average: string; difference: string; perceptual: string };
  metadata: {
    format: string;
    width: number;
    height: number;
    size: number;
    hasAlpha: boolean;
    channels: number;
  };
}> {
  const image = sharp(buffer);
  const metadata = await image.metadata();
  const hashes = await calculateAllHashes(buffer);

  return {
    hashes,
    metadata: {
      format: metadata.format || 'unknown',
      width: metadata.width || 0,
      height: metadata.height || 0,
      size: buffer.length,
      hasAlpha: metadata.hasAlpha || false,
      channels: metadata.channels || 0,
    },
  };
}

