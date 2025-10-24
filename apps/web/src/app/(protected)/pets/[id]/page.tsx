'use client';
import { PersonalityCard } from '@/components/Personality/PersonalityCard';
import PetProfileEditor from '@/components/Profile/PetProfileEditor';
import { useToast } from '@/components/ui/toast';
import { _useAuthStore as useAuthStore } from '@/stores/auth-store';
import { ArrowLeftIcon, CalendarIcon, Cog6ToothIcon, HeartIcon, MapPinIcon, } from '@heroicons/react/24/outline';
import { logger } from '@pawfectmatch/core';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
;
export default function PetProfilePage() {
    const toast = useToast();
    const { id } = useParams();
    const { user: _user } = useAuthStore();
    const [pet, setPet] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    useEffect(() => {
        fetchPet();
    }, [id]);
    const fetchPet = async () => {
        setIsLoading(true);
        try {
            // In a real app, you would fetch from your API
            // For this example, we'll use mock data
            await new Promise((resolve) => setTimeout(resolve, 800));
            // Sample pet data
            const mockPet = {
                id: id,
                name: 'Buddy',
                species: 'dog',
                breed: 'Golden Retriever',
                age: 3,
                ageUnit: 'years',
                gender: 'male',
                weight: 65,
                weightUnit: 'lb',
                color: 'Golden',
                description: "Buddy is a friendly, energetic dog who loves to play fetch and go on long walks. He's great with kids and other pets.",
                personality: ['Friendly', 'Energetic', 'Playful', 'Loyal'],
                likes: ['Tennis balls', 'Swimming', 'Car rides'],
                dislikes: ['Vacuum cleaners', 'Thunderstorms'],
                activityLevel: 'high',
                socialization: 'very-friendly',
            };
            setPet(mockPet);
        }
        catch (error) {
            logger.error('Error fetching pet:', { error });
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleSave = async (updatedPet) => {
        setIsSaving(true);
        try {
            // In a real app, you would make an API call to save the data
            await new Promise((resolve) => setTimeout(resolve, 1000));
            // Update local state
            setPet(updatedPet);
            toast.success('Profile Saved', 'Pet profile updated successfully!');
        }
        catch (error) {
            logger.error('Error saving pet profile:', { error });
            toast.error('Save Failed', 'Unable to save pet profile. Please try again.');
        }
        finally {
            setIsSaving(false);
        }
    };
    if (isLoading) {
        return (<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"/>
          <div className="h-24 mt-4"/>
          <div className="w-2/3 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"/>
          <div className="w-full h-[400px] mt-8 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"/>
        </div>
      </div>);
    }
    if (!pet) {
        return (<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐾</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pet Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We couldn't find the pet you're looking for.
          </p>
          <Link href="/pets" className="inline-flex items-center space-x-2 text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-300">
            <ArrowLeftIcon className="w-4 h-4"/>
            <span>Back to Pets</span>
          </Link>
        </div>
      </div>);
    }
    return (<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link href="/pets" className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <ArrowLeftIcon className="w-4 h-4"/>
            <span>Back to Pets</span>
          </Link>
        </div>

        {/* Profile Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {pet.name}'s Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Customize and manage your pet's information
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Link href={`/pets/${id}/matches`} className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full flex items-center justify-center mb-2">
              <HeartIcon className="w-5 h-5"/>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Matches</span>
          </Link>

          <Link href="/calendar" className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-2">
              <CalendarIcon className="w-5 h-5"/>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Calendar</span>
          </Link>

          <Link href="/map" className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-2">
              <MapPinIcon className="w-5 h-5"/>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Playgrounds</span>
          </Link>
        </div>

        {/* Personality Analysis */}
        <div className="mb-6">
          <PersonalityCard petId={id} petName={pet?.name || 'Pet'} breed={pet?.breed} age={pet?.age} personalityTags={pet?.personality} description={pet?.description} onPersonalityGenerated={(personality) => {
            logger.info('Personality generated:', { personality });
        }}/>
        </div>

        {/* Profile Editor */}
        <PetProfileEditor pet={pet} onSave={handleSave} isLoading={isSaving}/>

        {/* Settings Link */}
        <div className="mt-8 text-center">
          <Link href={`/pets/${id}/settings`} className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <Cog6ToothIcon className="w-4 h-4"/>
            <span>Advanced Settings</span>
          </Link>
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=page.jsx.map