'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheckIcon, QrCodeIcon, KeyIcon } from '@heroicons/react/24/outline';
import QRCode from 'qrcode';
export const TwoFactorAuth = ({ onVerify, onSetup, mode, onCancel }) => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [step, setStep] = useState(mode === 'setup' ? 'qr' : 'verify');
    const inputRefs = useRef([]);
    useEffect(() => {
        if (mode === 'setup' && onSetup) {
            handleSetup();
        }
    }, [mode, onSetup]);
    const handleSetup = async () => {
        if (!onSetup)
            return;
        try {
            const { secret: newSecret, qrCode: qrData } = await onSetup();
            setSecret(newSecret);
            // Generate QR code
            const qrCodeDataUrl = await QRCode.toDataURL(qrData);
            setQrCode(qrCodeDataUrl);
        }
        catch (error) {
            setError('Failed to setup 2FA. Please try again.');
        }
    };
    const handleCodeChange = (index, value) => {
        if (!/^\d*$/.test(value))
            return;
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setError('');
        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
        // Auto-verify when all digits entered
        if (index === 5 && value && newCode.every((digit) => digit)) {
            handleVerify(newCode.join(''));
        }
    };
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
        const newCode = pastedData.slice(0, 6).split('');
        while (newCode.length < 6) {
            newCode.push('');
        }
        setCode(newCode);
        if (newCode.every((digit) => digit)) {
            handleVerify(newCode.join(''));
        }
    };
    const handleVerify = async (verificationCode) => {
        setIsVerifying(true);
        setError('');
        try {
            const success = await onVerify(verificationCode);
            if (!success) {
                setError('Invalid code. Please try again.');
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        }
        catch (error) {
            setError('Verification failed. Please try again.');
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        }
        finally {
            setIsVerifying(false);
        }
    };
    const copySecret = () => {
        navigator.clipboard.writeText(secret);
    };
    return (<div className="max-w-md mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-4">
          <ShieldCheckIcon className="w-8 h-8 text-white"/>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {mode === 'setup' ? 'Setup Two-Factor Authentication' : 'Enter Verification Code'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {mode === 'setup'
            ? 'Scan the QR code with your authenticator app'
            : 'Enter the 6-digit code from your authenticator app'}
        </p>
      </div>

      {mode === 'setup' && step === 'qr' && (<div className="space-y-6">
          {/* QR Code */}
          {qrCode && (<div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-center mb-4">
                <img src={qrCode} alt="QR Code" className="w-48 h-48"/>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Can't scan? Enter this code manually:
                </p>
                <div className="flex items-center justify-center space-x-2">
                  <code className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded text-sm font-mono">
                    {secret}
                  </code>
                  <button onClick={copySecret} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" aria-label="Copy secret">
                    <KeyIcon className="w-5 h-5 text-gray-600 dark:text-gray-400"/>
                  </button>
                </div>
              </div>
            </div>)}

          <button onClick={() => setStep('verify')} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all">
            Continue to Verification
          </button>
        </div>)}

      {(mode === 'verify' || step === 'verify') && (<div className="space-y-6">
          {/* Code Input */}
          <div className="flex justify-center space-x-2" onPaste={handlePaste}>
            {code.map((digit, index) => (<input key={index} ref={(el) => (inputRefs.current[index] = el)} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => handleCodeChange(index, e.target.value)} onKeyDown={(e) => handleKeyDown(index, e)} className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl transition-all ${error
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 focus:border-pink-500 dark:focus:border-pink-500'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/20`} disabled={isVerifying} autoFocus={index === 0}/>))}
          </div>

          {/* Error Message */}
          {error && (<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
            </div>)}

          {/* Loading State */}
          {isVerifying && (<div className="flex justify-center">
              <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"/>
            </div>)}

          {/* Help Text */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Open your authenticator app and enter the 6-digit code
            </p>
          </div>

          {/* Cancel Button */}
          {onCancel && (<button onClick={onCancel} className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium py-2 transition-colors">
              Cancel
            </button>)}
        </div>)}

      {/* Recommended Apps */}
      {mode === 'setup' && (<div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Recommended Authenticator Apps:
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center">
              <span className="mr-2">•</span>
              Google Authenticator
            </li>
            <li className="flex items-center">
              <span className="mr-2">•</span>
              Microsoft Authenticator
            </li>
            <li className="flex items-center">
              <span className="mr-2">•</span>
              Authy
            </li>
          </ul>
        </div>)}
    </div>);
};
export default TwoFactorAuth;
//# sourceMappingURL=TwoFactorAuth.jsx.map