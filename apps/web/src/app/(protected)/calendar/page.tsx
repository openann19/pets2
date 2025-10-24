'use client';
import EventForm from '@/components/Calendar/EventForm';
import { logger } from '@pawfectmatch/core';
;
import PetCalendar from '@/components/Calendar/PetCalendar';
import { _useAuthStore as useAuthStore } from '@/stores/auth-store';
import { CalendarIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
export default function CalendarPage() {
    const { user: _user } = useAuthStore();
    const [events, setEvents] = useState([]);
    const [showEventForm, setShowEventForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // Sample pet data - in a real app, this would come from your API
    const [pets, _setPets] = useState([
        { id: 'pet1', name: 'Max', avatar: 'https://i.pravatar.cc/150?img=1' },
        { id: 'pet2', name: 'Bella', avatar: 'https://i.pravatar.cc/150?img=5' },
        { id: 'pet3', name: 'Charlie' },
    ]);
    useEffect(() => {
        // In a real app, fetch events from your API
        fetchEvents();
    }, []);
    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            // Mock API call - replace with your actual API
            await new Promise((resolve) => setTimeout(resolve, 500));
            // Sample events data
            const mockEvents = [
                {
                    id: '1',
                    title: 'Park Playdate',
                    description: 'Meetup at Central Park with other dogs',
                    start: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 14, 0, 0, 0),
                    end: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 16, 0, 0, 0),
                    type: 'playdate',
                    petIds: ['pet1'],
                    location: 'Central Park Dog Run',
                },
                {
                    id: '2',
                    title: 'Vet Appointment',
                    description: 'Annual checkup and vaccinations',
                    start: (() => { const d = new Date(); d.setDate(d.getDate() + 2); d.setHours(10, 0, 0, 0); return d; })(),
                    end: (() => { const d = new Date(); d.setDate(d.getDate() + 2); d.setHours(11, 0, 0, 0); return d; })(),
                    type: 'vet',
                    petIds: ['pet1', 'pet2'],
                    location: 'PawsomeVet Clinic',
                },
                {
                    id: '3',
                    title: 'Grooming Session',
                    description: 'Full grooming with bath and haircut',
                    start: (() => { const d = new Date(); d.setDate(d.getDate() + 5); d.setHours(13, 30, 0, 0); return d; })(),
                    end: (() => { const d = new Date(); d.setDate(d.getDate() + 5); d.setHours(15, 0, 0, 0); return d; })(),
                    type: 'grooming',
                    petIds: ['pet2'],
                    location: 'Fuzzy Friends Grooming',
                },
                {
                    id: '4',
                    title: 'Training Class',
                    description: 'Advanced obedience training',
                    start: (() => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(17, 0, 0, 0); return d; })(),
                    end: (() => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(18, 0, 0, 0); return d; })(),
                    type: 'training',
                    petIds: ['pet3'],
                    location: 'Paws & Train Center',
                },
            ];
            setEvents(mockEvents);
        }
        catch (error) {
            logger.error('Error fetching events:', { error });
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleAddEvent = (date) => {
        setSelectedDate(date);
        setSelectedEvent(null);
        setShowEventForm(true);
    };
    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setShowEventForm(true);
    };
    const handleSaveEvent = async (eventData) => {
        if (selectedEvent) {
            // Update existing event
            const updatedEvent = {
                ...eventData,
                id: selectedEvent.id,
            };
            // In a real app, make API call to update the event
            // Update local state
            setEvents(events.map((event) => (event.id === selectedEvent.id ? updatedEvent : event)));
        }
        else {
            // Create new event
            const newEvent = {
                ...eventData,
                id: `event-${Date.now()}`, // Generate temporary ID
            };
            // In a real app, make API call to create the event
            // Update local state
            setEvents([...events, newEvent]);
        }
        setShowEventForm(false);
        setSelectedEvent(null);
    };
    const handleDeleteEvent = async (eventId) => {
        // In a real app, make API call to delete the event
        // Update local state
        setEvents(events.filter((event) => event.id !== eventId));
        setShowEventForm(false);
        setSelectedEvent(null);
    };
    return (<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <CalendarIcon className="w-8 h-8 mr-3 text-pink-500"/>
              Pet Calendar
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Schedule playdates, vet visits, grooming, and more
            </p>
          </div>

          <button onClick={() => handleAddEvent(new Date())} className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg flex items-center transition-colors">
            <PlusIcon className="w-5 h-5 mr-1"/>
            <span>Add Event</span>
          </button>
        </div>

        {/* Calendar and Event Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`${showEventForm ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            {isLoading ? (<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 flex items-center justify-center min-h-[300px]">
                <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"/>
              </div>) : (<PetCalendar events={events} onDateClick={(date) => setSelectedDate(date)} onEventClick={handleEventClick} onAddEvent={handleAddEvent}/>)}
          </div>

          {showEventForm ? <div className="lg:col-span-1">
            <EventForm date={selectedDate || new Date()} pets={pets} {...(selectedEvent ? { event: selectedEvent } : {})} onSave={handleSaveEvent} onCancel={() => {
                setShowEventForm(false);
                setSelectedEvent(null);
            }}/>

            {selectedEvent ? <div className="mt-4 p-4 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200 mb-2">Delete this event?</p>
              <button onClick={() => handleDeleteEvent(selectedEvent.id)} className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
                Delete Event
              </button>
            </div> : null}
          </div> : null}
        </div>

        {/* Tips Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-2">🐾</div>
            <div className="font-semibold text-gray-900 dark:text-white">Playdates</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Schedule fun meetups with other pets and share locations.
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-2">🔔</div>
            <div className="font-semibold text-gray-900 dark:text-white">Reminders</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Get notifications for upcoming appointments and events.
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-2">🔄</div>
            <div className="font-semibold text-gray-900 dark:text-white">Recurring Events</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Set up regular schedules for walks, feedings, and more.
            </div>
          </div>
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=page.jsx.map