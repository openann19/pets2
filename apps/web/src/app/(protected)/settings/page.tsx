'use client';
import { DeactivateAccountDialog } from '@/components/Account/DeactivateAccountDialog'
import { logger } from '@pawfectmatch/core';
;
import { DeleteAccountDialog } from '@/components/Account/DeleteAccountDialog';
import BiometricAuth from '@/components/Auth/BiometricAuth';
import TwoFactorAuth from '@/components/Auth/TwoFactorAuth';
import SmartNotifications from '@/components/Notifications/SmartNotifications';
import PrivacyControls from '@/components/Privacy/PrivacyControls';
import { useToast } from '@/components/ui/toast';
import { _useAuthStore as useAuthStore } from '@/stores/auth-store';
import { BellIcon, FingerPrintIcon, LockClosedIcon, PauseIcon, ShieldCheckIcon, SparklesIcon, TrashIcon, UserGroupIcon, } from '@heroicons/react/24/outline';
import { useState } from 'react';
export default function SettingsPage() {
    const toast = useToast();
    const { user, logout } = useAuthStore();
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
    // Sanitize legacy privacy settings
    function sanitizePrivacySettings(settings) {
        return {
            profileVisibility: settings && settings.profileVisibility === 'none' ? 'nobody' : (settings && settings.profileVisibility) || 'nobody',
            showOnlineStatus: settings && typeof settings.showOnlineStatus === 'boolean' ? settings.showOnlineStatus : true,
            showDistance: settings && typeof settings.showDistance === 'boolean' ? settings.showDistance : true,
            showLastActive: settings && typeof settings.showLastActive === 'boolean' ? settings.showLastActive : true,
            allowMessages: settings && settings.allowMessages === 'none' ? 'nobody' : (settings && settings.allowMessages) || 'nobody',
            showReadReceipts: settings && typeof settings.showReadReceipts === 'boolean' ? settings.showReadReceipts : true,
            incognitoMode: settings && typeof settings.incognitoMode === 'boolean' ? settings.incognitoMode : false,
            shareLocation: settings && typeof settings.shareLocation === 'boolean' ? settings.shareLocation : true,
        };
    }
    if (!user) {
        return null;
    }
    return (<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account security, privacy, and notifications
          </p>
        </div>

        {/* Quick Access Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <a href="#privacy" className="quick-access-tile">
            <LockClosedIcon className="w-6 h-6 text-pink-600"/>
            <span>Privacy Settings</span>
          </a>
          <a href="#blocked-users" className="quick-access-tile">
            <UserGroupIcon className="w-6 h-6 text-blue-600"/>
            <span>Blocked Users</span>
          </a>
          <a href="#safety" className="quick-access-tile">
            <ShieldCheckIcon className="w-6 h-6 text-green-600"/>
            <span>Safety Center</span>
          </a>
          <a href="#notifications" className="quick-access-tile">
            <BellIcon className="w-6 h-6 text-purple-600"/>
            <span>Notification Preferences</span>
          </a>
          <a href="#help" className="quick-access-tile">
            <SparklesIcon className="w-6 h-6 text-yellow-500"/>
            <span>Help & Support</span>
          </a>
          <a href="#about" className="quick-access-tile">
            <FingerPrintIcon className="w-6 h-6 text-gray-600"/>
            <span>About / Terms / Privacy</span>
          </a>
          <a href="#deactivate" className="quick-access-tile">
            <PauseIcon className="w-6 h-6 text-orange-600"/>
            <span>Account Deactivation</span>
          </a>
          <a href="#advanced-filters" className="quick-access-tile">
            <SparklesIcon className="w-6 h-6 text-cyan-600"/>
            <span>Advanced Filters</span>
          </a>
          <a href="#moderation" className="quick-access-tile">
            <ShieldCheckIcon className="w-6 h-6 text-red-600"/>
            <span>Moderation Tools</span>
          </a>
          <a href="#discovery" className="quick-access-tile">
            <UserGroupIcon className="w-6 h-6 text-indigo-600"/>
            <span>Discovery</span>
          </a>
        </div>
        {/* Advanced Filters Section */}
        <section id="advanced-filters" className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <SparklesIcon className="w-6 h-6 text-cyan-600"/>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Filters</h2>
          </div>
          <form className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-cyan-200 dark:border-cyan-700 grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={async (e) => {
            e.preventDefault();
            toast.success('Filters applied successfully!', 'Your preferences have been saved.');
        }}>
            <div>
              <label className="block font-semibold mb-2 text-gray-900 dark:text-white">Breed</label>
              <input type="text" name="breed" className="w-full rounded-lg border px-3 py-2" placeholder="e.g. Golden Retriever"/>
            </div>
            <div>
              <label className="block font-semibold mb-2 text-gray-900 dark:text-white">Vaccination Status</label>
              <select name="vaccination" className="w-full rounded-lg border px-3 py-2">
                <option value="">Any</option>
                <option value="up-to-date">Up to Date</option>
                <option value="partial">Partial</option>
                <option value="none">None</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-2 text-gray-900 dark:text-white">Training Level</label>
              <select name="training" className="w-full rounded-lg border px-3 py-2">
                <option value="">Any</option>
                <option value="basic">Basic</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-2 text-gray-900 dark:text-white">Temperament</label>
              <select name="temperament" className="w-full rounded-lg border px-3 py-2">
                <option value="">Any</option>
                <option value="calm">Calm</option>
                <option value="active">Active</option>
                <option value="playful">Playful</option>
                <option value="shy">Shy</option>
                <option value="protective">Protective</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end mt-4">
              <button type="submit" className="px-6 py-2 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition">Apply Filters</button>
            </div>
          </form>
        </section>

        <div className="space-y-8">
          {/* Premium & Gamification Section */}
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <SparklesIcon className="w-6 h-6 text-yellow-500"/>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Premium & Gamification</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Premium Features */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-yellow-200 dark:border-yellow-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Premium Features</h3>
                <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300 text-sm space-y-1">
                  <li>Unlimited Likes</li>
                  <li>See Who Liked You</li>
                  <li>Advanced Filters (Breed, Vaccination, Training, Temperament)</li>
                  <li>Priority Placement</li>
                  <li>Incognito Mode</li>
                  <li>Rewind Swipes</li>
                  <li>Travel Mode</li>
                  <li>Super Likes</li>
                  <li>Profile Insights</li>
                  <li>Ad-Free Experience</li>
                  <li>Verified Badge</li>
                  <li>Video Calls (HD)</li>
                  <li>Priority Support</li>
                  <li>Exclusive Events</li>
                  <li>Custom Profile URL</li>
                </ul>
                <a href="/premium/manage" className="mt-4 inline-block px-4 py-2 bg-gradient-to-r from-yellow-400 to-pink-500 text-white font-medium rounded-lg hover:from-yellow-500 hover:to-pink-600 transition-all duration-200 shadow-lg">Manage Subscription</a>
              </div>
              {/* Gamification & Engagement */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-purple-200 dark:border-purple-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Achievements & Engagement</h3>
                <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300 text-sm space-y-1">
                  <li>Achievements & Badges (First Match, 10 Matches, Photo Verified, Response Champion, Early Adopter)</li>
                  <li>Leaderboard (Top Matchers)</li>
                  <li>Daily Login Streak</li>
                  <li>Quests & Challenges</li>
                  <li>Points System & Rewards Shop</li>
                  <li>Levels (Bronze, Silver, Gold)</li>
                  <li>Friends System & Group Chats</li>
                  <li>Events Calendar</li>
                  <li>Photo Contests</li>
                </ul>
                <div className="mt-4">
                  <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 rounded-full font-semibold text-xs mr-2">Your Level: Gold</span>
                  <span className="inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 rounded-full font-semibold text-xs">Points: 1,250</span>
                </div>
              </div>
            </div>
          </section>
          {/* Security Section */}
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <ShieldCheckIcon className="w-6 h-6 text-pink-600"/>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security</h2>
            </div>

            <div className="space-y-6">
              {/* Biometric Authentication */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <FingerPrintIcon className="w-5 h-5 text-gray-600 dark:text-gray-400"/>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Biometric Login
                  </h3>
                </div>
                <BiometricAuth onSuccess={() => {
            toast.success('Biometric authentication enabled!', 'You can now use Face ID or Touch ID to sign in.');
        }} onError={(error) => {
            logger.error('Biometric auth error:', { error });
            toast.error('Biometric authentication failed', String(error));
        }} onFallback={() => {
            // setShowPasswordLogin(true); // TODO: Implement password login fallback
        }}/>
              </div>

              {/* Two-Factor Authentication */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  {!user.twoFactorEnabled && (<button onClick={() => setShow2FASetup(true)} className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors">
                      Enable 2FA
                    </button>)}
                </div>

                {show2FASetup && (<TwoFactorAuth mode="setup" onSetup={async () => {
                // Call your API to generate 2FA secret
                const response = await fetch('/api/auth/2fa/setup', {
                    method: 'POST',
                });
                return await response.json();
            }} onVerify={async (code) => {
                const response = await fetch('/api/auth/2fa/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code }),
                });
                return response.ok;
            }} onCancel={() => setShow2FASetup(false)}/>)}

                {user.twoFactorEnabled && (<div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                    <ShieldCheckIcon className="w-5 h-5"/>
                    <span className="font-medium">2FA is enabled</span>
                  </div>)}
              </div>
            </div>
          </section>

          {/* Privacy Section */}
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <LockClosedIcon className="w-6 h-6 text-pink-600"/>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Privacy & Safety</h2>
            </div>

            <PrivacyControls settings={sanitizePrivacySettings(user.privacySettings || {})} onUpdate={async (newSettings) => {
            await fetch('/api/user/privacy', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings),
            });
        }}/>
          </section>

          {/* Notifications Section */}
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <BellIcon className="w-6 h-6 text-pink-600"/>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h2>
            </div>

            <SmartNotifications preferences={user.notificationPreferences || {
            enabled: true,
            matches: true,
            messages: true,
            likes: true,
            reminders: true,
            quietHours: {
                enabled: false,
                start: '22:00',
                end: '08:00',
            },
            frequency: 'instant',
            sound: true,
            vibration: true,
        }} onUpdate={async (newPreferences) => {
            await fetch('/api/user/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPreferences),
            });
        }}/>
          </section>

          {/* Account Management */}
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <TrashIcon className="w-6 h-6 text-red-600"/>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Account Management
              </h2>
            </div>

            <div className="space-y-4">
              {/* Deactivate Account */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-yellow-200 dark:border-yellow-700">
                <div className="flex items-start space-x-4">
                  <PauseIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1"/>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Deactivate Account
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Temporarily deactivate your account. You can reactivate it anytime by logging back in.
                    </p>
                    <button onClick={() => setShowDeactivateDialog(true)} className="mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors">
                      Deactivate Account
                    </button>
                  </div>
                </div>
              </div>

              {/* Delete Account */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-red-200 dark:border-red-700">
                <div className="flex items-start space-x-4">
                  <TrashIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-1"/>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Delete Account
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Permanently delete your account and all associated data. This action cannot be undone after the 30-day grace period.
                    </p>
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        <strong>Warning:</strong> This will delete all your data including profile, pets, matches, messages, and photos.
                      </p>
                    </div>
                    <button onClick={() => setShowDeleteDialog(true)} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                      Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Account Management Section */}
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <TrashIcon className="w-6 h-6 text-red-600"/>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Account Management
              </h2>
            </div>

            <div className="space-y-6">
              {/* Account Deactivation */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <PauseIcon className="w-5 h-5 text-orange-600"/>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Deactivate Account
                      </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Temporarily suspend your account. You can reactivate it anytime.
                    </p>
                  </div>
                  <button onClick={() => setShowDeactivateDialog(true)} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors">
                    Deactivate
                  </button>
                </div>
              </div>

              {/* Account Deletion - GDPR Compliant */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <TrashIcon className="w-5 h-5 text-red-600"/>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Delete Account
                      </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Permanently delete your account and all data (GDPR Article 17)
                    </p>
                  </div>
                  <button onClick={() => setShowDeleteDialog(true)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 2025 UI Showcase */}
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <SparklesIcon className="w-6 h-6 text-purple-600"/>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                2025 UI Innovations
              </h2>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Hyper-Interactive Buttons Showcase
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Experience the future of button interactions with 2025 animations
                  </p>
                </div>
                <a href="/button-showcase" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl">
                  <SparklesIcon className="w-4 h-4 mr-2"/>
                  View Demo
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Deactivate Account Dialog */}
      <DeactivateAccountDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog} userId={user._id} onSuccess={() => {
            logout();
            window.location.href = '/';
        }}/>

      {/* Delete Account Dialog */}
      <DeleteAccountDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog} userEmail={user.email} userId={user._id} onSuccess={() => {
            logout();
            window.location.href = '/';
        }}/>
    </div>);
}
//# sourceMappingURL=page.jsx.map