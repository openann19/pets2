import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import { logger } from '@pawfectmatch/core';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { haptic } from '@/ui/haptics';
import { trackUserAction } from '@/services/analyticsService';

// Extracted components and hooks
import { useAdoptionApplicationForm } from './adoption-application/hooks/useAdoptionApplicationForm';
import {
  StepProgress,
  FormNavigation,
  ExperienceStep,
  LifestyleStep,
  ReferencesStep,
  CommitmentStep,
} from './adoption-application/components';
import { normalizeDigits } from './adoption-application/utils/validation';

type AdoptionStackParamList = {
  AdoptionApplication: { petId: string; petName: string };
};

type Props = NativeStackScreenProps<AdoptionStackParamList, 'AdoptionApplication'>;

const TOTAL_STEPS = 4;

const AdoptionApplicationScreen = ({ navigation, route }: Props) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { petId, petName } = route.params;
  const [currentStep, setCurrentStep] = useState(0);

  const formState = useAdoptionApplicationForm();

  const validateStep = () => {
    const { validateAdoptionApplicationStep } = require('../../utils/formValidation');
    const validation = validateAdoptionApplicationStep(formState.formData, currentStep);

    formState.setFieldErrors(validation.errors);

    return validation.valid;
  };

  const handleNext = () => {
    formState.setFieldErrors({}); // Clear previous errors

    if (!validateStep()) {
      haptic.error();
      const firstError =
        Object.values(formState.fieldErrors)[0] ||
        'Please fill in all required fields before proceeding.';
      Alert.alert('Validation Error', firstError);
      trackUserAction('adoption_application_validation_failed', {
        step: currentStep + 1,
        petId,
        petName,
        errors: Object.keys(formState.fieldErrors),
      });
      return;
    }

    haptic.confirm();
    formState.setFieldErrors({}); // Clear errors on successful validation
    trackUserAction('adoption_application_step_next', {
      step: currentStep + 1,
      petId,
      petName,
    });
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      const references = formState.formData.references
        .map((ref) => ({
          name: ref.name.trim(),
          phone: normalizeDigits(ref.phone),
          relationship: ref.relationship.trim(),
        }))
        .filter(
          (ref) => ref.name.length > 0 || ref.phone.length > 0 || ref.relationship.length > 0,
        );

      logger.info('adoption_application.submitted', {
        petId,
        petName,
        hasYard: formState.formData.hasYard,
        experience: formState.formData.experience,
        referenceCount: references.length,
        veterinarianProvided: formState.formData.veterinarian.name.trim().length > 0,
      });

      trackUserAction('adoption_application_submitted', {
        petId,
        petName,
        hasYard: formState.formData.hasYard,
        stepCount: TOTAL_STEPS,
      });

      haptic.success();

      Alert.alert(
        'Application Submitted!',
        `Your application for ${petName} has been submitted. The owner will review it and get back to you soon.`,
        [
          {
            text: 'OK',
            onPress: () => {
              haptic.tap();
              navigation.goBack();
            },
          },
        ],
      );
    } catch (error) {
      haptic.error();
      logger.error('Failed to submit adoption application', { error });
      trackUserAction('adoption_application_error', {
        petId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ExperienceStep
            formData={formState.formData}
            onUpdateForm={formState.updateFormData}
          />
        );
      case 1:
        return (
          <LifestyleStep
            formData={formState.formData}
            petName={petName}
            onUpdateForm={formState.updateFormData}
          />
        );
      case 2:
        return (
          <ReferencesStep
            formData={formState.formData}
            onUpdateReference={formState.updateReference}
            onUpdateVeterinarian={formState.updateVeterinarian}
          />
        );
      case 3:
        return (
          <CommitmentStep
            formData={formState.formData}
            onUpdateForm={formState.updateFormData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            testID="AdoptionApplicationScreen-nav-back"
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Returns to the previous screen"
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Apply for {petName}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Progress */}
        <StepProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderStep()}
        </ScrollView>

        {/* Footer */}
        <FormNavigation
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          canProceed={validateStep()}
          onBack={() => {
            haptic.tap();
            trackUserAction('adoption_application_step_back', {
              fromStep: currentStep + 1,
              petId,
            });
            setCurrentStep((prev) => prev - 1);
          }}
          onNext={handleNext}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    keyboardView: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    placeholder: {
      width: 50,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
      paddingTop: 0,
    },
  });
}

export default AdoptionApplicationScreen;
