import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Alert, Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { AdvancedPhotoEditor } from "./photo/AdvancedPhotoEditor";
import { Theme } from '../theme/unified-theme';

const { width } = Dimensions.get("window");
const PHOTO_SIZE = (width - 60) / 3;

interface Photo {
  id: string;
  uri: string;
  isPrimary: boolean;
}

interface ModernPhotoUploadWithEditorProps {
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
  maxPhotos?: number;
  style?: any;
  disabled?: boolean;
}

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 300,
  mass: 1,
};

export function ModernPhotoUploadWithEditor({
  photos,
  onPhotosChange,
  maxPhotos = 6,
  style,
  disabled = false,
}: ModernPhotoUploadWithEditorProps): JSX.Element {
  const [isUploading, setIsUploading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [photoToEdit, setPhotoToEdit] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'add' | 'edit'>('add');
  const scaleValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const requestPermissions = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== ImagePicker.PermissionStatus.GRANTED) {
      Alert.alert(
        "Permission Required",
        "Please grant camera roll permissions to upload photos.",
        [{ text: "OK" }],
      );
      return false;
    }
    return true;
  };

  const pickImage = async (): Promise<void> => {
    if (photos.length >= maxPhotos) {
      Alert.alert(
        "Photo Limit",
        `You can only upload up to ${maxPhotos} photos.`,
      );
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsUploading(true);
    scaleValue.value = withSpring(0.95, SPRING_CONFIG);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // We'll use our own editor
        quality: 1.0, // Get full quality for editing
      });

      if (!result.canceled && result.assets[0]) {
        // Show the editor for the newly selected image
        setPhotoToEdit(result.assets[0].uri);
        setEditMode('add');
        setShowEditor(true);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image. Please try again.");
    } finally {
      setIsUploading(false);
      scaleValue.value = withSpring(1, SPRING_CONFIG);
    }
  };

  const takePhoto = async (): Promise<void> => {
    if (photos.length >= maxPhotos) {
      Alert.alert(
        "Photo Limit",
        `You can only upload up to ${maxPhotos} photos.`,
      );
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== ImagePicker.PermissionStatus.GRANTED) {
      Alert.alert(
        "Permission Required",
        "Please grant camera permissions to take photos.",
        [{ text: "OK" }],
      );
      return;
    }

    setIsUploading(true);

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 1.0,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoToEdit(result.assets[0].uri);
        setEditMode('add');
        setShowEditor(true);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const showImageOptions = (): void => {
    Alert.alert("Add Photo", "Choose how you want to add a photo", [
      { text: "Camera", onPress: () => void takePhoto() },
      { text: "Photo Library", onPress: () => void pickImage() },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const editPhoto = (photoId: string): void => {
    const photo = photos.find((p) => p.id === photoId);
    if (photo) {
      setPhotoToEdit(photo.uri);
      setEditMode('edit');
      setShowEditor(true);
    }
  };

  const handleEditorSave = (editedUri: string): void => {
    if (editMode === 'add') {
      // Add new photo
      const newPhoto: Photo = {
        id: Date.now().toString(),
        uri: editedUri,
        isPrimary: photos.length === 0,
      };
      onPhotosChange([...photos, newPhoto]);
    } else {
      // Update existing photo
      const updatedPhotos = photos.map((p) =>
        photoToEdit && p.uri === photoToEdit ? { ...p, uri: editedUri } : p,
      );
      onPhotosChange(updatedPhotos);
    }

    setShowEditor(false);
    setPhotoToEdit(null);
  };

  const handleEditorCancel = (): void => {
    setShowEditor(false);
    setPhotoToEdit(null);
  };

  const removePhoto = (photoId: string): void => {
    Alert.alert("Remove Photo", "Are you sure you want to remove this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          const updatedPhotos = photos.filter((p) => p.id !== photoId);
          // If we removed the primary photo, make the first remaining photo primary
          if (
            updatedPhotos.length > 0 &&
            !updatedPhotos.some((p) => p.isPrimary) &&
            updatedPhotos[0]
          ) {
            updatedPhotos[0].isPrimary = true;
          }
          onPhotosChange(updatedPhotos);
        },
      },
    ]);
  };

  const setPrimaryPhoto = (photoId: string): void => {
    const updatedPhotos = photos.map((photo) => ({
      ...photo,
      isPrimary: photo.id === photoId,
    }));
    onPhotosChange(updatedPhotos);
  };

  return (
    <View style={[styles.container, style]}>
      {photos.length > 0 && (
        <View style={styles.photoGrid}>
          {photos.map((photo) => (
            <View key={photo.id} style={styles.photoContainer}>
              <TouchableOpacity onPress={() => editPhoto(photo.id)}>
                <Image source={{ uri: photo.uri }} style={styles.photo} />

                {photo.isPrimary && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>⭐ Primary</Text>
                  </View>
                )}

                <View style={styles.photoActions}>
                  {!photo.isPrimary && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => setPrimaryPhoto(photo.id)}
                    >
                      <Text style={styles.actionButtonText}>⭐</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionButton, styles.removeButton]}
                    onPress={() => removePhoto(photo.id)}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {photos.length < maxPhotos && (
        <Animated.View style={animatedStyle}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={showImageOptions}
            disabled={isUploading || disabled}
          >
            <Text style={styles.addButtonIcon}>
              {isUploading ? "⏳" : "📷"}
            </Text>
            <Text style={styles.addButtonText}>
              {photos.length === 0 ? "Add First Photo" : `Add Photo (${photos.length}/${maxPhotos})`}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Photo Editor Modal */}
      {showEditor && photoToEdit && (
        <Modal visible={showEditor} animationType="slide" presentationStyle="fullScreen">
          <AdvancedPhotoEditor
            imageUri={photoToEdit}
            onSave={handleEditorSave}
            onCancel={handleEditorCancel}
            aspectRatio={[4, 3]}
            maxWidth={1920}
            maxHeight={1920}
          />
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  photoContainer: {
    position: "relative",
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    backgroundColor: Theme.colors.neutral[100],
  },
  primaryBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: Theme.colors.primary[500],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  primaryBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  photoActions: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    gap: 6,
  },
  actionButton: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  removeButton: {
    backgroundColor: "rgba(239, 68, 68, 0.9)",
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  removeButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 20,
    borderRadius: 16,
    backgroundColor: Theme.colors.primary[500],
    borderWidth: 2,
    borderColor: Theme.colors.primary[600],
    marginBottom: 20,
  },
  addButtonIcon: {
    fontSize: 24,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

