import { useState, useEffect, useCallback, useMemo } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { breedsAPI, Breed, BreedSuggestionRequest } from '../services/breeds';
export const useUltraBreedFiltering = () => {
    const [filters, setFilters] = useState({
        species: [],
        breeds: [],
        ages: { min: 0, max: 20 },
        sizes: [],
        genders: [],
        colors: [],
        temperaments: [],
        energyLevels: [],
        trainability: [],
        familyFriendly: [],
        petFriendly: [],
        strangerFriendly: [],
        apartmentFriendly: null,
        houseSafe: null,
        yardRequired: null,
        groomingNeeds: [],
        exerciseNeeds: [],
        barkiness: [],
        healthStatus: [],
        vaccinationStatus: [],
        availability: [],
        locationRadius: 25,
        sortBy: 'relevance',
        sortDirection: 'desc',
        resultLimit: 20,
        premiumFeatures: {
            trending: false,
            verified: false,
            featured: false,
            aiRecommended: false
        },
        searchQuery: ''
    });
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [breedSuggestions, setBreedSuggestions] = useState([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    // Update individual filter
    const updateFilter = useCallback((key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);
    // Toggle array filter values
    const toggleArrayFilter = useCallback((key, value) => {
        setFilters(prev => {
            const currentArray = Array.isArray(prev[key]) ? prev[key] : [];
            const newArray = currentArray.includes(value)
                ? currentArray.filter(item => item !== value)
                : [...currentArray, value];
            return {
                ...prev,
                [key]: newArray
            };
        });
    }, []);
    // Search breeds with debouncing
    const searchBreeds = useCallback(async (query, species) => {
        if (!query || query.length < 2) {
            setBreedSuggestions([]);
            return;
        }
        setIsLoadingSuggestions(true);
        try {
            const response = await breedsAPI.searchBreeds(query, {
                species,
                limit: 10
            });
            if (response.data?.suggestions) {
                setBreedSuggestions(response.data.suggestions);
            }
        }
        catch (err) {
            logger.error('Breed search error:', { error });
            setBreedSuggestions([]);
        }
        finally {
            setIsLoadingSuggestions(false);
        }
    }, []);
    // Get personalized breed suggestions
    const getPersonalizedSuggestions = useCallback(async (preferences) => {
        setIsLoadingSuggestions(true);
        try {
            const response = await breedsAPI.getBreedSuggestions(preferences);
            if (response.data?.suggestions) {
                setBreedSuggestions(response.data.suggestions);
            }
        }
        catch (err) {
            logger.error('Personalized suggestions error:', { error });
        }
        finally {
            setIsLoadingSuggestions(false);
        }
    }, []);
    // Apply advanced filters and discover pets
    const discoverPets = useCallback(async (customFilters) => {
        const activeFilters = { ...filters, ...customFilters };
        // Skip if no meaningful filters are applied
        const hasFilters = Object.values(activeFilters).some(value => Array.isArray(value) ? value.length > 0 :
            typeof value === 'object' ? Object.values(value).some(Boolean) :
                value !== null && value !== undefined && value !== '');
        if (!hasFilters && !activeFilters.searchQuery) {
            setResults(null);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await breedsAPI.discoverPetsAdvanced(activeFilters);
            if (response.success) {
                setResults({
                    pets: response.data.pets || [],
                    recommendations: response.data.recommendations || [],
                    pagination: response.data.pagination || {},
                    analytics: response.data.analytics || {},
                    appliedFilters: response.data.appliedFilters || 0,
                    performanceMetrics: response.data.performanceMetrics
                });
            }
            else {
                throw new Error(response.message || 'Failed to discover pets');
            }
        }
        catch (err) {
            setError(err.message || 'Failed to load pets');
            logger.error('Pet discovery error:', { error });
        }
        finally {
            setIsLoading(false);
        }
    }, [filters]);
    // Advanced pet matching
    const matchPetsAdvanced = useCallback(async (userProfile) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await breedsAPI.matchPetsAdvanced(userProfile);
            if (response.success) {
                setResults({
                    pets: response.data.matches || [],
                    pagination: { page: 1, limit: 50, total: response.data.matches?.length || 0, hasMore: false },
                    analytics: response.data.matchingSummary || {},
                    appliedFilters: 0
                });
            }
            else {
                throw new Error(response.message || 'Failed to match pets');
            }
        }
        catch (err) {
            setError(err.message || 'Failed to match pets');
            logger.error('Pet matching error:', { error });
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    // Reset all filters
    const resetFilters = useCallback(() => {
        setFilters({
            species: [],
            breeds: [],
            ages: { min: 0, max: 20 },
            sizes: [],
            genders: [],
            colors: [],
            temperaments: [],
            energyLevels: [],
            trainability: [],
            familyFriendly: [],
            petFriendly: [],
            strangerFriendly: [],
            apartmentFriendly: null,
            houseSafe: null,
            yardRequired: null,
            groomingNeeds: [],
            exerciseNeeds: [],
            barkiness: [],
            healthStatus: [],
            vaccinationStatus: [],
            availability: [],
            locationRadius: 25,
            sortBy: 'relevance',
            sortDirection: 'desc',
            resultLimit: 20,
            premiumFeatures: {
                trending: false,
                verified: false,
                featured: false,
                aiRecommended: false
            },
            searchQuery: ''
        });
        setResults(null);
    }, []);
    // Calculate filter count
    const filterCount = useMemo(() => {
        let count = 0;
        Object.entries(filters).forEach(([key, value]) => {
            if (key === 'ages') {
                if (value.min > 0 || value.max < 20)
                    count++;
            }
            else if (key === 'premiumFeatures') {
                count += Object.values(value).filter(Boolean).length;
            }
            else if (key === 'locationRadius' && value !== 25) {
                count++;
            }
            else if (Array.isArray(value)) {
                count += value.length;
            }
            else if (typeof value === 'boolean') {
                count += 1;
            }
            else if (typeof value === 'string' && value !== '') {
                count += 1;
            }
        });
        return count;
    }, [filters]);
    // Check if filters are applied
    const hasActiveFilters = useMemo(() => {
        return filterCount > 0;
    }, [filterCount]);
    // Get popular breeds for quick selection
    const getPopularBreeds = useCallback(async (species) => {
        try {
            const response = await breedsAPI.getBreeds({
                species,
                page: 1,
                limit: 12,
                sortBy: 'popularity'
            });
            if (response.data?.breeds) {
                return response.data.breeds.slice(0, 12);
            }
            return [];
        }
        catch (err) {
            logger.error('Popular breeds error:', { error });
            return [];
        }
    }, []);
    // Get breed statistics
    const getBreedStats = useCallback(async () => {
        try {
            const response = await breedsAPI.getBreedStats();
            return response.data;
        }
        catch (err) {
            logger.error('Breed stats error:', { error });
            return null;
        }
    }, []);
    // Auto-trigger search when filters change (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (hasActiveFilters) {
                discoverPets();
            }
        }, 500);
        return () => { clearTimeout(timer); };
    }, [filters, hasActiveFilters, discoverPets]);
    return {
        // State
        filters,
        results,
        isLoading,
        error,
        breedSuggestions,
        isLoadingSuggestions,
        filterCount,
        hasActiveFilters,
        // Actions
        updateFilter,
        toggleArrayFilter,
        resetFilters,
        discoverPets,
        matchPetsAdvanced,
        searchBreeds,
        getPersonalizedSuggestions,
        getPopularBreeds,
        getBreedStats,
        // Utility
        totalResults: results?.pagination?.total || 0,
        currentPage: results?.pagination?.page || 1,
        hasMore: results?.pagination?.hasMore || false,
    };
};
//# sourceMappingURL=useUltraBreedFiltering.js.map