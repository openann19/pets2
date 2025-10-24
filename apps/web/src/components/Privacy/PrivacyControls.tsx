'use client';
import { BellIcon, EyeIcon, EyeSlashIcon, LockClosedIcon, MapPinIcon, ShieldCheckIcon, UserGroupIcon, } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { logger } from '@pawfectmatch/core';
;
export const PrivacyControls = ({ settings: initialSettings, onUpdate }) => {
    const [settings, setSettings] = useState(initialSettings);
    const [isSaving, setIsSaving] = useState(false);
    const handleToggle = async (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        setIsSaving(true);
        try {
            await onUpdate(newSettings);
        }
        catch (error) {
            logger.error('Failed to update privacy settings:', { error });
            setSettings(settings); // Revert on error
        }
        finally {
            setIsSaving(false);
        }
    };
    return (<div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
            <ShieldCheckIcon className="w-6 h-6 text-white"/>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Privacy & Safety</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Control who can see your information
            </p>
          </div>
        </div>

        {/* Incognito Mode */}
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <EyeSlashIcon className="w-5 h-5 text-purple-600 dark:text-purple-400"/>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Incognito Mode</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Browse without being seen
                </div>
              </div>
            </div>
            <button onClick={() => handleToggle('incognitoMode', !settings.incognitoMode)} disabled={isSaving} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.incognitoMode ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.incognitoMode ? 'translate-x-6' : 'translate-x-1'}`}/>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Visibility */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <EyeIcon className="w-5 h-5 text-gray-600 dark:text-gray-400"/>
          <h3 className="font-semibold text-gray-900 dark:text-white">Profile Visibility</h3>
        </div>

        <div className="space-y-3">
          {[
            { value: 'everyone', label: 'Everyone', desc: 'Anyone can see your profile' },
            {
                value: 'matches',
                label: 'Matches Only',
                desc: 'Only your matches can see your profile',
            },
            { value: 'nobody', label: 'Hidden', desc: 'Your profile is hidden from everyone' },
        ].map((option) => (<button key={option.value} onClick={() => handleToggle('profileVisibility', option.value)} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${settings.profileVisibility === option.value
                ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
              <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{option.desc}</div>
            </button>))}
        </div>
      </div>

      {/* Activity Status */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <UserGroupIcon className="w-5 h-5 text-gray-600 dark:text-gray-400"/>
          <h3 className="font-semibold text-gray-900 dark:text-white">Activity Status</h3>
        </div>

        <div className="space-y-4">
          <ToggleItem label="Show Online Status" description="Let others see when you're active" checked={settings.showOnlineStatus} onChange={(checked) => handleToggle('showOnlineStatus', checked)} disabled={isSaving}/>
          <ToggleItem label="Show Last Active" description="Display when you were last online" checked={settings.showLastActive} onChange={(checked) => handleToggle('showLastActive', checked)} disabled={isSaving}/>
          <ToggleItem label="Show Read Receipts" description="Let others know when you've read their messages" checked={settings.showReadReceipts} onChange={(checked) => handleToggle('showReadReceipts', checked)} disabled={isSaving}/>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <MapPinIcon className="w-5 h-5 text-gray-600 dark:text-gray-400"/>
          <h3 className="font-semibold text-gray-900 dark:text-white">Location</h3>
        </div>

        <div className="space-y-4">
          <ToggleItem label="Share Location" description="Allow the app to access your location" checked={settings.shareLocation} onChange={(checked) => handleToggle('shareLocation', checked)} disabled={isSaving}/>
          <ToggleItem label="Show Distance" description="Display distance to other users" checked={settings.showDistance} onChange={(checked) => handleToggle('showDistance', checked)} disabled={isSaving || !settings.shareLocation}/>
        </div>
      </div>

      {/* Messaging */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-400"/>
          <h3 className="font-semibold text-gray-900 dark:text-white">Who Can Message You</h3>
        </div>

        <div className="space-y-3">
          {[
            { value: 'everyone', label: 'Everyone', desc: 'Anyone can send you messages' },
            { value: 'matches', label: 'Matches Only', desc: 'Only your matches can message you' },
            { value: 'nobody', label: 'Nobody', desc: 'Disable all incoming messages' },
        ].map((option) => (<button key={option.value} onClick={() => handleToggle('allowMessages', option.value)} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${settings.allowMessages === option.value
                ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
              <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{option.desc}</div>
            </button>))}
        </div>
      </div>

      {/* Safety Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <LockClosedIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5"/>
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Safety Tips</h4>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
              <li>• Never share personal information like your address or phone number</li>
              <li>• Meet in public places for first dates</li>
              <li>• Trust your instincts - report suspicious behavior</li>
              <li>• Keep conversations on the platform initially</li>
            </ul>
          </div>
        </div>
      </div>
    </div>);
};
const ToggleItem = ({ label, description, checked, onChange, disabled }) => {
    return (<div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="font-medium text-gray-900 dark:text-white">{label}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">{description}</div>
      </div>
      <button onClick={() => onChange(!checked)} disabled={disabled} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${checked ? 'bg-pink-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}/>
      </button>
    </div>);
};
export default PrivacyControls;
//# sourceMappingURL=PrivacyControls.jsx.map