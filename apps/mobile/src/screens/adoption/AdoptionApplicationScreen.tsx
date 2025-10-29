import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { logger } from "@pawfectmatch/core";
import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
年产import { haptic } from '@/ui/haptics';
import { track, trackUserAction } from '@/services/analyticsService';

type AdoptionStackParamList = {
  AdoptionApplication: { petId: string; petName: string };
};

type Props = NativeStackScreenProps<
  AdoptionStackParamList,
  "AdoptionApplication"
>;

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

const AdoptionApplicationScreen = ({ navigation, route }: Props) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { petId, petName } = route.params;
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ApplicationData>({
    experience: "",
    livingSpace: "",
    hasYard: false,
    otherPets: "",
    workSchedule: "",
    references: [
      { name: "", phone: "", relationship: "" },
      { name: "", phone: "", relationship: "" },
    ],
    veterinarian: { name: "", clinic: "", phone: "" },
    reason: "",
    commitment: "",
  });

  const updateFormData = (
    field: string,
    value: import("../../types/forms").FormFieldValue,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    haptic.selection();
  };

  // Phone validation utility
  const validatePhoneNumber = (phone: string): boolean => {
    // Remove common formatting characters
    const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
    // Match 10+ digits (US format) or international formats
    return /^[\d]{10,15}$/.test(cleaned);
  };

  const updateReference = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      references: prev.references.map((ref, i) =>
        i === index ? { ...ref, [field]: value } : ref,
      ),
    }));
  };

  const updateVeterinarian = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      veterinarian: { ...prev.veterinarian, [field]: value },
    }));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 0:
        return (
          formData.experience.trim() !== "" &&
          formData.livingSpace.trim() !== ""
        );
      case 1:
        return (
          formData.workSchedule.trim() !== "" &&
          formData.reason.trim() !== ""
        );
      case 2:
        const ref = formData.references[0];
        return (
          ref?.name.trim() !== "" &&
          ref?.phone.trim() !== "" &&
          validatePhoneNumber(ref.phone)
        );
      case 3:
        return formData.commitment.trim() !== "";
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateStep()) {
      haptic.error();
      const errorMessage =
        currentStep === 2
          ? "Please fill in all required fields with valid information. Phone numbers must be 10-15 digits."
          : "Please fill in all required fields.";
      Alert.alert("Missing Information", errorMessage);
      return;
    }
    haptic.confirm();
    trackUserAction("adoption_application_step_next", {
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
      haptic.success();
      logger.info("Blanketing application:", { petId, ...formData });
      track("adoption.application.submitted", {
        petId,
        petName,
        hasYard: formData.hasYard,
        experience: formData.experience,
      });
      Alert.alert(
        "Application Submitted!",
        `Your application for ${petName} has been submitted. The owner will review it and get back to you soon.`,
        [
          {
            text: "OK",
            onPress: () => {
              haptic.tap();
              navigation.goBack();
            },
          },
        ],
      );
    } catch (error) {
      haptic.error();
      logger.error("Failed to submit adoption application", { error });
      Alert.alert("Error", "Failed to submit application. Please try again.");
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
          {["First-time owner", "1-5 years", "5-10 years", "10+ years"].map(
            (option) => (
              <TouchableOpacity
                key={option}
                style={StyleSheet.flatten([
                  styles.optionButton,
                  formData.experience === option && styles.selectedOption,
                ])}
                testID={`AdoptionApplicationScreen-experience-${option.replace(/\s+/g, '-').toLowerCase()}`}
                accessibilityLabel={`Select pet experience: ${option}`}
                accessibilityRole="button"
                accessibilityState={{ selected: formData.experience === option }}
                onPress={() => {
                  updateFormData("experience", option);
                }}
              >
                <Text
                  style={StyleSheet.flatten([
                    styles.optionText,
                    formData.experience === option && styles.selectedOptionText,
                  ])}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Living Space *</Text>
        <View style={styles.optionsContainer}>
          {[
            "Apartment",
            "House with yard",
            "House without yard",
            "Farm/Rural",
          ].map((option) => (
            <TouchableOpacity
              key={option}
              style={StyleSheet.flatten([
                styles.optionButton,
                formData.livingSpace === option && styles.selectedOption,
              ])}
               testID="AdoptionApplicationScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                updateFormData("livingSpace", option);
              }}
            >
              <Text
                style={StyleSheet.flatten([
                  styles.optionText,
                  formData.livingSpace === option && styles.selectedOptionText,
                ])}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Do you have a yard?</Text>
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>
            {formData.hasYard ? "Yes" : "No"}
          </Text>
          <Switch
            value={formData.hasYard}
            onValueChange={(value) => {
              updateFormData("hasYard", value);
            }}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
            thumbColor={theme.colors.surface}
            testID="AdoptionApplicationScreen-hasYard-toggle"
            accessibilityLabel="Toggle yard availability"
            accessibilityRole="switch"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Other Pets</Text>
        <TextInput
          style={styles.textArea}
          value={formData.otherPets}
          onChangeText={(text) => {
            updateFormData("otherPets", text);
          }}
          placeholder="Tell us about any other pets you have..."
          multiline
          numberOfLines={3}
          accessibilityLabel="Other pets information"
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
            updateFormData("workSchedule", text);
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
            updateFormData("reason", text);
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
        <View key={index} style={styles.referenceContainer}>
          <Text style={styles.referenceTitle}>
            Reference {index + 1} {index === 0 ? "*" : ""}
          </Text>
          <TextInput
            style={styles.input}
            value={ref.name}
            onChangeText={(text) => {
              updateReference(index, "name", text);
            }}
            placeholder="Full Name"
          />
          <TextInput
            style={styles.input}
            value={ref.phone}
            onChangeText={(text) => {
              updateReference(index, "phone", text);
            }}
            placeholder="Phone Number"
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            value={ref.relationship}
            onChangeText={(text) => {
              updateReference(index, "relationship", text);
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
          updateVeterinarian("name", text);
        }}
        placeholder="Veterinarian Name"
      />
      <TextInput
        style={styles.input}
        value={formData.veterinarian.clinic}
        onChangeText={(text) => {
          updateVeterinarian("clinic", text);
        }}
        placeholder="Clinic Name"
      />
      <TextInput
        style={styles.input}
        value={formData.veterinarian.phone}
        onChangeText={(text) => {
          updateVeterinarian("phone", text);
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
            updateFormData("commitment", text);
          }}
          placeholder="Please explain your long-term commitment to caring for this pet, including financial responsibility, medical care, and what you would do if circumstances change..."
          multiline
          numberOfLines={5}
        />
      </View>

      <View style={styles.agreementContainer}>
        <Text style={styles.agreementTitle}>
          By submitting this application, I agree to:
        </Text>
        <Text style={styles.agreementText}>
          • Provide a safe, loving home for the pet
        </Text>
        <Text style={styles.agreementText}>
          • Cover all medical expenses and regular veterinary care
        </Text>
        <Text style={styles.agreementText}>
          • Allow a home visit if requested
        </Text>
        <Text style={styles.agreementText}>
          • Return the pet to the owner if unable to care for it
        </Text>
        <Text style={styles.agreementText}>
          • Provide updates on the pet's wellbeing
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            testID="AdoptionApplicationScreen-back-button"
            accessibilityLabel="Go back to previous screen"
            accessibilityRole="button"
            onPress={() => {
              haptic.tap();
              trackUserAction("adoption_application_back", { petId, petName });
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
          <View style={styles.progressBar}>
          <View
            style={StyleSheet.flatten([
              styles.progressFill,
              { width: `${((currentStep + 1) / 4) * 100}%` as const },
            ])}
          />
          </View>
          <Text style={styles.progressText}>Step {currentStep + 1} of 4</Text>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderStep()}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={styles.backStepButton}
               testID="AdoptionApplicationScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                setCurrentStep((prev) => prev - 1);
              }}
            >
              <Text style={styles.backStepButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={StyleSheet.flatten([
              styles.nextButton,
              !validateStep() && styles.disabledButton,
            ])}
             testID="AdoptionApplicationScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={handleNext}
            disabled={!validateStep()}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === 3 ? "Submit Application" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

function makeStyles(theme: AppTheme) {
  return {
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    keyboardView: {
      flex: 1,
    },
    header: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: "600" as const,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "bold" as const,
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
      borderRadius: themeRuntime.radius.sm,
      marginBottom: theme.spacing.sm,
    },
    progressFill: {
      height: "100%" as const,
      backgroundColor: theme.colors.primary,
      borderRadius: themeRuntime.radius.sm,
    },
    progressText: {
      fontSize: 14,
      color: theme.colors.onMuted,
      textAlign: "center" as const,
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
      fontWeight: "bold" as const,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600" as const,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
      marginTop: theme.spacing.sm,
    },
    inputGroup: {
      marginBottom: theme.spacing.xl,
    },
    label: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    input: {
      backgroundColor: theme.colors.bg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: themeRuntime.radius.md,
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
      borderRadius: themeRuntime.radius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: 16,
      color: theme.colors.onSurface,
      textAlignVertical: "top" as const,
      minHeight: 100,
    },
    optionsContainer: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      gap: theme.spacing.sm,
    },
    optionButton: {
      backgroundColor: themeRuntime.colors.bgAlt ?? theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: themeRuntime.radius.sm,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      alignItems: "center" as const,
    },
    selectedOption: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    optionText: {
      fontSize: 14,
      color: theme.colors.onMuted,
      fontWeight: "500" as const,
    },
    selectedOptionText: {
      color: theme.colors.onSurface,
      fontWeight: "600" as const,
    },
    referenceContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: themeRuntime.radius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    referenceTitle: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
    },
    agreementContainer: {
      backgroundColor: themeRuntime.colors.bgAlt ?? theme.colors.surface,
      borderRadius: themeRuntime.radius.md,
      padding: theme.spacing.xl,
      marginTop: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    agreementTitle: {
      fontSize: 16,
      fontWeight: "bold" as const,
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
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    backStepButton: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: themeRuntime.radius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    backStepButtonText: {
      fontSize: 16,
      color: theme.colors.onMuted,
      fontWeight: "600" as const,
    },
    nextButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: themeRuntime.radius.sm,
      flex: 1,
      marginLeft: theme.spacing.md,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    disabledButton: {
      backgroundColor: theme.colors.onMuted,
      opacity: 0.6,
    },
    nextButtonText: {
      fontSize: 16,
      color: theme.colors.onSurface,
      fontWeight: "600" as const,
    },
  };
}

export default AdoptionApplicationScreen;
