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
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme } from '../../theme/unified-theme';

type AdoptionStackParamList = {
  AdoptionContract: {
    applicationId: string;
    petName: string;
    applicantName: string;
  };
};

type Props = NativeStackScreenProps<AdoptionStackParamList, "AdoptionContract">;

interface ContractTerms {
  adoptionFee: string;
  spayNeuterRequired: boolean;
  vaccinationRequired: boolean;
  microchipRequired: boolean;
  returnPolicy: boolean;
  homeVisitRequired: boolean;
  followUpRequired: boolean;
  specialConditions: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

const AdoptionContractScreen = ({ navigation, route }: Props) => {
  const { applicationId, petName, applicantName } = route.params;
  const [contractTerms, setContractTerms] = useState<ContractTerms>({
    adoptionFee: "0",
    spayNeuterRequired: true,
    vaccinationRequired: true,
    microchipRequired: true,
    returnPolicy: true,
    homeVisitRequired: false,
    followUpRequired: true,
    specialConditions: "",
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const updateContractTerms = (
    field: string,
    value: import("../../types/forms").FormFieldValue,
  ) => {
    setContractTerms((prev) => ({ ...prev, [field]: value }));
  };

  const updateEmergencyContact = (field: string, value: string) => {
    setContractTerms((prev) => ({
      ...prev,
      emergencyContact: { ...prev.emergencyContact, [field]: value },
    }));
  };

  const generateContract = async () => {
    setIsGenerating(true);
    try {
      // Simulate contract generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert(
        "Contract Generated",
        "The adoption contract has been generated and sent to both parties for review and signature.",
        [
          {
            text: "View Contract",
            onPress: () => {
              logger.info("View contract");
            },
          },
          {
            text: "Send for Signature",
            onPress: () => {
              handleSendForSignature();
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert("Error", "Failed to generate contract. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendForSignature = () => {
    Alert.alert(
      "Contract Sent",
      `The adoption contract for ${petName} has been sent to ${applicantName} for digital signature. You will be notified when it's signed.`,
      [{ text: "OK", onPress: () => navigation.goBack() }],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adoption Contract</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contract Info */}
        <View style={styles.contractInfo}>
          <Text style={styles.contractTitle}>
            Adoption Contract for {petName}
          </Text>
          <Text style={styles.contractSubtitle}>Adopter: {applicantName}</Text>
          <Text style={styles.contractDate}>
            Date: {new Date().toLocaleDateString()}
          </Text>
        </View>

        {/* Financial Terms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Financial Terms</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adoption Fee ($)</Text>
            <TextInput
              style={styles.input}
              value={contractTerms.adoptionFee}
              onChangeText={(text) => {
                updateContractTerms("adoptionFee", text);
              }}
              placeholder="0"
              keyboardType="numeric"
            />
            <Text style={styles.helperText}>
              Set to 0 for free adoption. Fee helps cover medical expenses.
            </Text>
          </View>
        </View>

        {/* Medical Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏥 Medical Requirements</Text>

          {[
            {
              key: "spayNeuterRequired",
              label: "Spay/Neuter Required",
              description: "Pet must be spayed/neutered within 6 months",
            },
            {
              key: "vaccinationRequired",
              label: "Vaccination Updates Required",
              description: "Keep vaccinations current per vet schedule",
            },
            {
              key: "microchipRequired",
              label: "Microchip Required",
              description: "Pet must be microchipped for identification",
            },
          ].map((item) => (
            <View key={item.key} style={styles.switchContainer}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>{item.label}</Text>
                <Text style={styles.switchDescription}>{item.description}</Text>
              </View>
              <Switch
                value={
                  contractTerms[item.key as keyof ContractTerms] as boolean
                }
                onValueChange={(value) => {
                  updateContractTerms(item.key, value);
                }}
                trackColor={{ false: "Theme.colors.neutral[200]", true: "#fce7f3" }}
                thumbColor={
                  contractTerms[item.key as keyof ContractTerms]
                    ? "Theme.colors.primary[500]"
                    : "Theme.colors.neutral[400]"
                }
              />
            </View>
          ))}
        </View>

        {/* Adoption Policies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Adoption Policies</Text>

          {[
            {
              key: "returnPolicy",
              label: "Return Policy Agreement",
              description:
                "Pet must be returned to original owner if unable to care for it",
            },
            {
              key: "homeVisitRequired",
              label: "Home Visit Required",
              description: "Allow home visit before/after adoption",
            },
            {
              key: "followUpRequired",
              label: "Follow-up Check Required",
              description: "Allow follow-up contact within first year",
            },
          ].map((item) => (
            <View key={item.key} style={styles.switchContainer}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>{item.label}</Text>
                <Text style={styles.switchDescription}>{item.description}</Text>
              </View>
              <Switch
                value={
                  contractTerms[item.key as keyof ContractTerms] as boolean
                }
                onValueChange={(value) => {
                  updateContractTerms(item.key, value);
                }}
                trackColor={{ false: "Theme.colors.neutral[200]", true: "#fce7f3" }}
                thumbColor={
                  contractTerms[item.key as keyof ContractTerms]
                    ? "Theme.colors.primary[500]"
                    : "Theme.colors.neutral[400]"
                }
              />
            </View>
          ))}
        </View>

        {/* Emergency Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚨 Emergency Contact</Text>
          <Text style={styles.sectionSubtitle}>
            Backup contact in case adopter cannot be reached
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Name</Text>
            <TextInput
              style={styles.input}
              value={contractTerms.emergencyContact.name}
              onChangeText={(text) => {
                updateEmergencyContact("name", text);
              }}
              placeholder="Full Name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={contractTerms.emergencyContact.phone}
              onChangeText={(text) => {
                updateEmergencyContact("phone", text);
              }}
              placeholder="Phone Number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Relationship</Text>
            <TextInput
              style={styles.input}
              value={contractTerms.emergencyContact.relationship}
              onChangeText={(text) => {
                updateEmergencyContact("relationship", text);
              }}
              placeholder="e.g., Friend, Family Member, Veterinarian"
            />
          </View>
        </View>

        {/* Special Conditions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Special Conditions</Text>
          <Text style={styles.sectionSubtitle}>
            Any additional terms or conditions specific to this adoption
          </Text>

          <TextInput
            style={styles.textArea}
            value={contractTerms.specialConditions}
            onChangeText={(text) => {
              updateContractTerms("specialConditions", text);
            }}
            placeholder="Enter any special conditions, restrictions, or requirements..."
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Legal Notice */}
        <View style={styles.legalNotice}>
          <Text style={styles.legalTitle}>⚖️ Legal Notice</Text>
          <Text style={styles.legalText}>
            This contract is legally binding. Both parties agree to the terms
            outlined above. The adopter acknowledges responsibility for the
            pet's welfare, medical care, and safety. Violation of terms may
            result in return of the pet to the original owner.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={StyleSheet.flatten([
            styles.generateButton,
            isGenerating && styles.disabledButton,
          ])}
          onPress={generateContract}
          disabled={isGenerating}
        >
          <Text style={styles.generateButtonText}>
            {isGenerating
              ? "Generating Contract..."
              : "Generate & Send Contract"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "Theme.colors.neutral[0]",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "Theme.colors.neutral[100]",
  },
  backButton: {
    fontSize: 16,
    color: "Theme.colors.primary[500]",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "Theme.colors.neutral[800]",
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  contractInfo: {
    backgroundColor: "Theme.colors.background.secondary",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: "center",
  },
  contractTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "Theme.colors.neutral[800]",
    marginBottom: 8,
    textAlign: "center",
  },
  contractSubtitle: {
    fontSize: 16,
    color: "Theme.colors.neutral[500]",
    marginBottom: 4,
  },
  contractDate: {
    fontSize: 14,
    color: "Theme.colors.neutral[400]",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "Theme.colors.neutral[800]",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "Theme.colors.neutral[500]",
    marginBottom: 16,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "Theme.colors.neutral[700]",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "Theme.colors.background.secondary",
    borderWidth: 1,
    borderColor: "Theme.colors.neutral[200]",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "Theme.colors.neutral[800]",
  },
  textArea: {
    backgroundColor: "Theme.colors.background.secondary",
    borderWidth: 1,
    borderColor: "Theme.colors.neutral[200]",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "Theme.colors.neutral[800]",
    textAlignVertical: "top",
    minHeight: 100,
  },
  helperText: {
    fontSize: 12,
    color: "Theme.colors.neutral[400]",
    marginTop: 4,
    lineHeight: 16,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "Theme.colors.background.secondary",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "Theme.colors.neutral[800]",
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: "Theme.colors.neutral[500]",
    lineHeight: 18,
  },
  legalNotice: {
    backgroundColor: "#fef3c7",
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  legalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#92400e",
    marginBottom: 12,
  },
  legalText: {
    fontSize: 14,
    color: "#92400e",
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "Theme.colors.neutral[100]",
  },
  generateButton: {
    backgroundColor: "Theme.colors.primary[500]",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "Theme.colors.neutral[300]",
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "Theme.colors.neutral[0]",
  },
});

export default AdoptionContractScreen;
