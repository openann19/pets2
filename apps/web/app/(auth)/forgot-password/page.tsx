'use client';

import { ArrowLeftIcon, CheckCircleIcon, EnvelopeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import PremiumButton from '../../../src/components/UI/PremiumButton';
import apiClient from '../../../src/lib/api-client';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.forgotPassword(data.email);
      
      if (response && typeof response === 'object' && 'success' in response && response.success) {
        setIsSuccess(true);
      } else {
        const errorResponse = response as { error?: string };
        setError(errorResponse?.error || 'Failed to send reset email');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-md w-full space-y-8 relative z-10"
      >
        {/* Logo and Header */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/" className="inline-flex justify-center items-center space-x-2 mb-8">
            <div className="text-5xl">
              🐾
            </div>
            <span className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              PawfectMatch
            </span>
          </Link>
          
          {!isSuccess ? (
            <>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-3">
                Forgot Password?
              </h2>
              <p className="text-base text-gray-600">
                No worries! Enter your email and we'll send you reset instructions.
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircleIcon className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-3">
                Check Your Email
              </h2>
              <p className="text-base text-gray-600">
                We've sent password reset instructions to your email address.
              </p>
            </>
          )}
        </motion.div>

        {/* Main Form Card */}
        {!isSuccess ? (
          <motion.form 
            className="space-y-6" 
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl space-y-6 border border-white/20">
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium flex items-center gap-2"
                  >
                    <ShieldCheckIcon className="h-5 w-5" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500" />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    className="appearance-none relative block w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white/50 backdrop-blur-sm hover:border-gray-300"
                    placeholder="your@email.com"
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 text-sm text-red-600 flex items-center gap-1"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <PremiumButton
                size="lg"
                disabled={isLoading}
                loading={isLoading}
                onClick={handleSubmit(onSubmit)}
                className="w-full shadow-xl hover:shadow-2xl"
              >
                <span className="flex items-center justify-center gap-2">
                  <EnvelopeIcon className="h-5 w-5" />
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </span>
              </PremiumButton>

              <div className="text-center">
                <Link 
                  href="/login" 
                  className="inline-flex items-center gap-2 text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 transition-all"
                >
                  <ArrowLeftIcon className="h-4 w-4 text-purple-600" />
                  Back to login
                </Link>
              </div>
            </div>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl space-y-6 border border-white/20"
          >
            <div className="space-y-4 text-center">
              <p className="text-gray-600">
                If an account exists with that email, you'll receive password reset instructions shortly.
              </p>
              <p className="text-sm text-gray-500">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/login" className="flex-1">
                <PremiumButton
                  size="lg"
                  variant="secondary"
                  className="w-full"
                >
                  <span className="flex items-center justify-center gap-2">
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back to Login
                  </span>
                </PremiumButton>
              </Link>
              <PremiumButton
                size="lg"
                onClick={() => setIsSuccess(false)}
                className="flex-1"
              >
                Try Again
              </PremiumButton>
            </div>
          </motion.div>
        )}

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-6 text-sm text-gray-600"
        >
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-green-500" />
            <span>Secure & Encrypted</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
