'use client';
import React, { useState, useEffect } from 'react';
import { logger } from '@pawfectmatch/core';
;
import { _useAuthStore as useAuthStore } from '@/stores/auth-store';
import PetCareReminders, {} from '@/components/Reminders/PetCareReminders';
import { BellIcon } from '@heroicons/react/24/outline';
import { isBefore } from 'date-fns';
export default function RemindersPage() {
    const { user } = useAuthStore();
    const [reminders, setReminders] = useState([]);
    const [pets, setPets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        upcoming: 0,
        overdue: 0,
    });
    useEffect(() => {
        fetchData();
    }, []);
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [petsResponse, remindersResponse] = await Promise.all([
                fetch('/api/pets', {
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                }),
                fetch('/api/reminders', {
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                }),
            ]);
            if (!petsResponse.ok || !remindersResponse.ok) {
                throw new Error('Failed to fetch data');
            }
            const petsData = await petsResponse.json();
            const remindersData = await remindersResponse.json();
            setPets(petsData.pets || []);
            setReminders(remindersData.reminders || []);
            updateStats(remindersData.reminders || []);
        }
        catch (error) {
            logger.error('Error fetching data:', { error });
            setPets([]);
            setReminders([]);
        }
        finally {
            setIsLoading(false);
        }
    };
    const updateStats = (remindersList) => {
        const now = new Date();
        const total = remindersList.length;
        const completed = remindersList.filter((r) => r.completed).length;
        const upcoming = remindersList.filter((r) => {
            const reminderDate = new Date(r.date);
            return !r.completed && !isOverdue(r);
        }).length;
        const overdue = remindersList.filter((r) => isOverdue(r)).length;
        setStats({
            total,
            completed,
            upcoming,
            overdue,
        });
    };
    const isOverdue = (reminder) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const reminderDate = new Date(reminder.date);
        reminderDate.setHours(0, 0, 0, 0);
        return !reminder.completed && isBefore(reminderDate, today);
    };
    const handleAddReminder = (newReminder) => {
        const reminder = {
            ...newReminder,
            id: (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)),
        };
        const updatedReminders = [...reminders, reminder];
        setReminders(updatedReminders);
        updateStats(updatedReminders);
    };
    const handleUpdateReminder = (updatedReminder) => {
        const updatedReminders = reminders.map((reminder) => reminder.id === updatedReminder.id ? updatedReminder : reminder);
        setReminders(updatedReminders);
        updateStats(updatedReminders);
    };
    const handleDeleteReminder = (reminderId) => {
        const updatedReminders = reminders.filter((reminder) => reminder.id !== reminderId);
        setReminders(updatedReminders);
        updateStats(updatedReminders);
    };
    const handleToggleComplete = (reminderId, completed) => {
        const updatedReminders = reminders.map((reminder) => reminder.id === reminderId ? { ...reminder, completed } : reminder);
        setReminders(updatedReminders);
        updateStats(updatedReminders);
    };
    return (<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <BellIcon className="w-8 h-8 mr-3 text-pink-500"/>
            Pet Care Reminders
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Set up and manage reminders for your pet's care
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4">
            <div className="font-medium text-gray-500 dark:text-gray-400 text-sm mb-1">Total</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4">
            <div className="font-medium text-green-500 dark:text-green-400 text-sm mb-1">
              Completed
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.completed}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4">
            <div className="font-medium text-blue-500 dark:text-blue-400 text-sm mb-1">
              Upcoming
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.upcoming}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4">
            <div className="font-medium text-red-500 dark:text-red-400 text-sm mb-1">Overdue</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</div>
          </div>
        </div>

        {/* Reminders Component */}
        {isLoading ? (<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading reminders...</p>
            </div>
          </div>) : (<PetCareReminders reminders={reminders} pets={pets} onAddReminder={handleAddReminder} onUpdateReminder={handleUpdateReminder} onDeleteReminder={handleDeleteReminder} onToggleComplete={handleToggleComplete}/>)}

        {/* Tips Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-2">⏰</div>
            <div className="font-semibold text-gray-900 dark:text-white">Timely Reminders</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Get notifications on mobile and email for important pet care tasks.
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-2">🔁</div>
            <div className="font-semibold text-gray-900 dark:text-white">Recurring Tasks</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Set up daily, weekly, or monthly recurring reminders for regular care.
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-2">✅</div>
            <div className="font-semibold text-gray-900 dark:text-white">Task Completion</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Mark tasks as complete to track your pet care history.
            </div>
          </div>
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=page.jsx.map