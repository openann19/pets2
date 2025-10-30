'use client';
import { _useAuthStore as useAuthStore } from '@/stores/auth-store';
import { logger } from '@pawfectmatch/core';
;
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { AnimatedGrid, AnimatedItem, TiltCardV2, useRevealObserver } from '@/components/Animations';
export default function PetsPage() {
    const { user } = useAuthStore();
    const [pets, setPets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPetName, setNewPetName] = useState('');
    const [newPetSpecies, setNewPetSpecies] = useState('dog');
    
    // Initialize reveal observer
    useRevealObserver();
    useEffect(() => {
        fetchPets();
    }, []);
    const fetchPets = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/pets', {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch pets');
            }
            const data = await response.json();
            setPets(data.pets || []);
        }
        catch (error) {
            logger.error('Error fetching pets:', { error });
            setPets([]);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleAddPet = async (e) => {
        e.preventDefault();
        if (!newPetName.trim())
            return;
        try {
            const response = await fetch('/api/pets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`,
                },
                body: JSON.stringify({
                    name: newPetName,
                    species: newPetSpecies,
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to add pet');
            }
            const newPet = await response.json();
            setPets([...pets, newPet]);
            setNewPetName('');
            setNewPetSpecies('dog');
            setShowAddModal(false);
        }
        catch (error) {
            logger.error('Error adding pet:', { error });
        }
    };
    const handleDeletePet = async (id) => {
        if (!confirm('Are you sure you want to delete this pet?'))
            return;
        try {
            const response = await fetch(`/api/pets/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to delete pet');
            }
            setPets(pets.filter((pet) => pet.id !== id));
        }
        catch (error) {
            logger.error('Error deleting pet:', { error });
        }
    };
    const getSpeciesEmoji = (species) => {
        switch (species) {
            case 'dog':
                return '🐶';
            case 'cat':
                return '🐱';
            case 'bird':
                return '🐦';
            case 'rabbit':
                return '🐰';
            case 'fish':
                return '🐠';
            case 'reptile':
                return '🦎';
            default:
                return '🐾';
        }
    };
    const getAgeText = (pet) => {
        if (!pet.age)
            return 'Age unknown';
        return `${pet.age} ${pet.ageUnit}${pet.age !== 1 ? 's' : ''}`;
    };
    return (<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Pets</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Manage your pet profiles and preferences
            </p>
          </div>

          <button onClick={() => { setShowAddModal(true); }} className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg flex items-center transition-colors">
            <PlusIcon className="w-5 h-5 mr-1"/>
            <span>Add Pet</span>
          </button>
        </div>

        {/* Pets List */}
        {isLoading ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (<div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  </div>
                </div>
              </div>))}
          </div>) : pets.length > 0 ? (<AnimatedGrid columns={2} gap={6} staggerDelay={0.1} className="grid-cols-1 md:grid-cols-2">
            {pets.map((pet) => (<AnimatedItem key={pet.id}>
              <TiltCardV2 
                maxTilt={8}
                hoverScale={1.02}
                glareOpacity={0.2}
                className="reveal reveal-premium"
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden group hover:shadow-xl transition-shadow">
                <Link href={`/pets/${pet.id}`} className="block">
                  <div className="p-6 flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {pet.avatar ? (<img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover"/>) : (<span className="text-3xl">{getSpeciesEmoji(pet.species)}</span>)}
                    </div>

                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {pet.name}
                      </h2>
                      <div className="text-gray-600 dark:text-gray-400 text-sm">
                        {pet.breed || pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}
                      </div>
                      <div className="text-gray-500 dark:text-gray-500 text-sm">
                        {getAgeText(pet)}
                      </div>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/pets/${pet.id}`} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-pink-100 dark:hover:bg-pink-900/30 flex items-center justify-center text-gray-500 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400 transition-colors">
                        <PencilIcon className="w-4 h-4"/>
                      </Link>
                    </div>
                  </div>
                </Link>

                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 flex justify-between items-center">
                  <div className="flex space-x-1">
                    <span className="px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 text-xs rounded-full">
                      {pet.species}
                    </span>
                    {pet.breed && (<span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                        {pet.breed}
                      </span>)}
                  </div>

                  <button onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeletePet(pet.id);
                }} className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400">
                    <TrashIcon className="w-5 h-5"/>
                  </button>
                </div>
              </div>
            </TiltCardV2>
          </AnimatedItem>))}
          </AnimatedGrid>) : (<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="text-6xl mb-4">🐾</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Pets Added Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start by adding your first pet profile
            </p>
            <button onClick={() => { setShowAddModal(true); }} className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg inline-flex items-center transition-colors">
              <PlusIcon className="w-5 h-5 mr-2"/>
              Add Your First Pet
            </button>
          </div>)}

        {/* Tips */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-2">📝</div>
            <div className="font-semibold text-gray-900 dark:text-white">Complete Profiles</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Add details to help find perfect matches for your pets.
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-2">🖼️</div>
            <div className="font-semibold text-gray-900 dark:text-white">Add Photos</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Upload clear pictures to showcase your pet's personality.
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-2">📅</div>
            <div className="font-semibold text-gray-900 dark:text-white">Track Events</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Keep track of vet visits, playdates, and special occasions.
            </div>
          </div>
        </div>
      </div>

      {/* Add Pet Modal */}
      {showAddModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New Pet</h2>

              <form onSubmit={handleAddPet}>
                <div className="mb-4">
                  <label htmlFor="petName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pet Name*
                  </label>
                  <input type="text" id="petName" value={newPetName} onChange={(e) => { setNewPetName(e.target.value); }} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Enter pet name" required/>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Species*
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['dog', 'cat', 'bird', 'rabbit', 'fish', 'reptile', 'other'].map((species) => (<button key={species} type="button" className={`p-3 rounded-lg border text-center transition-colors ${newPetSpecies === species
                    ? 'bg-pink-100 dark:bg-pink-900/30 border-pink-500 text-pink-800 dark:text-pink-300'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`} onClick={() => { setNewPetSpecies(species); }}>
                        <div className="text-2xl mb-1">
                          {getSpeciesEmoji(species)}
                        </div>
                        <div className="text-xs capitalize">{species}</div>
                      </button>))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={() => { setShowAddModal(false); }} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg">
                    Add Pet
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>)}
    </div>);
}
//# sourceMappingURL=page.jsx.map