import { logger } from '@pawfectmatch/core';
import { useAuthStore } from '@pawfectmatch/core';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  avatar: string | undefined;
}

export function useEditProfileScreen() {
  const { user } = useAuthStore();
  const [profileData, setProfileData] = useState<ProfileData>(() => ({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: '',
    avatar: user?.avatar,
  }));
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const originalData = {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      location: '',
      avatar: user?.avatar,
    };

    const changed = Object.keys(profileData).some(
      (key) => profileData[key as keyof ProfileData] !== originalData[key as keyof ProfileData],
    );
    setHasChanges(changed);
  }, [profileData, user]);

  const updateField = useCallback((field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSelectAvatar = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission required',
          'Please enable photo library access to change your avatar.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        updateField('avatar', result.assets[0].uri);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    } catch (error) {
      logger.error('Error selecting avatar:', { error });
      Alert.alert('Error', 'Failed to select avatar. Please try again.');
    }
  }, [updateField]);

  const handleSave = useCallback(async () => {
    if (!hasChanges) {
      return { shouldNavigate: true };
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      logger.info('Profile updated successfully');
      return { shouldNavigate: true };
    } catch (error) {
      logger.error('Error updating profile:', { error });
      Alert.alert('Error', 'Failed to update profile. Please try again.');
      return { shouldNavigate: false };
    } finally {
      setLoading(false);
    }
  }, [hasChanges]);

  const handleCancel = useCallback(() => {
    if (hasChanges) {
      Alert.alert('Discard Changes', 'Are you sure you want to discard your changes?', [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            // Return true to indicate navigation should happen
          },
        },
      ]);
      return false;
    } else {
      return true;
    }
  }, [hasChanges]);

  return {
    profileData,
    loading,
    hasChanges,
    updateField,
    handleSelectAvatar,
    handleSave,
    handleCancel,
  };
}
