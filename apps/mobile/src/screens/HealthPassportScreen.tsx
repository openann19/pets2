/**
 * HEALTH PASSPORT SCREEN
 * Comprehensive health tracking with vaccine passport, medication reminders, and activity logging
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';

// Existing architecture components
import { EliteContainer, EliteHeader } from '../components/elite';
import { useTheme } from '@/theme';

// Pet-first hooks
import { useHealthPassport } from '../hooks/domains/pet';

// Types
import type { VaccineRecord, MedicationRecord } from '@pawfectmatch/core';
import type { RootStackScreenProps } from '../navigation/types';

type HealthPassportScreenProps = RootStackScreenProps<'HealthPassport'>;

export default function HealthPassportScreen({
  navigation,
  route
}: HealthPassportScreenProps) {
  const theme = useTheme();
  const { petId } = route.params;

  const {
    healthData,
    reminders,
    loading,
    addVaccineRecord,
    addMedicationRecord,
  } = useHealthPassport(petId);

  // UI state
  const [activeTab, setActiveTab] = useState<'vaccines' | 'medications' | 'reminders' | 'activity'>('vaccines');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<'vaccine' | 'medication' | null>(null);

  // Form state
  const [vaccineForm, setVaccineForm] = useState({
    type: '',
    administeredAt: '',
    vetName: '',
  });

  const [medicationForm, setMedicationForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
    vetName: '',
  });

  const handleAddVaccine = useCallback(async () => {
    if (!vaccineForm.type || !vaccineForm.administeredAt || !vaccineForm.vetName) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    try {
      await addVaccineRecord({
        type: vaccineForm.type,
        administeredAt: vaccineForm.administeredAt,
        vetName: vaccineForm.vetName,
      });

      setVaccineForm({ type: '', administeredAt: '', vetName: '' });
      setShowAddModal(false);
      Alert.alert('Success', 'Vaccine record added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add vaccine record. Please try again.');
    }
  }, [vaccineForm, addVaccineRecord]);

  const handleAddMedication = useCallback(async () => {
    if (!medicationForm.name || !medicationForm.dosage || !medicationForm.frequency || !medicationForm.vetName) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    try {
      await addMedicationRecord({
        name: medicationForm.name,
        dosage: medicationForm.dosage,
        frequency: medicationForm.frequency,
        prescribedAt: new Date().toISOString(),
        vetName: medicationForm.vetName,
      });

      setMedicationForm({ name: '', dosage: '', frequency: '', vetName: '' });
      setShowAddModal(false);
      Alert.alert('Success', 'Medication record added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add medication record. Please try again.');
    }
  }, [medicationForm, addMedicationRecord]);

  const renderVaccinesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Vaccination History
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            setModalType('vaccine');
            setShowAddModal(true);
          }}
        >
          <Text style={[styles.addButtonText, { color: theme.colors.primaryText }]}>
            ➕ Add Vaccine
          </Text>
        </TouchableOpacity>
      </View>

      {healthData?.vaccines && healthData.vaccines.length > 0 ? (
        healthData.vaccines.map((vaccine, index) => (
          <View key={index} style={[styles.healthCard, { backgroundColor: theme.colors.bgElevated }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                {vaccine.type}
              </Text>
              <View style={[
                styles.statusBadge,
                {
                  backgroundColor: vaccine.expiresAt && new Date(vaccine.expiresAt) > new Date()
                    ? theme.colors.success
                    : theme.colors.warning
                }
              ]}>
                <Text style={[styles.statusText, { color: theme.colors.primaryText }]}>
                  {vaccine.expiresAt && new Date(vaccine.expiresAt) > new Date() ? 'Current' : 'Expired'}
                </Text>
              </View>
            </View>

            <View style={styles.cardDetails}>
              <Text style={[styles.detailText, { color: theme.colors.textMuted }]}>
                📅 Administered: {new Date(vaccine.administeredAt).toLocaleDateString()}
              </Text>
              {vaccine.expiresAt && (
                <Text style={[
                  styles.detailText,
                  {
                    color: new Date(vaccine.expiresAt) > new Date()
                      ? theme.colors.success
                      : theme.colors.danger
                  }
                ]}>
                  ⏰ Expires: {new Date(vaccine.expiresAt).toLocaleDateString()}
                </Text>
              )}
              <Text style={[styles.detailText, { color: theme.colors.textMuted }]}>
                🩺 Vet: {vaccine.vetName}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <View style={[styles.emptyState, { backgroundColor: theme.colors.bgElevated }]}>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No vaccinations recorded
          </Text>
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            Keep your pet's vaccination records up to date for safe playdates and travel.
          </Text>
        </View>
      )}
    </View>
  );

  const renderMedicationsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Medications & Treatments
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            setModalType('medication');
            setShowAddModal(true);
          }}
        >
          <Text style={[styles.addButtonText, { color: theme.colors.primaryText }]}>
            ➕ Add Medication
          </Text>
        </TouchableOpacity>
      </View>

      {healthData?.medications && healthData.medications.length > 0 ? (
        healthData.medications.map((med, index) => (
          <View key={index} style={[styles.healthCard, { backgroundColor: theme.colors.bgElevated }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                {med.name}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: theme.colors.info }]}>
                <Text style={[styles.statusText, { color: theme.colors.primaryText }]}>
                  Active
                </Text>
              </View>
            </View>

            <View style={styles.cardDetails}>
              <Text style={[styles.detailText, { color: theme.colors.textMuted }]}>
                💊 Dosage: {med.dosage}
              </Text>
              <Text style={[styles.detailText, { color: theme.colors.textMuted }]}>
                🔄 Frequency: {med.frequency}
              </Text>
              <Text style={[styles.detailText, { color: theme.colors.textMuted }]}>
                📅 Prescribed: {new Date(med.prescribedAt).toLocaleDateString()}
              </Text>
              <Text style={[styles.detailText, { color: theme.colors.textMuted }]}>
                🩺 Vet: {med.vetName}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <View style={[styles.emptyState, { backgroundColor: theme.colors.bgElevated }]}>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No medications recorded
          </Text>
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            Track your pet's medications and treatments for better care coordination.
          </Text>
        </View>
      )}
    </View>
  );

  const renderRemindersTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Upcoming Reminders
      </Text>

      {reminders && reminders.length > 0 ? (
        reminders.map((reminder, index) => (
          <View key={index} style={[styles.reminderCard, { backgroundColor: theme.colors.bgElevated }]}>
            <View style={styles.reminderHeader}>
              <Text style={[styles.reminderTitle, { color: theme.colors.text }]}>
                {reminder.title}
              </Text>
              <View style={[
                styles.priorityBadge,
                {
                  backgroundColor: reminder.priority === 'high' ? theme.colors.danger :
                                   reminder.priority === 'medium' ? theme.colors.warning :
                                   theme.colors.success
                }
              ]}>
                <Text style={[styles.priorityText, { color: theme.colors.primaryText }]}>
                  {reminder.priority}
                </Text>
              </View>
            </View>

            <Text style={[styles.reminderDate, { color: theme.colors.primary }]}>
              📅 Due: {new Date(reminder.dueAt).toLocaleDateString()}
            </Text>

            <Text style={[styles.reminderDesc, { color: theme.colors.textMuted }]}>
              {reminder.description}
            </Text>
          </View>
        ))
      ) : (
        <View style={[styles.emptyState, { backgroundColor: theme.colors.bgElevated }]}>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            All caught up! 🎉
          </Text>
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            No upcoming health reminders. We'll notify you when it's time for check-ups or renewals.
          </Text>
        </View>
      )}
    </View>
  );

  const renderActivityTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Activity Log (Coming Soon)
      </Text>

      <View style={[styles.comingSoon, { backgroundColor: theme.colors.bgElevated }]}>
        <Text style={[styles.comingSoonTitle, { color: theme.colors.text }]}>
          🏃‍♀️ Activity Tracking
        </Text>
        <Text style={[styles.comingSoonText, { color: theme.colors.textMuted }]}>
          Track walks, playtime, and exercise to monitor your pet's health and activity levels.
        </Text>
      </View>
    </View>
  );

  const renderAddModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.bg }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            Add {modalType === 'vaccine' ? 'Vaccine' : 'Medication'} Record
          </Text>

          {modalType === 'vaccine' ? (
            <View style={styles.form}>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.bgElevated, color: theme.colors.text }]}
                placeholder="Vaccine type (e.g., Rabies, DHPP)"
                placeholderTextColor={theme.colors.textMuted}
                value={vaccineForm.type}
                onChangeText={(type) => setVaccineForm(prev => ({ ...prev, type }))}
              />
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.bgElevated, color: theme.colors.text }]}
                placeholder="Date administered (YYYY-MM-DD)"
                placeholderTextColor={theme.colors.textMuted}
                value={vaccineForm.administeredAt}
                onChangeText={(administeredAt) => setVaccineForm(prev => ({ ...prev, administeredAt }))}
              />
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.bgElevated, color: theme.colors.text }]}
                placeholder="Veterinarian name"
                placeholderTextColor={theme.colors.textMuted}
                value={vaccineForm.vetName}
                onChangeText={(vetName) => setVaccineForm(prev => ({ ...prev, vetName }))}
              />
            </View>
          ) : (
            <View style={styles.form}>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.bgElevated, color: theme.colors.text }]}
                placeholder="Medication name"
                placeholderTextColor={theme.colors.textMuted}
                value={medicationForm.name}
                onChangeText={(name) => setMedicationForm(prev => ({ ...prev, name }))}
              />
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.bgElevated, color: theme.colors.text }]}
                placeholder="Dosage (e.g., 1 tablet, 5ml)"
                placeholderTextColor={theme.colors.textMuted}
                value={medicationForm.dosage}
                onChangeText={(dosage) => setMedicationForm(prev => ({ ...prev, dosage }))}
              />
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.bgElevated, color: theme.colors.text }]}
                placeholder="Frequency (e.g., twice daily, every 3 months)"
                placeholderTextColor={theme.colors.textMuted}
                value={medicationForm.frequency}
                onChangeText={(frequency) => setMedicationForm(prev => ({ ...prev, frequency }))}
              />
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.bgElevated, color: theme.colors.text }]}
                placeholder="Veterinarian name"
                placeholderTextColor={theme.colors.textMuted}
                value={medicationForm.vetName}
                onChangeText={(vetName) => setMedicationForm(prev => ({ ...prev, vetName }))}
              />
            </View>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, { borderColor: theme.colors.border }]}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton, { backgroundColor: theme.colors.primary }]}
              onPress={modalType === 'vaccine' ? handleAddVaccine : handleAddMedication}
            >
              <Text style={[styles.saveButtonText, { color: theme.colors.primaryText }]}>
                Save Record
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <EliteContainer>
        <EliteHeader title="Health Passport" />
        <View style={styles.loading}>
          <Text style={{ color: theme.colors.text }}>Loading health data...</Text>
        </View>
      </EliteContainer>
    );
  }

  return (
    <EliteContainer>
      <EliteHeader title="Health Passport" />

      {/* Tab Navigation */}
      <View style={[styles.tabBar, { backgroundColor: theme.colors.bgElevated }]}>
        {(['vaccines', 'medications', 'reminders', 'activity'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              {
                color: activeTab === tab ? theme.colors.primary : theme.colors.textMuted
              }
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.container}>
        {activeTab === 'vaccines' && renderVaccinesTab()}
        {activeTab === 'medications' && renderMedicationsTab()}
        {activeTab === 'reminders' && renderRemindersTab()}
        {activeTab === 'activity' && renderActivityTab()}
      </ScrollView>

      {renderAddModal()}
    </EliteContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabContent: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  healthCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardDetails: {
    gap: 4,
  },
  detailText: {
    fontSize: 14,
  },
  reminderCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  reminderDate: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  reminderDesc: {
    fontSize: 14,
  },
  emptyState: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  comingSoon: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {},
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
