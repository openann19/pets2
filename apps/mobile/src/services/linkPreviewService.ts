/**
 * Link Preview Service
 * Detects URLs in text and fetches rich preview data
 */

import { request } from './api';
import { logger } from '@pawfectmatch/core';

export interface LinkPreviewData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
}

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

/**
 * Extract URLs from a text string
 */
export function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Fetch link preview data from backend
 */
export async function fetchLinkPreview(url: string): Promise<LinkPreviewData | null> {
  try {
    const response = await request<LinkPreviewData>(
      `/api/chat/link-preview`,
      {
        method: 'POST',
        body: { url },
      }
    );

    return response || null;
  } catch (error) {
    logger.error('Failed to fetch link preview', {
      error: error instanceof Error ? error : new Error(String(error)),
      url,
    });
    return null;
  }
}

/**
 * Fetch link previews for multiple URLs
 */
export async function fetchLinkPreviews(urls: string[]): Promise<Map<string, LinkPreviewData | null>> {
  const previews = new Map<string, LinkPreviewData | null>();

  const promises = urls.map(async (url) => {
    const preview = await fetchLinkPreview(url);
    return { url, preview };
  });

  const results = await Promise.all(promises);

  results.forEach(({ url, preview }) => {
    previews.set(url, preview);
  });

  return previews;
}

/**
 * Check if text contains URLs
 */
export function containsUrls(text: string): boolean {
  return URL_REGEX.test(text);
}

/**
 * Get first URL from text
 */
export function getFirstUrl(text: string): string | null {
  const urls = extractUrls(text);
  return urls[0] || null;
}

export default {
  extractUrls,
  fetchLinkPreview,
  fetchLinkPreviews,
  containsUrls,
  getFirstUrl,
};

