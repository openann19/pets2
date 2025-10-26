'use client';
import { ClockIcon, EyeIcon, EyeSlashIcon, GlobeAltIcon, LockClosedIcon, MapPinIcon, ShieldCheckIcon, } from '@heroicons/react/24/outline';
import { useState } from 'react';
export const LocationPrivacy = ({ currentSettings, onSettingsChange }) => {
    const [settings, setSettings] = useState(currentSettings);
    const handleSettingChange = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        onSettingsChange(newSettings);
    };
    const privacyOptions = [
        {
            id: 'showExactLocation',
            title: 'Show Exact Location',
            description: 'Display your precise coordinates to other users',
            icon: MapPinIcon,
            warning: 'This reveals your exact location',
        },
        {
            id: 'showCity',
            title: 'Show City',
            description: 'Display your city to other users',
            icon: GlobeAltIcon,
            warning: 'This reveals your city',
        },
        {
            id: 'showCountry',
            title: 'Show Country',
            description: 'Display your country to other users',
            icon: GlobeAltIcon,
            warning: 'This reveals your country',
        },
        {
            id: 'allowLocationHistory',
            title: 'Location History',
            description: 'Allow the app to track your location history',
            icon: ClockIcon,
            warning: 'This stores your location data',
        },
        {
            id: 'shareWithMatches',
            title: 'Share with Matches',
            description: 'Share location with your matches',
            icon: ShieldCheckIcon,
            warning: 'Matches can see your location',
        },
        {
            id: 'shareWithPremium',
            title: 'Share with Premium Users',
            description: 'Allow premium users to see your location',
            icon: LockClosedIcon,
            warning: 'Premium users can see your location',
        },
    ];
    const updateFrequencyOptions = [
        { value: 'realtime', label: 'Real-time', description: 'Update location continuously' },
        { value: 'hourly', label: 'Hourly', description: 'Update location every hour' },
        { value: 'daily', label: 'Daily', description: 'Update location once per day' },
        { value: 'manual', label: 'Manual', description: 'Update location only when you change it' },
    ];
    return (<div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
          <ShieldCheckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400"/>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Location Privacy</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Control how your location information is shared
          </p>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="space-y-4 mb-6">
        {privacyOptions.map((option) => {
            const Icon = option.icon;
            const isEnabled = settings[option.id];
            return (<div key={option.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-gray-500"/>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{option.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
                    {isEnabled && (<p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        ⚠️ {option.warning}
                      </p>)}
                  </div>
                </div>

                <button onClick={() => { handleSettingChange(option.id, !isEnabled); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isEnabled ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
              </div>
            </div>);
        })}
      </div>

      {/* Update Frequency */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
          Location Update Frequency
        </h4>
        <div className="space-y-2">
          {updateFrequencyOptions.map((option) => (<label key={option.value} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
              <input type="radio" name="updateFrequency" value={option.value} checked={settings.locationUpdateFrequency === option.value} onChange={(e) => { handleSettingChange('locationUpdateFrequency', e.target.value); }} className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300"/>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
              </div>
            </label>))}
        </div>
      </div>

      {/* Privacy Summary */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Your Privacy Summary</h4>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          {settings.showExactLocation && (<div className="flex items-center space-x-2">
              <EyeIcon className="h-4 w-4 text-red-500"/>
              <span>Exact location is visible to others</span>
            </div>)}
          {settings.showCity && !settings.showExactLocation && (<div className="flex items-center space-x-2">
              <EyeIcon className="h-4 w-4 text-yellow-500"/>
              <span>City is visible to others</span>
            </div>)}
          {settings.showCountry && !settings.showCity && !settings.showExactLocation && (<div className="flex items-center space-x-2">
              <EyeIcon className="h-4 w-4 text-green-500"/>
              <span>Country is visible to others</span>
            </div>)}
          {!settings.showExactLocation && !settings.showCity && !settings.showCountry && (<div className="flex items-center space-x-2">
              <EyeSlashIcon className="h-4 w-4 text-green-500"/>
              <span>Location is completely hidden</span>
            </div>)}
        </div>
      </div>

      {/* Safety Tips */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Safety Tips</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Only share location with people you trust</li>
          <li>• Consider using city-level sharing instead of exact location</li>
          <li>• Regularly review your privacy settings</li>
          <li>• Be cautious when meeting people from the app</li>
        </ul>
      </div>
    </div>);
};
//# sourceMappingURL=LocationPrivacy.jsx.map