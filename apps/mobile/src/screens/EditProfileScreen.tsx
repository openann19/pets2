import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
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
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenShell } from '../ui/layout/ScreenShell';
import { AdvancedHeader, HeaderConfigs } from '../components/Advanced/AdvancedHeader';
import { haptic } from '../ui/haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useEditProfileScreen } from "../hooks/screens/useEditProfileScreen";
import type { ProfileData } from "../hooks/screens/useEditProfileScreen";
import { Theme } from '../theme/unified-theme';
import { AdvancedPhotoEditor } from "../components/photo/AdvancedPhotoEditor";

interface EditProfileScreenProps {
  navigation: {
    goBack: () => void;
  };
}

function EditProfileScreen({
  navigation,
}: EditProfileScreenProps): JSX.Element {
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [avatarToEdit, setAvatarToEdit] = useState<string | undefined>(undefined);

  const {
    profileData,
    loading,
    hasChanges,
    updateField,
    handleSelectAvatar,
    handleSave,
    handleCancel,
  } = useEditProfileScreen();

  const handleSelectAvatarWithEditor = async () => {
    try {
      // This will launch the image picker
      await handleSelectAvatar();
      // If an avatar was selected, show the editor
      if (profileData.avatar) {
        setAvatarToEdit(profileData.avatar);
        setShowPhotoEditor(true);
      }
    } catch (error) {
      // Handle error
    }
  };

  const handlePhotoEditorSave = (editedUri: string) => {
    updateField("avatar", editedUri);
    setShowPhotoEditor(false);
    setAvatarToEdit(undefined);
  };

  const handlePhotoEditorCancel = () => {
    setShowPhotoEditor(false);
    setAvatarToEdit(undefined);
  };

  const onSubmit = async () => {
    haptic.success();
    const result = await handleSave();
    if (result?.shouldNavigate) {
      if (hasChanges) {
        Alert.alert("Success", "Profile updated successfully!", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        navigation.goBack();
      }
    }
  };

  const onCancel = () => {
    haptic.tap();
    const shouldNavigate = handleCancel();
    if (shouldNavigate) {
      navigation.goBack();
    }
  };
  
  const handleBackPress = () => {
    haptic.tap();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#6366f1", "#8b5cf6", Theme.colors.primary[500]]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Photo Editor Modal */}
      {showPhotoEditor && avatarToEdit && (
        <Modal visible={showPhotoEditor} animationType="slide" presentationStyle="fullScreen">
          <AdvancedPhotoEditor
            imageUri={avatarToEdit}
            onSave={handlePhotoEditorSave}
            onCancel={handlePhotoEditorCancel}
            aspectRatio={[1, 1]}
            maxWidth={512}
            maxHeight={512}
          />
        </Modal>
      )}

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            style={StyleSheet.flatten([
              styles.saveButton,
              (!hasChanges || loading) && styles.saveButtonDisabled,
            ])}
            onPress={onSubmit}
            disabled={!hasChanges || loading}
          >
            <Text
              style={StyleSheet.flatten([
                styles.saveButtonText,
                (!hasChanges || loading) && styles.saveButtonTextDisabled,
              ])}
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
                onPress={handleSelectAvatarWithEditor}
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
