/**
 * PROJECT HYPERION: MODERN PHOTO UPLOAD COMPONENT
 *
 * Premium photo upload component that demonstrates the new unified design system:
 * - Uses EliteButton for consistent interactions
 * - Applies FXContainer for premium visual effects
 * - Implements staggered animations for photo grid
 * - Provides non-blocking error handling
 * - Maintains accessibility standards
 */

import { Ionicons } from "@expo/vector-icons";
import { logger } from "@pawfectmatch/core";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  Dimensions,
  type ViewStyle,
} from "react-native";

import { useStaggeredAnimation } from "../hooks/useUnifiedAnimations";
import { Theme } from "../theme/unified-theme";

import EliteButton from "./buttons/EliteButton";
import FXContainer from "./containers/FXContainer";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PHOTO_SIZE =
  (SCREEN_WIDTH - Theme.spacing["4xl"] * 2 - Theme.spacing.lg * 2) / 3;

// === TYPES ===
interface PhotoItem {
  id: string;
  uri: string;
  isUploading?: boolean;
  error?: string;
}

interface ModernPhotoUploadProps {
  photos: PhotoItem[];
  onPhotosChange: (photos: PhotoItem[]) => void;
  maxPhotos?: number;
  style?: ViewStyle;
  disabled?: boolean;
}

// === MAIN COMPONENT ===
function ModernPhotoUpload({
  photos,
  onPhotosChange,
  maxPhotos = 6,
  style,
  disabled = false,
}: ModernPhotoUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Staggered animation for photo grid
  const { start: startStaggeredAnimation, getAnimatedStyle } =
    useStaggeredAnimation(
      photos.length + 1, // +1 for add button
      100,
      "gentle",
    );

  // Start staggered animation when photos change
  React.useEffect(() => {
    startStaggeredAnimation();
  }, [photos.length, startStaggeredAnimation]);

  // Request permissions
  const requestPermissions = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant camera roll permissions to upload photos.",
        [{ text: "OK" }],
      );
      return false;
    }
    return true;
  }, []);

  // Pick image from library
  const pickImage = useCallback(async () => {
    if (disabled || isProcessing || photos.length >= maxPhotos) return;

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newPhoto: PhotoItem = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
          isUploading: true,
        };

        const updatedPhotos = [...photos, newPhoto];
        onPhotosChange(updatedPhotos);

        // Simulate upload process
        setTimeout(() => {
          const finalPhotos = updatedPhotos.map((photo) =>
            photo.id === newPhoto.id ? { ...photo, isUploading: false } : photo,
          );
          onPhotosChange(finalPhotos);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 2000);
      }
    } catch (error) {
      logger.error("Error picking image:", { error });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Non-blocking error handling
      Alert.alert("Upload Error", "Failed to upload photo. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsProcessing(false);
    }
  }, [
    disabled,
    isProcessing,
    photos,
    maxPhotos,
    requestPermissions,
    onPhotosChange,
  ]);

  // Remove photo
  const removePhoto = useCallback(
    (photoId: string) => {
      if (disabled || isProcessing) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const updatedPhotos = photos.filter((photo) => photo.id !== photoId);
      onPhotosChange(updatedPhotos);
    },
    [disabled, isProcessing, photos, onPhotosChange],
  );

  // Render photo item
  const renderPhotoItem = useCallback(
    (photo: PhotoItem, index: number) => {
      const AnimatedView = require("react-native-reanimated").default.View;
      const animatedStyle = getAnimatedStyle(index);

      return (
        <AnimatedView key={photo.id} style={animatedStyle}>
          <FXContainer
            type="glass"
            variant="medium"
            hasGlow={true}
            style={styles.photoContainer}
          >
            <Image
              source={{ uri: photo.uri }}
              style={styles.photo}
              resizeMode="cover"
            />

            {/* Uploading overlay */}
            {photo.isUploading && (
              <View style={styles.uploadingOverlay}>
                <View style={styles.uploadingSpinner}>
                  <Ionicons
                    name="cloud-upload"
                    size={24}
                    color={Theme.colors.primary[500]}
                  />
                </View>
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            )}

            {/* Error overlay */}
            {photo.error && (
              <View style={styles.errorOverlay}>
                <Ionicons
                  name="alert-circle"
                  size={24}
                  color={Theme.colors.status.error}
                />
                <Text style={styles.errorText}>Failed</Text>
              </View>
            )}

            {/* Remove button */}
            {!photo.isUploading && !photo.error && (
              <EliteButton
                title=""
                size="sm"
                variant="ghost"
                leftIcon="close"
                onPress={() => {
                  removePhoto(photo.id);
                }}
                style={styles.removeButton}
                glowEffect={false}
                rippleEffect={false}
              />
            )}
          </FXContainer>
        </AnimatedView>
      );
    },
    [getAnimatedStyle, removePhoto],
  );

  // Render add button
  const renderAddButton = useCallback(() => {
    const AnimatedView = require("react-native-reanimated").default.View;
    const animatedStyle = getAnimatedStyle(photos.length);

    return (
      <AnimatedView style={animatedStyle}>
        <EliteButton
          title="Add Photo"
          size="lg"
          variant="outline"
          leftIcon="camera"
          onPress={pickImage}
          loading={isProcessing}
          disabled={disabled || photos.length >= maxPhotos}
          style={styles.addButton}
          glowEffect={true}
          rippleEffect={true}
          pressEffect={true}
        />
      </AnimatedView>
    );
  }, [
    getAnimatedStyle,
    photos.length,
    pickImage,
    isProcessing,
    disabled,
    maxPhotos,
  ]);

  // Memoized grid layout
  const gridItems = useMemo(() => {
    const items = photos.map(renderPhotoItem);
    if (photos.length < maxPhotos) {
      items.push(renderAddButton());
    }
    return items;
  }, [photos, maxPhotos, renderPhotoItem, renderAddButton]);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Pet Photos</Text>
      <Text style={styles.subtitle}>
        Add up to {maxPhotos} photos ({photos.length}/{maxPhotos})
      </Text>

      <View style={styles.grid}>{gridItems}</View>

      {photos.length === 0 && (
        <FXContainer
          type="glass"
          variant="subtle"
          hasEntrance={true}
          entranceType="fadeInUp"
          style={styles.emptyState}
        >
          <Ionicons
            name="images"
            size={48}
            color={Theme.colors.neutral[400]}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>No photos yet</Text>
          <Text style={styles.emptySubtitle}>
            Add photos to help other pet owners get to know your pet better
          </Text>
        </FXContainer>
      )}
    </View>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.xl,
  },
  title: {
    fontSize: Theme.typography.fontSize["2xl"],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary.primary,
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary.secondary,
    marginBottom: Theme.spacing.xl,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: Theme.spacing.lg,
  },
  photoContainer: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: Theme.borderRadius.xl,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: Theme.borderRadius.xl,
  },
  uploadingSpinner: {
    marginBottom: Theme.spacing.sm,
  },
  uploadingText: {
    color: Theme.colors.neutral[0],
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: Theme.borderRadius.xl,
  },
  errorText: {
    color: Theme.colors.neutral[0],
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    marginTop: Theme.spacing.xs,
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.status.error,
    padding: 0,
    minHeight: 32,
  },
  addButton: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    padding: Theme.spacing["4xl"],
    alignItems: "center",
    marginTop: Theme.spacing.xl,
  },
  emptyIcon: {
    marginBottom: Theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.primary.primary,
    marginBottom: Theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary.secondary,
    textAlign: "center",
    lineHeight:
      Theme.typography.fontSize.base * Theme.typography.lineHeight.relaxed,
  },
});

export default ModernPhotoUpload;
