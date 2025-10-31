'use client';

/**
 * Pet Verification Component
 * Handles pet verification with microchip ID and vet documents
 */

import React, { useState } from 'react';
import { usePetProfile } from '@/hooks/domains/pet';
import { useToast } from '@/components/ui/toast';
import { logger } from '@pawfectmatch/core';
import {
  ShieldCheckIcon,
  IdentificationIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface PetVerificationProps {
  petId: string;
}

export default function PetVerification({ petId }: PetVerificationProps) {
  const { pet, verifyPet } = usePetProfile(petId);
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [microchipId, setMicrochipId] = useState('');
  const [vetDocument, setVetDocument] = useState<File | null>(null);
  const [showForm, setShowForm] = useState(false);

  const verificationStatus = pet?.verified
    ? 'verified'
    : pet?.microchipId
      ? 'pending'
      : 'unverified';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!microchipId && !vetDocument) {
      toast.error('Required', 'Please provide a microchip ID or vet document');
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyPet({
        microchipId: microchipId || undefined,
        vetDocument: vetDocument || undefined,
      });
      setShowForm(false);
      setMicrochipId('');
      setVetDocument(null);
    } catch (error) {
      logger.error('Error verifying pet:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVetDocument(file);
    }
  };

  const getStatusConfig = () => {
    switch (verificationStatus) {
      case 'verified':
        return {
          icon: CheckCircleIcon,
          color: 'green',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          textColor: 'text-green-800 dark:text-green-300',
          borderColor: 'border-green-500',
          title: 'Verified',
          description: 'Your pet has been verified and will appear with a verification badge.',
        };
      case 'pending':
        return {
          icon: ExclamationCircleIcon,
          color: 'yellow',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
          textColor: 'text-yellow-800 dark:text-yellow-300',
          borderColor: 'border-yellow-500',
          title: 'Pending Verification',
          description: 'Your verification request is being reviewed. This usually takes 24-48 hours.',
        };
      default:
        return {
          icon: XCircleIcon,
          color: 'gray',
          bgColor: 'bg-gray-100 dark:bg-gray-700',
          textColor: 'text-gray-800 dark:text-gray-300',
          borderColor: 'border-gray-400',
          title: 'Not Verified',
          description: 'Verify your pet to increase trust and improve match quality.',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r from-${statusConfig.color}-500 to-${statusConfig.color}-600 px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Verification</h2>
              <p className={`${statusConfig.color === 'green' ? 'text-green-100' : statusConfig.color === 'yellow' ? 'text-yellow-100' : 'text-gray-100'} text-sm`}>
                {statusConfig.description}
              </p>
            </div>
          </div>
          {verificationStatus !== 'verified' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-sm"
            >
              {showForm ? 'Cancel' : 'Verify Pet'}
            </button>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="p-6">
        <div className={`flex items-center gap-4 p-4 rounded-lg border-2 ${statusConfig.borderColor} ${statusConfig.bgColor}`}>
          <StatusIcon className={`w-8 h-8 ${statusConfig.textColor}`} />
          <div className="flex-1">
            <h3 className={`font-semibold ${statusConfig.textColor}`}>{statusConfig.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {verificationStatus === 'verified'
                ? 'Your pet is verified and trusted by the community.'
                : verificationStatus === 'pending'
                  ? 'Verification is in progress. You will be notified when complete.'
                  : 'Verification helps build trust and improves your pet\'s match potential.'}
            </p>
          </div>
        </div>

        {/* Current Info */}
        {pet?.microchipId && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <IdentificationIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white">Microchip ID:</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{pet.microchipId}</p>
          </div>
        )}

        {/* Verification Form */}
        <AnimatePresence>
          {showForm && verificationStatus !== 'verified' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6"
            >
              <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <IdentificationIcon className="w-4 h-4 inline mr-1" />
                    Microchip ID
                  </label>
                  <input
                    type="text"
                    value={microchipId}
                    onChange={(e) => setMicrochipId(e.target.value)}
                    placeholder="Enter microchip ID"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Found on your pet's collar or registration documents
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                    Veterinary Document (Optional)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Upload vet records, registration papers, or proof of ownership
                  </p>
                  {vetDocument && (
                    <p className="mt-2 text-sm text-green-600 dark:text-green-400">✓ {vetDocument.name} selected</p>
                  )}
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    <strong>Privacy:</strong> Your verification documents are securely stored and only used for
                    verification purposes. They are never shared with other users.
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setMicrochipId('');
                      setVetDocument(null);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || (!microchipId && !vetDocument)}
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {verificationStatus === 'verified' && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-800 dark:text-green-300">
                Your pet is verified! The verification badge will appear on your pet's profile and in search results.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

