/**
 * Hook for Message Templates
 * Phase 2 Product Enhancement - Message Templates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageTemplateService } from '../services/messageTemplateService';
import type {
  MessageTemplate,
  CreateMessageTemplateRequest,
  RenderedTemplate,
} from '@pawfectmatch/core/types/phase2-contracts';
import { featureFlags } from '@pawfectmatch/core';

export function useMessageTemplates(category?: 'personal' | 'team' | 'ops') {
  const isEnabled = featureFlags.isEnabled('chatTemplates');

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<MessageTemplate[]>({
    queryKey: ['messageTemplates', category],
    queryFn: () => messageTemplateService.getTemplates(category),
    enabled: isEnabled,
    staleTime: 60_000, // 1 minute
    gcTime: 600_000, // 10 minutes
  });

  return {
    templates: data || [],
    isLoading,
    error,
    refetch,
    isEnabled,
  };
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  const isEnabled = featureFlags.isEnabled('chatTemplates');

  return useMutation({
    mutationFn: (request: CreateMessageTemplateRequest) =>
      messageTemplateService.createTemplate(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messageTemplates'] });
    },
    enabled: isEnabled,
  });
}

export function useRenderTemplate() {
  const isEnabled = featureFlags.isEnabled('chatTemplates');

  return useMutation({
    mutationFn: ({ templateId, variables }: { templateId: string; variables: Record<string, string> }) =>
      messageTemplateService.renderTemplate(templateId, variables),
    enabled: isEnabled,
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  const isEnabled = featureFlags.isEnabled('chatTemplates');

  return useMutation({
    mutationFn: ({ templateId, updates }: { templateId: string; updates: Partial<CreateMessageTemplateRequest> }) =>
      messageTemplateService.updateTemplate(templateId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messageTemplates'] });
    },
    enabled: isEnabled,
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  const isEnabled = featureFlags.isEnabled('chatTemplates');

  return useMutation({
    mutationFn: (templateId: string) =>
      messageTemplateService.deleteTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messageTemplates'] });
    },
    enabled: isEnabled,
  });
}

