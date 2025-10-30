import type { AppTheme } from '@mobile/theme';
import { useTheme } from '@mobile/theme';
import { logger } from '@pawfectmatch/core';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Runtime theme has radius (not radii) and bgAlt/surfaceAlt in colors
type RuntimeTheme = AppTheme & {
  radius: {
    'xs': number;
    'sm': number;
    'md': number;
    'lg': number;
    'xl': number;
    '2xl': number;
    'full': number;
    'pill': number;
    'none': number;
  };
  colors: AppTheme['colors'] & { bgAlt?: string; surfaceAlt?: string };
};

type AdoptionStackParamList = {
  AdoptionContract: {
    applicationId: string;
    petName: string;
    applicantName: string;
  };
};

type Props = NativeStackScreenProps<AdoptionStackParamList, 'AdoptionContract'>;

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
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { applicationId, petName, applicantName } = route.params;
  const [contractTerms, setContractTerms] = useState<ContractTerms>({
    adoptionFee: '0',
    spayNeuterRequired: true,
    vaccinationRequired: true,
    microchipRequired: true,
    returnPolicy: true,
    homeVisitRequired: false,
    followUpRequired: true,
    specialConditions: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: '',
    },
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const updateContractTerms = (
    field: string,
    value: import('../../types/forms').FormFieldValue,
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
        'Contract Generated',
        'The adoption contract has been generated and sent to both parties for review and signature.',
        [
          {
            text: 'View Contract',
            onPress: () => {
              logger.info('View contract');
            },
          },
          {
            text: 'Send for Signature',
            onPress: () => {
              handleSendForSignature();
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate contract. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendForSignature = () => {
    Alert.alert(
      'Contract Sent',
      `The adoption contract for ${petName} has been sent to ${applicantName} for digital signature. You will be notified when it's signed.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          testID="AdoptionContractScreen-button-2"
          accessibilityLabel="navigation.goBack()"
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adoption Contract</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Contract Info */}
        <View style={styles.contractInfo}>
          <Text style={styles.contractTitle}>Adoption Contract for {petName}</Text>
          <Text style={styles.contractSubtitle}>Adopter: {applicantName}</Text>
          <Text style={styles.contractDate}>Date: {new Date().toLocaleDateString()}</Text>
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
                updateContractTerms('adoptionFee', text);
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
              key: 'spayNeuterRequired',
              label: 'Spay/Neuter Required',
              description: 'Pet must be spayed/neutered within 6 months',
            },
            {
              key: 'vaccinationRequired',
              label: 'Vaccination Updates Required',
              description: 'Keep vaccinations current per vet schedule',
            },
            {
              key: 'microchipRequired',
              label: 'Microchip Required',
              description: 'Pet must be microchipped for identification',
            },
          ].map((item) => (
            <View
              key={item.key}
              style={styles.switchContainer}
            >
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>{item.label}</Text>
                <Text style={styles.switchDescription}>{item.description}</Text>
              </View>
              <Switch
                value={contractTerms[item.key as keyof ContractTerms] as boolean}
                onValueChange={(value) => {
                  updateContractTerms(item.key, value);
                }}
                trackColor={{ false: theme.colors.onMuted, true: theme.colors.primary }}
                thumbColor={
                  contractTerms[item.key as keyof ContractTerms]
                    ? theme.colors.primary
                    : theme.colors.onSurface
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
              key: 'returnPolicy',
              label: 'Return Policy Agreement',
              description: 'Pet must be returned to original owner if unable to care for it',
            },
            {
              key: 'homeVisitRequired',
              label: 'Home Visit Required',
              description: 'Allow home visit before/after adoption',
            },
            {
              key: 'followUpRequired',
              label: 'Follow-up Check Required',
              description: 'Allow follow-up contact within first year',
            },
          ].map((item) => (
            <View
              key={item.key}
              style={styles.switchContainer}
            >
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>{item.label}</Text>
                <Text style={styles.switchDescription}>{item.description}</Text>
              </View>
              <Switch
                value={contractTerms[item.key as keyof ContractTerms] as boolean}
                onValueChange={(value) => {
                  updateContractTerms(item.key, value);
                }}
                trackColor={{ false: theme.colors.onMuted, true: theme.colors.primary }}
                thumbColor={
                  contractTerms[item.key as keyof ContractTerms]
                    ? theme.colors.primary
                    : theme.colors.onSurface
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
                updateEmergencyContact('name', text);
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
                updateEmergencyContact('phone', text);
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
                updateEmergencyContact('relationship', text);
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
              updateContractTerms('specialConditions', text);
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
            This contract is legally binding. Both parties agree to the terms outlined above. The
            adopter acknowledges responsibility for the pet's welfare, medical care, and safety.
            Violation of terms may result in return of the pet to the original owner.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={StyleSheet.flatten([styles.generateButton, isGenerating && styles.disabledButton])}
          testID="AdoptionContractScreen-button-2"
          accessibilityLabel="Interactive element"
          accessibilityRole="button"
          onPress={generateContract}
          disabled={isGenerating}
        >
          <Text style={styles.generateButtonText}>
            {isGenerating ? 'Generating Contract...' : 'Generate & Send Contract'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

function makeStyles(theme: AppTheme) {
  const themeRuntime = theme as RuntimeTheme;

  return {
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    header: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    placeholder: {
      width: 60,
    },
    backButton: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '600' as const,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: theme.colors.onSurface,
    },
    content: {
      flex: 1,
    },
    contractInfo: {
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      marginBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    contractTitle: {
      fontSize: 22,
      fontWeight: 'bold' as const,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    contractSubtitle: {
      fontSize: 16,
      color: theme.colors.onMuted,
      marginBottom: theme.spacing.xs,
    },
    contractDate: {
      fontSize: 14,
      color: theme.colors.onMuted,
    },
    section: {
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      marginBottom: theme.spacing.md,
      borderRadius: themeRuntime.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: theme.colors.onMuted,
      marginBottom: theme.spacing.md,
    },
    inputGroup: {
      marginBottom: theme.spacing.md,
    },
    label: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    input: {
      backgroundColor: theme.colors.bg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: themeRuntime.radius.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    helperText: {
      fontSize: 12,
      color: theme.colors.onMuted,
      marginTop: theme.spacing.xs,
    },
    textArea: {
      backgroundColor: theme.colors.bg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: themeRuntime.radius.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: 16,
      color: theme.colors.onSurface,
      minHeight: 100,
      textAlignVertical: 'top' as const,
    },
    switchContainer: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    switchInfo: {
      flex: 1,
      marginRight: theme.spacing.md,
    },
    switchLabel: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    switchDescription: {
      fontSize: 13,
      color: theme.colors.onMuted,
    },
    legalNotice: {
      padding: theme.spacing.lg,
      backgroundColor: themeRuntime.colors.bgAlt ?? theme.colors.surface,
      margin: theme.spacing.lg,
      borderRadius: themeRuntime.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    legalTitle: {
      fontSize: 16,
      fontWeight: 'bold' as const,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    legalText: {
      fontSize: 13,
      color: theme.colors.onMuted,
      lineHeight: 20,
    },
    footer: {
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    generateButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: themeRuntime.radius.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    disabledButton: {
      opacity: 0.6,
    },
    generateButtonText: {
      fontSize: 16,
      fontWeight: 'bold' as const,
      color: theme.colors.onSurface,
    },
  };
}

export default AdoptionContractScreen;
