/**
 * Status Modal Component
 * Modal for changing pet listing status
 */

import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { EliteButton } from '../../../components';
import { GlobalStyles } from '../../../animation';
import type { PetListing } from '../../../../hooks/screens/useAdoptionManagerScreen';

interface StatusModalProps {
  visible: boolean;
  selectedPet: PetListing | null;
  getStatusIcon: (status: string) => string;
  onStatusChange: (pet: PetListing, status: string) => void;
  onClose: () => void;
}

const STATUS_OPTIONS = ['active', 'pending', 'adopted', 'paused'] as const;

export const StatusModal: React.FC<StatusModalProps> = ({
  visible,
  selectedPet,
  getStatusIcon,
  onStatusChange,
  onClose,
}) => {
  if (!selectedPet) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={GlobalStyles['modalOverlay'] as any}>
        <View style={GlobalStyles['modalContent'] as any}>
          <Text style={GlobalStyles['heading2'] as any}>
            Change Status for {selectedPet.name}
          </Text>

          <View style={styles.statusOptions}>
            {STATUS_OPTIONS.map((status) => (
              <EliteButton
                key={status}
                title={`${getStatusIcon(status)} ${status.charAt(0).toUpperCase() + status.slice(1)}`}
                variant="ghost"
                onPress={() => {
                  onStatusChange(selectedPet, status);
                }}
                style={styles.statusOptionButton}
              />
            ))}
          </View>

          <EliteButton
            title="Cancel"
            variant="secondary"
            onPress={onClose}
            style={GlobalStyles['mt4'] as any}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  statusOptions: {
    marginTop: 16,
    gap: 12,
  },
  statusOptionButton: {
    width: '100%',
  },
});

