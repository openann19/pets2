import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type { PhotoData } from "../../hooks/usePhotoManager";
import { Theme } from '../theme/unified-theme';

interface PetPhotosSectionProps {
  photos: PhotoData[];
  errors: Record<string, string>;
  onPickImage: () => void;
  onRemovePhoto: (index: number) => void;
  onSetPrimaryPhoto: (index: number) => void;
}

const { width: screenWidth } = Dimensions.get("window");

export const PetPhotosSection: React.FC<PetPhotosSectionProps> = ({
  photos,
  errors,
  onPickImage,
  onRemovePhoto,
  onSetPrimaryPhoto,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Photos</Text>

      <TouchableOpacity
        style={styles.addPhotoButton}
        onPress={onPickImage}
        disabled={photos.length >= 10}
      >
        <Ionicons name="camera" size={24} color="Theme.colors.neutral[500]" />
        <Text style={styles.addPhotoText}>
          {photos.length === 0
            ? "Add Photos"
            : `Add More Photos (${photos.length}/10)`}
        </Text>
      </TouchableOpacity>

      {errors.photos && <Text style={styles.errorText}>{errors.photos}</Text>}

      {photos.length > 0 && (
        <View style={styles.photosGrid}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{ uri: photo.uri }} style={styles.photo} />

              {photo.isPrimary && (
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryBadgeText}>Primary</Text>
                </View>
              )}

              <View style={styles.photoActions}>
                {!photo.isPrimary && (
                  <TouchableOpacity
                    style={styles.photoActionButton}
                    onPress={() => {
                      onSetPrimaryPhoto(index);
                    }}
                  >
                    <Ionicons name="star" size={16} color="Theme.colors.neutral[0]" />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={StyleSheet.flatten([
                    styles.photoActionButton,
                    styles.deleteButton,
                  ])}
                  onPress={() => {
                    onRemovePhoto(index);
                  }}
                >
                  <Ionicons name="trash" size={16} color="Theme.colors.neutral[0]" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.photoHint}>
        • Upload up to 10 photos (max 5MB each){"\n"}• First photo will be set
        as primary{"\n"}• Supported formats: JPG, PNG, GIF
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "Theme.colors.neutral[900]",
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: "Theme.colors.status.error",
    marginTop: 4,
  },
  addPhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderWidth: 2,
    borderColor: "Theme.colors.neutral[300]",
    borderRadius: 12,
    backgroundColor: "Theme.colors.background.secondary",
    borderStyle: "dashed",
  },
  addPhotoText: {
    fontSize: 16,
    color: "Theme.colors.neutral[500]",
    marginLeft: 8,
    fontWeight: "500",
  },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
  },
  photoContainer: {
    width: (screenWidth - 40 - 24) / 3,
    height: (screenWidth - 40 - 24) / 3,
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  primaryBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "rgba(139, 92, 246, 0.9)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryBadgeText: {
    fontSize: 10,
    color: "Theme.colors.neutral[0]",
    fontWeight: "bold",
  },
  photoActions: {
    position: "absolute",
    top: 4,
    right: 4,
    flexDirection: "row",
    gap: 4,
  },
  photoActionButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "rgba(239, 68, 68, 0.8)",
  },
  photoHint: {
    fontSize: 12,
    color: "Theme.colors.neutral[500]",
    marginTop: 12,
    lineHeight: 18,
  },
});
