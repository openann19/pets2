import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { logger } from "@pawfectmatch/core";
import React, { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
        return formData.experience && formData.livingSpace;
      case 1:
        return formData.workSchedule && formData.reason;
      case 2:
        return formData.references[0].name && formData.references[0].phone;
      case 3:
        return formData.commitment;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateStep()) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      logger.info("Submitting application:", { petId, ...formData });
      Alert.alert(
        "Application Submitted!",
        `Your application for ${petName} has been submitted. The owner will review it and get back to you soon.`,
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } catch (error) {
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
              onPress={() => {
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
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
                { width: `${((currentStep + 1) / 4) * 100}%` },
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
              onPress={() => {
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
            onPress={handleNext}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backButton: {
    fontSize: 16,
    color: "#ec4899",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  placeholder: {
    width: 50,
  },
  progressContainer: {
    padding: 20,
    paddingTop: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ec4899",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1f2937",
    marginBottom: 12,
  },
  textArea: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1f2937",
    textAlignVertical: "top",
    minHeight: 100,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#fdf2f8",
    borderColor: "#ec4899",
  },
  optionText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  selectedOptionText: {
    color: "#ec4899",
    fontWeight: "600",
  },
  referenceContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  referenceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  agreementContainer: {
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
  },
  agreementTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#92400e",
    marginBottom: 12,
  },
  agreementText: {
    fontSize: 14,
    color: "#92400e",
    marginBottom: 4,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  backStepButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  backStepButtonText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "600",
  },
  nextButton: {
    backgroundColor: "#ec4899",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginLeft: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#d1d5db",
  },
  nextButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});

export default AdoptionApplicationScreen;
