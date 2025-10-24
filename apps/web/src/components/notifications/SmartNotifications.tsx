'use client';
import { useToast } from '@/components/ui/toast';
import { BellAlertIcon, BellIcon, ClockIcon, MoonIcon, SunIcon, } from '@heroicons/react/24/outline';
import { logger } from '@pawfectmatch/core';
import { useEffect, useState } from 'react';
export const SmartNotifications = ({ preferences: initialPreferences, onUpdate, }) => {
    const toast = useToast();
    const [preferences, setPreferences] = useState(initialPreferences);
    const [isSaving, setIsSaving] = useState(false);
    const [permission, setPermission] = useState('default');
    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);
    const requestPermission = async () => {
        if (!('Notification' in window)) {
            toast.warning('Notifications not supported', 'This browser does not support desktop notifications.');
            return;
        }
        const result = await Notification.requestPermission();
        setPermission(result);
        if (result === 'granted') {
            handleToggle('enabled', true);
            toast.success('Notifications enabled!', 'You will now receive desktop notifications.');
        }
    };
    const handleToggle = async (key, value) => {
        const newPreferences = { ...preferences, [key]: value };
        setPreferences(newPreferences);
        setIsSaving(true);
        try {
            await onUpdate(newPreferences);
        }
        catch (error) {
            logger.error('Failed to update preferences:', { error });
            setPreferences(preferences); // Revert on error
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleQuietHoursToggle = async (enabled) => {
        const newPreferences = {
            ...preferences,
            quietHours: { ...preferences.quietHours, enabled },
        };
        setPreferences(newPreferences);
        setIsSaving(true);
        try {
            await onUpdate(newPreferences);
        }
        catch (error) {
            logger.error('Failed to update preferences:', { error });
            setPreferences(preferences);
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleQuietHoursTime = async (type, time) => {
        const newPreferences = {
            ...preferences,
            quietHours: { ...preferences.quietHours, [type]: time },
        };
        setPreferences(newPreferences);
        setIsSaving(true);
        try {
            await onUpdate(newPreferences);
        }
        catch (error) {
            logger.error('Failed to update preferences:', { error });
            setPreferences(preferences);
        }
        finally {
            setIsSaving(false);
        }
    };
    const isInQuietHours = () => {
        if (!preferences.quietHours.enabled)
            return false;
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const { start, end } = preferences.quietHours;
        if (start < end) {
            return currentTime >= start && currentTime < end;
        }
        else {
            // Quiet hours span midnight
            return currentTime >= start || currentTime < end;
        }
    };
    return (<div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BellIcon className="w-6 h-6 text-white"/>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Smart Notifications
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Stay updated without being overwhelmed
              </p>
            </div>
          </div>
          {isInQuietHours() && (<div className="flex items-center space-x-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <MoonIcon className="w-4 h-4 text-purple-600 dark:text-purple-400"/>
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                Quiet Hours
              </span>
            </div>)}
        </div>

        {/* Permission Status */}
        {permission !== 'granted' && (<div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <div className="flex items-start space-x-3">
              <BellAlertIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5"/>
              <div className="flex-1">
                <div className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                  Enable Notifications
                </div>
                <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
                  Allow notifications to stay updated on matches, messages, and more.
                </p>
                <button onClick={requestPermission} className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Enable Notifications
                </button>
              </div>
            </div>
          </div>)}
      </div>

      {/* Notification Types */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          What to notify me about
        </h3>

        <div className="space-y-4">
          <ToggleItem label="New Matches" description="When you get a new match" icon="💕" checked={preferences.matches} onChange={(checked) => handleToggle('matches', checked)} disabled={isSaving || !preferences.enabled}/>
          <ToggleItem label="Messages" description="When someone sends you a message" icon="💬" checked={preferences.messages} onChange={(checked) => handleToggle('messages', checked)} disabled={isSaving || !preferences.enabled}/>
          <ToggleItem label="Likes" description="When someone likes your pet" icon="❤️" checked={preferences.likes} onChange={(checked) => handleToggle('likes', checked)} disabled={isSaving || !preferences.enabled}/>
          <ToggleItem label="Reminders" description="Daily check-in and activity reminders" icon="🔔" checked={preferences.reminders} onChange={(checked) => handleToggle('reminders', checked)} disabled={isSaving || !preferences.enabled}/>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-400"/>
            <h3 className="font-semibold text-gray-900 dark:text-white">Quiet Hours</h3>
          </div>
          <button onClick={() => handleQuietHoursToggle(!preferences.quietHours.enabled)} disabled={isSaving} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.quietHours.enabled ? 'bg-pink-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.quietHours.enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Mute notifications during specific hours
        </p>

        {preferences.quietHours.enabled && (<div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Time
              </label>
              <div className="relative">
                <input type="time" value={preferences.quietHours.start} onChange={(e) => handleQuietHoursTime('start', e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"/>
                <MoonIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Time
              </label>
              <div className="relative">
                <input type="time" value={preferences.quietHours.end} onChange={(e) => handleQuietHoursTime('end', e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"/>
                <SunIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"/>
              </div>
            </div>
          </div>)}
      </div>

      {/* Notification Frequency */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <ClockIcon className="w-5 h-5 text-gray-600 dark:text-gray-400"/>
          <h3 className="font-semibold text-gray-900 dark:text-white">Notification Frequency</h3>
        </div>

        <div className="space-y-3">
          {[
            { value: 'instant', label: 'Instant', desc: 'Get notified immediately' },
            { value: 'batched', label: 'Batched', desc: 'Group notifications every hour' },
            { value: 'daily', label: 'Daily Digest', desc: 'One summary per day' },
        ].map((option) => (<button key={option.value} onClick={() => handleToggle('frequency', option.value)} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${preferences.frequency === option.value
                ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
              <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{option.desc}</div>
            </button>))}
        </div>
      </div>

      {/* Sound & Vibration */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Notification Style</h3>

        <div className="space-y-4">
          <ToggleItem label="Sound" description="Play a sound for notifications" icon="🔊" checked={preferences.sound} onChange={(checked) => handleToggle('sound', checked)} disabled={isSaving || !preferences.enabled}/>
          <ToggleItem label="Vibration" description="Vibrate for notifications" icon="📳" checked={preferences.vibration} onChange={(checked) => handleToggle('vibration', checked)} disabled={isSaving || !preferences.enabled}/>
        </div>
      </div>
    </div>);
};
const ToggleItem = ({ label, description, icon, checked, onChange, disabled }) => {
    return (<div className="flex items-center justify-between">
      <div className="flex items-center space-x-3 flex-1">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{label}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{description}</div>
        </div>
      </div>
      <button onClick={() => onChange(!checked)} disabled={disabled} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${checked ? 'bg-pink-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}/>
      </button>
    </div>);
};
export default SmartNotifications;
//# sourceMappingURL=SmartNotifications.jsx.map