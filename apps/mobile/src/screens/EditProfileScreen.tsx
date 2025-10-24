import { Ionicons } from "@expo/vector-icons";
import { logger } from "@pawfectmatch/core";
import { useAuthStore } from "@pawfectmatch/core";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";

interface EditProfileScreenProps {
  navigation: {
    goBack: () => void;
  };
}

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  avatar: string | undefined;
}

function EditProfileScreen({
  navigation,
}: EditProfileScreenProps): JSX.Element {
  const { colors: _colors } = useTheme();
  const { user } = useAuthStore();
  const [profileData, setProfileData] = useState<ProfileData>(() => ({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    location: user?.location?.address || "",
    avatar: user?.avatar,
  }));
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Check if form has changes
    const originalData = {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
      location: user?.location?.address || "",
      avatar: user?.avatar,
    };

    const changed = Object.keys(profileData).some(
      (key) =>
        profileData[key as keyof ProfileData] !==
        originalData[key as keyof ProfileData],
    );
    setHasChanges(changed);
  }, [profileData, user]);

  const updateField = useCallback((field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSelectAvatar = useCallback(async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission required",
          "Please enable photo library access to change your avatar.",
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
        updateField("avatar", result.assets[0].uri);
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
      }
    } catch (error) {
      logger.error("Error selecting avatar:", { error });
      Alert.alert("Error", "Failed to select avatar. Please try again.");
    }
  }, [updateField]);

  const handleSave = useCallback(async () => {
    if (!hasChanges) {
      navigation.goBack();
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real app, this would call an API
      Alert.alert("Success", "Profile updated successfully!", [
        {
          text: "OK",
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
    } catch (error) {
      logger.error("Error updating profile:", { error });
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [hasChanges, navigation]);

  const handleCancel = useCallback(() => {
    if (hasChanges) {
      Alert.alert(
        "Discard Changes",
        "Are you sure you want to discard your changes?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              navigation.goBack();
            },
          },
        ],
      );
    } else {
      navigation.goBack();
    }
  }, [hasChanges, navigation]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#6366f1", "#8b5cf6", "#ec4899"]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!hasChanges || loading) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!hasChanges || loading}
          >
            <Text
              style={[
                styles.saveButtonText,
                (!hasChanges || loading) && styles.saveButtonTextDisabled,
              ]}
            >
              {loading ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Profile Picture</Text>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={handleSelectAvatar}
              >
                <BlurView intensity={20} style={styles.avatarBlur}>
                  {profileData.avatar ? (
                    <View style={styles.avatarWrapper}>
                      {/* In a real app, you'd show the actual image */}
                      <Ionicons name="person" size={40} color="white" />
                      <View style={styles.avatarOverlay}>
                        <Ionicons name="camera" size={20} color="white" />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons
                        name="person"
                        size={40}
                        color="rgba(255,255,255,0.6)"
                      />
                      <View style={styles.addPhotoOverlay}>
                        <Ionicons name="add" size={24} color="#6366f1" />
                      </View>
                    </View>
                  )}
                </BlurView>
              </TouchableOpacity>
            </View>

            {/* Personal Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>First Name</Text>
                  <BlurView intensity={15} style={styles.inputBlur}>
                    <TextInput
                      style={styles.input}
                      value={profileData.firstName}
                      onChangeText={(value) => {
                        updateField("firstName", value);
                      }}
                      placeholder="Enter first name"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                    />
                  </BlurView>
                </View>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Last Name</Text>
                  <BlurView intensity={15} style={styles.inputBlur}>
                    <TextInput
                      style={styles.input}
                      value={profileData.lastName}
                      onChangeText={(value) => {
                        updateField("lastName", value);
                      }}
                      placeholder="Enter last name"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                    />
                  </BlurView>
                </View>
              </View>

              <Text style={styles.inputLabel}>Email</Text>
              <BlurView intensity={15} style={styles.inputBlur}>
                <TextInput
                  style={styles.input}
                  value={profileData.email}
                  onChangeText={(value) => {
                    updateField("email", value);
                  }}
                  placeholder="Enter email"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </BlurView>

              <Text style={styles.inputLabel}>Phone</Text>
              <BlurView intensity={15} style={styles.inputBlur}>
                <TextInput
                  style={styles.input}
                  value={profileData.phone}
                  onChangeText={(value) => {
                    updateField("phone", value);
                  }}
                  placeholder="Enter phone number"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  keyboardType="phone-pad"
                />
              </BlurView>

              <Text style={styles.inputLabel}>Location</Text>
              <BlurView intensity={15} style={styles.inputBlur}>
                <TextInput
                  style={styles.input}
                  value={profileData.location}
                  onChangeText={(value) => {
                    updateField("location", value);
                  }}
                  placeholder="Enter your location"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                />
              </BlurView>
            </View>

            {/* Bio Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About Me</Text>
              <BlurView intensity={15} style={styles.bioInputBlur}>
                <TextInput
                  style={styles.bioInput}
                  value={profileData.bio}
                  onChangeText={(value) => {
                    updateField("bio", value);
                  }}
                  placeholder="Tell us about yourself and what you're looking for in a pet match..."
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                />
              </BlurView>
              <Text style={styles.charCount}>
                {profileData.bio.length}/500 characters
              </Text>
            </View>

            {/* Spacer for keyboard */}
            <View style={styles.spacer} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cancelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.5)",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  saveButtonTextDisabled: {
    opacity: 0.5,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatarBlur: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarWrapper: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
    borderStyle: "dashed",
  },
  addPhotoOverlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarOverlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  inputHalf: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
    marginBottom: 8,
  },
  inputBlur: {
    borderRadius: 12,
    overflow: "hidden",
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "white",
    fontSize: 16,
  },
  bioInputBlur: {
    borderRadius: 12,
    overflow: "hidden",
    height: 120,
  },
  bioInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "white",
    fontSize: 16,
    height: "100%",
  },
  charCount: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    textAlign: "right",
    marginTop: 4,
  },
  spacer: {
    height: 100,
  },
});

export default EditProfileScreen;
