/**
 * Hook for Message Scheduling
 * Phase 2 Product Enhancement - Message Scheduling
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageSchedulingService } from '../services/messageSchedulingService';
import type { ScheduledMessage, CreateScheduledMessageRequest } from '@pawfectmatch/core/types/phase2-contracts';
import { featureFlags } from '@pawfectmatch/core';

export function useScheduledMessages(
  convoId?: string,
  status?: 'scheduled' | 'sent' | 'canceled' | 'failed'
) {
  const isEnabled = featureFlags.isEnabled('chatSchedule');

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<ScheduledMessage[]>({
    queryKey: ['scheduledMessages', convoId, status],
    queryFn: () => messageSchedulingService.getScheduledMessages(convoId, status),
    enabled: isEnabled,
    staleTime: 30_000, // 30 seconds
    gcTime: 300_000, // 5 minutes
  });

  return {
    scheduledMessages: data || [],
    isLoading,
    error,
    refetch,
    isEnabled,
  };
}

export function useCreateScheduledMessage() {
  const queryClient = useQueryClient();
  const isEnabled = featureFlags.isEnabled('chatSchedule');

  return useMutation({
    mutationFn: (request: CreateScheduledMessageRequest) =>
      messageSchedulingService.createScheduledMessage(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledMessages'] });
    },
    enabled: isEnabled,
  });
}

export function useCancelScheduledMessage() {
  const queryClient = useQueryClient();
  const isEnabled = featureFlags.isEnabled('chatSchedule');

  return useMutation({
    mutationFn: (messageId: string) =>
      messageSchedulingService.cancelScheduledMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledMessages'] });
    },
    enabled: isEnabled,
  });
}

