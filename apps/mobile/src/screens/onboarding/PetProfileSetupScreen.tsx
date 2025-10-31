/**
 * Pet Profile Setup Screen
 * Refactored: Uses extracted components and hooks
 */

import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/theme';
import {
  BasicInfoStep,
  HealthInfoStep,
  PersonalityStep,
  PhysicalInfoStep,
  ProgressBar,
  StepNavigation,
} from './pet-profile/components';
import { usePetProfileSetup } from './pet-profile/hooks';

type OnboardingStackParamList = {
  UserIntent: undefined;
  PetProfileSetup: { userIntent: string };
  PreferencesSetup: { userIntent: string };
  Welcome: undefined;
};

type PetProfileSetupScreenProps = NativeStackScreenProps<OnboardingStackParamList, 'PetProfileSetup'>;

const PetProfileSetupScreen = ({ navigation, route }: PetProfileSetupScreenProps) => {
  const { userIntent } = route.params;
  const theme = useTheme();
  const styles = makeStyles(theme);
  const progressValue = useSharedValue(0);

  const handleComplete = async (formData: import('./pet-profile/types').PetFormData) => {
    // Navigate to preferences setup
    navigation.navigate('PreferencesSetup', { userIntent });
  };

  const {
    currentStep,
    formData,
    updateFormData,
    updateHealthInfo,
    togglePersonalityTag,
    handleNext,
    handleBack,
    canProceed,
  } = usePetProfileSetup({
    userIntent,
    onComplete: handleComplete,
  });

  React.useEffect(() => {
    progressValue.value = withTiming((currentStep + 1) / 4, { duration: 300 });
  }, [currentStep, progressValue]);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInfoStep
            formData={formData}
            onUpdate={(field, value) => updateFormData(field, value)}
          />
        );
      case 1:
        return (
          <PhysicalInfoStep
            formData={formData}
            onUpdate={(field, value) => updateFormData(field, value)}
          />
        );
      case 2:
        return (
          <PersonalityStep
            formData={formData}
            onUpdate={(field, value) => updateFormData(field, value)}
            onToggleTag={togglePersonalityTag}
          />
        );
      case 3:
        return (
          <HealthInfoStep
            formData={formData}
            onToggleHealth={(field, value) => updateHealthInfo(field, value)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <ProgressBar
            currentStep={currentStep}
            totalSteps={4}
            progressValue={progressValue}
          />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderStep()}
        </ScrollView>

        {/* Footer */}
        <StepNavigation
          currentStep={currentStep}
          totalSteps={4}
          canProceed={canProceed}
          onBack={currentStep === 0 ? () => navigation.goBack() : handleBack}
          onNext={handleNext}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    keyboardView: {
      flex: 1,
    },
    header: {
      padding: theme.spacing.lg + theme.spacing.xs,
      borderBottomWidth: 1,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg + theme.spacing.xs,
    },
  });
}

export default PetProfileSetupScreen;
