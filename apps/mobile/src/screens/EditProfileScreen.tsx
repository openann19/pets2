import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@mobile/src/theme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdvancedPhotoEditor } from '../components/photo/AdvancedPhotoEditor';
import { useEditProfileScreen } from '../hooks/screens/useEditProfileScreen';
import { haptic } from '../ui/haptics';

interface EditProfileScreenProps {
  navigation: {
    goBack: () => void;
  };
}

function EditProfileScreen({ navigation }: EditProfileScreenProps): React.JSX.Element {
  const theme = useTheme();
  const { t } = useTranslation('common');
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
    updateField('avatar', editedUri);
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
        Alert.alert(t('edit_profile.success'), t('edit_profile.profile_updated'), [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
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
        colors={['#6366f1', '#8b5cf6', theme.colors.primary]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Photo Editor Modal */}
      {showPhotoEditor && avatarToEdit && (
        <Modal
          visible={showPhotoEditor}
          animationType="slide"
          presentationStyle="fullScreen"
        >
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
          <TouchableOpacity
            style={styles.cancelButton}
            testID="EditProfileScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={onCancel}
          >
            <Ionicons
              name="close"
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('edit_profile.title')}</Text>
          <TouchableOpacity
            style={StyleSheet.flatten([
              styles.saveButton,
              (!hasChanges || loading) && styles.saveButtonDisabled,
            ])}
            testID="EditProfileScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={onSubmit}
            disabled={!hasChanges || loading}
          >
            <Text
              style={StyleSheet.flatten([
                styles.saveButtonText,
                (!hasChanges || loading) && styles.saveButtonTextDisabled,
              ])}
            >
              {loading ? t('edit_profile.saving') : t('edit_profile.save')}
            </Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('edit_profile.profile_picture')}</Text>
              <TouchableOpacity
                style={styles.avatarContainer}
                testID="EditProfileScreen-button-2"
                accessibilityLabel="Interactive element"
                accessibilityRole="button"
                onPress={handleSelectAvatarWithEditor}
              >
                <BlurView
                  intensity={20}
                  style={styles.avatarBlur}
                >
                  {profileData.avatar ? (
                    <View style={styles.avatarWrapper}>
                      {/* In a real app, you'd show the actual image */}
                      <Ionicons
                        name="person"
                        size={40}
                        color="white"
                      />
                      <View style={styles.avatarOverlay}>
                        <Ionicons
                          name="camera"
                          size={20}
                          color="white"
                        />
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
                        <Ionicons
                          name="add"
                          size={24}
                          color="#6366f1"
                        />
                      </View>
                    </View>
                  )}
                </BlurView>
              </TouchableOpacity>
            </View>

            {/* Personal Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('edit_profile.personal_info')}</Text>

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>{t('edit_profile.first_name')}</Text>
                  <BlurView
                    intensity={15}
                    style={styles.inputBlur}
                  >
                    <TextInput
                      style={styles.input}
                      value={profileData.firstName}
                      onChangeText={(value) => {
                        updateField('firstName', value);
                      }}
                      placeholder={t('edit_profile.first_name_placeholder')}
                      placeholderTextColor="rgba(255,255,255,0.4)"
                    />
                  </BlurView>
                </View>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>{t('edit_profile.last_name')}</Text>
                  <BlurView
                    intensity={15}
                    style={styles.inputBlur}
                  >
                    <TextInput
                      style={styles.input}
                      value={profileData.lastName}
                      onChangeText={(value) => {
                        updateField('lastName', value);
                      }}
                      placeholder={t('edit_profile.last_name_placeholder')}
                      placeholderTextColor="rgba(255,255,255,0.4)"
                    />
                  </BlurView>
                </View>
              </View>

              <Text style={styles.inputLabel}>{t('edit_profile.email')}</Text>
              <BlurView
                intensity={15}
                style={styles.inputBlur}
              >
                <TextInput
                  style={styles.input}
                  value={profileData.email}
                  onChangeText={(value) => {
                    updateField('email', value);
                  }}
                  placeholder={t('edit_profile.email_placeholder')}
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </BlurView>

              <Text style={styles.inputLabel}>{t('edit_profile.phone')}</Text>
              <BlurView
                intensity={15}
                style={styles.inputBlur}
              >
                <TextInput
                  style={styles.input}
                  value={profileData.phone}
                  onChangeText={(value) => {
                    updateField('phone', value);
                  }}
                  placeholder={t('edit_profile.phone_placeholder')}
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  keyboardType="phone-pad"
                />
              </BlurView>

              <Text style={styles.inputLabel}>{t('edit_profile.location')}</Text>
              <BlurView
                intensity={15}
                style={styles.inputBlur}
              >
                <TextInput
                  style={styles.input}
                  value={profileData.location}
                  onChangeText={(value) => {
                    updateField('location', value);
                  }}
                  placeholder={t('edit_profile.location_placeholder')}
                  placeholderTextColor="rgba(255,255,255,0.4)"
                />
              </BlurView>
            </View>

            {/* Bio Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('edit_profile.about_me')}</Text>
              <BlurView
                intensity={15}
                style={styles.bioInputBlur}
              >
                <TextInput
                  style={styles.bioInput}
                  value={profileData.bio}
                  onChangeText={(value) => {
                    updateField('bio', value);
                  }}
                  placeholder={t('edit_profile.bio_placeholder')}
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                />
              </BlurView>
              <Text style={styles.charCount}>
                {profileData.bio.length}/500 {t('edit_profile.characters')}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cancelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarBlur: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
  },
  addPhotoOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputHalf: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  inputBlur: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    fontSize: 16,
  },
  bioInputBlur: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 120,
  },
  bioInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    fontSize: 16,
    height: '100%',
  },
  charCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'right',
    marginTop: 4,
  },
  spacer: {
    height: 100,
  },
});

export default EditProfileScreen;
