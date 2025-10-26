import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

export interface ActivityType {
  id: string;
  name: string;
  label: string;
  emoji: string;
  color: string;
}

interface ActivityTypeSelectorProps {
  activityTypes: ActivityType[];
  selectedActivities: string[];
  onToggleActivity: (activityId: string) => void;
}

export function ActivityTypeSelector({
  activityTypes,
  selectedActivities,
  onToggleActivity,
}: ActivityTypeSelectorProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Activity Types</Text>
      <View style={styles.grid}>
        {activityTypes.map((activity) => (
          <TouchableOpacity
            key={activity.id}
            style={[
              styles.button,
              {
                backgroundColor: selectedActivities.includes(activity.id)
                  ? activity.color
                  : "#F3F4F6",
              },
            ]}
            onPress={() => {
              onToggleActivity(activity.id);
            }}
          >
            <Text style={styles.emoji}>{activity.emoji}</Text>
            <Text
              style={[
                styles.label,
                {
                  color: selectedActivities.includes(activity.id)
                    ? "#FFFFFF"
                    : "#374151",
                },
              ]}
            >
              {activity.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  button: {
    width: (width - 64) / 3,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  emoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
  },
});
