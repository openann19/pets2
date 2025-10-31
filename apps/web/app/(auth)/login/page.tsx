'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { logger } from '@pawfectmatch/core';
// import { useRouter } from 'next/navigation'; // TODO: Re-enable when routing is needed
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EnvelopeIcon, LockClosedIcon, SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { SocialLoginButtons } from '@/components/Auth/SocialLoginButtons';
import { useAuth } from '../../../src/hooks/api-hooks';
import PremiumButton from '../../../src/components/UI/PremiumButton';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login({ email: data.email, password: data.password });
      // Navigate to dashboard after successful login
      router.push('/dashboard');
    } catch (loginError) {
      logger.error('Login failed:', loginError);
      // Error is already handled by useAuth hook
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
          <h2 className="text-4xl font-extrabold text-gray-900 mb-3">
            Welcome back!
          </h2>
          <p className="text-base text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 transition-all">
              Sign up
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
          data-testid="login-form"
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
                  {error?.message || 'Login failed'}
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

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                  <LockClosedIcon className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500" />
                </div>
                <input
                  {...register('password')}
                  type="password"
                  autoComplete="current-password"
                  className="appearance-none relative block w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white/50 backdrop-blur-sm hover:border-gray-300"
                  placeholder="Enter your password"
                />
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 text-sm text-red-600 flex items-center gap-1"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-700 font-medium cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 transition-all">
                  Forgot password?
                </Link>
              </div>
            </div>

            <PremiumButton
              size="lg"
              disabled={isLoading}
              loading={isLoading}
              onClick={handleSubmit(onSubmit)}
              className="w-full shadow-xl hover:shadow-2xl"
            >
              <span className="flex items-center justify-center gap-2">
                <SparklesIcon className="h-5 w-5" />
                Sign in
              </span>
            </PremiumButton>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/90 text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            <SocialLoginButtons showLabels className="w-full" />
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
            <span>Secure Login</span>
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
