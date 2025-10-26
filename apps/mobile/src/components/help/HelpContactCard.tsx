import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { EliteButton } from "../EliteComponents";

interface HelpContactCardProps {
  onPress: () => void;
}

export const HelpContactCard: React.FC<HelpContactCardProps> = ({
  onPress,
}) => {
  return (
    <EliteButton
      style={styles.contactCard}
      onPress={onPress}
      variant="primary"
      size="lg"
    >
      <BlurView intensity={20} style={styles.contactBlur}>
        <View style={styles.contactContent}>
          <Ionicons name="mail-outline" size={24} color="#3B82F6" />
          <View style={styles.contactText}>
            <Text style={styles.contactTitle}>Email Support</Text>
            <Text style={styles.contactDescription}>
              support@pawfectmatch.com
            </Text>
          </View>
          <Ionicons
            name="open-outline"
            size={20}
            color="rgba(255,255,255,0.6)"
          />
        </View>
      </BlurView>
    </EliteButton>
  );
};

const styles = StyleSheet.create({
  contactCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  contactBlur: {
    padding: 16,
  },
  contactContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactText: {
    flex: 1,
    marginLeft: 16,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
});
