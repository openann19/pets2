import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BlurView } from "expo-blur";
import { Theme } from '../theme/unified-theme';

export interface PulsePin {
  _id: string;
  latitude: number;
  longitude: number;
  coordinates?: [number, number];
  activity: string;
  petId: string;
  userId: string;
  timestamp: string;
  message?: string;
  createdAt: string;
}

export interface ActivityType {
  id: string;
  name: string;
  label: string;
  emoji: string;
  color: string;
}

interface PinDetailsModalProps {
  visible: boolean;
  pin: PulsePin | null;
  activityTypes: ActivityType[];
  onClose: () => void;
}

export function PinDetailsModal({
  visible,
  pin,
  activityTypes,
  onClose,
}: PinDetailsModalProps): React.JSX.Element {
  if (!visible || !pin) return <></>;

  const activity = activityTypes.find((a) => a.id === pin.activity);

  return (
    <View style={styles.modalOverlay}>
      <BlurView style={styles.modalBlur} intensity={80} tint="dark">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {activity?.emoji} {activity?.label || pin.activity.charAt(0).toUpperCase() + pin.activity.slice(1)}
          </Text>

          {pin.message && <Text style={styles.modalMessage}>{pin.message}</Text>}

          <Text style={styles.modalTime}>
            {new Date(pin.createdAt).toLocaleTimeString()}
          </Text>

          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalButton, styles.likeButton]}>
              <Text style={styles.modalButtonText}>❤️ Like</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.modalButton, styles.chatButton]}>
              <Text style={styles.modalButtonText}>💬 Chat</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBlur: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 200,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "Theme.colors.neutral[800]",
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: "Theme.colors.neutral[500]",
    marginBottom: 12,
  },
  modalTime: {
    fontSize: 14,
    color: "Theme.colors.neutral[400]",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  likeButton: {
    backgroundColor: "#FEE2E2",
  },
  chatButton: {
    backgroundColor: "#DBEAFE",
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  closeButton: {
    padding: 12,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "Theme.colors.neutral[500]",
  },
});
