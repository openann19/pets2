'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  CloudArrowUpIcon,
  PlusIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

import PremiumLayout from '@/components/Layout/PremiumLayout';
import PremiumButton from '@/components/UI/PremiumButton';
import PremiumCard from '@/components/UI/PremiumCard';
import PremiumInput from '@/components/UI/PremiumInput';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { PREMIUM_VARIANTS, STAGGER_CONFIG } from '@/constants/animations';
import { useCreatePet } from '@/hooks/api-hooks';

interface PhotoData {
  file: File;
  preview: string;
  isPrimary: boolean;
}

export default function CreatePetPage() {
  const router = useRouter();
  const createPet = useCreatePet();

  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    gender: '',
    size: '',
    description: '',
    personalityTags: [] as string[],
    intent: '',
    healthInfo: {
      vaccinated: false,
      spayedNeutered: false,
      microchipped: false,
      specialNeeds: false
    }
  });

  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const speciesOptions = [
    { value: 'dog', label: 'Dog', emoji: '🐕' },
    { value: 'cat', label: 'Cat', emoji: '🐱' },
    { value: 'bird', label: 'Bird', emoji: '🐦' },
    { value: 'rabbit', label: 'Rabbit', emoji: '🐰' },
    { value: 'other', label: 'Other', emoji: '🐾' }
  ];

  const intentOptions = [
    { value: 'adoption', label: 'Available for Adoption', emoji: '🏠' },
    { value: 'mating', label: 'Looking for Mates', emoji: '💕' },
    { value: 'playdate', label: 'Playdates Only', emoji: '🎾' },
    { value: 'all', label: 'Open to All', emoji: '🌟' }
  ];

  const personalityTags = [
    'friendly', 'energetic', 'playful', 'calm', 'shy', 'protective',
    'good-with-kids', 'good-with-pets', 'trained', 'house-trained', 'intelligent'
  ];

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhotoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const maxPhotos = 10;
    const currentCount = photos.length;
    const remainingSlots = maxPhotos - currentCount;

    if (remainingSlots <= 0) {
      setErrors(prev => ({ ...prev, photos: 'Maximum 10 photos allowed' }));
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, photos: 'Each photo must be under 5MB' }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        setPhotos(prev => [...prev, {
          file,
          preview,
          isPrimary: prev.length === 0 // First photo is primary by default
        }]);
      };
      reader.readAsDataURL(file);
    });

    setErrors(prev => ({ ...prev, photos: '' }));
  }, [photos.length]);

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const newPhotos = prev.filter((_, i) => i !== index);
      // If we removed the primary photo, make the first remaining photo primary
      if (prev[index].isPrimary && newPhotos.length > 0) {
        newPhotos[0].isPrimary = true;
      }
      return newPhotos;
    });
  };

  const setPrimaryPhoto = (index: number) => {
    setPhotos(prev => prev.map((photo, i) => ({
      ...photo,
      isPrimary: i === index
    })));
  };

  const togglePersonalityTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      personalityTags: prev.personalityTags.includes(tag)
        ? prev.personalityTags.filter(t => t !== tag)
        : [...prev.personalityTags, tag]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Pet name is required';
    if (!formData.species) newErrors.species = 'Species is required';
    if (!formData.breed.trim()) newErrors.breed = 'Breed is required';
    if (!formData.age || isNaN(Number(formData.age)) || Number(formData.age) < 0 || Number(formData.age) > 30) {
      newErrors.age = 'Age must be between 0 and 30 years';
    }
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.size) newErrors.size = 'Size is required';
    if (!formData.intent) newErrors.intent = 'Intent is required';
    if (photos.length === 0) newErrors.photos = 'At least one photo is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const petData = {
        ...formData,
        age: Number(formData.age),
        photos: photos.map((photo, index) => ({
          file: photo.file,
          isPrimary: photo.isPrimary || (index === 0 && photos.length === 1)
        }))
      };

      await createPet.mutateAsync(petData);

      setSuccessMessage('Pet profile created successfully!');
      setTimeout(() => {
        router.push('/my-pets');
      }, 2000);

    } catch (error: any) {
      console.error('Error creating pet:', error);
      setErrors({
        submit: error.response?.data?.message || 'Failed to create pet profile. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PremiumLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          variants={PREMIUM_VARIANTS.fadeInUp}
          initial="initial"
          animate="animate"
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <PremiumButton
                  variant="ghost"
                  size="sm"
                  icon={<ArrowLeftIcon className="w-5 h-5" />}
                >
                  Back to Dashboard
                </PremiumButton>
              </Link>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Create Pet Profile</h1>
                <p className="text-gray-600 mt-1">Add your furry friend to find perfect matches</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <PremiumCard variant="gradient" className="p-4">
              <div className="flex items-center space-x-3">
                <CheckIcon className="w-6 h-6 text-white" />
                <p className="text-white font-medium">{successMessage}</p>
              </div>
            </PremiumCard>
          </motion.div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <PremiumCard variant="neon" className="p-4 border-red-200">
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                <p className="text-red-700 font-medium">{errors.submit}</p>
              </div>
            </PremiumCard>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <motion.div
              variants={PREMIUM_VARIANTS.fadeInUp}
              transition={{ delay: 0.1 }}
            >
              <PremiumCard variant="glass" className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <PremiumInput
                    label="Pet Name"
                    value={formData.name}
                    onChange={(value) => handleInputChange('name', value)}
                    placeholder="Enter your pet's name"
                    required
                    error={errors.name}
                  />

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Species *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {speciesOptions.map((option) => (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleInputChange('species', option.value)}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            formData.species === option.value
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
                          }`}
                        >
                          <span className="text-2xl mr-2">{option.emoji}</span>
                          {option.label}
                        </motion.button>
                      ))}
                    </div>
                    {errors.species && (
                      <p className="text-sm text-red-600 mt-1">{errors.species}</p>
                    )}
                  </div>

                  <PremiumInput
                    label="Breed"
                    value={formData.breed}
                    onChange={(value) => handleInputChange('breed', value)}
                    placeholder="e.g., Golden Retriever, Siamese"
                    required
                    error={errors.breed}
                  />

                  <PremiumInput
                    label="Age (years)"
                    type="number"
                    value={formData.age}
                    onChange={(value) => handleInputChange('age', value)}
                    placeholder="0-30"
                    min="0"
                    max="30"
                    required
                    error={errors.age}
                  />

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Gender *</label>
                    <div className="flex space-x-3">
                      {[
                        { value: 'male', label: 'Male', emoji: '♂️' },
                        { value: 'female', label: 'Female', emoji: '♀️' }
                      ].map((option) => (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleInputChange('gender', option.value)}
                          className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                            formData.gender === option.value
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
                          }`}
                        >
                          <span className="mr-2">{option.emoji}</span>
                          {option.label}
                        </motion.button>
                      ))}
                    </div>
                    {errors.gender && (
                      <p className="text-sm text-red-600 mt-1">{errors.gender}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Size *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'tiny', label: 'Tiny', desc: '< 5 lbs' },
                        { value: 'small', label: 'Small', desc: '5-20 lbs' },
                        { value: 'medium', label: 'Medium', desc: '20-50 lbs' },
                        { value: 'large', label: 'Large', desc: '50-100 lbs' },
                        { value: 'extra-large', label: 'Extra Large', desc: '> 100 lbs' }
                      ].map((option) => (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleInputChange('size', option.value)}
                          className={`p-3 rounded-xl border-2 transition-all text-left ${
                            formData.size === option.value
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
                          }`}
                        >
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs opacity-75">{option.desc}</div>
                        </motion.button>
                      ))}
                    </div>
                    {errors.size && (
                      <p className="text-sm text-red-600 mt-1">{errors.size}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <PremiumInput
                    label="Description"
                    type="textarea"
                    value={formData.description}
                    onChange={(value) => handleInputChange('description', value)}
                    placeholder="Tell us about your pet's personality, habits, and what makes them special..."
                    rows={4}
                  />
                </div>
              </PremiumCard>
            </motion.div>

            {/* Personality */}
            <motion.div
              variants={PREMIUM_VARIANTS.fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <PremiumCard variant="glass" className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Personality & Traits</h2>

                <div className="space-y-4">
                  <p className="text-gray-600">Select all that apply to help us find better matches:</p>

                  <div className="flex flex-wrap gap-3">
                    {personalityTags.map((tag) => (
                      <motion.button
                        key={tag}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => togglePersonalityTag(tag)}
                        className={`px-4 py-2 rounded-full border-2 transition-all ${
                          formData.personalityTags.includes(tag)
                            ? 'border-purple-500 bg-purple-100 text-purple-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
                        }`}
                      >
                        {tag.replace('-', ' ')}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </PremiumCard>
            </motion.div>

            {/* Intent & Health */}
            <motion.div
              variants={PREMIUM_VARIANTS.fadeInUp}
              transition={{ delay: 0.3 }}
            >
              <PremiumCard variant="glass" className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Intent & Health</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">What are you looking for? *</label>
                    <div className="grid md:grid-cols-2 gap-3">
                      {intentOptions.map((option) => (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleInputChange('intent', option.value)}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            formData.intent === option.value
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
                          }`}
                        >
                          <span className="text-xl mr-3">{option.emoji}</span>
                          <span className="font-medium">{option.label}</span>
                        </motion.button>
                      ))}
                    </div>
                    {errors.intent && (
                      <p className="text-sm text-red-600 mt-2">{errors.intent}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Health Information</label>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { key: 'vaccinated', label: 'Vaccinated' },
                        { key: 'spayedNeutered', label: 'Spayed/Neutered' },
                        { key: 'microchipped', label: 'Microchipped' },
                        { key: 'specialNeeds', label: 'Has Special Needs' }
                      ].map((item) => (
                        <label key={item.key} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={formData.healthInfo[item.key as keyof typeof formData.healthInfo] as boolean}
                            onChange={(e) => handleInputChange(`healthInfo.${item.key}`, e.target.checked)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>
          </div>

          {/* Photo Upload Sidebar */}
          <div className="space-y-6">
            <motion.div
              variants={PREMIUM_VARIANTS.fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <PremiumCard variant="glass" className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Photos</h2>

                {/* Photo Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {photos.map((photo, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <img
                        src={photo.preview}
                        alt={`Pet photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />

                      {/* Primary badge */}
                      {photo.isPrimary && (
                        <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                          Primary
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex space-x-2">
                          {!photo.isPrimary && (
                            <button
                              onClick={() => setPrimaryPhoto(index)}
                              className="p-1 bg-white rounded-full text-gray-700 hover:text-purple-600"
                              title="Set as primary"
                            >
                              <HeartIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => removePhoto(index)}
                            className="p-1 bg-white rounded-full text-gray-700 hover:text-red-600"
                            title="Remove photo"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Upload button */}
                  {photos.length < 10 && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <label className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all">
                        <PhotoIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Add Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </motion.div>
                  )}
                </div>

                {errors.photos && (
                  <p className="text-sm text-red-600">{errors.photos}</p>
                )}

                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Upload up to 10 photos (max 5MB each)</p>
                  <p>• First photo will be set as primary</p>
                  <p>• Supported formats: JPG, PNG, GIF</p>
                </div>
              </PremiumCard>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              variants={PREMIUM_VARIANTS.fadeInUp}
              transition={{ delay: 0.5 }}
            >
              <PremiumButton
                variant="gradient"
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full"
                glow
                magneticEffect
                haptic
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" variant="default" />
                    <span className="ml-2">Creating Profile...</span>
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Create Pet Profile
                  </>
                )}
              </PremiumButton>
            </motion.div>
          </div>
        </div>
      </div>
    </PremiumLayout>
  );
}
