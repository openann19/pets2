import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { api } from "../services/api";
import { FLAGS } from "../config/flags";
import { useTheme } from "@mobile/src/theme";
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

  // Dynamic styles that depend on theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#000",
      justifyContent: "space-between",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    closeButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "700",
    },
    placeholder: {
      width: 40,
    },
    preview: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#1a1a1a",
    },
    liveBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#ef4444",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginBottom: 16,
    },
    liveIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#fff",
      marginRight: 6,
    },
    liveText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 12,
    },
    previewText: {
      color: "#fff",
      opacity: 0.7,
      fontSize: 16,
    },
    controls: {
      padding: 20,
      gap: 16,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      padding: 14,
      borderRadius: 12,
      flexDirection: "row",
      gap: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    primaryText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 16,
    },
    dangerButton: {
      backgroundColor: "#ef4444",
      padding: 14,
      borderRadius: 12,
      flexDirection: "row",
      gap: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    row: {
      flexDirection: "row",
      gap: 12,
      justifyContent: "center",
    },
    circle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: "rgba(255,255,255,0.15)",
      alignItems: "center",
      justifyContent: "center",
    },
    errorContainer: {
      backgroundColor: "rgba(239, 68, 68, 0.2)",
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#ef4444",
    },
    errorText: {
      color: "#ff6b6b",
      fontSize: 14,
      textAlign: "center",
    },
    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      justifyContent: "center",
      marginVertical: 12,
    },
    loadingText: {
      color: "#fff",
      fontSize: 14,
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
      setRoom(null);
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

  const [room, setRoom] = useState(null);

  return (
    <View style={[styles.container, { paddingTop: top, paddingBottom: bottom }]>
      <View style={styles.header}>
        <TouchableOpacity  testID="GoLiveScreen-button-2" accessibilityLabel="navigation.goBack() style=styles.closeButton" accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#fff" />
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
          <TouchableOpacity style={styles.primaryButton}  testID="GoLiveScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={connectAndPublish}>
            <Ionicons name="radio" size={20} color="#fff" />
            <Text style={styles.primaryText}>Go Live</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.dangerButton}  testID="GoLiveScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={endLive}>
              <Ionicons name="stop" size={20} color="#fff" />
              <Text style={styles.primaryText}>End Stream</Text>
            </TouchableOpacity>

            <View style={styles.row}>
              <TouchableOpacity
                style={styles.circle}
                 testID="GoLiveScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => { setMuted((m) => ({ ...m, audio: !m.audio })); }}
              >
                <Ionicons name={muted.audio ? "mic-off" : "mic"} size={20} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.circle}
                 testID="GoLiveScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => { setMuted((m) => ({ ...m, video: !m.video })); }}
              >
                <Ionicons
                  name={muted.video ? "eye-off" : "eye"}
                  size={20}
                  color="#fff"
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
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.loadingText}>Connecting...</Text>
          </View>
        )}
      </View>
    </View>
  );
}
