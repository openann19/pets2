'use client';

/**
 * Pet Availability Component
 * Manages pet availability for playdates and meetups
 */

import React, { useState } from 'react';
import { usePetProfile } from '@/hooks/domains/pet';
import { useToast } from '@/components/ui/toast';
import { CalendarIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import type { Pet } from '@pawfectmatch/core';

interface PetAvailabilityProps {
  petId: string;
}

export default function PetAvailability({ petId }: PetAvailabilityProps) {
  const { pet, updateAvailability } = usePetProfile(petId);
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const availability = pet?.availability || {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  };

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
  const timeSlots = [
    'Morning (6am - 12pm)',
    'Afternoon (12pm - 5pm)',
    'Evening (5pm - 9pm)',
    'Night (9pm - 12am)',
  ];

  const handleToggleTimeSlot = async (day: typeof daysOfWeek[number], slot: string) => {
    if (!pet) return;

    const dayAvailability = availability[day] || [];
    const newAvailability = dayAvailability.includes(slot)
      ? dayAvailability.filter((s) => s !== slot)
      : [...dayAvailability, slot];

    const updatedAvailability = {
      ...availability,
      [day]: newAvailability,
    };

    try {
      await updateAvailability(updatedAvailability);
      toast.success('Availability Updated', 'Pet availability has been updated successfully');
    } catch (error) {
      toast.error('Update Failed', 'Failed to update availability. Please try again.');
    }
  };

  const formatDayName = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Availability</h2>
              <p className="text-blue-100 text-sm">Set when your pet is available for playdates</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-sm"
          >
            {isEditing ? 'Done' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {daysOfWeek.map((day, index) => (
          <motion.div
            key={day}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="mb-4 last:mb-0"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">{formatDayName(day)}</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {availability[day]?.length || 0} time slots
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {timeSlots.map((slot) => {
                const isSelected = availability[day]?.includes(slot) || false;
                return (
                  <button
                    key={slot}
                    onClick={() => isEditing && handleToggleTimeSlot(day, slot)}
                    disabled={!isEditing}
                    className={`p-3 rounded-lg border text-sm transition-all ${
                      isSelected
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-800 dark:text-blue-300'
                        : isEditing
                          ? 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <ClockIcon className="w-4 h-4 inline mr-1" />
                    {slot.split('(')[0].trim()}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}

        {!isEditing && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <MapPinIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Tip:</strong> Setting your pet's availability helps other users find the best time for
                  playdates. Click "Edit" to update availability.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

