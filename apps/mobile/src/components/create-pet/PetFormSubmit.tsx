import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PetFormSubmitProps {
  isSubmitting: boolean;
  onSubmit: () => void;
}

export const PetFormSubmit: React.FC<PetFormSubmitProps> = ({
  isSubmitting,
  onSubmit,
}) => {
  return (
    <View style={styles.submitContainer}>
      <TouchableOpacity
        style={[
          styles.submitButton,
          isSubmitting && styles.submitButtonDisabled,
        ]}
        onPress={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <View style={styles.submitContent}>
            <Ionicons
              name="sync"
              size={20}
              color="#FFFFFF"
              style={{ transform: [{ rotate: "45deg" }] }}
            />
            <Text style={styles.submitButtonText}>Creating Profile...</Text>
          </View>
        ) : (
          <View style={styles.submitContent}>
            <Ionicons name="add-circle" size={20} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>Create Pet Profile</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  submitContainer: {
    marginTop: 32,
    marginBottom: 40,
  },
  submitButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 8,
  },
});
