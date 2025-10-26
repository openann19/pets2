import { useCallback } from "react";
import { Alert } from "react-native";
import { logger } from "../services/logger";
import type { Match } from "../types/api";
import { matchesAPI } from "../services/api";

export interface UseMatchesActionsOptions {
  onMatchRemoved?: (matchId: string) => void;
  onMatchBlocked?: (matchId: string) => void;
  onMatchReported?: (matchId: string) => void;
}

export interface UseMatchesActionsReturn {
  handleUnmatch: (matchId: string, petName: string) => Promise<void>;
  handleBlock: (matchId: string, petName: string) => Promise<void>;
  handleReport: (matchId: string, petName: string) => Promise<void>;
}

/**
 * Hook for managing match actions (unmatch, block, report)
 */
export function useMatchesActions({
  onMatchRemoved,
  onMatchBlocked,
  onMatchReported,
}: UseMatchesActionsOptions = {}): UseMatchesActionsReturn {
  const handleUnmatch = useCallback(
    async (matchId: string, petName: string) => {
      Alert.alert(
        "Unmatch",
        `Are you sure you want to unmatch with ${petName}?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Unmatch",
            style: "destructive",
            onPress: async () => {
              try {
                await matchesAPI.unmatch(matchId);
                logger.info("Match removed", { matchId, petName });
                onMatchRemoved?.(matchId);
              } catch (error) {
                logger.error("Failed to unmatch", { error, matchId });
                Alert.alert("Error", "Failed to unmatch. Please try again.");
              }
            },
          },
        ],
      );
    },
    [onMatchRemoved],
  );

  const handleBlock = useCallback(
    async (matchId: string, petName: string) => {
      Alert.alert(
        "Block",
        `Are you sure you want to block ${petName}? This action cannot be undone.`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Block",
            style: "destructive",
            onPress: async () => {
              try {
                await matchesAPI.block(matchId);
                logger.info("User blocked", { matchId, petName });
                onMatchBlocked?.(matchId);
              } catch (error) {
                logger.error("Failed to block user", { error, matchId });
                Alert.alert("Error", "Failed to block user. Please try again.");
              }
            },
          },
        ],
      );
    },
    [onMatchBlocked],
  );

  const handleReport = useCallback(
    async (matchId: string, petName: string) => {
      Alert.alert("Report", `Why are you reporting ${petName}?`, [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Spam",
          onPress: async () => {
            try {
              await matchesAPI.report(matchId, "spam");
              logger.info("User reported", {
                matchId,
                petName,
                reason: "spam",
              });
              onMatchReported?.(matchId);
              Alert.alert(
                "Reported",
                "Thank you for reporting. We'll review this.",
              );
            } catch (error) {
              logger.error("Failed to report", { error, matchId });
              Alert.alert("Error", "Failed to report. Please try again.");
            }
          },
        },
        {
          text: "Inappropriate Content",
          onPress: async () => {
            try {
              await matchesAPI.report(matchId, "inappropriate");
              logger.info("User reported", {
                matchId,
                petName,
                reason: "inappropriate",
              });
              onMatchReported?.(matchId);
              Alert.alert(
                "Reported",
                "Thank you for reporting. We'll review this.",
              );
            } catch (error) {
              logger.error("Failed to report", { error, matchId });
              Alert.alert("Error", "Failed to report. Please try again.");
            }
          },
        },
        {
          text: "Other",
          onPress: async () => {
            try {
              await matchesAPI.report(matchId, "other");
              logger.info("User reported", {
                matchId,
                petName,
                reason: "other",
              });
              onMatchReported?.(matchId);
              Alert.alert(
                "Reported",
                "Thank you for reporting. We'll review this.",
              );
            } catch (error) {
              logger.error("Failed to report", { error, matchId });
              Alert.alert("Error", "Failed to report. Please try again.");
            }
          },
        },
      ]);
    },
    [onMatchReported],
  );

  return {
    handleUnmatch,
    handleBlock,
    handleReport,
  };
}
