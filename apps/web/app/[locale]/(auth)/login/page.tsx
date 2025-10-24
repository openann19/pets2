'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EnvelopeIcon, LockClosedIcon, SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/api-hooks';
import PremiumButton from '@/components/UI/PremiumButton';
import PremiumLayout from '@/components/Layout/PremiumLayout';
import PremiumCard from '@/components/UI/PremiumCard';
import HoloLogo from '@/components/Brand/HoloLogo';
import { logger } from '@/services/logger';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const [loginSuccess, setLoginSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setValue('email', rememberedEmail);
      setValue('rememberMe', true);
    }
  }, [setValue]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log('🔐 Attempting login with:', data.email);
      const result = await login({ email: data.email, password: data.password });
      
      console.log('📊 Login result:', result);
      
      // Handle remember me
      if (data.rememberMe) {
        localStorage.setItem('rememberedEmail', data.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      setLoginSuccess(true);
      
      // Play success sound
      if (typeof window !== 'undefined' && window.Audio) {
        const audio = new Audio('/sounds/success.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      }
      
      // Navigate to dashboard after short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (err: unknown) {
      logger.error('Login error', { error: err });
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      logger.error('Error message', { message: errorMessage });
      logger.error('Error details', { details: err });
      // Error will be displayed from the useAuth hook's error state
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
                Welcome Back!
              </span>
            </h2>
            <p className="text-lg text-white/80 font-medium">
              Don't have an account?{' '}
              <Link href="/register" className="font-bold text-white hover:text-pink-300 transition-colors underline underline-offset-4 decoration-2">
                Sign up for free
              </Link>
            </p>
          </motion.div>

          {/* Elite Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <PremiumCard variant="glass" className="p-10 space-y-8 shadow-2xl border-2 border-white/30">
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} data-testid="login-form">
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
                      <p className="font-bold mb-1">Login Failed</p>
                      <p className="text-xs text-red-200">{error?.message || 'Unable to login. Please check your credentials or try again.'}</p>
                    </div>
                  </motion.div>
              )}
            </AnimatePresence>

                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-white mb-3 tracking-wide uppercase">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors">
                      <EnvelopeIcon className="h-6 w-6 text-white/60 group-focus-within:text-white transition-all" />
                    </div>
                    <input
                      {...register('email')}
                      type="email"
                      autoComplete="email"
                      className="appearance-none relative block w-full pl-14 pr-5 py-4 border-2 border-white/30 placeholder-white/60 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/70 focus:border-pink-500/50 transition-all bg-white/15 backdrop-blur-md hover:border-white/50 font-medium shadow-lg"
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

                <div>
                  <label htmlFor="password" className="block text-sm font-bold text-white mb-3 tracking-wide uppercase">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors">
                      <LockClosedIcon className="h-6 w-6 text-white/60 group-focus-within:text-white transition-all" />
                    </div>
                    <input
                      {...register('password')}
                      type="password"
                      autoComplete="current-password"
                      className="appearance-none relative block w-full pl-14 pr-5 py-4 border-2 border-white/30 placeholder-white/60 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/70 focus:border-pink-500/50 transition-all bg-white/15 backdrop-blur-md hover:border-white/50 font-medium shadow-lg"
                      placeholder="Enter your password"
                    />
                  </div>
              <AnimatePresence>
                {errors.password && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 text-sm text-red-300 flex items-center gap-1"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      {...register('rememberMe')}
                      id="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-pink-500 focus:ring-pink-500/30 border-white/30 bg-white/10 rounded cursor-pointer transition-colors hover:border-pink-500/50"
                    />
                    <label htmlFor="remember-me" className="ml-3 block text-sm text-white/80 font-medium cursor-pointer hover:text-white transition-colors">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link href="/forgot-password" className="font-semibold text-white/80 hover:text-white transition-colors underline">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <div className="flex justify-center">
                  <PremiumButton
                    variant="primary"
                    size="lg"
                    disabled={isLoading || loginSuccess}
                    loading={isLoading}
                    type="submit"
                    className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 hover:from-pink-400 hover:via-purple-400 hover:to-indigo-500 font-black shadow-2xl border-none justify-center text-xl py-5"
                    glow
                    magneticEffect
                    icon={loginSuccess ? <ShieldCheckIcon className="h-7 w-7" /> : <SparklesIcon className="h-7 w-7" />}
                  >
                    {loginSuccess ? '✨ Success! Redirecting...' : 'Sign In'}
                  </PremiumButton>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/10 text-white/70 font-medium backdrop-blur-md rounded-full">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                    <PremiumButton
                      variant="outline"
                      className="w-full bg-white/25 border-2 border-white/60 hover:bg-white/35 hover:border-white font-bold justify-center shadow-lg"
                      icon={
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 0C4.477 0 0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.879V12.89h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.989C16.343 19.129 20 14.99 20 10c0-5.523-4.477-10-10-10z"/>
                        </svg>
                      }
                    >
                      Facebook
                    </PremiumButton>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                    <PremiumButton
                      variant="outline"
                      className="w-full bg-white/25 border-2 border-white/60 hover:bg-white/35 hover:border-white font-bold justify-center shadow-lg"
                      icon={
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"/>
                        </svg>
                      }
                    >
                      GitHub
                    </PremiumButton>
                  </motion.div>
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
              <span className="font-semibold">Bank-Level Security</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="p-2 bg-violet-500/20 rounded-lg">
                <SparklesIcon className="h-6 w-6 text-violet-400" />
              </div>
              <span className="font-semibold">AI-Powered Matching</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </PremiumLayout>
  );
}
