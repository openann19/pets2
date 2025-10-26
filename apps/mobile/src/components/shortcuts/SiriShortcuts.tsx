import { Ionicons } from "@expo/vector-icons";
import { logger } from "@pawfectmatch/core";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Mock Siri Shortcuts API for non-iOS platforms
let ExpoSiriShortcuts: any = null;
if (Platform.OS === "ios") {
  try {
    ExpoSiriShortcuts = require("expo-siri-shortcuts");
  } catch {
    ExpoSiriShortcuts = null;
  }
}

interface SiriShortcut {
  id: string;
  title: string;
  description: string;
  phrase: string;
  icon: string;
  isActive: boolean;
}

export function SiriShortcuts(): React.JSX.Element {
  const [shortcuts, setShortcuts] = useState<SiriShortcut[]>([
    {
      id: "find-pets",
      title: "Find Pets",
      description: "Open PawfectMatch to find nearby pets",
      phrase: "Find pets",
      icon: "paw-outline",
      isActive: false,
    },
    {
      id: "check-matches",
      title: "Check Matches",
      description: "View your latest matches",
      phrase: "Check my matches",
      icon: "heart-outline",
      isActive: false,
    },
    {
      id: "start-swiping",
      title: "Start Swiping",
      description: "Begin swiping on pet profiles",
      phrase: "Start swiping",
      icon: "swap-horizontal-outline",
      isActive: false,
    },
    {
      id: "view-events",
      title: "View Events",
      description: "See upcoming pet events nearby",
      phrase: "Show pet events",
      icon: "calendar-outline",
      isActive: false,
    },
  ]);

  useEffect(() => {
    checkShortcutStatus();
  }, []);

  const checkShortcutStatus = async () => {
    if (!ExpoSiriShortcuts || Platform.OS !== "ios") {
      setShortcuts((prev) =>
        prev.map((shortcut) => ({
          ...shortcut,
          isActive: false,
        })),
      );
      return;
    }

    try {
      const activeShortcuts = await ExpoSiriShortcuts.getShortcuts();
      const activeIds = activeShortcuts.map(
        (shortcut: any) => shortcut.identifier,
      );

      setShortcuts((prev) =>
        prev.map((shortcut) => ({
          ...shortcut,
          isActive: activeIds.includes(shortcut.id),
        })),
      );
    } catch (error) {
      logger.error("Error checking shortcut status:", { error });
    }
  };

  const createShortcut = async (shortcut: SiriShortcut) => {
    if (!ExpoSiriShortcuts || Platform.OS !== "ios") {
      Alert.alert(
        "Unsupported",
        "Siri Shortcuts are only available on iOS devices.",
      );
      return;
    }

    try {
      await ExpoSiriShortcuts.addShortcut({
        identifier: shortcut.id,
        title: shortcut.title,
        subtitle: shortcut.description,
        phrase: shortcut.phrase,
        icon: {
          name: shortcut.icon,
          color: "#8B5CF6",
        },
      });

      Alert.alert(
        "Shortcut Created",
        `You can now say "${shortcut.phrase}" to activate this shortcut.`,
        [{ text: "OK" }],
      );

      checkShortcutStatus();
    } catch (error) {
      logger.error("Error creating shortcut:", { error });
      Alert.alert("Error", "Failed to create shortcut. Please try again.");
    }
  };

  const deleteShortcut = async (shortcut: SiriShortcut) => {
    if (!ExpoSiriShortcuts || Platform.OS !== "ios") {
      Alert.alert(
        "Unsupported",
        "Siri Shortcuts are only available on iOS devices.",
      );
      return;
    }

    try {
      await ExpoSiriShortcuts.removeShortcut(shortcut.id);
      checkShortcutStatus();
    } catch (error) {
      logger.error("Error deleting shortcut:", { error });
      Alert.alert("Error", "Failed to delete shortcut. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Siri Shortcuts</Text>
      <Text style={styles.subtitle}>
        Use voice commands to quickly access PawfectMatch features
      </Text>

      <View style={styles.shortcutsList}>
        {shortcuts.map((shortcut) => (
          <View key={shortcut.id} style={styles.shortcutItem}>
            <View style={styles.shortcutInfo}>
              <View style={styles.shortcutHeader}>
                <Ionicons
                  name={shortcut.icon as any}
                  size={20}
                  color="#8B5CF6"
                />
                <Text style={styles.shortcutTitle}>{shortcut.title}</Text>
                {shortcut.isActive ? (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeText}>Active</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.shortcutDescription}>
                {shortcut.description}
              </Text>
              <Text style={styles.shortcutPhrase}>
                Say: "{shortcut.phrase}"
              </Text>
            </View>

            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.actionButton,
                shortcut.isActive ? styles.deleteButton : styles.createButton,
              ])}
              onPress={() =>
                shortcut.isActive
                  ? deleteShortcut(shortcut)
                  : createShortcut(shortcut)
              }
            >
              <Text style={styles.actionButtonText}>
                {shortcut.isActive ? "Remove" : "Add"}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>How to Use:</Text>
        <Text style={styles.instructionsText}>
          1. Tap "Add" to create a shortcut{"\n"}
          2. Say "Hey Siri" followed by the phrase{"\n"}
          3. Siri will open PawfectMatch and perform the action
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    margin: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  shortcutsList: {
    marginBottom: 16,
  },
  shortcutItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  shortcutInfo: {
    flex: 1,
  },
  shortcutHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  shortcutTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
    flex: 1,
  },
  activeBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  shortcutDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  shortcutPhrase: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  createButton: {
    backgroundColor: "#8B5CF6",
  },
  deleteButton: {
    backgroundColor: "#EF4444",
  },
  actionButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  instructions: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
  },
});

export default SiriShortcuts;
