'use client';

/**
 * Health Passport Component
 * Displays and manages pet health records including vaccines, medications, and reminders
 */

import React, { useState } from 'react';
import { useHealthPassport } from '@/hooks/domains/pet';
import { useToast } from '@/components/ui/toast';
import { logger } from '@pawfectmatch/core';
import {
  PlusIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import type { VaccineRecord, MedicationRecord } from '@pawfectmatch/core';

interface HealthPassportProps {
  petId: string;
  petName?: string;
}

export default function HealthPassport({ petId, petName = 'Pet' }: HealthPassportProps) {
  const { healthData, reminders, loading, addVaccineRecord, addMedicationRecord } = useHealthPassport(petId);
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'vaccines' | 'medications' | 'reminders'>('vaccines');
  const [showAddModal, setShowAddModal] = useState<'vaccine' | 'medication' | null>(null);

  const vaccines = healthData?.vaccines || [];
  const medications = healthData?.medications || [];

  const handleAddVaccine = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const record: VaccineRecord = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      administeredAt: formData.get('administeredAt') as string,
      administeredBy: formData.get('administeredBy') as string || 'Vet Clinic',
      nextDue: formData.get('nextDue') as string || undefined,
      lotNumber: formData.get('lotNumber') as string || undefined,
      notes: formData.get('notes') as string || undefined,
    };

    try {
      await addVaccineRecord(record);
      setShowAddModal(null);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      logger.error('Error adding vaccine:', error);
    }
  };

  const handleAddMedication = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const record: MedicationRecord = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string || undefined,
      dosage: formData.get('dosage') as string,
      frequency: formData.get('frequency') as string,
      prescribedBy: formData.get('prescribedBy') as string || 'Vet',
      notes: formData.get('notes') as string || undefined,
    };

    try {
      await addMedicationRecord(record);
      setShowAddModal(null);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      logger.error('Error adding medication:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (loading && !healthData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Health Passport</h2>
              <p className="text-green-100 text-sm">{petName}'s health records</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(activeTab === 'vaccines' ? 'vaccine' : 'medication')}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center gap-2 transition-colors backdrop-blur-sm"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add {activeTab === 'vaccines' ? 'Vaccine' : 'Medication'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab('vaccines')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'vaccines'
                ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ShieldCheckIcon className="w-5 h-5" />
              <span>Vaccines ({vaccines.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('medications')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'medications'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <BeakerIcon className="w-5 h-5" />
              <span>Medications ({medications.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'reminders'
                ? 'border-b-2 border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              <span>Reminders ({reminders.length})</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'vaccines' && (
          <div className="space-y-4">
            {vaccines.length > 0 ? (
              vaccines.map((vaccine: VaccineRecord) => (
                <motion.div
                  key={vaccine.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{vaccine.name}</h3>
                        {vaccine.nextDue && isOverdue(vaccine.nextDue) && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs rounded-full flex items-center gap-1">
                            <ExclamationTriangleIcon className="w-3 h-3" />
                            Overdue
                          </span>
                        )}
                        {vaccine.nextDue && !isOverdue(vaccine.nextDue) && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs rounded-full flex items-center gap-1">
                            <CheckCircleIcon className="w-3 h-3" />
                            Up to date
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-medium">Type:</span> {vaccine.type}
                        </div>
                        <div>
                          <span className="font-medium">Administered:</span> {formatDate(vaccine.administeredAt)}
                        </div>
                        {vaccine.administeredBy && (
                          <div>
                            <span className="font-medium">By:</span> {vaccine.administeredBy}
                          </div>
                        )}
                        {vaccine.nextDue && (
                          <div>
                            <span className="font-medium">Next Due:</span>{' '}
                            <span className={isOverdue(vaccine.nextDue) ? 'text-red-600 dark:text-red-400' : ''}>
                              {formatDate(vaccine.nextDue)}
                            </span>
                          </div>
                        )}
                      </div>
                      {vaccine.notes && (
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{vaccine.notes}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <ShieldCheckIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No vaccine records yet</p>
                <button
                  onClick={() => setShowAddModal('vaccine')}
                  className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                >
                  Add First Vaccine
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'medications' && (
          <div className="space-y-4">
            {medications.length > 0 ? (
              medications.map((medication: MedicationRecord) => (
                <motion.div
                  key={medication.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{medication.name}</h3>
                        {medication.endDate && new Date(medication.endDate) > new Date() && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-medium">Dosage:</span> {medication.dosage}
                        </div>
                        <div>
                          <span className="font-medium">Frequency:</span> {medication.frequency}
                        </div>
                        <div>
                          <span className="font-medium">Start:</span> {formatDate(medication.startDate)}
                        {medication.endDate && (
                          <>
                            {' '}
                            <span className="font-medium">End:</span> {formatDate(medication.endDate)}
                          </>
                        )}
                      </div>
                        {medication.prescribedBy && (
                          <div>
                            <span className="font-medium">Prescribed by:</span> {medication.prescribedBy}
                          </div>
                        )}
                      </div>
                      {medication.notes && (
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{medication.notes}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <BeakerIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No medication records yet</p>
                <button
                  onClick={() => setShowAddModal('medication')}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                >
                  Add First Medication
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reminders' && (
          <div className="space-y-4">
            {reminders.length > 0 ? (
              reminders.map((reminder, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border ${
                    reminder.isOverdue
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon
                      className={`w-6 h-6 flex-shrink-0 ${
                        reminder.isOverdue ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                      }`}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{reminder.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Due: {formatDate(reminder.dueDate)}
                      </p>
                      <span className="inline-block mt-2 px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                        {reminder.type}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No reminders at this time</p>
                <p className="text-xs mt-2">Reminders will appear here when vaccines or medications are due</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Vaccine Modal */}
      <AnimatePresence>
        {showAddModal === 'vaccine' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Vaccine Record</h3>
              <form onSubmit={handleAddVaccine} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Vaccine Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type *
                  </label>
                  <input
                    type="text"
                    name="type"
                    required
                    placeholder="e.g., Rabies, DHPPL"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Administered Date *
                  </label>
                  <input
                    type="date"
                    name="administeredAt"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Next Due Date
                  </label>
                  <input
                    type="date"
                    name="nextDue"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Administered By
                  </label>
                  <input
                    type="text"
                    name="administeredBy"
                    placeholder="Vet Clinic"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(null)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  >
                    Add Vaccine
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Medication Modal */}
      <AnimatePresence>
        {showAddModal === 'medication' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Medication Record</h3>
              <form onSubmit={handleAddMedication} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Medication Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    name="dosage"
                    required
                    placeholder="e.g., 10mg"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Frequency *
                  </label>
                  <input
                    type="text"
                    name="frequency"
                    required
                    placeholder="e.g., Once daily, Every 12 hours"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prescribed By
                  </label>
                  <input
                    type="text"
                    name="prescribedBy"
                    placeholder="Vet Name"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(null)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                    Add Medication
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

