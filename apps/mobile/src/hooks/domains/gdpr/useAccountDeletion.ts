import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { gdprService } from "../../services/gdprService";
import { logger } from "../../services/logger";

export interface UseAccountDeletionReturn {
  isDeleting: boolean;
  requestDeletion: (
    password: string,
    reason?: string,
    feedback?: string,
  ) => Promise<boolean>;
  cancelDeletion: () => Promise<boolean>;
  error: string | null;
}

/**
 * Hook for requesting account deletion (GDPR)
 */
export function useAccountDeletion(): UseAccountDeletionReturn {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestDeletion = useCallback(
    async (
      password: string,
      reason?: string,
      feedback?: string,
    ): Promise<boolean> => {
      setIsDeleting(true);
      setError(null);

      try {
        const result = await gdprService.requestAccountDeletion(
          password,
          reason,
          feedback,
        );

        if (result.success) {
          Alert.alert(
            "Account Deletion Requested",
            `Your account will be permanently deleted in 30 days. We'll send you reminders before the deletion occurs.`,
            [{ text: "OK" }],
          );
          logger.info("Account deletion requested", {
            deletionId: result.deletionId,
          });
          return true;
        }

        return false;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to request account deletion";
        setError(errorMessage);
        logger.error("Account deletion request failed:", {
          error: errorMessage,
        });
        Alert.alert("Error", errorMessage);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [],
  );

  const cancelDeletion = useCallback(async (): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);

    try {
      const cancelled = await gdprService.cancelAccountDeletion();

      if (cancelled) {
        Alert.alert(
          "Deletion Cancelled",
          "Your account deletion has been cancelled.",
        );
        logger.info("Account deletion cancelled");
        return true;
      }

      return false;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to cancel deletion";
      setError(errorMessage);
      logger.error("Failed to cancel account deletion:", {
        error: errorMessage,
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    isDeleting,
    requestDeletion,
    cancelDeletion,
    error,
  };
}
