'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EnvelopeIcon, ArrowLeftIcon, CheckCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import PremiumButton from '@/components/UI/PremiumButton';
import apiClient from '@/lib/api-client';
import PremiumLayout from '@/components/Layout/PremiumLayout';
import HoloLogo from '@/components/Brand/HoloLogo';

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
      const response = await fetch(`${process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:5001'}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setIsSuccess(true);
      } else {
        setError(result.message || 'Failed to send reset email');
      }
    } catch (err: any) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PremiumLayout showHeader={false}>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
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
          <Link href="/" className="inline-flex justify-center items-center mb-8">
            <HoloLogo size={60} withText monochrome />
          </Link>
          
          {!isSuccess ? (
            <>
              <h2 className="text-4xl font-extrabold mb-3">
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Forgot Password?</span>
              </h2>
              <p className="text-base text-white/70">
                No worries! Enter your email and we'll send you reset instructions.
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircleIcon className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-4xl font-extrabold mb-3">
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Check Your Email</span>
              </h2>
              <p className="text-base text-white/70">
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
            <div className="glass-light p-8 rounded-3xl shadow-2xl space-y-6 border border-white/20">
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-500/30 border-2 border-red-500/60 text-red-100 p-4 rounded-xl text-sm font-bold flex items-center gap-2 backdrop-blur-md shadow-lg"
                  >
                    <ShieldCheckIcon className="h-6 w-6 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold mb-1">Error</p>
                      <p className="text-xs text-red-200">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-white/90 mb-2">
                  Email address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                    <EnvelopeIcon className="h-5 w-5 text-white/60 group-focus-within:text-white/80" />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    className="appearance-none relative block w-full pl-12 pr-4 py-3.5 border border-white/20 placeholder-white/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all bg-white/10 backdrop-blur-sm hover:border-white/30"
                    placeholder="your@email.com"
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 text-sm text-red-300 flex items-center gap-1"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex justify-center">
                <PremiumButton
                  size="lg"
                  disabled={isLoading}
                  loading={isLoading}
                  type="submit"
                  variant="primary"
                  glow
                  magneticEffect
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 font-bold shadow-xl border-none justify-center"
                  icon={<EnvelopeIcon className="h-6 w-6" />}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </PremiumButton>
              </div>

              <div className="text-center">
                <Link 
                  href="/login" 
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors underline"
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
            className="glass-light p-8 rounded-3xl shadow-2xl space-y-6 border border-white/20"
          >
            <div className="space-y-4 text-center">
              <p className="text-white/80">
                If an account exists with that email, you'll receive password reset instructions shortly.
              </p>
              <p className="text-sm text-white/70">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/login" className="flex-1">
                <PremiumButton
                  size="lg"
                  variant="outline"
                  className="w-full bg-white/20 border-2 border-white/50 hover:bg-white/30 hover:border-white font-semibold justify-center"
                  icon={<ArrowLeftIcon className="h-5 w-5" />}
                >
                  Back to Login
                </PremiumButton>
              </Link>
              <PremiumButton
                size="lg"
                onClick={() => setIsSuccess(false)}
                variant="primary"
                glow
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 font-bold shadow-xl justify-center"
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
          className="flex items-center justify-center gap-6 text-sm text-white/70"
        >
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-emerald-400" />
            <span>Secure & Encrypted</span>
          </div>
        </motion.div>
      </motion.div>
      </div>
    </PremiumLayout>
  );
}
