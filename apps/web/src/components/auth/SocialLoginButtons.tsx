/**
 * Social Login Buttons Component
 * One-tap sign-in with Google, Apple, and other providers
 */
'use client';
import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { InteractiveButton } from '@/components/ui/Interactive';
export function SocialLoginButtons({ onSuccess, onError, className = '', showLabels = true, size = 'md' }) {
    const [isLoading, setIsLoading] = useState(null);
    const [error, setError] = useState(null);
    const handleSocialLogin = async (provider) => {
        setIsLoading(provider);
        setError(null);
        try {
            const result = await signIn(provider, {
                redirect: false,
                callbackUrl: '/dashboard',
            });
            if (result?.error) {
                throw new Error(result.error);
            }
            if (result?.ok) {
                // Get the session to pass user data
                const session = await getSession();
                if (session?.user) {
                    onSuccess?.(session.user);
                }
            }
        }
        catch (error) {
            const errorMessage = error.message || `Failed to sign in with ${provider}`;
            setError(errorMessage);
            onError?.(errorMessage);
        }
        finally {
            setIsLoading(null);
        }
    };
    const buttonSize = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    };
    const iconSize = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };
    return (<div className={`space-y-4 ${className}`}>
      {/* Google Sign-in */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <InteractiveButton onClick={() => handleSocialLogin('google')} disabled={isLoading !== null} className={`
            w-full bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 
            hover:border-gray-400 font-semibold shadow-md hover:shadow-lg
            ${buttonSize[size]} transition-all duration-200
            ${isLoading === 'google' ? 'opacity-75 cursor-not-allowed' : ''}
          `} icon={isLoading === 'google' ? (<div className={`${iconSize[size]} animate-spin rounded-full border-2 border-gray-300 border-t-gray-600`}/>) : (<GoogleIcon className={iconSize[size]}/>)}>
          {showLabels && (<span className="ml-2">
              {isLoading === 'google' ? 'Signing in...' : 'Continue with Google'}
            </span>)}
        </InteractiveButton>
      </motion.div>

      {/* Apple Sign-in */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <InteractiveButton onClick={() => handleSocialLogin('apple')} disabled={isLoading !== null} className={`
            w-full bg-black hover:bg-gray-900 text-white border-2 border-black 
            hover:border-gray-800 font-semibold shadow-md hover:shadow-lg
            ${buttonSize[size]} transition-all duration-200
            ${isLoading === 'apple' ? 'opacity-75 cursor-not-allowed' : ''}
          `} icon={isLoading === 'apple' ? (<div className={`${iconSize[size]} animate-spin rounded-full border-2 border-white border-t-transparent`}/>) : (<AppleIcon className={iconSize[size]}/>)}>
          {showLabels && (<span className="ml-2">
              {isLoading === 'apple' ? 'Signing in...' : 'Continue with Apple'}
            </span>)}
        </InteractiveButton>
      </motion.div>

      {/* Error Display */}
      {error && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-50 border-2 border-red-200 text-red-800 p-4 rounded-xl">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mr-2"/>
            <p className="text-sm font-medium">{error}</p>
          </div>
        </motion.div>)}

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"/>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">or continue with email</span>
        </div>
      </div>
    </div>);
}
// Google Icon Component
function GoogleIcon({ className }) {
    return (<svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>);
}
// Apple Icon Component
function AppleIcon({ className }) {
    return (<svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>);
}
// Quick Social Login Component for minimal UI
export function QuickSocialLogin({ onSuccess, onError }) {
    return (<div className="flex space-x-3">
      <InteractiveButton onClick={() => signIn('google', { callbackUrl: '/dashboard' })} className="flex-1 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 hover:border-gray-400 p-3" icon={<GoogleIcon className="w-5 h-5"/>}/>
      <InteractiveButton onClick={() => signIn('apple', { callbackUrl: '/dashboard' })} className="flex-1 bg-black hover:bg-gray-900 text-white border border-black hover:border-gray-800 p-3" icon={<AppleIcon className="w-5 h-5"/>}/>
    </div>);
}
//# sourceMappingURL=SocialLoginButtons.jsx.map