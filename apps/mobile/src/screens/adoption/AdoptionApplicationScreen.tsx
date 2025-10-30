import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { haptic } from '@/ui/haptics';
import { trackUserAction } from '@/services/analyticsService';

type AdoptionStackParamList = {
  AdoptionApplication: { petId: string; petName: string };
};

type Props = NativeStackScreenProps<AdoptionStackParamList, 'AdoptionApplication'>;

interface ApplicationData {
  experience: string;
  livingSpace: string;
  hasYard: boolean;
  otherPets: string;
  workSchedule: string;
  references: { name: string; phone: string; relationship: string }[];
  veterinarian: { name: string; clinic: string; phone: string };
  reason: string;
  commitment: string;
}

const EXPERIENCE_OPTIONS = ['First-time owner', '1-5 years', '5-10 years', '10+ years'] as const;
const LIVING_SPACE_OPTIONS = [
  'Apartment',
  'House with yard',
  'House without yard',
  'Farm/Rural',
] as const;
const YARD_CHOICES: Array<{ label: string; value: boolean }> = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
];

const PHONE_DIGIT_REGEX = /\D/g;

const AdoptionApplicationScreen = ({ navigation, route }: Props) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { petId, petName } = route.params;
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ApplicationData>({
    experience: '',
    livingSpace: '',
    hasYard: false,
    otherPets: '',
    workSchedule: '',
    references: [
      { name: '', phone: '', relationship: '' },
      { name: '', phone: '', relationship: '' },
    ],
    veterinarian: { name: '', clinic: '', phone: '' },
    reason: '',
    commitment: '',
  });

  const updateFormData = <K extends keyof ApplicationData>(field: K, value: ApplicationData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const normalizeDigits = (phone: string): string => phone.replace(PHONE_DIGIT_REGEX, '');

  const validatePhoneNumber = (phone: string): boolean => {
    const digitsOnly = normalizeDigits(phone);
    return digitsOnly.length >= 7 && digitsOnly.length <= 15;
  };

  const updateReference = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      references: prev.references.map((ref, i) => (i === index ? { ...ref, [field]: value } : ref)),
    }));
  };

  const updateVeterinarian = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      veterinarian: { ...prev.veterinarian, [field]: value },
    }));
  };

  const isPrimaryReferenceComplete = (): boolean => {
    const primary = formData.references[0];
    if (!primary) {
      return false;
    }

    return (
      [primary.name, primary.phone, primary.relationship].every(
        (value) => value.trim().length > 0 && !value.match(/^\s*$/),
      ) && validatePhoneNumber(primary.phone)
    );
  };

  const validateStep = () => {
    switch (currentStep) {
      case 0:
        return (
          formData.experience.trim().length > 0 &&
          formData.livingSpace.trim().length > 0 &&
          !formData.experience.match(/^\s*$/) &&
          !formData.livingSpace.match(/^\s*$/)
        );
      case 1:
        return (
          formData.workSchedule.trim().length > 0 &&
          formData.reason.trim().length > 0 &&
          !formData.workSchedule.match(/^\s*$/) &&
          !formData.reason.match(/^\s*$/)
        );
      case 2:
        return isPrimaryReferenceComplete();
      case 3:
        return formData.commitment.trim().length > 0 && !formData.commitment.match(/^\s*$/);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateStep()) {
      haptic.error();
      const message =
        currentStep === 2
          ? 'Please provide a complete reference with a valid phone number (7-15 digits).'
          : 'Please fill in all required fields before proceeding.';
      Alert.alert('Missing Information', message);
      trackUserAction('adoption_application_validation_failed', {
        step: currentStep + 1,
        petId,
        petName,
      });
      return;
    }
    haptic.confirm();
    trackUserAction('adoption_application_step_next', {
      step: currentStep + 1,
      petId,
      petName,
    });
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      const references = formData.references
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
        hasYard: formData.hasYard,
        experience: formData.experience,
        referenceCount: references.length,
        veterinarianProvided: formData.veterinarian.name.trim().length > 0,
      });

      trackUserAction('adoption_application_submitted', {
        petId,
        petName,
        hasYard: formData.hasYard,
        stepCount: 4,
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
        return renderExperienceStep();
      case 1:
        return renderLifestyleStep();
      case 2:
        return renderReferencesStep();
      case 3:
        return renderCommitmentStep();
      default:
        return null;
    }
  };

  const renderExperienceStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Pet Experience</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pet Experience *</Text>
        <View style={styles.optionsContainer}>
          {EXPERIENCE_OPTIONS.map((option) => {
            const isSelected = formData.experience === option;
            return (
              <TouchableOpacity
                key={option}
                style={[styles.optionButton, isSelected && styles.selectedOption]}
                testID={`AdoptionApplicationScreen-experience-${option.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`}
                accessibilityRole="button"
                accessibilityLabel={`Select experience level ${option}`}
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  updateFormData('experience', option);
                }}
              >
                <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Living Space *</Text>
        <View style={styles.optionsContainer}>
          {LIVING_SPACE_OPTIONS.map((option) => {
            const isSelected = formData.livingSpace === option;
            return (
              <TouchableOpacity
                key={option}
                style={[styles.optionButton, isSelected && styles.selectedOption]}
                testID={`AdoptionApplicationScreen-livingSpace-${option.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`}
                accessibilityRole="button"
                accessibilityLabel={`Select living space ${option}`}
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  updateFormData('livingSpace', option);
                }}
              >
                <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Do you have a fenced yard?</Text>
        <View style={styles.toggleGroup}>
          {YARD_CHOICES.map(({ label, value }) => {
            const isSelected = formData.hasYard === value;
            return (
              <TouchableOpacity
                key={label}
                style={[styles.toggleOption, isSelected && styles.toggleOptionSelected]}
                testID={`AdoptionApplicationScreen-hasYard-${label.toLowerCase()}`}
                accessibilityRole="button"
                accessibilityLabel={`Select ${label} for fenced yard`}
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  updateFormData('hasYard', value);
                }}
              >
                <Text style={[styles.toggleText, isSelected && styles.toggleTextSelected]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Other Pets</Text>
        <TextInput
          style={styles.textArea}
          value={formData.otherPets}
          onChangeText={(text) => {
            updateFormData('otherPets', text);
          }}
          placeholder="Tell us about any other pets you have..."
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderLifestyleStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Lifestyle & Schedule</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Work Schedule *</Text>
        <TextInput
          style={styles.input}
          value={formData.workSchedule}
          onChangeText={(text) => {
            updateFormData('workSchedule', text);
          }}
          placeholder="e.g., 9-5 weekdays, work from home, etc."
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Why do you want to adopt {petName}? *</Text>
        <TextInput
          style={styles.textArea}
          value={formData.reason}
          onChangeText={(text) => {
            updateFormData('reason', text);
          }}
          placeholder="Tell us what draws you to this pet and what you hope to provide..."
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );

  const renderReferencesStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>References & Veterinarian</Text>

      <Text style={styles.sectionTitle}>Personal References</Text>
      {formData.references.map((ref, index) => (
        <View
          key={index}
          style={styles.referenceContainer}
        >
          <Text style={styles.referenceTitle}>
            Reference {index + 1} {index === 0 ? '*' : ''}
          </Text>
          <TextInput
            style={styles.input}
            value={ref.name}
            onChangeText={(text) => {
              updateReference(index, 'name', text);
            }}
            placeholder="Full Name"
          />
          <TextInput
            style={styles.input}
            value={ref.phone}
            onChangeText={(text) => {
              updateReference(index, 'phone', text);
            }}
            placeholder="Phone Number"
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            value={ref.relationship}
            onChangeText={(text) => {
              updateReference(index, 'relationship', text);
            }}
            placeholder="Relationship (friend, family, etc.)"
          />
        </View>
      ))}

      <Text style={styles.sectionTitle}>Veterinarian (Optional)</Text>
      <TextInput
        style={styles.input}
        value={formData.veterinarian.name}
        onChangeText={(text) => {
          updateVeterinarian('name', text);
        }}
        placeholder="Veterinarian Name"
      />
      <TextInput
        style={styles.input}
        value={formData.veterinarian.clinic}
        onChangeText={(text) => {
          updateVeterinarian('clinic', text);
        }}
        placeholder="Clinic Name"
      />
      <TextInput
        style={styles.input}
        value={formData.veterinarian.phone}
        onChangeText={(text) => {
          updateVeterinarian('phone', text);
        }}
        placeholder="Clinic Phone"
        keyboardType="phone-pad"
      />
    </View>
  );

  const renderCommitmentStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Commitment & Agreement</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Long-term Commitment *</Text>
        <TextInput
          style={styles.textArea}
          value={formData.commitment}
          onChangeText={(text) => {
            updateFormData('commitment', text);
          }}
          placeholder="Please explain your long-term commitment to caring for this pet, including financial responsibility, medical care, and what you would do if circumstances change..."
          multiline
          numberOfLines={5}
        />
      </View>

      <View style={styles.agreementContainer}>
        <Text style={styles.agreementTitle}>By submitting this application, I agree to:</Text>
        <Text style={styles.agreementText}>• Provide a safe, loving home for the pet</Text>
        <Text style={styles.agreementText}>
          • Cover all medical expenses and regular veterinary care
        </Text>
        <Text style={styles.agreementText}>• Allow a home visit if requested</Text>
        <Text style={styles.agreementText}>
          • Return the pet to the owner if unable to care for it
        </Text>
        <Text style={styles.agreementText}>• Provide updates on the pet's wellbeing</Text>
      </View>
    </View>
  );

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
        <View style={styles.progressContainer}>
          <View
            style={styles.progressBar}
            accessible
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 4, now: currentStep + 1 }}
          >
            <View style={[styles.progressFill, { width: `${((currentStep + 1) / 4) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>Step {currentStep + 1} of 4</Text>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {renderStep()}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={styles.backStepButton}
              testID="AdoptionApplicationScreen-prev-step"
              accessibilityRole="button"
              accessibilityLabel="Go to previous step"
              onPress={() => {
                haptic.tap();
                trackUserAction('adoption_application_step_back', {
                  fromStep: currentStep + 1,
                  petId,
                });
                setCurrentStep((prev) => prev - 1);
              }}
            >
              <Text style={styles.backStepButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.nextButton, !validateStep() && styles.disabledButton]}
            testID="AdoptionApplicationScreen-next-step"
            accessibilityRole="button"
            accessibilityLabel={
              currentStep === 3 ? 'Submit adoption application' : 'Go to next step'
            }
            accessibilityState={{ disabled: !validateStep() }}
            onPress={handleNext}
            disabled={!validateStep()}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === 3 ? 'Submit Application' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
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
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: "600",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.onSurface,
    },
    placeholder: {
      width: 50,
    },
    progressContainer: {
      padding: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
    },
    progressBar: {
      height: 4,
      backgroundColor: theme.colors.onMuted,
      borderRadius: theme.radii.sm,
      overflow: "hidden",
      marginBottom: theme.spacing.sm,
    },
    progressFill: {
      height: "100%",
      backgroundColor: theme.colors.primary,
    },
    progressText: {
      fontSize: 14,
      color: theme.colors.onMuted,
      textAlign: "center",
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
      paddingTop: 0,
    },
    stepContainer: {
      flex: 1,
    },
    stepTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
      marginTop: theme.spacing.sm,
    },
    inputGroup: {
      marginBottom: theme.spacing.xl,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    input: {
      backgroundColor: theme.colors.bg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: 16,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
    },
    textArea: {
      backgroundColor: theme.colors.bg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: 16,
      color: theme.colors.onSurface,
      textAlignVertical: "top",
      minHeight: 100,
    },
    optionsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -theme.spacing.sm,
    },
    optionButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.sm,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    selectedOption: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    optionText: {
      fontSize: 14,
      color: theme.colors.onMuted,
      fontWeight: "500",
    },
    selectedOptionText: {
      color: theme.colors.onPrimary,
      fontWeight: "600",
    },
    toggleGroup: {
      flexDirection: "row",
      marginTop: theme.spacing.sm,
      marginHorizontal: -theme.spacing.xs,
    },
    toggleOption: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.sm,
      paddingVertical: theme.spacing.sm,
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: theme.spacing.xs,
      backgroundColor: theme.colors.surface,
    },
    toggleOptionSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    toggleText: {
      fontSize: 14,
      color: theme.colors.onMuted,
      fontWeight: "500",
    },
    toggleTextSelected: {
      color: theme.colors.onPrimary,
      fontWeight: "600",
    },
    referenceContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    referenceTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
    },
    agreementContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.md,
      padding: theme.spacing.xl,
      marginTop: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    agreementTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
    },
    agreementText: {
      fontSize: 14,
      color: theme.colors.onMuted,
      marginBottom: theme.spacing.xs,
      lineHeight: 20,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    backStepButton: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radii.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    backStepButtonText: {
      fontSize: 16,
      color: theme.colors.onMuted,
      fontWeight: "600",
    },
    nextButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radii.sm,
      flex: 1,
      marginLeft: theme.spacing.md,
      alignItems: "center",
      justifyContent: "center",
    },
    disabledButton: {
      backgroundColor: theme.colors.onMuted,
      opacity: 0.6,
    },
    nextButtonText: {
      fontSize: 16,
      color: theme.colors.onPrimary,
      fontWeight: "600",
    },
  });
}

export default AdoptionApplicationScreen;
