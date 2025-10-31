'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { logger } from '@pawfectmatch/core';
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  CalendarIcon,
  SparklesIcon,
  ShieldCheckIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/components/providers/AuthProvider';
import PremiumButton from '@/components/UI/PremiumButton';
import PremiumCard from '@/components/UI/PremiumCard';
import PremiumLayout from '@/components/Layout/PremiumLayout';
import HoloLogo from '@/components/Brand/HoloLogo';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
  dateOfBirth: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 18;
  }, 'You must be at least 18 years old'),
  phoneNumber: z.string().optional(),
  location: z.string().min(2, 'Location is required'),
  agreeToTerms: z.boolean(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => data.agreeToTerms, {
  message: "You must agree to the terms and conditions",
  path: ["agreeToTerms"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, loading: authLoading, error: authError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const fullName = `${data.firstName} ${data.lastName}`;
      await registerUser(data.email, data.password, fullName, data.dateOfBirth);
      router.push('/dashboard');
    } catch (error) {
      logger.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PremiumLayout showHeader={false}>
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-md w-full space-y-8"
        >
          {/* Elite Logo and Header */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Link href="/" className="inline-flex justify-center items-center mb-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-3xl blur-xl opacity-60"></div>
                  <div className="relative">
                    <HoloLogo size={80} withText monochrome />
                  </div>
                </div>
              </Link>
            </motion.div>
            <h2 className="text-5xl md:text-6xl font-black mb-4">
              <span className="bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-2xl">
                Join PawfectMatch
              </span>
            </h2>
            <p className="text-lg text-white/80 font-medium">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-white hover:text-pink-300 transition-colors underline underline-offset-4 decoration-2">
                Sign in here
              </Link>
            </p>
          </motion.div>

          {/* Elite Form Card */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <PremiumCard variant="glass" className="p-10 space-y-6 shadow-2xl border-2 border-white/30">
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} data-testid="register-form">
            <AnimatePresence>
              {authError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/20 border border-red-500/30 text-red-200 p-4 rounded-xl text-sm font-medium flex items-center gap-2 backdrop-blur-md"
                >
                  <ShieldCheckIcon className="h-5 w-5" />
                  {authError}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-bold text-white mb-3 tracking-wide uppercase">
                  First Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors">
                    <UserIcon className="h-6 w-6 text-white/60 group-focus-within:text-white transition-all" />
                  </div>
                  <input
                    {...registerField('firstName')}
                    type="text"
                    autoComplete="given-name"
                    className="appearance-none relative block w-full pl-14 pr-5 py-4 border-2 border-white/30 placeholder-white/60 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/70 focus:border-pink-500/50 transition-all bg-white/15 backdrop-blur-md hover:border-white/50 font-medium shadow-lg"
                    placeholder="John"
                  />
                </div>
                <AnimatePresence>
                  {errors.firstName && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 text-sm text-red-300"
                    >
                      {errors.firstName.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-bold text-white mb-3 tracking-wide uppercase">
                  Last Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors">
                    <UserIcon className="h-6 w-6 text-white/60 group-focus-within:text-white transition-all" />
                  </div>
                  <input
                    {...registerField('lastName')}
                    type="text"
                    autoComplete="family-name"
                    className="appearance-none relative block w-full pl-14 pr-5 py-4 border-2 border-white/30 placeholder-white/60 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/70 focus:border-pink-500/50 transition-all bg-white/15 backdrop-blur-md hover:border-white/50 font-medium shadow-lg"
                    placeholder="Doe"
                  />
                </div>
                <AnimatePresence>
                  {errors.lastName && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 text-sm text-red-300"
                    >
                      {errors.lastName.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-white/90 mb-2">
                Email address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                  <EnvelopeIcon className="h-5 w-5 text-white/60 group-focus-within:text-white/80" />
                </div>
                <input
                  {...registerField('email')}
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
                    className="mt-2 text-sm text-red-300"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-white/90 mb-2">
                Date of Birth
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                  <CalendarIcon className="h-5 w-5 text-white/60 group-focus-within:text-white/80" />
                </div>
                <input
                  {...registerField('dateOfBirth')}
                  type="date"
                  className="appearance-none relative block w-full pl-12 pr-4 py-3.5 border border-white/20 placeholder-white/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all bg-white/10 backdrop-blur-sm hover:border-white/30"
                />
              </div>
              <AnimatePresence>
                {errors.dateOfBirth && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 text-sm text-red-300"
                  >
                    {errors.dateOfBirth.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-semibold text-white/90 mb-2">
                Phone Number <span className="text-gray-500 text-sm">(Optional)</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                  <svg className="h-5 w-5 text-white/60 group-focus-within:text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  {...registerField('phoneNumber')}
                  type="tel"
                  autoComplete="tel"
                  className="appearance-none relative block w-full pl-12 pr-4 py-3.5 border border-white/20 placeholder-white/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all bg-white/10 backdrop-blur-sm hover:border-white/30"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <AnimatePresence>
                {errors.phoneNumber && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 text-sm text-red-300"
                  >
                    {errors.phoneNumber.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-white/90 mb-2">
                Location
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                  <svg className="h-5 w-5 text-white/60 group-focus-within:text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  {...registerField('location')}
                  type="text"
                  autoComplete="address-level1"
                  className="appearance-none relative block w-full pl-12 pr-4 py-3.5 border border-white/20 placeholder-white/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all bg-white/10 backdrop-blur-sm hover:border-white/30"
                  placeholder="San Francisco, CA"
                />
              </div>
              <AnimatePresence>
                {errors.location && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 text-sm text-red-300"
                  >
                    {errors.location.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white/90 mb-2">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                  <LockClosedIcon className="h-5 w-5 text-white/60 group-focus-within:text-white/80" />
                </div>
                <input
                  {...registerField('password')}
                  type="password"
                  autoComplete="new-password"
                  className="appearance-none relative block w-full pl-12 pr-4 py-3.5 border border-white/20 placeholder-white/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all bg-white/10 backdrop-blur-sm hover:border-white/30"
                  placeholder="Create a strong password"
                />
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 text-sm text-red-300"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white/90 mb-2">
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                  <LockClosedIcon className="h-5 w-5 text-white/60 group-focus-within:text-white/80" />
                </div>
                <input
                  {...registerField('confirmPassword')}
                  type="password"
                  autoComplete="new-password"
                  className="appearance-none relative block w-full pl-12 pr-4 py-3.5 border border-white/20 placeholder-white/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all bg-white/10 backdrop-blur-sm hover:border-white/30"
                  placeholder="Confirm your password"
                />
              </div>
              <AnimatePresence>
                {errors.confirmPassword && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 text-sm text-red-300"
                  >
                    {errors.confirmPassword.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-2">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    {...registerField('agreeToTerms')}
                    id="agreeToTerms"
                    type="checkbox"
                    className="h-4 w-4 text-white focus:ring-white/30 border-white/30 bg-white/10 rounded cursor-pointer"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="agreeToTerms" className="text-sm text-white/80 cursor-pointer">
                    I agree to the{' '}
                    <Link href="/terms" className="font-semibold text-white hover:text-white/80 underline">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="font-semibold text-white hover:text-white/80 underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>
              <AnimatePresence>
                {errors.agreeToTerms && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-red-300"
                  >
                    {errors.agreeToTerms.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-center pt-2">
              <PremiumButton
                type="submit"
                size="lg"
                disabled={isLoading || authLoading}
                loading={isLoading || authLoading}
                variant="primary"
                fullWidth
                glow
                magneticEffect
                icon={<HeartIcon className="h-7 w-7" />}
                className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 hover:from-pink-400 hover:via-purple-400 hover:to-indigo-500 font-black shadow-2xl border-none justify-center text-xl py-5"
              >
                {isLoading || authLoading ? '✨ Creating account...' : 'Create Account'}
              </PremiumButton>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/10 text-white/70 font-medium backdrop-blur-md rounded-full">Or sign up with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-sm font-semibold text-white hover:border-white/30 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 0C4.477 0 0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.879V12.89h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.989C16.343 19.129 20 14.99 20 10c0-5.523-4.477-10-10-10z"/>
                </svg>
                <span className="ml-2">Facebook</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-sm font-semibold text-white hover:border-white/30 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"/>
                </svg>
                <span className="ml-2">GitHub</span>
              </motion.button>
            </div>
              </form>
            </PremiumCard>
          </motion.div>

          {/* Elite Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex items-center justify-center gap-8 text-base text-white/90"
          >
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <ShieldCheckIcon className="h-6 w-6 text-emerald-400" />
              </div>
              <span className="font-semibold">100% Secure</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="p-2 bg-violet-500/20 rounded-lg">
                <SparklesIcon className="h-6 w-6 text-violet-400" />
              </div>
              <span className="font-semibold">AI-Powered</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </PremiumLayout>
  );
}
