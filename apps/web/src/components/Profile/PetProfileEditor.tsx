'use client';
import { PhotoCropper } from '@/components/Photo/PhotoCropper';
import { CustomTextarea } from '@/components/ui/CustomTextarea';
import { CameraIcon, PencilIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
export const PetProfileEditor = ({ pet, onSave, isLoading = false }) => {
    const [profile, setProfile] = useState(pet);
    const [showAvatarCropper, setShowAvatarCropper] = useState(false);
    const [showCoverCropper, setShowCoverCropper] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [activeTab, setActiveTab] = useState('basic');
    const [showTooltip, setShowTooltip] = useState(null);
    const handleChange = (field, value) => {
        setProfile({ ...profile, [field]: value });
    };
    const handleStringArrayChange = (field, value) => {
        // Handle string arrays like personality traits, likes, dislikes
        const currentArray = profile[field] || [];
        if (!value.trim())
            return;
        if (!currentArray.includes(value)) {
            setProfile({
                ...profile,
                [field]: [...currentArray, value],
            });
        }
    };
    const handleRemoveStringArrayItem = (field, index) => {
        const currentArray = profile[field] || [];
        setProfile({
            ...profile,
            [field]: currentArray.filter((_, i) => i !== index),
        });
    };
    const handleFileSelect = (type) => (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage(event.target?.result);
                if (type === 'avatar') {
                    setShowAvatarCropper(true);
                }
                else {
                    setShowCoverCropper(true);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    const handleCropComplete = async (blob, type) => {
        const url = URL.createObjectURL(blob);
        if (type === 'avatar') {
            setProfile({ ...profile, avatar: url });
            setShowAvatarCropper(false);
        }
        else {
            setProfile({ ...profile, coverPhoto: url });
            setShowCoverCropper(false);
        }
        // In a real app, you would upload the blob to your server
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSave(profile);
    };
    const speciesOptions = [
        { value: 'dog', label: '🐶 Dog' },
        { value: 'cat', label: '🐱 Cat' },
        { value: 'bird', label: '🐦 Bird' },
        { value: 'rabbit', label: '🐰 Rabbit' },
        { value: 'fish', label: '🐠 Fish' },
        { value: 'reptile', label: '🦎 Reptile' },
        { value: 'other', label: '🐾 Other' },
    ];
    const genderOptions = [
        { value: 'male', label: '♂️ Male' },
        { value: 'female', label: '♀️ Female' },
        { value: 'unknown', label: '❓ Unknown' },
    ];
    const activityOptions = [
        { value: 'low', label: 'Low - Mostly relaxing' },
        { value: 'moderate', label: 'Moderate - Regular play' },
        { value: 'high', label: 'High - Very active' },
        { value: 'very-high', label: 'Very High - Constant energy' },
    ];
    const socializationOptions = [
        { value: 'shy', label: 'Shy - Prefers alone time' },
        { value: 'neutral', label: 'Neutral - Selective socializing' },
        { value: 'friendly', label: 'Friendly - Enjoys company' },
        { value: 'very-friendly', label: 'Very Friendly - Loves everyone' },
    ];
    // Helper component for tooltips
    const Tooltip = ({ id, text }) => (<div className="absolute z-10 bg-gray-900 text-white p-2 rounded-lg text-xs w-48" style={{
            display: showTooltip === id ? 'block' : 'none',
            bottom: 'calc(100% + 10px)',
            left: '50%',
            transform: 'translateX(-50%)',
        }}>
      {text}
      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"/>
    </div>);
    const renderBasicInfo = () => (<div className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Pet Name*
        </label>
        <input type="text" id="name" value={profile.name || ''} onChange={(e) => { handleChange('name', e.target.value); }} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent" placeholder="Your pet's name" required/>
      </div>

      {/* Species */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Species*
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {speciesOptions.map((option) => (<button key={option.value} type="button" className={`p-2 rounded-lg border text-center transition-colors ${profile.species === option.value
                ? 'bg-pink-100 dark:bg-pink-900/30 border-pink-500 text-pink-800 dark:text-pink-300'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`} onClick={() => { handleChange('species', option.value); }}>
              <span className="text-xl block mb-1">{option.label.split(' ')[0]}</span>
              <span className="text-sm">{option.label.split(' ')[1]}</span>
            </button>))}
        </div>
      </div>

      {/* Breed */}
      <div>
        <label htmlFor="breed" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Breed
        </label>
        <input type="text" id="breed" value={profile.breed || ''} onChange={(e) => { handleChange('breed', e.target.value); }} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent" placeholder="E.g., Golden Retriever"/>
      </div>

      {/* Age or Birthday */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Age
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" id="age" min="0" value={profile.age || ''} onChange={(e) => { handleChange('age', parseInt(e.target.value) || ''); }} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent" placeholder="Age"/>
            <select value={profile.ageUnit || 'years'} onChange={(e) => { handleChange('ageUnit', e.target.value); }} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent">
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Birthday
          </label>
          <input type="date" id="birthday" value={profile.birthday || ''} onChange={(e) => { handleChange('birthday', e.target.value); }} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"/>
        </div>
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Gender
        </label>
        <div className="grid grid-cols-3 gap-2">
          {genderOptions.map((option) => (<button key={option.value} type="button" className={`p-3 rounded-lg border text-center transition-colors ${profile.gender === option.value
                ? 'bg-pink-100 dark:bg-pink-900/30 border-pink-500 text-pink-800 dark:text-pink-300'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`} onClick={() => { handleChange('gender', option.value); }}>
              {option.label}
            </button>))}
        </div>
      </div>

      {/* Weight */}
      <div>
        <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Weight
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input type="number" id="weight" min="0" step="0.1" value={profile.weight || ''} onChange={(e) => { handleChange('weight', parseFloat(e.target.value) || ''); }} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent" placeholder="Weight"/>
          <select value={profile.weightUnit || 'lb'} onChange={(e) => { handleChange('weightUnit', e.target.value); }} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent">
            <option value="lb">lb</option>
            <option value="kg">kg</option>
            <option value="g">g</option>
          </select>
        </div>
      </div>

      {/* Color */}
      <div>
        <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Color
        </label>
        <input type="text" id="color" value={profile.color || ''} onChange={(e) => { handleChange('color', e.target.value); }} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent" placeholder="E.g., Golden, Black & White"/>
      </div>
    </div>);
    const renderPersonality = () => (<div className="space-y-6">
      {/* Description */}
      <div>
        <CustomTextarea id="description" value={profile.description || ''} onChange={(e) => { handleChange('description', e.target.value); }} rows={4} variant="outline" size="medium" maxHeight={200} label="About" placeholder="Tell us about your pet..." showWordCount={true} animateOnFocus={true} className="focus:ring-2 focus:ring-pink-500 focus:border-transparent"/>
      </div>

      {/* Personality traits */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="personality" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Personality Traits
          </label>
          <div className="relative">
            <button type="button" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" onMouseEnter={() => setShowTooltip('personality')} onMouseLeave={() => setShowTooltip(null)}>
              ⓘ
            </button>
            <Tooltip id="personality" text="Add traits like Playful, Calm, Energetic, Curious, Shy, etc."/>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {(profile.personality || []).map((trait, index) => (<span key={index} className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 rounded-full text-sm flex items-center">
              {trait}
              <button type="button" onClick={() => { handleRemoveStringArrayItem('personality', index); }} className="ml-1 text-pink-600 hover:text-pink-800 dark:hover:text-pink-400">
                ×
              </button>
            </span>))}
        </div>
        <div className="flex space-x-2">
          <input type="text" id="personality" className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent" placeholder="Add a trait..." onKeyPress={(e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleStringArrayChange('personality', e.target.value);
                e.target.value = '';
            }
        }}/>
          <button type="button" className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg" onClick={() => {
            const input = document.getElementById('personality');
            handleStringArrayChange('personality', input.value);
            input.value = '';
        }}>
            Add
          </button>
        </div>
      </div>

      {/* Activity level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Activity Level
        </label>
        <div className="space-y-2">
          {activityOptions.map((option) => (<button key={option.value} type="button" className={`w-full p-3 rounded-lg border text-left transition-colors flex items-center ${profile.activityLevel === option.value
                ? 'bg-pink-100 dark:bg-pink-900/30 border-pink-500 text-pink-800 dark:text-pink-300'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`} onClick={() => { handleChange('activityLevel', option.value); }}>
              <span className="w-4 h-4 mr-2 rounded-full border border-current inline-block"></span>
              {option.label}
            </button>))}
        </div>
      </div>

      {/* Socialization */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Socialization
        </label>
        <div className="space-y-2">
          {socializationOptions.map((option) => (<button key={option.value} type="button" className={`w-full p-3 rounded-lg border text-left transition-colors flex items-center ${profile.socialization === option.value
                ? 'bg-pink-100 dark:bg-pink-900/30 border-pink-500 text-pink-800 dark:text-pink-300'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`} onClick={() => { handleChange('socialization', option.value); }}>
              <span className="w-4 h-4 mr-2 rounded-full border border-current inline-block"></span>
              {option.label}
            </button>))}
        </div>
      </div>
    </div>);
    return (<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Cover Photo & Avatar */}
      <div className="relative">
        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
          {profile.coverPhoto ? (<img src={profile.coverPhoto} alt="Cover" className="w-full h-full object-cover"/>) : (<div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-pink-400 to-purple-500">
              <span className="text-white text-lg font-medium">Add a cover photo</span>
            </div>)}
          <label className="absolute top-4 right-4 w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <CameraIcon className="w-5 h-5 text-gray-600 dark:text-gray-400"/>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect('cover')}/>
          </label>
        </div>

        <div className="absolute left-6 -bottom-12 w-24 h-24 rounded-full bg-white dark:bg-gray-800 p-1 shadow-lg">
          <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
            {profile.avatar ? (<img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover"/>) : (<span className="text-4xl">🐾</span>)}
          </div>
          <label className="absolute bottom-0 right-0 w-8 h-8 bg-pink-500 hover:bg-pink-600 rounded-full flex items-center justify-center cursor-pointer shadow transition-colors">
            <PencilIcon className="w-4 h-4 text-white"/>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect('avatar')}/>
          </label>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="pt-16 px-6 pb-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <button type="button" className={`py-2 px-4 font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === 'basic'
            ? 'border-pink-500 text-pink-600 dark:text-pink-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`} onClick={() => setActiveTab('basic')}>
            Basic Info
          </button>
          <button type="button" className={`py-2 px-4 font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === 'personality'
            ? 'border-pink-500 text-pink-600 dark:text-pink-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`} onClick={() => setActiveTab('personality')}>
            Personality
          </button>
          <button type="button" className={`py-2 px-4 font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === 'medical'
            ? 'border-pink-500 text-pink-600 dark:text-pink-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`} onClick={() => setActiveTab('medical')}>
            Medical Info
          </button>
          <button type="button" className={`py-2 px-4 font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === 'preferences'
            ? 'border-pink-500 text-pink-600 dark:text-pink-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`} onClick={() => setActiveTab('preferences')}>
            Preferences
          </button>
        </div>

        {/* Tab Content */}
        <div className="mb-6">
          {activeTab === 'basic' && renderBasicInfo()}
          {activeTab === 'personality' && renderPersonality()}
          {activeTab === 'medical' && (<div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Medical information section coming soon!
            </div>)}
          {activeTab === 'preferences' && (<div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Pet preferences section coming soon!
            </div>)}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button type="submit" disabled={isLoading} className="py-2 px-6 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? (<div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </div>) : ('Save Profile')}
          </button>
        </div>
      </form>

      {/* Photo Croppers */}
      {showAvatarCropper && (<PhotoCropper image={selectedImage} onCropComplete={(blob) => handleCropComplete(blob, 'avatar')} onCancel={() => setShowAvatarCropper(false)} aspectRatio={1} cropShape="round"/>)}

      {showCoverCropper && (<PhotoCropper image={selectedImage} onCropComplete={(blob) => handleCropComplete(blob, 'cover')} onCancel={() => setShowCoverCropper(false)} aspectRatio={16 / 5}/>)}
    </div>);
};
export default PetProfileEditor;
//# sourceMappingURL=PetProfileEditor.jsx.map