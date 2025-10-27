import { useTheme } from '../theme/Provider';
import { Theme } from '../theme/unified-theme';
/**
 * 📸 PHOTO UPLOAD SECTION
 * Extracted from AIPhotoAnalyzerScreen
 */

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PinchZoomPro } from '../../../components/Gestures/PinchZoomPro';
import { usePinchMetrics } from '../../../hooks/useInteractionMetrics';

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface PhotoUploadSectionProps {
  selectedImage: string | null;
  onPickImage: () => Promise<void>;
  onTakePhoto: () => Promise<void>;
  colors: {
    text: string;
    textSecondary: string;
    card: string;
    primary: string;
    secondary: string;
  };
}

export function PhotoUploadSection({
  selectedImage,
  onPickImage,
  onTakePhoto,
  colors,
}: PhotoUploadSectionProps) {
  const { startInteraction, endInteraction } = usePinchMetrics();

  return (
    <View style={styles.imageSection}>
      <Text
        style={StyleSheet.flatten([
          styles.sectionTitle,
          { color: colors.text },
        ])}
      >
        Select Pet Photo
      </Text>

      {selectedImage !== null ? (
        <View style={styles.imageContainer}>
          <PinchZoomPro
            source={{ uri: selectedImage }}
            width={SCREEN_WIDTH - 32}
            height={SCREEN_WIDTH - 32}
            minScale={1}
            maxScale={3}
            enableMomentum={true}
            haptics={true}
            onScaleChange={(scale) => {
              if (scale > 1.1) {
                startInteraction('pinch', { imageUri: selectedImage });
              } else {
                endInteraction('pinch', true);
              }
            }}
            backgroundColor="#000"
          />
          <TouchableOpacity
            style={StyleSheet.flatten([
              styles.changeImageButton,
              { backgroundColor: colors.primary },
            ])}
            testID="PhotoUploadSection-change-button"
            accessibilityLabel="Change photo"
            accessibilityRole="button"
            onPress={onPickImage}
          >
            <Ionicons name="camera" size={20} color="#ffffff" />
            <Text style={styles.changeImageText}>Change Photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={StyleSheet.flatten([
            styles.imagePlaceholder,
            { backgroundColor: colors.card },
          ])}
        >
          <Ionicons name="camera" size={48} color={colors.textSecondary} />
          <Text
            style={StyleSheet.flatten([
              styles.placeholderText,
              { color: colors.textSecondary },
            ])}
          >
            No photo selected
          </Text>
          <View style={styles.imageButtons}>
            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.imageButton,
                { backgroundColor: colors.primary },
              ])}
              testID="PhotoUploadSection-gallery-button"
              accessibilityLabel="Select from gallery"
              accessibilityRole="button"
              onPress={onPickImage}
            >
              <Ionicons name="image" size={20} color="#ffffff" />
              <Text style={styles.imageButtonText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.imageButton,
                { backgroundColor: colors.secondary },
              ])}
              testID="PhotoUploadSection-camera-button"
              accessibilityLabel="Take photo"
              accessibilityRole="button"
              onPress={onTakePhoto}
            >
              <Ionicons name="camera" size={20} color="#ffffff" />
              <Text style={styles.imageButtonText}>Camera</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  imageSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  imageContainer: {
    alignItems: "center",
  },
  selectedImage: {
    width: SCREEN_WIDTH - 32,
    height: SCREEN_WIDTH - 32,
    borderRadius: 16,
    marginBottom: 16,
  },
  changeImageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  changeImageText: {
    color: theme.colors.neutral[0],
    fontSize: 14,
    fontWeight: "600",
  },
  imagePlaceholder: {
    height: SCREEN_WIDTH - 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  imageButtons: {
    flexDirection: "row",
    gap: 16,
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  imageButtonText: {
    color: theme.colors.neutral[0],
    fontSize: 14,
    fontWeight: "600",
  },
});
