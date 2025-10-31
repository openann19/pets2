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
import { useAuth } from '../../../src/components/providers/AuthProvider';
import PremiumButton from '../../../src/components/UI/PremiumButton';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
  dateOfBirth: z.string(),
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
      await registerUser(data.email, data.password, data.name, data.dateOfBirth);
      router.push('/dashboard');
    } catch (error) {
      logger.error('Registration error:', error);
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
          className="absolute top-40 right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, -50, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 18,
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
          <h2 className="text-4xl font-extrabold text-gray-900 mb-3">
            Join PawfectMatch
          </h2>
          <p className="text-base text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 transition-all">
              Sign in
            </Link>
          </p>
        </motion.div>

        {/* Main Form Card */}
        <motion.form 
          className="space-y-6" 
          onSubmit={handleSubmit(onSubmit)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          data-testid="register-form"
        >
          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl space-y-5 border border-white/20">
            <AnimatePresence>
              {authError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium flex items-center gap-2"
                >
                  <ShieldCheckIcon className="h-5 w-5" />
                  {authError}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                  <UserIcon className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500" />
                </div>
                <input
                  {...registerField('name')}
                  type="text"
                  autoComplete="name"
                  className="appearance-none relative block w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white/50 backdrop-blur-sm hover:border-gray-300"
                  placeholder="John Doe"
                />
              </div>
              <AnimatePresence>
                {errors.name && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 text-sm text-red-600"
                  >
                    {errors.name.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500" />
                </div>
                <input
                  {...registerField('email')}
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
                    className="mt-2 text-sm text-red-600"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700 mb-2">
                Date of Birth
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                  <CalendarIcon className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500" />
                </div>
                <input
                  {...registerField('dateOfBirth')}
                  type="date"
                  className="appearance-none relative block w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white/50 backdrop-blur-sm hover:border-gray-300"
                />
              </div>
              <AnimatePresence>
                {errors.dateOfBirth && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 text-sm text-red-600"
                  >
                    {errors.dateOfBirth.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                  <LockClosedIcon className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500" />
                </div>
                <input
                  {...registerField('password')}
                  type="password"
                  autoComplete="new-password"
                  className="appearance-none relative block w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white/50 backdrop-blur-sm hover:border-gray-300"
                  placeholder="Create a strong password"
                />
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 text-sm text-red-600"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                  <LockClosedIcon className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500" />
                </div>
                <input
                  {...registerField('confirmPassword')}
                  type="password"
                  autoComplete="new-password"
                  className="appearance-none relative block w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white/50 backdrop-blur-sm hover:border-gray-300"
                  placeholder="Confirm your password"
                />
              </div>
              <AnimatePresence>
                {errors.confirmPassword && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 text-sm text-red-600"
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
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="agreeToTerms" className="text-sm text-gray-700 cursor-pointer">
                    I agree to the{' '}
                    <Link href="/terms" className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700">
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
                    className="text-sm text-red-600"
                  >
                    {errors.agreeToTerms.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <PremiumButton
              size="lg"
              disabled={isLoading || authLoading}
              loading={isLoading || authLoading}
              onClick={handleSubmit(onSubmit)}
              className="w-full shadow-xl hover:shadow-2xl"
            >
              <span className="flex items-center justify-center gap-2">
                <HeartIcon className="h-5 w-5" />
                {isLoading || authLoading ? 'Creating account...' : 'Create Account'}
              </span>
            </PremiumButton>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/90 text-gray-500 font-medium">Or sign up with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full inline-flex justify-center items-center py-3 px-4 border-2 border-gray-200 rounded-xl shadow-sm bg-white/50 backdrop-blur-sm text-sm font-semibold text-gray-700 hover:bg-white hover:border-gray-300 transition-all"
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
                className="w-full inline-flex justify-center items-center py-3 px-4 border-2 border-gray-200 rounded-xl shadow-sm bg-white/50 backdrop-blur-sm text-sm font-semibold text-gray-700 hover:bg-white hover:border-gray-300 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"/>
                </svg>
                <span className="ml-2">GitHub</span>
              </motion.button>
            </div>
          </div>
        </motion.form>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-6 text-sm text-gray-600"
        >
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-green-500" />
            <span>Secure & Private</span>
          </div>
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-purple-500" />
            <span>AI-Powered</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
