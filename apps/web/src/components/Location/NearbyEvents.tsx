'use client';
import { CalendarIcon, ChevronRightIcon, ClockIcon, MapPinIcon, StarIcon, UserGroupIcon, } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { logger } from '@pawfectmatch/core';
;
import React, { useEffect, useState } from 'react';
export const NearbyEvents = ({ userLocation, onEventSelect }) => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('distance');
    const categories = [
        { id: 'all', label: 'All Events', emoji: '🎉' },
        { id: 'playdate', label: 'Playdates', emoji: '🐾' },
        { id: 'training', label: 'Training', emoji: '🎓' },
        { id: 'social', label: 'Social', emoji: '👥' },
        { id: 'adoption', label: 'Adoption', emoji: '🏠' },
        { id: 'health', label: 'Health', emoji: '🏥' },
    ];
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/events/nearby', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        latitude: userLocation?.lat,
                        longitude: userLocation?.lng,
                        radius: 10, // 10km radius
                    }),
                });
                if (response.ok) {
                    const data = await response.json();
                    setEvents(data.events || []);
                }
                else {
                    // No events available
                    setEvents([]);
                }
            }
            catch (error) {
                logger.error('Failed to fetch nearby events:', { error });
                // Show empty state on error
                setEvents([]);
            }
            finally {
                setIsLoading(false);
            }
        };
        if (userLocation) {
            void fetchEvents();
        }
        else {
            // No events without location
            setEvents([]);
            setIsLoading(false);
        }
    }, [userLocation]);
    const filteredEvents = events
        .filter((event) => selectedCategory === 'all' || event.category === selectedCategory)
        .sort((a, b) => {
        switch (sortBy) {
            case 'distance':
                return a.distance - b.distance;
            case 'date':
                return a.date.getTime() - b.date.getTime();
            case 'attendees':
                return b.attendees - a.attendees;
            default:
                return 0;
        }
    });
    const getCategoryColor = (category) => {
        const colors = {
            playdate: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            training: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            social: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            adoption: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            health: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };
        return (colors[category] ||
            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200');
    };
    const formatDate = (date) => date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
    if (isLoading) {
        return (<div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"/>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (<div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"/>))}
          </div>
        </div>
      </div>);
    }
    return (<div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
            <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400"/>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nearby Events</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Discover pet events near you</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (<button key={category.id} onClick={() => {
                setSelectedCategory(category.id);
            }} className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category.id
                ? 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
              <span className="mr-1">{category.emoji}</span>
              {category.label}
            </button>))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="mb-4">
        <select value={sortBy} onChange={(e) => {
            setSortBy(e.target.value);
        }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
          <option value="distance">Sort by Distance</option>
          <option value="date">Sort by Date</option>
          <option value="attendees">Sort by Popularity</option>
        </select>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (<div className="text-center py-8">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
            <p className="text-gray-600 dark:text-gray-400">No events found in this category</p>
          </div>) : (filteredEvents.map((event) => (<motion.div key={event.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer" onClick={() => onEventSelect?.(event)}>
              <div className="flex items-start space-x-4">
                {/* Event Image */}
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                  {event.image && event.image.length > 0 ? (<img src={event.image} alt={event.title} className="w-full h-full object-cover rounded-lg"/>) : (<CalendarIcon className="h-8 w-8 text-gray-400"/>)}
                </div>

                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {event.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400 ml-2"/>
                  </div>

                  {/* Event Meta */}
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="h-4 w-4"/>
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4"/>
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPinIcon className="h-4 w-4"/>
                      <span>{event.distance} mi</span>
                    </div>
                  </div>

                  {/* Tags and Attendees */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                        {event.category}
                      </span>
                      {event.price > 0 && (<span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-xs font-medium">
                          ${event.price}
                        </span>)}
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                      <UserGroupIcon className="h-4 w-4"/>
                      <span>
                        {event.attendees}/{event.maxAttendees}
                      </span>
                    </div>
                  </div>

                  {/* Organizer */}
                  <div className="flex items-center space-x-2 mt-2">
                    <img src={event.organizer.avatar} alt={event.organizer.name} className="w-6 h-6 rounded-full"/>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      by {event.organizer.name}
                    </span>
                    {event.organizer.verified ? (<StarIcon className="h-4 w-4 text-blue-500"/>) : null}
                  </div>
                </div>
              </div>
            </motion.div>)))}
      </div>

      {/* View All Events */}
      {filteredEvents.length > 0 && (<div className="mt-6 text-center">
          <button className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors">
            View All Events
          </button>
        </div>)}
    </div>);
};
//# sourceMappingURL=NearbyEvents.jsx.map