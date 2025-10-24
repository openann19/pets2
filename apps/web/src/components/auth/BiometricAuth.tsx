'use client';
import React, { useState, useEffect } from 'react';
import { FingerprintIcon, FaceSmileIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
export const BiometricAuth = ({ onSuccess, onError, onFallback }) => {
    const [isSupported, setIsSupported] = useState(false);
    const [biometricType, setBiometricType] = useState('none');
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    useEffect(() => {
        checkBiometricSupport();
    }, []);
    const checkBiometricSupport = async () => {
        // Check for Web Authentication API (WebAuthn)
        if (!window.PublicKeyCredential) {
            setIsSupported(false);
            return;
        }
        try {
            const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
            setIsSupported(available);
            // Detect biometric type based on platform
            const userAgent = navigator.userAgent.toLowerCase();
            if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
                setBiometricType('face'); // Face ID on iOS
            }
            else if (userAgent.includes('android')) {
                setBiometricType('fingerprint'); // Fingerprint on Android
            }
            else if (userAgent.includes('mac')) {
                setBiometricType('fingerprint'); // Touch ID on Mac
            }
        }
        catch (error) {
            setIsSupported(false);
        }
    };
    const authenticate = async () => {
        if (!isSupported) {
            onFallback();
            return;
        }
        setIsAuthenticating(true);
        try {
            // Create credential request
            const publicKey = {
                challenge: new Uint8Array(32), // Should come from server
                timeout: 60000,
                userVerification: 'required',
                rpId: window.location.hostname,
            };
            const credential = (await navigator.credentials.get({
                publicKey,
            }));
            if (credential) {
                onSuccess();
            }
            else {
                onError('Authentication failed');
            }
        }
        catch (error) {
            if (error.name === 'NotAllowedError') {
                onError('Authentication cancelled');
            }
            else if (error.name === 'InvalidStateError') {
                onError('No biometric credentials found');
            }
            else {
                onError('Authentication failed');
            }
        }
        finally {
            setIsAuthenticating(false);
        }
    };
    const getIcon = () => {
        switch (biometricType) {
            case 'face':
                return FaceSmileIcon;
            case 'fingerprint':
                return FingerprintIcon;
            default:
                return DevicePhoneMobileIcon;
        }
    };
    const getTitle = () => {
        switch (biometricType) {
            case 'face':
                return 'Face ID';
            case 'fingerprint':
                return 'Touch ID';
            default:
                return 'Biometric Authentication';
        }
    };
    const getDescription = () => {
        switch (biometricType) {
            case 'face':
                return 'Look at your device to authenticate';
            case 'fingerprint':
                return 'Touch the fingerprint sensor';
            default:
                return 'Use your device biometrics';
        }
    };
    const Icon = getIcon();
    if (!isSupported) {
        return null;
    }
    return (<div className="text-center">
      <button onClick={authenticate} disabled={isAuthenticating} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl">
        <div className="flex flex-col items-center space-y-2">
          {isAuthenticating ? (<div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"/>) : (<Icon className="w-8 h-8"/>)}
          <div>
            <div className="font-bold">{getTitle()}</div>
            <div className="text-sm opacity-90">{getDescription()}</div>
          </div>
        </div>
      </button>

      <button onClick={onFallback} className="mt-4 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
        Use password instead
      </button>
    </div>);
};
export default BiometricAuth;
//# sourceMappingURL=BiometricAuth.jsx.map