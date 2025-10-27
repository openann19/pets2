import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { PetBasicInfoSection } from "../components/create-pet/PetBasicInfoSection";
import { PetFormSubmit } from "../components/create-pet/PetFormSubmit";
import { PetIntentHealthSection } from "../components/create-pet/PetIntentHealthSection";
import { PetPersonalitySection } from "../components/create-pet/PetPersonalitySection";
import { PetPhotosSection } from "../components/create-pet/PetPhotosSection";
import { usePetForm } from "../hooks/usePetForm";
import { usePhotoManager } from "../hooks/usePhotoManager";
import type { RootStackScreenProps } from "../navigation/types";
import { useTheme } from '../theme/Provider';
import { ScreenShell } from '../ui/layout/ScreenShell';
import { AdvancedHeader, HeaderConfigs } from '../components/Advanced/AdvancedHeader';
import { haptic } from '../ui/haptics';

type CreatePetScreenProps = RootStackScreenProps<"CreatePet">;

export default function CreatePetScreen({ navigation }: CreatePetScreenProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  
  const { formData, errors, isSubmitting, updateFormData, handleSubmit } =
    usePetForm();

  const { photos, pickImage, removePhoto, setPrimaryPhoto } = usePhotoManager();

  const onSubmit = () => {
    haptic.confirm();
    handleSubmit(photos, navigation);
  };

  const handleBackPress = () => {
    haptic.tap();
    navigation.goBack();
  };

  return (
    <ScreenShell
      header={
        <AdvancedHeader
          {...HeaderConfigs.glass({
            title: 'Create Pet Profile',
            onBackPress: handleBackPress,
            showBackButton: true,
          })}
        />
      }
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Form Sections */}
          <Animated.View entering={FadeInDown.duration(220)}>
            <PetBasicInfoSection
              formData={formData}
              errors={errors}
              onUpdateFormData={updateFormData}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(240).delay(50)}>
            <PetPersonalitySection
              formData={formData}
              onUpdateFormData={updateFormData}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(260).delay(100)}>
            <PetIntentHealthSection
              formData={formData}
              errors={errors}
              onUpdateFormData={updateFormData}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(280).delay(150)}>
            <PetPhotosSection
              photos={photos}
              errors={errors}
              onPickImage={pickImage}
              onRemovePhoto={removePhoto}
              onSetPrimaryPhoto={setPrimaryPhoto}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(300).delay(200)}>
            <PetFormSubmit isSubmitting={isSubmitting} onSubmit={onSubmit} />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

const makeStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
});
