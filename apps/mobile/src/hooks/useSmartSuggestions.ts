/**
 * Hook for Smart Suggestions
 * Phase 2 Product Enhancement - AI-powered message suggestions
 */

import { useMutation } from '@tanstack/react-query';
import { smartSuggestionsService } from '../services/smartSuggestionsService';
import type { SmartSuggestionsRequest, SmartSuggestionsResponse } from '@pawfectmatch/core/types/phase2-contracts';
import { featureFlags } from '@pawfectmatch/core';

export function useSmartSuggestions() {
  const isEnabled = featureFlags.isEnabled('chatSmartSuggestions');

  return useMutation({
    mutationFn: (request: SmartSuggestionsRequest) =>
      smartSuggestionsService.getSuggestions(request),
    enabled: isEnabled,
  });
}

