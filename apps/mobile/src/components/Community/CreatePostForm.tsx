/**
 * Create Post Form Component
 *
 * Production-grade form for creating community posts with:
 * - Text content input
 * - Image selection and upload
 * - Activity creation options
 * - Form validation and error handling
 * - Real-time character counting
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@mobile/theme';
import { getExtendedColors, type ExtendedColors } from '@mobile/theme/adapters';
import type { CreatePostRequest, ActivityDetails } from '../../services/communityAPI';
import { logger } from '@pawfectmatch/core';

interface CreatePostFormProps {
  onSubmit: (data: CreatePostRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const MAX_CONTENT_LENGTH = 5000;
const MAX_IMAGES = 5;

export const CreatePostForm: React.FC<CreatePostFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const theme = useTheme();
  const colors: ExtendedColors = getExtendedColors(theme);

  // Form state
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isActivity, setIsActivity] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Activity details state
  const [activityDate, setActivityDate] = useState(new Date());
  const [location, setLocation] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('10');

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dynamic styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: theme.spacing.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      color: colors.onSurface,
    },
    cancelButton: {
      padding: theme.spacing.sm,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
      color: colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    textInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      fontSize: theme.typography.body.size,
      color: colors.onSurface,
      backgroundColor: colors.card,
      textAlignVertical: 'top',
    },
    textInputError: {
      borderColor: theme.colors.danger,
    },
    characterCount: {
      textAlign: 'right',
      marginTop: theme.spacing.xs,
      fontSize: theme.typography.body.size * 0.75,
      color: colors.onMuted,
    },
    characterCountError: {
      color: theme.colors.danger,
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: theme.typography.body.size * 0.75,
      marginTop: theme.spacing.xs,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
    },
    switchLabel: {
      fontSize: theme.typography.body.size,
      color: colors.onSurface,
      flex: 1,
    },
    switchDescription: {
      fontSize: theme.typography.body.size * 0.875,
      color: colors.onMuted,
      marginTop: theme.spacing.xs / 2,
    },
    activitySection: {
      backgroundColor: colors.card,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
    activityInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: theme.radius.sm,
      padding: theme.spacing.sm,
      fontSize: theme.typography.body.size,
      color: colors.onSurface,
      backgroundColor: colors.background,
      marginBottom: theme.spacing.sm,
    },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: theme.radius.sm,
      padding: theme.spacing.sm,
      backgroundColor: colors.background,
      marginBottom: theme.spacing.sm,
    },
    dateButtonText: {
      fontSize: theme.typography.body.size,
      color: colors.onSurface,
      marginLeft: theme.spacing.sm,
    },
    imagesSection: {
      marginBottom: theme.spacing.lg,
    },
    addImageButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: colors.border,
      borderRadius: theme.radius.md,
      padding: theme.spacing.lg,
      backgroundColor: colors.card,
    },
    addImageText: {
      marginLeft: theme.spacing.sm,
      fontSize: theme.typography.body.size,
      color: colors.onMuted,
    },
    imageGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    imageContainer: {
      position: 'relative',
      width: 80,
      height: 80,
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: theme.radius.sm,
    },
    removeImageButton: {
      position: 'absolute',
      top: -theme.spacing.xs,
      right: -theme.spacing.xs,
      backgroundColor: theme.colors.danger,
      borderRadius: theme.radius.full,
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      alignItems: 'center',
      marginTop: theme.spacing.lg,
    },
    submitButtonDisabled: {
      backgroundColor: colors.onMuted,
    },
    submitButtonText: {
      color: theme.colors.onPrimary,
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    loadingText: {
      marginLeft: theme.spacing.sm,
      color: theme.colors.onPrimary,
    },
  });

  // Validation
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!content.trim()) {
      newErrors.content = 'Post content is required';
    } else if (content.length > MAX_CONTENT_LENGTH) {
      newErrors.content = `Content must be ${MAX_CONTENT_LENGTH} characters or less`;
    }

    if (isActivity) {
      if (!location.trim()) {
        newErrors.location = 'Location is required for activities';
      }
      
      const attendees = parseInt(maxAttendees, 10);
      if (isNaN(attendees) || attendees < 1 || attendees > 1000) {
        newErrors.maxAttendees = 'Max attendees must be between 1 and 1000';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [content, isActivity, location, maxAttendees]);

  // Handle image selection
  const handleAddImage = useCallback(async () => {
    try {
      if (images.length >= MAX_IMAGES) {
        Alert.alert('Limit Reached', `You can only add up to ${MAX_IMAGES} images.`);
        return;
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to add images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        setImages(prev => [...prev, result.assets[0].uri]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      logger.error('Error selecting image:', { error });
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  }, [images.length]);

  // Handle image removal
  const handleRemoveImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      const postData: CreatePostRequest = {
        content: content.trim(),
        images,
        type: isActivity ? 'activity' : 'post',
      };

      if (isActivity) {
        const activityDetails: ActivityDetails = {
          date: activityDate.toISOString(),
          location: location.trim(),
          maxAttendees: parseInt(maxAttendees, 10),
          currentAttendees: 0,
          attending: false,
        };
        postData.activityDetails = activityDetails;
      }

      await onSubmit(postData);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      logger.error('Error creating post:', { error });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [content, images, isActivity, activityDate, location, maxAttendees, onSubmit, validateForm]);

  const isFormValid = content.trim().length > 0 && Object.keys(errors).length === 0;
  const characterCount = content.length;
  const isCharacterLimitExceeded = characterCount > MAX_CONTENT_LENGTH;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Post</Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            accessibilityLabel="Cancel post creation"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={24} color={colors.onMuted} />
          </TouchableOpacity>
        </View>

        {/* Content Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's on your mind?</Text>
          <TextInput
            style={[
              styles.textInput,
              { height: 120 },
              errors.content && styles.textInputError,
            ]}
            value={content}
            onChangeText={setContent}
            placeholder="Share something with the community..."
            placeholderTextColor={colors.onMuted}
            multiline
            maxLength={MAX_CONTENT_LENGTH + 100} // Allow slight overflow for better UX
            accessibilityLabel="Post content"
            accessibilityHint="Enter the text content for your post"
          />
          <Text
            style={[
              styles.characterCount,
              isCharacterLimitExceeded && styles.characterCountError,
            ]}
          >
            {characterCount}/{MAX_CONTENT_LENGTH}
          </Text>
          {errors.content && <Text style={styles.errorText}>{errors.content}</Text>}
        </View>

        {/* Images Section */}
        <View style={styles.imagesSection}>
          <Text style={styles.sectionTitle}>Images (Optional)</Text>
          <TouchableOpacity
            style={styles.addImageButton}
            onPress={handleAddImage}
            disabled={images.length >= MAX_IMAGES}
            accessibilityLabel="Add image"
            accessibilityRole="button"
          >
            <Ionicons name="camera" size={24} color={colors.onMuted} />
            <Text style={styles.addImageText}>
              Add Image ({images.length}/{MAX_IMAGES})
            </Text>
          </TouchableOpacity>

          {images.length > 0 && (
            <View style={styles.imageGrid}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                    accessibilityLabel={`Remove image ${index + 1}`}
                    accessibilityRole="button"
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Activity Toggle */}
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Create Activity</Text>
              <Text style={styles.switchDescription}>
                Turn this post into an activity that others can join
              </Text>
            </View>
            <Switch
              value={isActivity}
              onValueChange={setIsActivity}
              trackColor={{ false: colors.border, true: theme.colors.primary }}
              thumbColor={isActivity ? theme.colors.onPrimary : colors.onMuted}
              accessibilityLabel="Create activity toggle"
            />
          </View>

          {/* Activity Details */}
          {isActivity && (
            <View style={styles.activitySection}>
              <Text style={styles.sectionTitle}>Activity Details</Text>

              {/* Date Picker */}
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
                accessibilityLabel="Select activity date"
                accessibilityRole="button"
              >
                <Ionicons name="calendar" size={20} color={colors.onMuted} />
                <Text style={styles.dateButtonText}>
                  {activityDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={activityDate}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setActivityDate(selectedDate);
                    }
                  }}
                />
              )}

              {/* Location */}
              <TextInput
                style={[styles.activityInput, errors.location && styles.textInputError]}
                value={location}
                onChangeText={setLocation}
                placeholder="Activity location"
                placeholderTextColor={colors.onMuted}
                accessibilityLabel="Activity location"
              />
              {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}

              {/* Max Attendees */}
              <TextInput
                style={[styles.activityInput, errors.maxAttendees && styles.textInputError]}
                value={maxAttendees}
                onChangeText={setMaxAttendees}
                placeholder="Maximum attendees"
                placeholderTextColor={colors.onMuted}
                keyboardType="numeric"
                accessibilityLabel="Maximum attendees"
              />
              {errors.maxAttendees && <Text style={styles.errorText}>{errors.maxAttendees}</Text>}
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!isFormValid || isSubmitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          accessibilityLabel="Create post"
          accessibilityRole="button"
          accessibilityState={{ disabled: !isFormValid || isSubmitting }}
        >
          {isSubmitting ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.onPrimary} />
              <Text style={styles.loadingText}>Creating...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>
              {isActivity ? 'Create Activity' : 'Create Post'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CreatePostForm;
