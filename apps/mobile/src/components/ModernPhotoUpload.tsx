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

import { Ionicons } from '@expo/vector-icons';
import { logger } from '@pawfectmatch/core';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Image, StyleSheet, Alert, Dimensions, type ViewStyle } from 'react-native';

import { useStaggeredAnimation } from '../hooks/usePremiumAnimations';

import EliteButton from './buttons/EliteButton';
import FXContainer from './containers/FXContainer';
import { AdvancedPhotoEditor } from './photo/AdvancedPhotoEditor';
import { Modal } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const theme = useTheme();
  const photoSize = useMemo(
    () => (SCREEN_WIDTH - theme.spacing['4xl'] * 2 - theme.spacing.lg * 2) / 3,
    [theme.spacing],
  );
  const styles = makeStyles(theme, photoSize);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [photoToEdit, setPhotoToEdit] = useState<string | null>(null);

  // Staggered animation for photo grid
  const { start: startStaggeredAnimation, getAnimatedStyle } = useStaggeredAnimation(
    photos.length + 1, // +1 for add button
    100,
  );

  // Start staggered animation when photos change
  React.useEffect(() => {
    startStaggeredAnimation();
  }, [photos.length, startStaggeredAnimation]);

  // Request permissions
  const requestPermissions = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload photos.', [
        { text: 'OK' },
      ]);
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
        allowsEditing: false, // We'll use our own editor
        quality: 1.0, // Get full quality for editing
      });

      if (!result.canceled && result.assets[0]) {
        // Show the editor for the newly selected image
        setPhotoToEdit(result.assets[0].uri);
        setShowPhotoEditor(true);
      }
    } catch (error) {
      logger.error('Error picking image:', { error });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Non-blocking error handling
      Alert.alert('Upload Error', 'Failed to upload photo. Please try again.', [{ text: 'OK' }]);
    } finally {
      setIsProcessing(false);
    }
  }, [disabled, isProcessing, photos, maxPhotos, requestPermissions, onPhotosChange]);

  // Handle photo editor save
  const handlePhotoEditorSave = useCallback(
    (editedUri: string) => {
      const newPhoto: PhotoItem = {
        id: Date.now().toString(),
        uri: editedUri,
        isUploading: false,
      };

      const updatedPhotos = [...photos, newPhoto];
      onPhotosChange(updatedPhotos);
      setShowPhotoEditor(false);
      setPhotoToEdit(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    [photos, onPhotosChange],
  );

  // Handle photo editor cancel
  const handlePhotoEditorCancel = useCallback(() => {
    setShowPhotoEditor(false);
    setPhotoToEdit(null);
  }, []);

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
    (photo: PhotoItem) => {
      const AnimatedView = require('react-native-reanimated').default.View;

      return (
        <AnimatedView
          key={photo.id}
          style={getAnimatedStyle}
        >
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
                  <Ionicons name="cloud-upload" size={24} color={theme.colors.primary} />
                </View>
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            )}

            {/* Error overlay */}
            {photo.error && (
              <View style={styles.errorOverlay}>
                <Ionicons name="alert-circle" size={24} color={theme.colors.danger} />
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
    const AnimatedView = require('react-native-reanimated').default.View;

    return (
      <AnimatedView style={getAnimatedStyle}>
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
  }, [getAnimatedStyle, photos.length, pickImage, isProcessing, disabled, maxPhotos]);

  // Memoized grid layout
  const gridItems = useMemo(() => {
    const items = photos.map(renderPhotoItem);
    if (photos.length < maxPhotos) {
      items.push(renderAddButton());
    }
    return items;
  }, [photos, maxPhotos, renderPhotoItem, renderAddButton]);

  return (
    <View style={StyleSheet.flatten([styles.container, style])}>
      <Text style={styles.title}>Pet Photos</Text>
      <Text style={styles.subtitle}>
        Add up to {maxPhotos} photos ({photos.length}/{maxPhotos})
      </Text>

      {/* Photo Editor Modal */}
      {showPhotoEditor && photoToEdit && (
        <Modal
          visible={showPhotoEditor}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <AdvancedPhotoEditor
            imageUri={photoToEdit}
            onSave={handlePhotoEditorSave}
            onCancel={handlePhotoEditorCancel}
            aspectRatio={[1, 1]}
            maxWidth={1920}
            maxHeight={1920}
          />
        </Modal>
      )}

      <View style={styles.grid}>{gridItems}</View>

      {photos.length === 0 && (
        <FXContainer
          type="glass"
          variant="subtle"
          hasEntrance={true}
          entranceType="slideIn"
          style={styles.emptyState}
        >
          <Ionicons name="images" size={48} color={theme.colors.onMuted} style={styles.emptyIcon} />
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
function makeStyles(theme: AppTheme, photoSize: number) {
  return StyleSheet.create({
    container: {
      padding: theme.spacing.xl,
    },
    title: {
      fontSize: theme.typography.h2.size,
      fontWeight: '700',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onMuted,
      marginBottom: theme.spacing.xl,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: theme.spacing.lg,
    },
    photoContainer: {
      width: photoSize,
      height: photoSize,
      position: 'relative',
    },
    photo: {
      width: '100%',
      height: '100%',
      borderRadius: theme.radii.xl,
    },
    uploadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: theme.radii.xl,
    },
    uploadingSpinner: {
      marginBottom: theme.spacing.sm,
    },
    uploadingText: {
      color: theme.colors.onPrimary,
      fontSize: theme.typography.body.size,
      fontWeight: '600',
    },
    errorOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.danger,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: theme.radii.xl,
    },
    errorText: {
      color: theme.colors.onPrimary,
      fontSize: theme.typography.body.size,
      fontWeight: '600',
      marginTop: theme.spacing.xs,
    },
    removeButton: {
      position: 'absolute',
      top: -8,
      right: -8,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.danger,
      padding: 0,
      minHeight: 32,
    },
    addButton: {
      width: photoSize,
      height: photoSize,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyState: {
      padding: theme.spacing['4xl'],
      alignItems: 'center',
      marginTop: theme.spacing.xl,
    },
    emptyIcon: {
      marginBottom: theme.spacing.lg,
    },
    emptyTitle: {
      fontSize: theme.typography.body.size,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    emptySubtitle: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onMuted,
      textAlign: 'center',
    },
  });
}

export default ModernPhotoUpload;
