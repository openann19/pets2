/**
 * SettingsScreen - Web Version
 * Identical to mobile SettingsScreen structure
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ScreenShell } from '@/src/components/layout/ScreenShell';
import { useSettingsScreen } from '@/src/hooks/screens/useSettingsScreen';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const router = useRouter();
  const { t } = useTranslation('common');

  const {
    notifications,
    preferences,
    deletionStatus,
    setNotifications,
    handleLogout,
    handleDeleteAccount,
    handleExportData,
  } = useSettingsScreen();

  const settingsSections = [
    {
      title: t('settings.profile', 'Profile'),
      items: [
        {
          id: 'profile',
          label: t('settings.edit_profile', 'Edit Profile'),
          onPress: () => router.push('/profile'),
        },
      ],
    },
    {
      title: t('settings.notifications', 'Notifications'),
      items: [
        {
          id: 'email',
          label: t('settings.email_notifications', 'Email Notifications'),
          type: 'toggle',
          value: notifications.email,
          onToggle: (value: boolean) => setNotifications({ ...notifications, email: value }),
        },
        {
          id: 'push',
          label: t('settings.push_notifications', 'Push Notifications'),
          type: 'toggle',
          value: notifications.push,
          onToggle: (value: boolean) => setNotifications({ ...notifications, push: value }),
        },
      ],
    },
    {
      title: t('settings.account', 'Account'),
      items: [
        {
          id: 'export-data',
          label: t('settings.export_data', 'Export Data'),
          onPress: handleExportData,
        },
        {
          id: 'logout',
          label: t('settings.logout', 'Logout'),
          onPress: handleLogout,
          destructive: true,
        },
      ],
    },
    {
      title: t('settings.danger_zone', 'Danger Zone'),
      items: [
        {
          id: 'delete',
          label: t('settings.delete_account', 'Delete Account'),
          onPress: handleDeleteAccount,
          destructive: true,
        },
      ],
    },
  ];

  return (
    <ScreenShell
      header={
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 text-gray-600 hover:text-gray-800"
                  aria-label="Back"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">
                  {t('settings.title', 'Settings')}
                </h1>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {section.title}
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
              {section.items.map((item) => (
                <div key={item.id}>
                  {item.type === 'toggle' ? (
                    <div className="flex items-center justify-between p-4">
                      <span className="text-gray-900">{item.label}</span>
                      <button
                        onClick={() => item.onToggle?.(!item.value)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                          item.value ? 'bg-purple-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            item.value ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={item.onPress}
                      className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                        item.destructive ? 'text-red-600' : 'text-gray-900'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScreenShell>
  );
}

