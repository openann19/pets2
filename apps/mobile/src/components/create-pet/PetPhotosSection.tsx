import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type { PhotoData } from "../../hooks/usePhotoManager";
import { useExtendedColors } from "../../hooks/useExtendedTheme";

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
  const colors = useExtendedColors();
  const hasUploadingPhotos = photos.some((p) => p.isUploading);
  const hasErrorPhotos = photos.some((p) => p.error);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Photos</Text>

      <TouchableOpacity
        style={styles.addPhotoButton}
        onPress={onPickImage}
        disabled={photos.length >= 10}
      >
        <Ionicons name="camera" size={24} color={colors.textSecondary} />
        <Text style={styles.addPhotoText}>
          {photos.length === 0
            ? "Add Photos"
            : `Add More Photos (${photos.length}/10)`}
        </Text>
      </TouchableOpacity>

      {errors.photos && <Text style={styles.errorText}>{errors.photos}</Text>}

      {/* Upload status indicators */}
      {hasUploadingPhotos && (
        <View style={styles.uploadStatusContainer}>
          <ActivityIndicator size="small" color="#8B5CF6" />
          <Text style={styles.uploadStatusText}>
            Uploading photos...
          </Text>
        </View>
      )}

      {hasErrorPhotos && !hasUploadingPhotos && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color="#EF4444" />
          <Text style={styles.errorStatusText}>
            Some photos failed to upload. Please try again.
          </Text>
        </View>
      )}

      {photos.length > 0 && (
        <View style={styles.photosGrid}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image 
                source={{ uri: photo.uploadedUrl || photo.uri }} 
                style={styles.photo}
                resizeMode="cover"
              />

              {/* Upload progress overlay */}
              {photo.isUploading && photo.uploadProgress && (
                <View style={styles.progressOverlay}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  {photo.uploadProgress.percentage < 100 && (
                    <Text style={styles.progressText}>
                      {photo.uploadProgress.percentage}%
                    </Text>
                  )}
                </View>
              )}

              {/* Error indicator */}
              {photo.error && (
                <View style={styles.errorOverlay}>
                  <Ionicons name="alert-circle" size={20} color="#EF4444" />
                </View>
              )}

              {/* Success indicator */}
              {photo.uploadedUrl && !photo.isUploading && !photo.error && (
                <View style={styles.successIndicator}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                </View>
              )}

              {photo.isPrimary && (
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryBadgeText}>Primary</Text>
                </View>
              )}

              <View style={styles.photoActions}>
                {!photo.isPrimary && !photo.isUploading && (
                  <TouchableOpacity
                    style={styles.photoActionButton}
                    onPress={() => {
                      onSetPrimaryPhoto(index);
                    }}
                  >
                    <Ionicons name="star" size={16} color={colors.white} />
                  </TouchableOpacity>
                )}

                {!photo.isUploading && (
                  <TouchableOpacity
                    style={StyleSheet.flatten([
                      styles.photoActionButton,
                      styles.deleteButton,
                    ])}
                    onPress={() => {
                      onRemovePhoto(index);
                    }}
                  >
                    <Ionicons name="trash" size={16} color={colors.white} />
                  </TouchableOpacity>
                )}
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
  uploadStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 8,
    backgroundColor: "#F3E8FF",
    borderRadius: 8,
    gap: 8,
  },
  uploadStatusText: {
    fontSize: 14,
    color: "#8B5CF6",
    fontWeight: "500",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 8,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    gap: 8,
  },
  errorStatusText: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "500",
  },
  progressOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    gap: 4,
  },
  progressText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  errorOverlay: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 2,
  },
  successIndicator: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 2,
  },
});
