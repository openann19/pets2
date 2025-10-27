import { useState, useEffect, useCallback } from "react";
import gdprService from "../../../services/gdprService";
import { logger } from "@pawfectmatch/core";

export interface GDPRStatus {
  isPending: boolean;
  daysRemaining: number | null;
  gracePeriodEndsAt: string | null;
  canCancel: boolean;
}

export interface UseGDPRStatusReturn {
  status: GDPRStatus;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook for checking GDPR deletion status
 */
export function useGDPRStatus(): UseGDPRStatusReturn {
  const [status, setStatus] = useState<GDPRStatus>({
    isPending: false,
    daysRemaining: null,
    gracePeriodEndsAt: null,
    canCancel: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await gdprService.getAccountStatus();
      
      if (result.success && result.status === 'pending') {
        setStatus({
          isPending: true,
          daysRemaining: result.daysRemaining ?? 30,
          gracePeriodEndsAt: result.scheduledDeletionDate ?? null,
          canCancel: result.canCancel ?? true,
        });
      } else {
        setStatus({
          isPending: false,
          daysRemaining: null,
          gracePeriodEndsAt: null,
          canCancel: false,
        });
      }
    } catch (error) {
      logger.error("Failed to check GDPR status:", { error });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    status,
    isLoading,
    refresh,
  };
}
