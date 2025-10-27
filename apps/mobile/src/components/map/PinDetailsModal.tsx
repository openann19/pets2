import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { Theme } from "../../theme/unified-theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export interface MapPin {
  _id: string;
  petId: string;
  activity: string;
  message?: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export type PulsePin = MapPin & {
  pulseIntensity?: number;
  radius?: number;
};

interface Props {
  visible: boolean;
  pin: MapPin | null;
  activityTypes: string[];
  onClose: () => void;
  onLike?: () => void;
  onChat?: () => void;
  testID?: string;
}

export function PinDetailsModal({ visible, pin, activityTypes, onClose, onLike, onChat, testID }: Props) {
  const nav = useNavigation<any>();
  if (!visible || !pin) return null;

  const handleLike = async () => {
    if (onLike) {
      onLike();
    } else {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL || "";
      await fetch(`${API_URL}/api/matches/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petId: pin.petId }),
      }).catch(() => null);
      onClose();
      nav.navigate("Matches");
    }
  };

  const handleChat = () => {
    if (onChat) {
      onChat();
    } else {
      onClose();
      nav.navigate("Chat", { petId: pin.petId });
    }
  };

  const openMaps = () => {
    const url = `https://www.google.com/maps?q=${pin.latitude},${pin.longitude}`;
    Linking.openURL(url).catch(() => null);
  };

  return (
    <Modal transparent visible={visible} animationType="fade" testID={testID || "modal-pin-details"}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{pin.activity.toUpperCase()}</Text>
            <TouchableOpacity onPress={onClose} testID="btn-close-pin">
              <Ionicons name="close" size={24} color={Theme.colors.neutral[800]} />
            </TouchableOpacity>
          </View>

          {pin.message ? <Text style={styles.message}>{pin.message}</Text> : null}
          <Text style={styles.meta}>
            {new Date(pin.timestamp).toLocaleTimeString()} · {pin.latitude.toFixed(4)},{pin.longitude.toFixed(4)}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.like]} onPress={handleLike} testID="btn-like-pin">
              <Text style={styles.btnText}>❤️ Like</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.chat]} onPress={handleChat} testID="btn-chat-pin">
              <Text style={styles.btnText}>💬 Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.directions]} onPress={openMaps} testID="btn-directions-pin">
              <Text style={styles.btnText}>🧭 Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", padding: 16 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 18, fontWeight: "800", color: Theme.colors.neutral[800] },
  message: { marginTop: 8, color: Theme.colors.neutral[700] },
  meta: { marginTop: 6, fontSize: 12, color: Theme.colors.neutral[500] },
  actions: { flexDirection: "row", gap: 8, marginTop: 16, flexWrap: "wrap" },
  btn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  like: { backgroundColor: "#ffe4e6" },
  chat: { backgroundColor: "#e0f2fe" },
  directions: { backgroundColor: "#ecfccb" },
  btnText: { fontWeight: "700", color: Theme.colors.neutral[800] },
});
export default PinDetailsModal;
