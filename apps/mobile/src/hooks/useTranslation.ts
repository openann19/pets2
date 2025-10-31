/**
 * Hook for Chat Translation
 * Phase 2 Product Enhancement - Chat Translation
 */

import { useMutation } from '@tanstack/react-query';
import { translationService } from '../services/translationService';
import type { TranslationRequest, Translation } from '@pawfectmatch/core/types/phase2-contracts';
import { featureFlags } from '@pawfectmatch/core';

export function useTranslation() {
  const isEnabled = featureFlags.isEnabled('chatTranslation');

  return useMutation({
    mutationFn: (request: TranslationRequest) =>
      translationService.translateMessage(request),
    enabled: isEnabled,
  });
}

