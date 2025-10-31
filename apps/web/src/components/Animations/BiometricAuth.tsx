'use client';

/**
 * 🔐 BIOMETRIC AUTHENTICATION — WebAuthn Integration
 * Secure biometric login with hardware-backed authentication
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Presence } from './Presence';

interface BiometricAuthProps {
  requestOptions: () => Promise<PublicKeyCredentialRequestOptions>;
  onSuccess: (credential: PublicKeyCredential) => void;
  onError: (error: string) => void;
  onFallback: () => void;
  className?: string;
  buttonText?: string;
  fallbackText?: string;
}

export function BiometricAuth({
  requestOptions,
  onSuccess,
  onError,
  onFallback,
  className = '',
  buttonText = 'Sign in with Biometrics',
  fallbackText = 'Use password instead',
}: BiometricAuthProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBiometricAuth = useCallback(async () => {
    try {
      setIsAuthenticating(true);
      setError(null);

      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error('Biometric authentication is not supported on this device');
      }

      // Get authentication options from server
      const options = await requestOptions();

      // Convert challenge from base64url to ArrayBuffer
      options.challenge = base64UrlToArrayBuffer(options.challenge as any);

      // Convert allowCredentials IDs if present
      if (options.allowCredentials) {
        options.allowCredentials = options.allowCredentials.map(cred => ({
          ...cred,
          id: base64UrlToArrayBuffer(cred.id as any),
        }));
      }

      // Request authentication
      const credential = await navigator.credentials.get({
        publicKey: options,
      }) as PublicKeyCredential;

      // Success!
      onSuccess(credential);

    } catch (err: any) {
      console.error('Biometric authentication failed:', err);

      let errorMessage = 'Authentication failed';

      if (err.name === 'NotAllowedError') {
        errorMessage = 'Authentication was cancelled';
      } else if (err.name === 'SecurityError') {
        errorMessage = 'Authentication failed due to security restrictions';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Biometric authentication is not supported';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  }, [requestOptions, onSuccess, onError]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Biometric Auth Button */}
      <motion.button
        onClick={handleBiometricAuth}
        disabled={isAuthenticating}
        className={`
          w-full px-6 py-4 rounded-xl font-semibold text-white
          bg-gradient-to-r from-purple-600 to-blue-600
          hover:from-purple-700 hover:to-blue-700
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200 shadow-lg hover:shadow-xl
          flex items-center justify-center space-x-3
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={isAuthenticating ? {
          scale: [1, 1.05, 1],
          transition: {
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        } : {}}
      >
        {isAuthenticating ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
            <span>Authenticating...</span>
          </>
        ) : (
          <>
            <FingerprintIcon />
            <span>{buttonText}</span>
          </>
        )}
      </motion.button>

      {/* Error Display */}
      <Presence show={!!error} preset="slideDown">
        <motion.div
          className="p-3 bg-red-50 border border-red-200 rounded-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="flex items-center space-x-2">
            <ErrorIcon />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </motion.div>
      </Presence>

      {/* Fallback Option */}
      <motion.button
        onClick={onFallback}
        className="
          w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800
          hover:bg-gray-50 rounded-lg transition-colors duration-200
        "
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {fallbackText}
      </motion.button>

      {/* Security Note */}
      <div className="text-xs text-gray-500 text-center">
        🔒 Your biometric data never leaves your device
      </div>
    </div>
  );
}

// Helper function to convert base64url to ArrayBuffer
function base64UrlToArrayBuffer(base64Url: string): ArrayBuffer {
  // Convert base64url to base64
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  const paddedBase64 = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');

  // Convert to ArrayBuffer
  const binaryString = atob(paddedBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Icon Components
function FingerprintIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008.682 5M12 11c0-3.517 1.009-6.799 2.753-9.571m3.44 2.04l-.054.09A13.916 13.916 0 0115.318 19M12 11h6m-6 0H6"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      className="w-4 h-4 text-red-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
      />
    </svg>
  );
}

// Biometric Setup Component
interface BiometricSetupProps {
  onComplete: (credential: PublicKeyCredential) => void;
  onSkip: () => void;
}

export function BiometricSetup({ onComplete, onSkip }: BiometricSetupProps) {
  const [isSettingUp, setIsSettingUp] = useState(false);

  const handleSetup = async () => {
    try {
      setIsSettingUp(true);

      // This would typically involve server-side registration
      // For demo purposes, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful setup
      const mockCredential = {
        id: 'mock-credential-id',
        type: 'public-key',
      } as PublicKeyCredential;

      onComplete(mockCredential);
    } catch (error) {
      console.error('Biometric setup failed:', error);
    } finally {
      setIsSettingUp(false);
    }
  };

  return (
    <Presence show={true} preset="scale" className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-6">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="inline-block mb-4"
          >
            <FingerprintIcon />
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Enable Biometric Login
          </h2>
          <p className="text-gray-600">
            Secure, fast authentication using your device's biometric features
          </p>
        </div>

        <div className="space-y-4">
          <motion.button
            onClick={handleSetup}
            disabled={isSettingUp}
            className="
              w-full px-6 py-4 rounded-xl font-semibold text-white
              bg-gradient-to-r from-green-500 to-blue-500
              hover:from-green-600 hover:to-blue-600
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200 shadow-lg hover:shadow-xl
              flex items-center justify-center space-x-3
            "
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSettingUp ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Setting up...</span>
              </>
            ) : (
              <>
                <FingerprintIcon />
                <span>Enable Biometrics</span>
              </>
            )}
          </motion.button>

          <button
            onClick={onSkip}
            className="
              w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800
              hover:bg-gray-50 rounded-lg transition-colors duration-200
            "
          >
            Skip for now
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-500 text-center space-y-1">
          <div>🔒 Biometric data stays on your device</div>
          <div>⚡ Faster and more secure than passwords</div>
          <div>🔄 You can disable this anytime in settings</div>
        </div>
      </div>
    </Presence>
  );
}
