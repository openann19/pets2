'use client';

/**
 * Favorites Page
 * 
 * Displays user's favorited pets in a responsive grid layout.
 * 
 * Features:
 * - Grid layout with responsive columns
 * - Empty state with CTA
 * - Loading skeletons
 * - Remove favorite button
 * - Navigate to pet details
 * - Optimistic UI updates
 * - Premium animations
 */

import { useFavorites } from '@/hooks/useFavorites';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Heart, MapPin, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function FavoritesPage() {
    const router = useRouter();
    const { favorites, isLoading, removeFavorite } = useFavorites();
    const [removingId, setRemovingId] = useState<string | null>(null);

    const handleRemoveFavorite = (petId: string) => {
        setRemovingId(petId);
        removeFavorite(petId);

        // Reset after animation
        setTimeout(() => setRemovingId(null), 300);
    };

    const handlePetClick = (petId: string) => {
        router.push(`/pets/${petId}`);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        My Favorites
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Your favorite pets
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg animate-pulse"
                        >
                            <div className="aspect-square bg-gray-300 dark:bg-gray-700" />
                            <div className="p-4 space-y-3">
                                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded" />
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3" />
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Empty state
    if (!favorites || favorites.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="max-w-md mx-auto text-center"
                >
                    <div className="mb-6 flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full blur-xl opacity-50 animate-pulse" />
                            <div className="relative bg-white dark:bg-gray-800 rounded-full p-6">
                                <Heart className="w-16 h-16 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        No Favorites Yet
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Start exploring pets and add your favorites to see them here!
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/pets')}
                        className="px-8 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
                    >
                        <Sparkles className="w-5 h-5" />
                        Explore Pets
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    My Favorites
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {favorites.length} {favorites.length === 1 ? 'pet' : 'pets'} saved
                </p>
            </div>

            {/* Favorites Grid */}
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
                <AnimatePresence mode="popLayout">
                    {favorites.map((favorite, index) => {
                        const pet = favorite.petId;
                        const isRemoving = removingId === pet._id;

                        return (
                            <motion.div
                                key={favorite._id}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 30,
                                    delay: index * 0.05,
                                }}
                                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer"
                            >
                                {/* Pet Image */}
                                <div
                                    onClick={() => handlePetClick(pet._id)}
                                    className="relative aspect-square overflow-hidden"
                                >
                                    {pet.photos && pet.photos.length > 0 && pet.photos[0] ? (
                                        <Image
                                            src={pet.photos[0]}
                                            alt={pet.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center">
                                            <Heart className="w-16 h-16 text-white opacity-50" />
                                        </div>
                                    )}

                                    {/* Remove Favorite Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveFavorite(pet._id);
                                        }}
                                        disabled={isRemoving}
                                        className="absolute top-3 right-3 bg-white dark:bg-gray-900 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                    >
                                        <Heart
                                            className={`w-5 h-5 ${isRemoving
                                                    ? 'text-gray-400'
                                                    : 'text-red-500 fill-red-500'
                                                }`}
                                        />
                                    </motion.button>
                                </div>

                                {/* Pet Info */}
                                <div
                                    onClick={() => handlePetClick(pet._id)}
                                    className="p-4 space-y-2"
                                >
                                    {/* Name and Age */}
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                            {pet.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {pet.breed} • {pet.gender}
                                        </p>
                                    </div>

                                    {/* Age */}
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                            {pet.age} {pet.age === 1 ? 'year' : 'years'} old
                                        </span>
                                    </div>

                                    {/* Location */}
                                    {pet.location && (pet.location.city || pet.location.state) && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <MapPin className="w-4 h-4" />
                                            <span>
                                                {pet.location.city}
                                                {pet.location.city && pet.location.state && ', '}
                                                {pet.location.state}
                                            </span>
                                        </div>
                                    )}

                                    {/* View Details Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePetClick(pet._id);
                                        }}
                                        className="w-full mt-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                                    >
                                        View Details
                                    </motion.button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
