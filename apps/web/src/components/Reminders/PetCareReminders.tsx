'use client';
import { CustomTextarea } from '@/components/ui/CustomTextarea';
import { BellIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { addDays, format, isToday, isTomorrow } from 'date-fns';
import React, { useState } from 'react';
export const PetCareReminders = ({ reminders, pets, onAddReminder, onUpdateReminder: _onUpdateReminder, onDeleteReminder, onToggleComplete, }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [filterPet, setFilterPet] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [newReminder, setNewReminder] = useState({
        petId: pets[0]?.id || '',
        title: '',
        description: '',
        type: 'other',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: format(new Date(), 'HH:mm'),
        frequency: 'once',
        notifyBefore: [30], // 30 minutes before by default
        completed: false,
    });
    const filteredReminders = reminders.filter((reminder) => {
        const petMatches = filterPet === 'all' || reminder.petId === filterPet;
        const typeMatches = filterType === 'all' || reminder.type === filterType;
        return petMatches && typeMatches;
    });
    // Group reminders by date
    const remindersByDate = filteredReminders.reduce((acc, reminder) => {
        const date = reminder.date.split('T')[0]; // Extract date part only
        if (date) {
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(reminder);
        }
        return acc;
    }, {});
    // Sort dates
    const sortedDates = Object.keys(remindersByDate).sort((a, b) => {
        return new Date(a).getTime() - new Date(b).getTime();
    });
    const getPetById = (petId) => {
        return pets.find((pet) => pet.id === petId);
    };
    const handleAddReminder = () => {
        if (!newReminder.title || !newReminder.petId)
            return;
        onAddReminder?.(newReminder);
        setShowAddModal(false);
        // Reset form
        setNewReminder({
            petId: pets[0]?.id || '',
            title: '',
            description: '',
            type: 'other',
            date: format(new Date(), 'yyyy-MM-dd'),
            time: format(new Date(), 'HH:mm'),
            frequency: 'once',
            notifyBefore: [30],
            completed: false,
        });
    };
    const handleToggleComplete = (reminder) => {
        onToggleComplete?.(reminder.id, !reminder.completed);
    };
    const formatReminderDate = (dateStr) => {
        const date = new Date(dateStr);
        if (isToday(date)) {
            return 'Today';
        }
        else if (isTomorrow(date)) {
            return 'Tomorrow';
        }
        else if (date < addDays(new Date(), 7)) {
            return format(date, 'EEEE'); // Day of week
        }
        else {
            return format(date, 'MMM d, yyyy');
        }
    };
    const getReminderTypeIcon = (type) => {
        switch (type) {
            case 'medication':
                return '💊';
            case 'feeding':
                return '🍽️';
            case 'grooming':
                return '✂️';
            case 'exercise':
                return '🏃';
            case 'vaccination':
                return '💉';
            case 'checkup':
                return '🩺';
            default:
                return '📝';
        }
    };
    const getReminderTypeColor = (type) => {
        switch (type) {
            case 'medication':
                return 'bg-blue-500';
            case 'feeding':
                return 'bg-orange-500';
            case 'grooming':
                return 'bg-purple-500';
            case 'exercise':
                return 'bg-green-500';
            case 'vaccination':
                return 'bg-red-500';
            case 'checkup':
                return 'bg-cyan-500';
            default:
                return 'bg-gray-500';
        }
    };
    const getFrequencyText = (reminder) => {
        switch (reminder.frequency) {
            case 'once':
                return 'One time';
            case 'daily':
                return 'Daily';
            case 'weekly':
                return 'Weekly';
            case 'monthly':
                return 'Monthly';
            case 'custom':
                if (reminder.customFrequency) {
                    return `Every ${reminder.customFrequency.interval} ${reminder.customFrequency.unit}`;
                }
                return 'Custom';
            default:
                return '';
        }
    };
    return (<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <BellIcon className="w-5 h-5 mr-2 text-pink-500"/>
            Pet Care Reminders
          </h2>

          <button onClick={() => setShowAddModal(true)} className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium rounded-lg flex items-center transition-colors">
            <PlusIcon className="w-4 h-4 mr-1"/>
            <span>Add Reminder</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center">
            <label htmlFor="pet-filter" className="text-sm text-gray-700 dark:text-gray-300 mr-2">
              Pet:
            </label>
            <select id="pet-filter" value={filterPet} onChange={(e) => setFilterPet(e.target.value)} className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-1 px-2">
              <option value="all">All Pets</option>
              {pets.map((pet) => (<option key={pet.id} value={pet.id}>
                  {pet.name}
                </option>))}
            </select>
          </div>

          <div className="flex items-center">
            <label htmlFor="type-filter" className="text-sm text-gray-700 dark:text-gray-300 mr-2">
              Type:
            </label>
            <select id="type-filter" value={filterType} onChange={(e) => setFilterType(e.target.value)} className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-1 px-2">
              <option value="all">All Types</option>
              <option value="medication">Medication</option>
              <option value="feeding">Feeding</option>
              <option value="grooming">Grooming</option>
              <option value="exercise">Exercise</option>
              <option value="vaccination">Vaccination</option>
              <option value="checkup">Checkup</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reminders List */}
      <div className="px-6 py-4">
        {sortedDates.length > 0 ? (<div className="space-y-6">
            {sortedDates.map((date) => (<div key={date}>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                  {formatReminderDate(date)}
                </h3>

                <div className="space-y-2">
                  {remindersByDate[date]?.map((reminder) => {
                    const pet = getPetById(reminder.petId);
                    return (<div key={reminder.id} className={`p-4 rounded-lg border ${reminder.completed
                            ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'} relative`}>
                        <div className="flex items-center mb-2">
                          {/* Checkbox */}
                          <button onClick={() => handleToggleComplete(reminder)} className={`w-5 h-5 rounded border flex-shrink-0 ${reminder.completed
                            ? 'bg-pink-500 border-pink-500'
                            : 'border-gray-300 dark:border-gray-600'}`} aria-label={reminder.completed ? 'Mark as incomplete' : 'Mark as complete'}>
                            {reminder.completed && (<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                              </svg>)}
                          </button>

                          {/* Type indicator */}
                          <div className={`ml-3 w-8 h-8 rounded-full ${getReminderTypeColor(reminder.type)} flex items-center justify-center text-white`}>
                            <span>{getReminderTypeIcon(reminder.type)}</span>
                          </div>

                          {/* Pet avatar */}
                          {pet && (<div className="ml-2 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                              {pet.avatar ? (<img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover"/>) : (<span className="text-lg">
                                  {pet.species === 'dog'
                                    ? '🐶'
                                    : pet.species === 'cat'
                                        ? '🐱'
                                        : '🐾'}
                                </span>)}
                            </div>)}

                          {/* Title and pet name */}
                          <div className="ml-3 flex-1">
                            <h4 className={`font-medium ${reminder.completed
                            ? 'text-gray-500 dark:text-gray-400 line-through'
                            : 'text-gray-900 dark:text-white'}`}>
                              {reminder.title}
                            </h4>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <span className="mr-2">{pet?.name}</span>
                              {reminder.time && <span>{reminder.time}</span>}
                              <span className="mx-2">•</span>
                              <span>{getFrequencyText(reminder)}</span>
                            </div>
                          </div>

                          {/* Delete button */}
                          <button onClick={() => onDeleteReminder?.(reminder.id)} className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400" aria-label="Delete reminder">
                            <TrashIcon className="w-4 h-4"/>
                          </button>
                        </div>

                        {/* Description */}
                        {reminder.description && (<div className={`pl-11 ml-3 text-sm ${reminder.completed
                                ? 'text-gray-500 dark:text-gray-400'
                                : 'text-gray-600 dark:text-gray-300'}`}>
                            {reminder.description}
                          </div>)}
                      </div>);
                })}
                </div>
              </div>))}
          </div>) : (<div className="text-center py-8">
            <div className="text-4xl mb-3">🔔</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              No reminders found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {filterPet !== 'all' || filterType !== 'all'
                ? 'Try changing your filters or'
                : 'Start by'}
              {' adding your first pet care reminder.'}
            </p>
            <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg inline-flex items-center transition-colors">
              <PlusIcon className="w-5 h-5 mr-1"/>
              Add Reminder
            </button>
          </div>)}
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Add New Reminder
              </h3>

              <form onSubmit={(e) => {
                e.preventDefault();
                handleAddReminder();
            }}>
                {/* Pet Selection */}
                <div className="mb-4">
                  <label htmlFor="pet" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pet*
                  </label>
                  <select id="pet" value={newReminder.petId} onChange={(e) => setNewReminder({ ...newReminder, petId: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                    <option value="">Select a pet</option>
                    {pets.map((pet) => (<option key={pet.id} value={pet.id}>
                        {pet.name}
                      </option>))}
                  </select>
                </div>

                {/* Title */}
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title*
                  </label>
                  <input type="text" id="title" value={newReminder.title} onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="e.g., Give medication, Monthly grooming" required/>
                </div>

                {/* Type */}
                <div className="mb-4">
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type*
                  </label>
                  <select id="type" value={newReminder.type} onChange={(e) => setNewReminder({
                ...newReminder,
                type: e.target.value,
            })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="medication">Medication</option>
                    <option value="feeding">Feeding</option>
                    <option value="grooming">Grooming</option>
                    <option value="exercise">Exercise</option>
                    <option value="vaccination">Vaccination</option>
                    <option value="checkup">Checkup</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date*
                    </label>
                    <input type="date" id="date" value={newReminder.date} onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required/>
                  </div>
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Time
                    </label>
                    <input type="time" id="time" value={newReminder.time} onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                  </div>
                </div>

                {/* Frequency */}
                <div className="mb-4">
                  <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Frequency*
                  </label>
                  <select id="frequency" value={newReminder.frequency} onChange={(e) => setNewReminder({
                ...newReminder,
                frequency: e.target.value,
            })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="once">One time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {newReminder.frequency === 'custom' && (<div className="mb-4 grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="interval" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Every
                      </label>
                      <input type="number" id="interval" min="1" value={newReminder.customFrequency?.interval || 1} onChange={(e) => setNewReminder({
                    ...newReminder,
                    customFrequency: {
                        ...(newReminder.customFrequency || { unit: 'days' }),
                        interval: parseInt(e.target.value) || 1,
                    },
                })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                    </div>
                    <div>
                      <label htmlFor="unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Unit
                      </label>
                      <select id="unit" value={newReminder.customFrequency?.unit || 'days'} onChange={(e) => setNewReminder({
                    ...newReminder,
                    customFrequency: {
                        ...(newReminder.customFrequency || { interval: 1 }),
                        unit: e.target.value,
                    },
                })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                      </select>
                    </div>
                  </div>)}

                {/* Notify Before */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notify Before
                  </label>
                  <div className="space-y-2">
                    {[30, 60, 1440].map((minutes) => (<div key={minutes} className="flex items-center">
                        <input type="checkbox" id={`notify-${minutes}`} checked={newReminder.notifyBefore.includes(minutes)} onChange={(e) => {
                    if (e.target.checked) {
                        setNewReminder({
                            ...newReminder,
                            notifyBefore: [...newReminder.notifyBefore, minutes].sort((a, b) => a - b),
                        });
                    }
                    else {
                        setNewReminder({
                            ...newReminder,
                            notifyBefore: newReminder.notifyBefore.filter((m) => m !== minutes),
                        });
                    }
                }} className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500 dark:border-gray-600"/>
                        <label htmlFor={`notify-${minutes}`} className="ml-2 text-gray-700 dark:text-gray-300">
                          {minutes === 30
                    ? '30 minutes before'
                    : minutes === 60
                        ? '1 hour before'
                        : minutes === 1440
                            ? '1 day before'
                            : `${minutes} minutes before`}
                        </label>
                      </div>))}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <CustomTextarea id="description" value={newReminder.description || ''} onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })} rows={3} variant="outline" size="medium" autoGrow={true} maxHeight={150} label="Description" placeholder="Add more details about this reminder..." showWordCount={true} animateOnFocus={true}/>
                </div>

                {/* Recurring */}
                <div className="mb-6 flex items-center">
                  <input type="checkbox" id="recurring" checked={newReminder.recurring || false} onChange={(e) => setNewReminder({ ...newReminder, recurring: e.target.checked })} className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500 dark:border-gray-600"/>
                  <label htmlFor="recurring" className="ml-2 text-gray-700 dark:text-gray-300">
                    Mark as recurring
                  </label>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg">
                    Add Reminder
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>)}
    </div>);
};
export default PetCareReminders;
//# sourceMappingURL=PetCareReminders.jsx.map