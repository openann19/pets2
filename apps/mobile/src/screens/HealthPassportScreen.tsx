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
import { getExtendedColors } from '@/theme/adapters';

// Pet-first hooks
import { useHealthPassport } from '../hooks/domains/pet';

// Types
import type { RootStackScreenProps } from '../navigation/types';

type HealthPassportScreenProps = RootStackScreenProps<'HealthPassport'>;

export default function HealthPassportScreen({
  navigation,
  route
}: HealthPassportScreenProps) {
  const theme = useTheme();
  const colors = getExtendedColors(theme);
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
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Vaccination History
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            setModalType('vaccine');
            setShowAddModal(true);
          }}
        >
          <Text style={[styles.addButtonText, { color: colors.onPrimary }]}>
            ➕ Add Vaccine
          </Text>
        </TouchableOpacity>
      </View>

      {healthData?.vaccines && healthData.vaccines.length > 0 ? (
        healthData.vaccines.map((vaccine: any, index: number) => (
          <View key={index} style={[styles.healthCard, { backgroundColor: colors.bgElevated }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {vaccine.type}
              </Text>
              <View style={[
                styles.statusBadge,
                {
                  backgroundColor: vaccine.expiresAt && new Date(vaccine.expiresAt) > new Date()
                    ? colors.success
                    : colors.warning
                }
              ]}>
                <Text style={[styles.statusText, { color: colors.onPrimary }]}>
                  {vaccine.expiresAt && new Date(vaccine.expiresAt) > new Date() ? 'Current' : 'Expired'}
                </Text>
              </View>
            </View>

            <View style={styles.cardDetails}>
              <Text style={[styles.detailText, { color: colors.textMuted }]}>
                📅 Administered: {new Date(vaccine.administeredAt).toLocaleDateString()}
              </Text>
              {vaccine.expiresAt && (
                <Text style={[
                  styles.detailText,
                  {
                    color: new Date(vaccine.expiresAt) > new Date()
                      ? colors.success
                      : colors.danger
                  }
                ]}>
                  ⏰ Expires: {new Date(vaccine.expiresAt).toLocaleDateString()}
                </Text>
              )}
              <Text style={[styles.detailText, { color: colors.textMuted }]}>
                🩺 Vet: {vaccine.vetName}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <View style={[styles.emptyState, { backgroundColor: colors.bgElevated }]}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No vaccinations recorded
          </Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Keep your pet's vaccination records up to date for safe playdates and travel.
          </Text>
        </View>
      )}
    </View>
  );

  const renderMedicationsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Medications & Treatments
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            setModalType('medication');
            setShowAddModal(true);
          }}
        >
          <Text style={[styles.addButtonText, { color: colors.onPrimary }]}>
            ➕ Add Medication
          </Text>
        </TouchableOpacity>
      </View>

      {healthData?.medications && healthData.medications.length > 0 ? (
        healthData.medications.map((med: any, index: number) => (
          <View key={index} style={[styles.healthCard, { backgroundColor: colors.bgElevated }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {med.name}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: colors.info }]}>
                <Text style={[styles.statusText, { color: colors.onPrimary }]}>
                  Active
                </Text>
              </View>
            </View>

            <View style={styles.cardDetails}>
              <Text style={[styles.detailText, { color: colors.textMuted }]}>
                💊 Dosage: {med.dosage}
              </Text>
              <Text style={[styles.detailText, { color: colors.textMuted }]}>
                🔄 Frequency: {med.frequency}
              </Text>
              <Text style={[styles.detailText, { color: colors.textMuted }]}>
                📅 Prescribed: {new Date(med.prescribedAt).toLocaleDateString()}
              </Text>
              <Text style={[styles.detailText, { color: colors.textMuted }]}>
                🩺 Vet: {med.vetName}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <View style={[styles.emptyState, { backgroundColor: colors.bgElevated }]}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No medications recorded
          </Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Track your pet's medications and treatments for better care coordination.
          </Text>
        </View>
      )}
    </View>
  );

  const renderRemindersTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Upcoming Reminders
      </Text>

      {reminders && reminders.length > 0 ? (
        reminders.map((reminder: any, index: number) => (
          <View key={index} style={[styles.reminderCard, { backgroundColor: colors.bgElevated }]}>
            <View style={styles.reminderHeader}>
              <Text style={[styles.reminderTitle, { color: colors.text }]}>
                {reminder.title}
              </Text>
              <View style={[
                styles.priorityBadge,
                {
                  backgroundColor: reminder.priority === 'high' ? colors.danger :
                                   reminder.priority === 'medium' ? colors.warning :
                                   colors.success
                }
              ]}>
                <Text style={[styles.priorityText, { color: colors.onPrimary }]}>
                  {reminder.priority}
                </Text>
              </View>
            </View>

            <Text style={[styles.reminderDate, { color: colors.primary }]}>
              📅 Due: {new Date(reminder.dueAt).toLocaleDateString()}
            </Text>

            <Text style={[styles.reminderDesc, { color: colors.textMuted }]}>
              {reminder.description}
            </Text>
          </View>
        ))
      ) : (
        <View style={[styles.emptyState, { backgroundColor: colors.bgElevated }]}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            All caught up! 🎉
          </Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            No upcoming health reminders. We'll notify you when it's time for check-ups or renewals.
          </Text>
        </View>
      )}
    </View>
  );

  const renderActivityTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Activity Log (Coming Soon)
      </Text>

      <View style={[styles.comingSoon, { backgroundColor: colors.bgElevated }]}>
        <Text style={[styles.comingSoonTitle, { color: colors.text }]}>
          🏃‍♀️ Activity Tracking
        </Text>
        <Text style={[styles.comingSoonText, { color: colors.textMuted }]}>
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
        <View style={[styles.modalContent, { backgroundColor: colors.bg }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Add {modalType === 'vaccine' ? 'Vaccine' : 'Medication'} Record
          </Text>

          {modalType === 'vaccine' ? (
            <View style={styles.form}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bgElevated, color: colors.text }]}
                placeholder="Vaccine type (e.g., Rabies, DHPP)"
                placeholderTextColor={colors.textMuted}
                value={vaccineForm.type}
                onChangeText={(type) => setVaccineForm(prev => ({ ...prev, type }))}
              />
              <TextInput
                style={[styles.input, { backgroundColor: colors.bgElevated, color: colors.text }]}
                placeholder="Date administered (YYYY-MM-DD)"
                placeholderTextColor={colors.textMuted}
                value={vaccineForm.administeredAt}
                onChangeText={(administeredAt) => setVaccineForm(prev => ({ ...prev, administeredAt }))}
              />
              <TextInput
                style={[styles.input, { backgroundColor: colors.bgElevated, color: colors.text }]}
                placeholder="Veterinarian name"
                placeholderTextColor={colors.textMuted}
                value={vaccineForm.vetName}
                onChangeText={(vetName) => setVaccineForm(prev => ({ ...prev, vetName }))}
              />
            </View>
          ) : (
            <View style={styles.form}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bgElevated, color: colors.text }]}
                placeholder="Medication name"
                placeholderTextColor={colors.textMuted}
                value={medicationForm.name}
                onChangeText={(name) => setMedicationForm(prev => ({ ...prev, name }))}
              />
              <TextInput
                style={[styles.input, { backgroundColor: colors.bgElevated, color: colors.text }]}
                placeholder="Dosage (e.g., 1 tablet, 5ml)"
                placeholderTextColor={colors.textMuted}
                value={medicationForm.dosage}
                onChangeText={(dosage) => setMedicationForm(prev => ({ ...prev, dosage }))}
              />
              <TextInput
                style={[styles.input, { backgroundColor: colors.bgElevated, color: colors.text }]}
                placeholder="Frequency (e.g., twice daily, every 3 months)"
                placeholderTextColor={colors.textMuted}
                value={medicationForm.frequency}
                onChangeText={(frequency) => setMedicationForm(prev => ({ ...prev, frequency }))}
              />
              <TextInput
                style={[styles.input, { backgroundColor: colors.bgElevated, color: colors.text }]}
                placeholder="Veterinarian name"
                placeholderTextColor={colors.textMuted}
                value={medicationForm.vetName}
                onChangeText={(vetName) => setMedicationForm(prev => ({ ...prev, vetName }))}
              />
            </View>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={modalType === 'vaccine' ? handleAddVaccine : handleAddMedication}
            >
              <Text style={[styles.saveButtonText, { color: colors.onPrimary }]}>
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
          <Text style={{ color: colors.text }}>Loading health data...</Text>
        </View>
      </EliteContainer>
    );
  }

  return (
    <EliteContainer>
      <EliteHeader title="Health Passport" />

      {/* Tab Navigation */}
      <View style={[styles.tabBar, { backgroundColor: colors.bgElevated }]}>
        {(['vaccines', 'medications', 'reminders', 'activity'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              {
                color: activeTab === tab ? colors.primary : colors.textMuted
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
