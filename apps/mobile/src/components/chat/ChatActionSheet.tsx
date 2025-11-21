import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

import {
  Heading3,
  Body,
  BodySmall,
} from "../Text";

interface ChatAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  destructive?: boolean;
  premium?: boolean;
}

interface ChatActionSheetProps {
  visible: boolean;
  onClose: () => void;
  petName: string;
  matchId: string;
  isPremium: boolean;
  onExport: () => void | Promise<void>;
  onClear: () => void | Promise<void>;
  onUnmatch: () => void | Promise<void>;
  onBlock: () => void | Promise<void>;
  onReport: () => void | Promise<void>;
}

export function ChatActionSheet({
  visible,
  onClose,
  petName,
  isPremium,
  onExport,
  onClear,
  onUnmatch,
  onBlock,
  onReport,
}: ChatActionSheetProps) {
  const actions: ChatAction[] = [
    {
      id: "export",
      label: "Export Chat",
      icon: "download-outline",
      color: "#8b5cf6",
    },
    {
      id: "clear",
      label: "Clear History",
      icon: "trash-outline",
      color: "#f59e0b",
      destructive: true,
    },
    {
      id: "block",
      label: "Block User",
      icon: "ban-outline",
      color: "#ef4444",
      destructive: true,
    },
    {
      id: "report",
      label: "Report User",
      icon: "flag-outline",
      color: "#ef4444",
      destructive: true,
    },
    {
      id: "unmatch",
      label: "Unmatch",
      icon: "close-circle-outline",
      color: "#ef4444",
      destructive: true,
    },
  ];

  const handleAction = async (actionId: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    switch (actionId) {
      case "export":
        onClose();
        if (onExport) {
          await Promise.resolve(onExport());
        }
        break;

      case "clear":
        onClose();
        Alert.alert(
          "Clear Chat History",
          `Are you sure you want to clear all messages with ${petName}? This action cannot be undone.`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Clear",
              style: "destructive",
              onPress: async () => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                if (onClear) {
                  await Promise.resolve(onClear());
                }
              },
            },
          ],
        );
        break;

      case "block":
        onClose();
        Alert.alert(
          "Block User",
          `Block ${petName}? They won't be able to message you or see your profile.`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Block",
              style: "destructive",
              onPress: async () => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                if (onBlock) {
                  await Promise.resolve(onBlock());
                }
              },
            },
          ],
        );
        break;

      case "report":
        onClose();
        if (onReport) {
          await Promise.resolve(onReport());
        }
        break;

      case "unmatch":
        onClose();
        Alert.alert(
          "Unmatch",
          `Unmatch with ${petName}? You will no longer be able to message each other and the conversation will be permanently deleted.`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Unmatch",
              style: "destructive",
              onPress: async () => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                if (onUnmatch) {
                  await Promise.resolve(onUnmatch());
                }
              },
            },
          ],
        );
        break;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <BlurView intensity={80} style={styles.blurContainer}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.sheetContainer}
            onPress={(e) => {
              e.stopPropagation();
            }}
          >
            <View style={styles.sheet}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.handle} />
                <Heading3 style={styles.title}>Chat Actions</Heading3>
                <BodySmall style={styles.subtitle}>
                  Manage your conversation with {petName}
                </BodySmall>
              </View>

              {/* Actions */}
              <ScrollView
                style={styles.actionsContainer}
                showsVerticalScrollIndicator={false}
              >
                {actions.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={[
                      styles.actionItem,
                      action.destructive && styles.destructiveAction,
                    ]}
                    onPress={() => {
                      void handleAction(action.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={
                        action.destructive
                          ? ["#fef2f2", "#fee2e2"]
                          : ["#f9fafb", "#f3f4f6"]
                      }
                      style={styles.actionGradient}
                    >
                      <View
                        style={[
                          styles.iconContainer,
                          { backgroundColor: `${action.color}20` },
                        ]}
                      >
                        <Ionicons
                          name={action.icon as "download-outline"}
                          size={24}
                          color={action.color}
                        />
                      </View>
                      <View style={styles.actionContent}>
                        <Body
                          style={[
                            styles.actionLabel,
                            action.destructive && styles.destructiveLabel,
                          ]}
                        >
                          {action.label}
                        </Body>
                        {action.premium && !isPremium && (
                          <View style={styles.premiumBadge}>
                            <Ionicons name="star" size={12} color="#f59e0b" />
                            <BodySmall style={styles.premiumText}>
                              Premium
                            </BodySmall>
                          </View>
                        )}
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#9ca3af"
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["#f3f4f6", "#e5e7eb"]}
                  style={styles.closeGradient}
                >
                  <Body style={styles.closeText}>Cancel</Body>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </BlurView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  blurContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetContainer: {
    maxHeight: "80%",
  },
  sheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: "#d1d5db",
    borderRadius: 2,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  actionsContainer: {
    maxHeight: 400,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  actionItem: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  destructiveAction: {
    shadowColor: "#ef4444",
    shadowOpacity: 0.1,
  },
  actionGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  actionContent: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  destructiveLabel: {
    color: "#ef4444",
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  premiumText: {
    fontSize: 12,
    color: "#f59e0b",
    fontWeight: "500",
  },
  closeButton: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  closeGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  closeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
});
