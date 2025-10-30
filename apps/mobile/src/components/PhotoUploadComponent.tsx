import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 60) / 3;

interface Photo {
  id: string;
  uri: string;
  isPrimary: boolean;
}

interface PhotoUploadComponentProps {
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
  maxPhotos?: number;
  title?: string;
}

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 300,
  mass: 1,
};

const PhotoUploadComponent: React.FC<PhotoUploadComponentProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 6,
  title = 'Pet Photos',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const scaleValue = useSharedValue(1);
  const theme = useTheme();
  const styles = makeStyles(theme);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== ImagePicker.PermissionStatus.GRANTED) {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload photos.', [
        { text: 'OK' },
      ]);
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Photo Limit', `You can only upload up to ${maxPhotos} photos.`);
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsUploading(true);
    scaleValue.value = withSpring(0.95, SPRING_CONFIG);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        const newPhoto: Photo = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
          isPrimary: photos.length === 0, // First photo is primary
        };

        onPhotosChange([...photos, newPhoto]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setIsUploading(false);
      scaleValue.value = withSpring(1, SPRING_CONFIG);
    }
  };

  const takePhoto = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Photo Limit', `You can only upload up to ${maxPhotos} photos.`);
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== ImagePicker.PermissionStatus.GRANTED) {
      Alert.alert('Permission Required', 'Please grant camera permissions to take photos.', [
        { text: 'OK' },
      ]);
      return;
    }

    setIsUploading(true);

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newPhoto: Photo = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
          isPrimary: photos.length === 0,
        };

        onPhotosChange([...photos, newPhoto]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert('Add Photo', 'Choose how you want to add a photo', [
      { text: 'Camera', onPress: () => void takePhoto() },
      { text: 'Photo Library', onPress: () => void pickImage() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const removePhoto = (photoId: string) => {
    Alert.alert('Remove Photo', 'Are you sure you want to remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
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

  const setPrimaryPhoto = (photoId: string) => {
    const updatedPhotos = photos.map((photo) => ({
      ...photo,
      isPrimary: photo.id === photoId,
    }));
    onPhotosChange(updatedPhotos);
  };

  const renderPhotoGrid = () => (
    <View style={styles.photoGrid}>
      {photos.map((photo, index) => (
        <View
          key={photo.id}
          style={styles.photoContainer}
        >
          <Image
            source={{ uri: photo.uri }}
            style={styles.photo}
          />

          {/* Primary Badge */}
          {photo.isPrimary && (
            <View style={styles.primaryBadge}>
              <Text style={styles.primaryBadgeText}>Primary</Text>
            </View>
          )}

          {/* Photo Actions */}
          <View style={styles.photoActions}>
            {!photo.isPrimary && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  setPrimaryPhoto(photo.id);
                }}
              >
                <Text style={styles.actionButtonText}>⭐</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={StyleSheet.flatten([styles.actionButton, styles.removeButton])}
              onPress={() => {
                removePhoto(photo.id);
              }}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Add Photo Button */}
      {photos.length < maxPhotos && (
        <Animated.View style={StyleSheet.flatten([styles.addPhotoContainer, animatedStyle])}>
          <TouchableOpacity
            style={styles.addPhotoButton}
            onPress={showImageOptions}
            disabled={isUploading}
          >
            <Text style={styles.addPhotoIcon}>{isUploading ? '⏳' : '📷'}</Text>
            <Text style={styles.addPhotoText}>{isUploading ? 'Uploading...' : 'Add Photo'}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          {photos.length}/{maxPhotos} photos • First photo will be the main photo
        </Text>
      </View>

      {renderPhotoGrid()}

      {photos.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📸</Text>
          <Text style={styles.emptyStateTitle}>No photos yet</Text>
          <Text style={styles.emptyStateText}>
            Add photos to make your pet&apos;s profile more attractive to potential matches
          </Text>
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={showImageOptions}
          >
            <Text style={styles.emptyStateButtonText}>Add First Photo</Text>
          </TouchableOpacity>
        </View>
      )}

      {photos.length > 0 && (
        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>📝 Photo Tips:</Text>
          <Text style={styles.tip}>• Use clear, well-lit photos</Text>
          <Text style={styles.tip}>• Show your pet&apos;s personality</Text>
          <Text style={styles.tip}>• Include different angles and activities</Text>
          <Text style={styles.tip}>• Avoid blurry or dark images</Text>
        </View>
      )}
    </View>
  );
};

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.onMuted,
    },
    photoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 20,
    },
    photoContainer: {
      position: 'relative',
      width: PHOTO_SIZE,
      height: PHOTO_SIZE,
    },
    photo: {
      width: '100%',
      height: '100%',
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
    },
    primaryBadge: {
      position: 'absolute',
      top: 8,
      left: 8,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    primaryBadgeText: {
      color: theme.colors.onPrimary,
      fontSize: 10,
      fontWeight: '600',
    },
    photoActions: {
      position: 'absolute',
      top: 8,
      right: 8,
      flexDirection: 'row',
      gap: 4,
    },
    actionButton: {
      backgroundColor: theme.colors.primary,
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    removeButton: {
      backgroundColor: theme.colors.danger,
    },
    actionButtonText: {
      color: theme.colors.onPrimary,
      fontSize: 12,
    },
    removeButtonText: {
      color: theme.colors.onPrimary,
      fontSize: 10,
      fontWeight: 'bold',
    },
    addPhotoContainer: {
      width: PHOTO_SIZE,
      height: PHOTO_SIZE,
    },
    addPhotoButton: {
      width: '100%',
      height: '100%',
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
    },
    addPhotoIcon: {
      fontSize: 32,
      marginBottom: 8,
    },
    addPhotoText: {
      fontSize: 12,
      color: theme.colors.onMuted,
      fontWeight: '500',
      textAlign: 'center',
    },
    emptyState: {
      alignItems: 'center',
      padding: 40,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      marginBottom: 20,
    },
    emptyStateIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    emptyStateTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 8,
    },
    emptyStateText: {
      fontSize: 14,
      color: theme.colors.onMuted,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 20,
    },
    emptyStateButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    emptyStateButtonText: {
      color: theme.colors.onPrimary,
      fontWeight: '600',
    },
    tips: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
    },
    tipsTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.warning,
      marginBottom: 8,
    },
    tip: {
      fontSize: 12,
      color: theme.colors.warning,
      marginBottom: 2,
      lineHeight: 16,
    },
  });
}

export default PhotoUploadComponent;
