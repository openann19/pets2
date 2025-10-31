'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { logger } from '@pawfectmatch/core';
import {
  UserCircleIcon,
  CameraIcon,
  PencilIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import PremiumLayout from '@/components/Layout/PremiumLayout';
import PremiumButton from '@/components/UI/PremiumButton';
import PremiumCard from '@/components/UI/PremiumCard';
import SafeImage from '@/components/UI/SafeImage';
import { ProfileSkeleton } from '@/components/UI/LoadingSkeleton';
import { useAuthStore } from '@/lib/auth-store';
import { useCurrentUser, useUpdateProfile } from '@/hooks/api-hooks';

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser } = useAuthStore();
  const { data: userData, isLoading, refetch } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const firstNameRef = React.useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    bio: string;
  }>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
  });

  React.useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        location: userData.location || '',
        bio: userData.bio || '',
      });
    }
  }, [userData]);

  // Autofocus first field when entering edit mode
  React.useEffect(() => {
    if (isEditing) {
      requestAnimationFrame(() => firstNameRef.current?.focus());
    }
  }, [isEditing]);

  const handleSave = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      // Cast formData to any to allow string location field
      // Backend will handle location string conversion
      await updateProfile.mutateAsync(formData as any);
      setIsEditing(false);
      setSuccessMessage('✅ Profile updated successfully!');
      
      // Clear success message after 4 seconds
      setTimeout(() => setSuccessMessage(null), 4000);
      
      refetch();
    } catch (error: any) {
      logger.error('Failed to update profile:', error);
      setErrorMessage(error.message || 'Failed to update profile. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <PremiumLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <ProfileSkeleton />
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Elite Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-block mb-6"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/40">
              <UserCircleIcon className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-2xl">
              Your Elite Profile
            </span>
          </h1>
          <p className="text-white/80 text-xl font-medium">Manage your exclusive account details</p>
        </motion.div>

        {/* Success Banner */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="mb-6"
            >
              <div className="bg-green-500/30 border-2 border-green-400/60 rounded-2xl p-5 backdrop-blur-sm shadow-2xl">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-7 h-7 text-green-100 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-green-50 text-lg">{successMessage}</p>
                  </div>
                  <button
                    onClick={() => setSuccessMessage(null)}
                    className="text-green-100 hover:text-white transition-colors p-1"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Banner */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="mb-6"
            >
              <div className="bg-red-500/30 border-2 border-red-400/60 rounded-2xl p-5 backdrop-blur-sm shadow-2xl">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="w-7 h-7 text-red-100 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-red-50 text-lg">Failed to save</p>
                    <p className="text-red-100 text-sm mt-1">{errorMessage}</p>
                  </div>
                  <button
                    onClick={() => setErrorMessage(null)}
                    className="text-red-100 hover:text-white transition-colors p-1"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Elite Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <PremiumCard variant="glass" className="p-10 shadow-2xl border-2 border-white/30">
            {/* Elite Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center gap-8 mb-10 pb-10 border-b border-white/20">
              <motion.div 
                className="relative group"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <SafeImage
                    src={userData?.avatar}
                    alt={userData?.name || 'User'}
                    fallbackType="user"
                    className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-2xl"
                  />
                  <motion.button 
                    className="absolute bottom-2 right-2 p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-2xl hover:from-pink-400 hover:to-purple-500 transition-all"
                    whileHover={{ scale: 1.15, rotate: 15 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <CameraIcon className="w-6 h-6 text-white" />
                  </motion.button>
                </div>
              </motion.div>
              
              <div className="flex-1 text-center sm:text-left">
                <motion.h2 
                  className="text-4xl font-black text-white mb-3 bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {userData?.firstName} {userData?.lastName}
                </motion.h2>
                <motion.p 
                  className="text-white/70 text-base mb-6 font-medium"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {userData?.email}
                </motion.p>
                
                {!isEditing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <PremiumButton
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="lg"
                      icon={<PencilIcon className="w-6 h-6" />}
                      className="bg-white/20 border-2 border-white/50 hover:bg-white/30 hover:border-white font-bold shadow-xl"
                      glow
                      magneticEffect
                    >
                      Edit Profile
                    </PremiumButton>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Profile Form */}
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="editing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Elite Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className="block text-sm font-bold text-white mb-3 tracking-wide">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-5 py-4 bg-white/15 border-2 border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500/70 focus:border-pink-500/50 transition-all font-medium shadow-lg hover:border-white/50"
                        ref={firstNameRef}
                      />
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <label className="block text-sm font-bold text-white mb-3 tracking-wide">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-5 py-4 bg-white/15 border-2 border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500/70 focus:border-pink-500/50 transition-all font-medium shadow-lg hover:border-white/50"
                      />
                    </motion.div>
                  </div>

                  {/* Elite Email */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-bold text-white mb-3 tracking-wide">
                      Email Address
                    </label>
                    <div className="relative group">
                      <EnvelopeIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-white/60 group-focus-within:text-white transition-colors" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-14 pr-5 py-4 bg-white/15 border-2 border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500/70 focus:border-pink-500/50 transition-all font-medium shadow-lg hover:border-white/50"
                      />
                    </div>
                  </motion.div>

                  {/* Elite Phone */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <label className="block text-sm font-bold text-white mb-3 tracking-wide">
                      Phone Number
                    </label>
                    <div className="relative group">
                      <PhoneIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-white/60 group-focus-within:text-white transition-colors" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-14 pr-5 py-4 bg-white/15 border-2 border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500/70 focus:border-pink-500/50 transition-all font-medium shadow-lg hover:border-white/50"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </motion.div>

                  {/* Elite Location */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-bold text-white mb-3 tracking-wide">
                      Location
                    </label>
                    <div className="relative group">
                      <MapPinIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-white/60 group-focus-within:text-white transition-colors" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full pl-14 pr-5 py-4 bg-white/15 border-2 border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500/70 focus:border-pink-500/50 transition-all font-medium shadow-lg hover:border-white/50"
                        placeholder="San Francisco, CA"
                      />
                    </div>
                  </motion.div>

                  {/* Elite Bio */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <label className="block text-sm font-bold text-white mb-3 tracking-wide">
                      About You
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={5}
                      className="w-full px-5 py-4 bg-white/15 border-2 border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500/70 focus:border-pink-500/50 transition-all resize-none font-medium shadow-lg hover:border-white/50"
                      placeholder="Tell us about yourself and your beloved pets..."
                    />
                  </motion.div>

                  {/* Elite Action Buttons */}
                  <motion.div 
                    className="flex flex-col sm:flex-row gap-4 pt-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <PremiumButton
                      onClick={handleSave}
                      disabled={updateProfile.isPending}
                      loading={updateProfile.isPending}
                      variant="primary"
                      size="lg"
                      icon={<CheckIcon className="w-6 h-6" />}
                      glow
                      magneticEffect
                      className="flex-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 hover:from-pink-400 hover:via-purple-400 hover:to-indigo-500 font-black shadow-2xl text-lg"
                    >
                      Save Changes
                    </PremiumButton>
                    
                    <PremiumButton
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      size="lg"
                      icon={<XMarkIcon className="w-6 h-6" />}
                      className="bg-white/20 border-2 border-white/50 hover:bg-white/30 hover:border-white font-bold shadow-xl"
                    >
                      Cancel
                    </PremiumButton>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="viewing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Info Display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm text-white/50 font-medium">Email</p>
                      <div className="flex items-center gap-2">
                        <EnvelopeIcon className="w-5 h-5 text-white/70" />
                        <p className="text-white font-medium">{userData?.email || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-white/50 font-medium">Phone</p>
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="w-5 h-5 text-white/70" />
                        <p className="text-white font-medium">{userData?.phone || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-white/50 font-medium">Location</p>
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-5 h-5 text-white/70" />
                        <p className="text-white font-medium">{userData?.location || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-white/50 font-medium">Member Since</p>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-white/70" />
                        <p className="text-white font-medium">
                          {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {userData?.bio && (
                    <div className="pt-6 border-t border-white/10">
                      <p className="text-sm text-white/50 font-medium mb-2">Bio</p>
                      <p className="text-white/90 leading-relaxed">{userData.bio}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </PremiumCard>
        </motion.div>
      </div>
    </PremiumLayout>
  );
}

