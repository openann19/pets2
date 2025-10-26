/**
 * Hook for managing link previews in chat
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchLinkPreview, type LinkPreviewData } from '../services/linkPreviewService';

export interface UseLinkPreviewReturn {
  preview: LinkPreviewData | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

export function useLinkPreview(url: string | null, enabled = true): UseLinkPreviewReturn {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadPreview = useCallback(async () => {
    if (!url || !enabled) {
      setPreview(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchLinkPreview(url);
      
      if (isMountedRef.current) {
        setPreview(data);
        setIsLoading(false);
      }
    } catch (err) {
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load preview';
        setError(errorMessage);
        setIsLoading(false);
      }
    }
  }, [url, enabled]);

  const retry = useCallback(() => {
    retryCountRef.current += 1;
    if (retryCountRef.current < 3) {
      loadPreview();
    }
  }, [loadPreview]);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  return {
    preview,
    isLoading,
    error,
    retry,
  };
}

export default useLinkPreview;

