/**
 * Create Alert Modal Component
 * Form for creating lost pet alert
 */
import React from 'react';
import { View, StyleSheet, Text, ScrollView, TextInput, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '@/theme';
import { PetSelector } from './PetSelector';
import type { AlertFormData } from '../types';

interface Pet {
  _id: string;
  name: string;
  breed?: string;
  species?: string;
}

interface CreateAlertModalProps {
  visible: boolean;
  pets: Pet[];
  selectedPet: Pet | null;
  formData: AlertFormData;
  onClose: () => void;
  onSelectPet: (pet: Pet) => void;
  onUpdateForm: (field: keyof AlertFormData, value: any) => void;
  onUseCurrentLocation: () => void;
  onSubmit: () => void;
}

export const CreateAlertModal: React.FC<CreateAlertModalProps> = ({
  visible,
  pets,
  selectedPet,
  formData,
  onClose,
  onSelectPet,
  onUpdateForm,
  onUseCurrentLocation,
  onSubmit,
}) => {
  const theme = useTheme();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        modalOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
        },
        modalContent: {
          borderRadius: theme.radii.lg,
          padding: theme.spacing.md,
          margin: theme.spacing.md,
          maxHeight: '90%',
          width: '90%',
          maxWidth: 400,
          backgroundColor: theme.colors.bg,
        },
        modalTitle: {
          fontSize: 18,
          fontWeight: '600' as const,
          marginBottom: theme.spacing.md,
          textAlign: 'center' as const,
          color: theme.colors.onSurface,
        },
        modalForm: {
          maxHeight: 500,
        },
        formLabel: {
          fontSize: 16,
          fontWeight: '500' as const,
          marginBottom: theme.spacing.sm,
          marginTop: theme.spacing.md,
          color: theme.colors.onSurface,
        },
        input: {
          borderWidth: 1,
          borderRadius: theme.radii.md,
          padding: theme.spacing.md,
          fontSize: 16,
          backgroundColor: theme.colors.surface,
          color: theme.colors.onSurface,
          borderColor: theme.colors.border,
        },
        textArea: {
          borderWidth: 1,
          borderRadius: theme.radii.md,
          padding: theme.spacing.md,
          fontSize: 16,
          minHeight: 80,
          textAlignVertical: 'top' as const,
          backgroundColor: theme.colors.surface,
          color: theme.colors.onSurface,
          borderColor: theme.colors.border,
        },
        currentLocationButton: {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radii.md,
          alignItems: 'center' as const,
          marginTop: theme.spacing.sm,
          backgroundColor: theme.colors.primary,
        },
        currentLocationText: {
          fontSize: 14,
          fontWeight: '500' as const,
          color: theme.colors.onPrimary,
        },
        radiusOptions: {
          flexDirection: 'row' as const,
          flexWrap: 'wrap' as const,
          gap: theme.spacing.sm,
          marginTop: theme.spacing.sm,
        },
        radiusOption: {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radii.md,
          borderWidth: 1,
        },
        radiusText: {
          fontSize: 14,
          fontWeight: '500' as const,
        },
        contactOptions: {
          gap: theme.spacing.sm,
          marginTop: theme.spacing.sm,
        },
        contactOption: {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radii.md,
          borderWidth: 1,
        },
        contactText: {
          fontSize: 16,
        },
        modalActions: {
          flexDirection: 'row' as const,
          justifyContent: 'space-between' as const,
          marginTop: theme.spacing.md,
          gap: theme.spacing.md,
        },
        modalButton: {
          flex: 1,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radii.md,
          alignItems: 'center' as const,
        },
        cancelButton: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        cancelButtonText: {
          fontSize: 16,
          fontWeight: '500' as const,
          color: theme.colors.onSurface,
        },
        createButton: {
          backgroundColor: theme.colors.danger,
        },
        createButtonText: {
          fontSize: 16,
          fontWeight: '600' as const,
          color: theme.colors.onPrimary,
        },
      }),
    [theme],
  );

  const contactMethods = [
    { value: 'inapp' as const, label: '💬 In-App Messages' },
    { value: 'phone' as const, label: '📞 Phone Call' },
    { value: 'email' as const, label: '📧 Email' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>🚨 Create Emergency Alert</Text>

          <ScrollView style={styles.modalForm}>
            <PetSelector pets={pets} selectedPet={selectedPet} onSelectPet={onSelectPet} />

            <Text style={styles.formLabel}>Last Seen Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter address or location description"
              placeholderTextColor={theme.colors.onMuted}
              value={formData.lastSeenLocation}
              onChangeText={(value) => onUpdateForm('lastSeenLocation', value)}
            />

            <TouchableOpacity style={styles.currentLocationButton} onPress={onUseCurrentLocation}>
              <Text style={styles.currentLocationText}>📍 Use Current Location</Text>
            </TouchableOpacity>

            <Text style={styles.formLabel}>Description</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe your pet, what they were wearing, any distinctive features..."
              placeholderTextColor={theme.colors.onMuted}
              value={formData.description}
              onChangeText={(value) => onUpdateForm('description', value)}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.formLabel}>Broadcast Radius</Text>
            <View style={styles.radiusOptions}>
              {[1, 3, 5, 10, 25].map((radius) => (
                <TouchableOpacity
                  key={radius}
                  style={[
                    styles.radiusOption,
                    {
                      backgroundColor:
                        formData.broadcastRadius === radius
                          ? theme.colors.primary
                          : theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => onUpdateForm('broadcastRadius', radius)}
                >
                  <Text
                    style={[
                      styles.radiusText,
                      {
                        color:
                          formData.broadcastRadius === radius
                            ? theme.colors.onPrimary
                            : theme.colors.onSurface,
                      },
                    ]}
                  >
                    {radius}km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formLabel}>Reward (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="$50"
              placeholderTextColor={theme.colors.onMuted}
              value={formData.reward}
              onChangeText={(value) => onUpdateForm('reward', value)}
              keyboardType="numeric"
            />

            <Text style={styles.formLabel}>Contact Method</Text>
            <View style={styles.contactOptions}>
              {contactMethods.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.contactOption,
                    {
                      backgroundColor:
                        formData.contactMethod === option.value
                          ? theme.colors.primary
                          : theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => onUpdateForm('contactMethod', option.value)}
                >
                  <Text
                    style={[
                      styles.contactText,
                      {
                        color:
                          formData.contactMethod === option.value
                            ? theme.colors.onPrimary
                            : theme.colors.onSurface,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {formData.contactMethod !== 'inapp' && (
              <>
                <Text style={styles.formLabel}>
                  {formData.contactMethod === 'phone' ? 'Phone Number' : 'Email Address'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={
                    formData.contactMethod === 'phone' ? '(555) 123-4567' : 'your@email.com'
                  }
                  placeholderTextColor={theme.colors.onMuted}
                  value={formData.contactValue}
                  onChangeText={(value) => onUpdateForm('contactValue', value)}
                  keyboardType={formData.contactMethod === 'phone' ? 'phone-pad' : 'email-address'}
                  autoCapitalize="none"
                />
              </>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.modalButton, styles.createButton]} onPress={onSubmit}>
              <Text style={styles.createButtonText}>🚨 Activate Emergency Alert</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

