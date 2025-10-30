import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { api } from "../services/api";
import { FLAGS } from "../config/flags";
import { useTheme } from "@mobile/theme";
import { logger } from "@pawfectmatch/core";

interface GoLiveScreenProps {
  navigation: any;
}

export default function GoLiveScreen({ navigation }: GoLiveScreenProps) {
  const theme = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const [publishing, setPublishing] = useState(false);
  const [muted, setMuted] = useState({ audio: false, video: false });
  const [streamId, setStreamId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper function for rgba with opacity
  const alpha = (color: string, opacity: number) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Dynamic styles that depend on theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
      justifyContent: "space-between",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
    },
    closeButton: {
      width: 44,
      height: 44,
      justifyContent: "center",
      alignItems: "center",
      minWidth: 44,
      minHeight: 44,
    },
    headerTitle: {
      color: theme.colors.onSurface,
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
    },
    placeholder: {
      width: 44,
    },
    preview: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surface,
    },
    liveBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.danger,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.full,
      marginBottom: theme.spacing.lg,
    },
    liveIndicator: {
      width: 8,
      height: 8,
      borderRadius: theme.radii.xs,
      backgroundColor: theme.colors.onPrimary,
      marginEnd: theme.spacing.xs,
    },
    liveText: {
      color: theme.colors.onPrimary,
      fontWeight: theme.typography.h1.weight,
      fontSize: theme.typography.body.size * 0.75,
    },
    previewText: {
      color: theme.colors.onSurface,
      opacity: 0.7,
      fontSize: theme.typography.body.size,
    },
    controls: {
      padding: theme.spacing.lg,
      gap: theme.spacing.lg,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.md,
      borderRadius: theme.radii.lg,
      flexDirection: "row",
      gap: theme.spacing.sm,
      justifyContent: "center",
      alignItems: "center",
    },
    primaryText: {
      color: theme.colors.onPrimary,
      fontWeight: theme.typography.h1.weight,
      fontSize: theme.typography.body.size,
    },
    dangerButton: {
      backgroundColor: theme.colors.danger,
      padding: theme.spacing.md,
      borderRadius: theme.radii.lg,
      flexDirection: "row",
      gap: theme.spacing.sm,
      justifyContent: "center",
      alignItems: "center",
    },
    row: {
      flexDirection: "row",
      gap: theme.spacing.md,
      justifyContent: "center",
    },
    circle: {
      width: 56,
      height: 56,
      borderRadius: theme.radii.full,
      backgroundColor: alpha(theme.colors.surface, 0.15),
      alignItems: "center",
      justifyContent: "center",
    },
    errorContainer: {
      backgroundColor: alpha(theme.colors.danger, 0.2),
      padding: theme.spacing.md,
      borderRadius: theme.radii.md,
      borderWidth: 1,
      borderColor: theme.colors.danger,
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: theme.typography.body.size * 0.875,
      textAlign: "center",
    },
    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      justifyContent: "center",
      marginVertical: theme.spacing.md,
    },
    loadingText: {
      color: theme.colors.onSurface,
      fontSize: theme.typography.body.size * 0.875,
    },
  });

  const startMutation = useMutation({
    mutationFn: async (payload: { title?: string; tags?: string[] }) => {
      const data = await api.request("/live/start", {
        method: "POST",
        body: payload,
      });
      return data as { streamId: string; roomName: string; token: string; url: string };
    },
    onError: (e: any) => {
      logger.error("Failed to start live stream", { error: e });
      Alert.alert("Error", e?.response?.data?.error || "Failed to start live stream");
      setPublishing(false);
    },
  });

  const stopMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.request("/live/stop", {
        method: "POST",
        body: { streamId: id },
      });
    },
    onError: (e: any) => {
      logger.error("Failed to stop live stream", { error: e });
    },
  });

  const connectAndPublish = async () => {
    try {
      if (!FLAGS.GO_LIVE) {
        Alert.alert("Feature Unavailable", "Live streaming is not enabled yet.");
        return;
      }

      setPublishing(true);
      setError(null);
      
      const start = await startMutation.mutateAsync({ title: "Live from PawfectMatch" });
      setStreamId(start.streamId);

      // Note: In a real implementation, you would integrate LiveKit here
      // For now, we're just setting the publishing state
      logger.info("Live stream initiated", { streamId: start.streamId });

      // Example of what would happen with LiveKit:
      // const r = new Room({
      //   publishDefaults: {
      //     videoSimulcastLayers: [VideoPresets.h540, VideoPresets.h216],
      //   },
      // });
      // await r.connect(start.url, start.token);

    } catch (e: any) {
      logger.error("Live stream error", { error: e });
      Alert.alert("Live Error", e?.message || "Failed to start streaming");
      setPublishing(false);
      setError(e?.message || "Unknown error");
    }
  };

  const endLive = async () => {
    try {
      if (streamId) {
        await stopMutation.mutateAsync(streamId);
      }
      setPublishing(false);
      setStreamId(null);
      navigation.goBack();
    } catch (e) {
      logger.error("Failed to end live stream", { error: e });
      // Continue with navigation even if stop fails
      setPublishing(false);
      navigation.goBack();
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup if component unmounts
      if (streamId && publishing) {
        stopMutation.mutate(streamId);
      }
    };
  }, []);

  return (
    <View style={[styles.container, { paddingTop: top, paddingBottom: bottom }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          testID="GoLiveScreen-button-2"
          accessibilityLabel="Close live stream"
          accessibilityRole="button"
          accessibilityHint="Closes the live stream screen"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Go Live</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.preview}>
        {publishing ? (
          <>
            <View style={styles.liveBadge}>
              <View style={styles.liveIndicator} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <Text style={styles.previewText}>Streaming...</Text>
          </>
        ) : (
          <Text style={styles.previewText}>Preview</Text>
        )}
      </View>

      <View style={styles.controls}>
        {!publishing ? (
          <TouchableOpacity
            style={styles.primaryButton}
            testID="GoLiveScreen-button-2"
            accessibilityLabel="Go Live"
            accessibilityRole="button"
            onPress={connectAndPublish}
          >
            <Ionicons name="radio" size={20} color={theme.colors.onPrimary} />
            <Text style={styles.primaryText}>Go Live</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={styles.dangerButton}
              testID="GoLiveScreen-button-2"
              accessibilityLabel="End Stream"
              accessibilityRole="button"
              onPress={endLive}
            >
              <Ionicons name="stop" size={20} color={theme.colors.onPrimary} />
              <Text style={styles.primaryText}>End Stream</Text>
            </TouchableOpacity>

            <View style={styles.row}>
              <TouchableOpacity
                style={styles.circle}
                testID="GoLiveScreen-button-2"
                accessibilityLabel={muted.audio ? "Unmute audio" : "Mute audio"}
                accessibilityRole="button"
                accessibilityState={{ selected: muted.audio }}
                onPress={() => {
                  setMuted((m) => ({ ...m, audio: !m.audio }));
                }}
              >
                <Ionicons name={muted.audio ? "mic-off" : "mic"} size={20} color={theme.colors.onSurface} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.circle}
                testID="GoLiveScreen-button-2"
                accessibilityLabel={muted.video ? "Show video" : "Hide video"}
                accessibilityRole="button"
                accessibilityState={{ selected: muted.video }}
                onPress={() => {
                  setMuted((m) => ({ ...m, video: !m.video }));
                }}
              >
                <Ionicons
                  name={muted.video ? "eye-off" : "eye"}
                  size={20}
                  color={theme.colors.onSurface}
                />
              </TouchableOpacity>
            </View>
          </>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {startMutation.isPending && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.onSurface} />
            <Text style={styles.loadingText}>Connecting...</Text>
          </View>
        )}
      </View>
    </View>
  );
}
