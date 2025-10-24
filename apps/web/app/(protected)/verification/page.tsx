'use client';

import { ProfileVerification } from '@/components/Verification/ProfileVerification';
import { _useAuthStore as useAuthStore } from '@/stores/auth-store';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function VerificationPage() {
  const { user } = useAuthStore();
  const [isCompleted, setIsCompleted] = useState(false);

  const handleVerificationComplete = () => {
    setIsCompleted(true);
  };

  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Verification Submitted!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your verification request has been submitted successfully. Our team will review it
            within 24-48 hours.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              What happens next?
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 text-left">
              <li>• Our team will review your documents and information</li>
              <li>• You'll receive an email notification once the review is complete</li>
              <li>• If approved, you'll get a verified badge on your profile</li>
              <li>• If additional information is needed, we'll contact you</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (user && 'isVerified' in user && (user as { isVerified?: boolean }).isVerified) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Profile Verified!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your profile has been successfully verified. You now have a verified badge.
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
              Benefits of being verified:
            </h3>
            <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 text-left">
              <li>• Verified badge on your profile</li>
              <li>• Increased trust from other users</li>
              <li>• Priority in search results</li>
              <li>• Access to premium features</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {user ? (
        <ProfileVerification
          userId={user.id}
          onComplete={handleVerificationComplete}
        />
      ) : (
        <div className="max-w-2xl mx-auto p-6 text-center text-gray-600 dark:text-gray-400">
          Please log in to verify your profile.
        </div>
      )}
    </div>
  );
}
